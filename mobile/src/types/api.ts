/**
 * Response shapes from the Next.js API routes in `app/api/**`.
 *
 * Two Postgres quirks to keep in mind:
 *  - `numeric` columns (properties.baths) come back from `pg` as *strings*, so
 *    money and decimal fields are typed `number | string` and normalised with
 *    `toNumber()`.
 *  - `SERIAL` ids and `photos TEXT[]` arrive as numbers and string arrays
 *    respectively.
 */

export type UserRole = 'admin' | 'client';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  created_at?: string;
}

export type PaymentStatus = 'paid' | 'due' | 'unpaid';

export interface Milestone {
  id: number;
  name: string;
  completed: boolean;
  current: boolean;
  payment_status: PaymentStatus;
  amount: number;
  due_date?: string | null;
  photos: string[];
  ai_note?: string | null;
  display_order?: number;
}

export interface PropertyClient {
  id: number;
  name: string;
  email: string;
}

export interface Property {
  id: number;
  name: string;
  location: string;
  price: number;
  type: string;
  status: string;
  image_url: string | null;
  client_id: number | null;
  progress: number;
  beds: number;
  baths: number | string;
  sqft: number;
  description?: string | null;
  created_at?: string;
  client?: PropertyClient | null;
  milestones: Milestone[];
  /** Only present on pgvector search results (0..1 cosine similarity). */
  similarity?: number;
}

export interface Application {
  id: number;
  user_id: number;
  property_id: number;
  status: 'pending' | 'approved' | 'rejected';
  step: number;
  employment: string | null;
  income: number | null;
  down_payment: number | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
  property_name?: string;
  property_location?: string;
  property_price?: number;
}

export interface Payment {
  id: number;
  user_id: number;
  application_id: number | null;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  provider_ref: string | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Client';
  status: string;
  projects: number;
  joined: string;
  lastActive: string;
  initials: string;
}

export interface UserStats {
  totalUsers: number;
  activeClients: number;
  adminUsers: number;
  pendingVerifications: number;
}

export interface EmbeddingStatus {
  total: number;
  with_embeddings: number;
  without_embeddings: number;
  percentage: number;
}

export interface PropertyFilters {
  search?: string;
  location?: string;
  type?: string;
  status?: string;
}