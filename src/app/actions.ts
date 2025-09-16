'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { 
  getContentById as dbGetContentById,
  getContents as dbGetContents,
  createContent as dbCreateContent,
  updateContent as dbUpdateContent,
  deleteContent as dbDeleteContent,
  getUserByUsername,
  createUser as createUserDb,
  users,
  type Content,
  type NewContent,
  type User,
  db,
  getDb
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

interface ContentData {
  title: string;
  content: string;
  category?: string;
  tags?: string[] | null;
  featuredImage?: string | null;
  isPublished?: boolean;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
};

export async function createContentAction(formData: FormData) {
  try {
    const { title, content, category, featuredImage, isPublished } = Object.fromEntries(formData.entries());
    // Get all tags from form data and ensure they're strings
    const tags = formData.getAll('tags').map(tag => String(tag));
    
    const newContent = await dbCreateContent({
      title: String(title),
      content: String(content),
      category: category ? String(category) : undefined,
      tags: tags,
      featuredMedia: featuredImage ? String(featuredImage) : null,
      isPublished: isPublished === 'on' || isPublished === 'true',
    });
    
    revalidatePath('/admin');
    return { success: true, id: newContent.id };
  } catch (error) {
    console.error('Error creating content:', error);
    return { success: false, message: 'Failed to create content' };
  }
}

export async function updatePage(formData: FormData) {
  try {
    const id = formData.get('id');
    const title = formData.get('title');
    const content = formData.get('content');
    const category = formData.get('category');
    const tags = formData.get('tags');
    const isPublished = formData.get('isPublished');
    const featuredImage = formData.get('featuredImage') as File | null;
    
    // For new content (id === '0'), we need to create it first
    if (id === '0') {
      const newContent = await dbCreateContent({
        title: String(title),
        content: String(content),
        category: category ? String(category) : null,
        tags: tags ? JSON.parse(tags as string) : [],
        featuredMedia: null, // Will be updated after file upload
        isPublished: isPublished === 'true',
      });
      
      // If there's a file to upload, handle it after creating the content
      if (featuredImage && featuredImage instanceof File) {
        // In a real app, you would upload the file to a storage service here
        // For now, we'll just store the file name
        const fileName = `${Date.now()}-${featuredImage.name}`;
        await dbUpdateContent(newContent.id, {
          featuredMedia: fileName
        });
        newContent.featuredMedia = fileName;
      }
      
      revalidatePath('/admin');
      return { success: true, content: newContent };
    }
    
    // For existing content
    const contentId = Number(id);
    if (isNaN(contentId)) {
      return { success: false, message: 'Invalid content ID' };
    }
    
    // Get all tags from form data (they come as separate entries with the same key)
    const tagsArray = formData.getAll('tags').map(tag => String(tag));
    
    const updateData: any = {
      title: String(title),
      content: String(content),
      category: category ? String(category) : null,
      tags: tagsArray,
      isPublished: isPublished === 'true',
    };
    
    // Only update featured media if a new file was uploaded
    if (featuredImage && featuredImage instanceof File) {
      // In a real app, you would upload the file to a storage service here
      // For now, we'll just store the file name
      const fileName = `${Date.now()}-${featuredImage.name}`;
      updateData.featuredMedia = fileName;
    }
    
    const updatedContent = await dbUpdateContent(contentId, updateData);
    
    revalidatePath('/admin');
    revalidatePath(`/admin/${id}`);
    
    return { success: true, content: updatedContent };
  } catch (error) {
    console.error('Error updating content:', error);
    return { success: false, message: 'Failed to update content: ' + (error as Error).message };
  }
}

interface ContentItem {
  id: number;
  title: string;
  tags?: string[];
}

export async function getContents(): Promise<{ success: boolean; data?: ContentItem[]; message?: string }> {
  try {
    const contents = await dbGetContents();
    const formattedContents: ContentItem[] = contents.map(content => ({
      id: content.id,
      title: content.title,
      ...(content.tags && { tags: content.tags })
    }));
    
    return { success: true, data: formattedContents };
  } catch (error) {
    console.error('Error fetching contents:', error);
    return { success: false, message: 'Failed to fetch contents' };
  }
}

export async function getContentById(id: number) {
  'use server';
  
  try {
    const content = await dbGetContentById(id);
    if (!content) {
      return { success: false, message: 'Content not found' };
    }
    
    // Convert Date objects to ISO strings for serialization
    const serializedContent = {
      ...content,
      createdAt: content.createdAt.toISOString(),
      updatedAt: content.updatedAt ? content.updatedAt.toISOString() : null
    };
    
    return { success: true, data: serializedContent };
  } catch (error) {
    console.error('Error fetching content:', error);
    return { success: false, message: 'Failed to fetch content' };
  }
}

export async function deletePage(formData: FormData) {
  try {
    const id = parseInt(formData.get('id')?.toString() || '0');
    if (!id) {
      throw new Error('Content ID is required');
    }
    
    await dbDeleteContent(id);
    revalidatePath('/admin');
    revalidatePath(`/admin/${id}`);
    revalidatePath(`/admin/edit/${id}`);
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
