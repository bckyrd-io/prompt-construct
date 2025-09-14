'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { 
  getContentBySlug,
  getContents,
  createContent,
  updateContent,
  deleteContent,
  getUserByUsername,
  createUser as createUserDb,
  users,
  type Content,
  type NewContent,
  type User,
  db
} from '@/lib/db';
import { eq } from 'drizzle-orm';
import { compare, hash } from 'bcryptjs';

// Session management (in a production app, use a proper session store like Redis)
let adminSession: { id: number; username: string; role: string } | null = null;

// Authentication functions
export async function loginAction(formData: FormData) {
  try {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
      return { success: false, message: 'Username and password are required' };
    }

    // Check database for user
    const [user] = await db.select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Create session
    adminSession = {
      id: user.id,
      username: user.username,
      role: user.role || 'editor'
    };

    return { 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An error occurred during login' };
  }
}

export async function getSession() {
  return adminSession;
}

export async function requireAuth(requiredRole: string = 'editor') {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  // Role-based access control
  const roles = ['editor', 'admin'];
  const userRoleIndex = roles.indexOf(session.role);
  const requiredRoleIndex = roles.indexOf(requiredRole);
  
  if (userRoleIndex < 0 || userRoleIndex < requiredRoleIndex) {
    redirect('/unauthorized');
  }
  
  return session;
}

export async function logoutAction() {
  adminSession = null;
  redirect('/login');
}

type ContentData = {
  title: string;
  slug: string;
  content: string;
  category: string;
  excerpt?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
};

export async function createPage(formData: FormData) {
  try {
    await requireAuth();
    
    const title = formData.get('title')?.toString() || '';
    const slug = formData.get('slug')?.toString() || '';
    const content = formData.get('content')?.toString() || '';
    const category = formData.get('category')?.toString() || 'page';
    const excerpt = formData.get('excerpt')?.toString() || undefined;
    const imageUrl = formData.get('imageUrl')?.toString() || undefined;
    
    if (!title || !slug || !content) {
      throw new Error('Title, slug, and content are required');
    }
    
    const contentData: Omit<NewContent, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'isPublished'> = {
      title,
      slug,
      content,
      category,
      ...(excerpt && { excerpt }),
      ...(imageUrl && { imageUrl }),
      metadata: {}
    };

    await createContent(contentData);
    revalidatePath('/admin');
    revalidatePath(`/${contentData.slug}`);
    return { success: true };
  } catch (error) {
    console.error('Error creating content:', error);
    return { success: false, message: 'Failed to create content' };
  }
}

export async function updatePage(formData: FormData) {
  try {
    await requireAuth();
    
    const id = parseInt(formData.get('id')?.toString() || '0');
    const title = formData.get('title')?.toString() || '';
    const slug = formData.get('slug')?.toString() || '';
    const content = formData.get('content')?.toString() || '';
    const category = formData.get('category')?.toString() || 'page';
    const excerpt = formData.get('excerpt')?.toString() || undefined;
    const imageUrl = formData.get('imageUrl')?.toString() || undefined;
    
    if (!id || !title || !slug || !content) {
      throw new Error('ID, title, slug, and content are required');
    }
    
    const updates = {
      title,
      slug,
      content,
      category,
      updatedAt: new Date(),
      ...(excerpt !== undefined && { excerpt }),
      ...(imageUrl !== undefined && { imageUrl })
    };

    await updateContent(id, updates);
    revalidatePath('/admin');
    revalidatePath(`/${slug}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating content:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to update content' 
    };
  }
}

export async function deletePage(formData: FormData) {
  try {
    await requireAuth('admin'); // Only admins can delete content
    
    const id = parseInt(formData.get('id')?.toString() || '0');
    if (!id) {
      throw new Error('Content ID is required');
    }
    
    await deleteContent(id);
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting content:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to delete content' 
    };
  }
}

export async function registerAction(formData: FormData) {
  try {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const email = formData.get('email') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Basic validation
    if (!username || !password || !email) {
      return { success: false, message: 'All fields are required' };
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match' };
    }

    if (password.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters' };
    }

    // Check if user already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return { success: false, message: 'Username already exists' };
    }

    // Check if email is already in use
    const [existingEmail] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
      
    if (existingEmail) {
      return { success: false, message: 'Email already in use' };
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const [newUser] = await db.insert(users)
      .values({
        username,
        password: hashedPassword,
        email,
        role: 'editor' // Default role
      })
      .returning();

    // Log the user in automatically after registration
    if (newUser) {
      adminSession = {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role || 'editor'
      };
    }

    return { 
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed. Please try again.' };
  }
}
