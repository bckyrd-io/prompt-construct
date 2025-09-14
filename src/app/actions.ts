'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { 
  getContentBySlug,
  getContents as dbGetContents,
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

// Simple in-memory session storage for development
// In a production app, use a proper session store or JWT with HTTP-only cookies

// Simple session storage key
const SESSION_KEY = 'admin-session';

// Authentication functions
export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  
  try {
    const user = await getUserByUsername(username);
    
    if (!user) {
      return { success: false, message: 'Invalid username or password' };
    }
    
    const isPasswordValid = await compare(password, user.password);
    
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid username or password' };
    }
    
    // Authentication successful
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An error occurred during login' };
  }
}

export async function getSession() {
  if (typeof window === 'undefined') return null;
  
  const sessionStr = localStorage.getItem(SESSION_KEY);
  if (!sessionStr) return null;

  try {
    const session = JSON.parse(sessionStr);
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session as { userId: string; role: string; email: string; expiresAt: number };
  } catch (error) {
    return null;
  }
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
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
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
    const title = formData.get('title')?.toString() || '';
    const content = formData.get('content')?.toString() || '';
    const category = formData.get('category')?.toString() || 'page';
    const imageUrl = formData.get('imageUrl')?.toString() || undefined;
    const location = formData.get('location')?.toString();
    const date = formData.get('date')?.toString();
    
    if (!title || !content) {
      throw new Error('Title and content are required');
    }
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const contentData: Omit<NewContent, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'isPublished'> = {
      title,
      slug,
      content,
      category,
      ...(imageUrl && { imageUrl }),
      metadata: {
        ...(location && { location }),
        ...(date && { date })
      }
    };

    await createContent(contentData);
    revalidatePath('/admin');
    revalidatePath(`/${slug}`);
    return { success: true };
  } catch (error) {
    console.error('Error creating content:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to create content' };
  }
}

export async function updatePage(formData: FormData) {
  try {
    const id = parseInt(formData.get('id')?.toString() || '0');
    const title = formData.get('title')?.toString() || '';
    const content = formData.get('content')?.toString() || '';
    const category = formData.get('category')?.toString() || 'page';
    const location = formData.get('location')?.toString();
    const date = formData.get('date')?.toString();
    const excerpt = formData.get('excerpt')?.toString() || undefined;
    const imageUrl = formData.get('imageUrl')?.toString() || undefined;
    
    if (!id || !title || !content) {
      throw new Error('ID, title, and content are required');
    }
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
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

interface ContentItem {
  id: number;
  title: string;
  slug: string;
}

export async function getContents(): Promise<{ success: boolean; data?: ContentItem[]; message?: string }> {
  try {
    const dbContents = await dbGetContents();
    const contents: ContentItem[] = dbContents.map((content: any) => ({
      id: content.id,
      title: content.title,
      slug: content.slug
    }));
    
    return { success: true, data: contents };
  } catch (error) {
    console.error('Error fetching contents:', error);
    return { success: false, message: 'Failed to fetch contents' };
  }
}

export async function deletePage(formData: FormData) {
  try {
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
    // Set session in localStorage
    const session = {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role || 'editor',
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed. Please try again.' };
  }
}
