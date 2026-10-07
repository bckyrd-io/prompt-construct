import { API_BASE_URL } from './config';
import type {
  AdminUser,
  Application,
  EmbeddingStatus,
  Payment,
  Property,
  PropertyFilters,
  User,
  UserRole,
  UserStats,
} from '@/types/api';

/** Error carrying whatever the API returned, so screens can show a real message. */
export class ApiError extends Error {
  status: number;
  details?: string;
  suggestion?: string;

  constructor(message: string, status: number, details?: string, suggestion?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.suggestion = suggestion;
  }
}

type Body = Record<string, unknown> | FormData | undefined;

async function request<T>(path: string, init: RequestInit = {}, body?: Body): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, {
      ...init,
      headers: {
        ...(body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
        Accept: 'application/json',
        ...init.headers,
      },
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch only rejects on a transport failure, so this is always connectivity.
    throw new ApiError(
      `Cannot reach the API at ${API_BASE_URL}. Check that the server is running and that EXPO_PUBLIC_API_URL is correct.`,
      0,
    );
  }

  const text = await response.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const data = (payload ?? {}) as { error?: string; details?: string; suggestion?: string };
    throw new ApiError(
      data.error || `Request failed with status ${response.status}`,
      response.status,
      data.details,
      data.suggestion,
    );
  }

  return payload as T;
}

function query(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/* ---------------------------------------------------------------- auth ---- */

export function login(email: string, password: string) {
  return request<{ success: true; user: User }>(
    '/auth/login',
    { method: 'POST' },
    { email, password },
  );
}

export function signup(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  return request<{ success: true; user: User }>(
    '/auth/signup',
    { method: 'POST' },
    input,
  );
}

/* ---------------------------------------------------------- properties ---- */

export function getProperties(filters: PropertyFilters = {}) {
  return request<{ properties: Property[] }>(
    `/properties${query({
      search: filters.search,
      location: filters.location,
      type: filters.type,
      status: filters.status,
    })}`,
  );
}

export function getProperty(id: number | string) {
  return request<{ property: Property }>(`/properties/${id}`);
}

export function createProperty(input: {
  name: string;
  location: string;
  price: number;
  type: string;
  beds: number;
  baths: number;
  sqft: number;
  description?: string;
  image_url?: string;
}) {
  return request<{ success: true; property: Property }>(
    '/properties',
    { method: 'POST' },
    input as unknown as Record<string, unknown>,
  );
}

/** Returns the recalculated progress alongside the saved milestones. */
export function updateMilestones(
  propertyId: number | string,
  milestones: unknown[],
) {
  return request<{ success: true; progress: number; milestones: Property['milestones'] }>(
    `/properties/${propertyId}/milestones`,
    { method: 'PUT' },
    { milestones },
  );
}

/* -------------------------------------------------------- applications ---- */

export function getApplications(userId?: number) {
  return request<{ applications: Application[] }>(`/applications${query({ user_id: userId ? String(userId) : undefined })}`);
}

export function createApplication(input: {
  property_id: number;
  employment: string;
  income: number;
  down_payment: number;
  email: string;
}) {
  return request<{ success: true; applicationId: number; application: Application }>(
    '/applications',
    { method: 'POST' },
    input as unknown as Record<string, unknown>,
  );
}

export function verifyApplication(input: { userId: number; applicationId: number }) {
  return request<{ success: true; milestoneId: number | null; message: string }>(
    '/applications/verify',
    { method: 'POST' },
    input as unknown as Record<string, unknown>,
  );
}

/* ------------------------------------------------------------- payments ---- */

export function getPayments() {
  return request<{ payments: Payment[] }>('/payments');
}

export interface InitializePaymentInput {
  amount: number;
  currency?: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
  customer: { email: string; first_name: string; last_name: string };
  customization: { title: string; description: string };
  meta: Record<string, string>;
}

export function initializePayment(input: InitializePaymentInput) {
  return request<{ success: true; checkout_url: string; tx_ref: string }>(
    '/payment/initialize',
    { method: 'POST' },
    input as unknown as Record<string, unknown>,
  );
}

/* ---------------------------------------------------------- embeddings ---- */

export function getEmbeddingStatus() {
  return request<EmbeddingStatus>('/embeddings/generate');
}

export function generateEmbeddings() {
  return request<{ success: boolean; processed: number; errors: number; total: number }>(
    '/embeddings/generate',
    { method: 'POST' },
  );
}

/* -------------------------------------------------------------- uploads ---- */

export function uploadFile(uri: string, name: string, mimeType: string) {
  const form = new FormData();
  // React Native's FormData accepts this {uri,name,type} shape for file parts.
  form.append('file', { uri, name, type: mimeType } as unknown as Blob);
  return request<{ success: true; url: string; filename: string }>(
    '/upload',
    { method: 'POST' },
    form,
  );
}

/* ----------------------------------------------------------------- misc ---- */

export function getUsers() {
  return request<{ users: AdminUser[]; stats: UserStats }>('/users');
}