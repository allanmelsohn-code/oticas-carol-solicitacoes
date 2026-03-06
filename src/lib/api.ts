// API client for Óticas Carol system
import { projectId, publicAnonKey } from '/utils/supabase/info';
import type { User, Request, Store, Stats } from '../types';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/server`;

let sessionId: string | null = null;

export function setSessionId(id: string) {
  sessionId = id;
  localStorage.setItem('sessionId', id);
  console.log('✅ Session ID stored');
}

export function getSessionId(): string | null {
  if (sessionId) return sessionId;
  sessionId = localStorage.getItem('sessionId');
  return sessionId;
}

export function clearSessionId() {
  sessionId = null;
  localStorage.removeItem('sessionId');
  console.log('🗑️  Session cleared');
}

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const sid = getSessionId();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`, // Always include Supabase anon key
    ...options.headers,
  };

  // Add session ID to headers if available
  if (sid) {
    headers['X-Session-ID'] = sid;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // If we get 401, session is invalid
  if (response.status === 401) {
    clearSessionId();
    throw new Error('Sessão inválida. Faça login novamente.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Falha na requisição' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// Auth API
export const auth = {
  async signin(email: string, password: string) {
    try {
      console.log('🚀 Iniciando signin...');
      console.log('📧 Email:', email);
      console.log('🔗 URL:', `${API_BASE}/signin`);
      console.log('🔑 Authorization header presente:', !!publicAnonKey);
      
      // Special handling for signin - use publicAnonKey
      const response = await fetch(`${API_BASE}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password }),
      });

      console.log(`📡 Response from /signin:`, response.status, response.statusText);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Falha no login' }));
        console.error(`❌ API Error [/signin]:`, error);
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Login response data:', result);

      // Store session ID
      setSessionId(result.sessionId);

      return {
        success: true,
        user: result.user,
      };
    } catch (error) {
      console.error('💥 Exception in auth.signin:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Erro de conexão. Verifique se o backend Supabase está online e se você tem conexão com a internet.');
      }
      throw error;
    }
  },

  async getMe(): Promise<{ user: User }> {
    return apiCall('/me');
  },

  signout() {
    clearSessionId();
  },
};

// Stores API
export const stores = {
  async getAll(): Promise<{ stores: Store[] }> {
    return apiCall('/stores');
  },

  async create(code: string, name: string) {
    return apiCall('/stores', {
      method: 'POST',
      body: JSON.stringify({ code, name }),
    });
  },
};

// Requests API
export const requests = {
  async create(data: Partial<Request>) {
    return apiCall('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAll(): Promise<{ requests: Request[] }> {
    return apiCall('/requests');
  },

  async getById(id: string) {
    return apiCall(`/requests/${id}`);
  },
  
  async update(id: string, data: Partial<Request>) {
    return apiCall(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async delete(id: string) {
    return apiCall(`/requests/${id}`, {
      method: 'DELETE',
    });
  },
};

// Approvals API
export const approvals = {
  async process(requestId: string, action: 'approved' | 'rejected', observation?: string) {
    return apiCall('/approvals', {
      method: 'POST',
      body: JSON.stringify({ requestId, action, observation }),
    });
  },
};

// Reports API
export const reports = {
  async getMonthly(filters: {
    storeId?: string;
    month?: number;
    year?: number;
    type?: string;
  }) {
    const params = new URLSearchParams();
    
    if (filters.storeId) params.append('storeId', filters.storeId);
    if (filters.month) params.append('month', filters.month.toString());
    if (filters.year) params.append('year', filters.year.toString());
    if (filters.type) params.append('type', filters.type);

    return apiCall(`/reports/monthly?${params.toString()}`);
  },
};

// Dashboard API
export const dashboard = {
  async getStats(): Promise<{ stats: Stats }> {
    return apiCall('/stats');
  },
};

// Users API
export const users = {
  async getAll(): Promise<{ users: User[] }> {
    return apiCall('/users');
  },

  async create(data: { email: string; password: string; name: string; role: string; storeId?: string }) {
    return apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(email: string, data: { name?: string; role?: string; storeId?: string; password?: string }) {
    return apiCall(`/users/${email}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(email: string) {
    return apiCall(`/users/${email}`, {
      method: 'DELETE',
    });
  },
};

// Setup API
export const setup = {
  async run() {
    try {
      console.log('🚀 Calling setup endpoint...');
      console.log('🌐 URL:', `${API_BASE}/setup`);
      
      // Call with publicAnonKey (required by Supabase Edge Functions)
      const response = await fetch(`${API_BASE}/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          masterPassword: 'setup123'
        }),
      });

      console.log('📡 Setup response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Setup error response:', errorText);
        console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()));
        
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText || 'Setup failed' };
        }
        
        throw new Error(error.error || `HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Setup data:', data);
      return data;
    } catch (err) {
      console.error('❌ Setup exception:', err);
      throw err;
    }
  },
};