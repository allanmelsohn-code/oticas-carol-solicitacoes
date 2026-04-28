import { Hono } from 'npm:hono@4.0.2';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import * as fcm from './fcm.ts';
import type { User, Store, Request, Approval } from './types.ts';
import { sendNewRequestEmail, sendApprovedEmail, sendRejectedEmail } from './email.ts';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Helper function to get user from KV or Supabase Auth metadata
async function getUser(authUserId: string, authUserEmail: string, authUserMetadata: any): Promise<User> {
  // Try to get from KV first
  let user = await kv.get(`user:${authUserId}`);
  
  // If not in KV, create from Supabase Auth metadata
  if (!user) {
    user = {
      id: authUserId,
      email: authUserEmail,
      name: authUserMetadata?.name || 'Usuário',
      role: authUserMetadata?.role || 'approver',
      storeId: authUserMetadata?.storeId,
    };
    
    // Store in KV for future use
    try {
      await kv.set(`user:${authUserId}`, user);
    } catch (e) {
      console.log('Failed to cache user in KV:', e);
    }
  }
  
  return user;
}

// Health check endpoint
app.get("/make-server-b2c42f95/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== AUTH ROUTES =====

// Simple authentication - check credentials against fixed users
app.post("/make-server-b2c42f95/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Fixed users - stored in KV
    const users = await kv.getByPrefix('user:');
    const user = users.find((u: User) => u.email === email);

    if (!user) {
      return c.json({ error: 'E-mail ou senha incorretos' }, 401);
    }

    // Check password - first try from separate key, then from user object
    let storedPassword = await kv.get(`password:${user.id}`);
    
    // If password not in separate key, check if it's in user object
    if (!storedPassword && user.password) {
      storedPassword = user.password;
    }
    
    if (storedPassword !== password) {
      return c.json({ error: 'E-mail ou senha incorretos' }, 401);
    }
    
    // Create simple session ID
    const sessionId = crypto.randomUUID();
    await kv.set(`session:${sessionId}`, user.id);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    return c.json({ 
      success: true, 
      sessionId,
      user: userResponse
    });
  } catch (error) {
    console.log('❌ Signin error:', error);
    return c.json({ error: 'Erro ao fazer login' }, 500);
  }
});

// Validate session
app.get("/make-server-b2c42f95/me", async (c) => {
  try {
    const sessionId = c.req.header('X-Session-ID');
    
    if (!sessionId) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const userId = await kv.get(`session:${sessionId}`);
    
    if (!userId) {
      return c.json({ error: 'Sessão inválida' }, 401);
    }

    const user = await kv.get(`user:${userId}`);

    if (!user) {
      return c.json({ error: 'Usuário não encontrado' }, 404);
    }

    return c.json({ user });
  } catch (error) {
    console.log('❌ Get current user error:', error);
    return c.json({ error: 'Erro ao obter usuário' }, 500);
  }
});

// Helper function to authenticate requests
async function authenticateRequest(c: any): Promise<User | null> {
  try {
    const sessionId = c.req.header('X-Session-ID');
    
    if (!sessionId) {
      return null;
    }

    const userId = await kv.get(`session:${sessionId}`);
    
    if (!userId) {
      return null;
    }

    const user = await kv.get(`user:${userId}`);
    return user || null;
  } catch (error) {
    console.error('❌ Auth error:', error);
    return null;
  }
}

// ===== STORES ROUTES =====

// Get all stores
app.get("/make-server-b2c42f95/stores", async (c) => {
  try {
    const stores = await kv.getByPrefix('store:');
    return c.json({ stores });
  } catch (error) {
    console.log('Get stores error:', error);
    return c.json({ error: 'Failed to get stores' }, 500);
  }
});

// Create store (admin only)
app.post("/make-server-b2c42f95/stores", async (c) => {
  try {
    const user = await authenticateRequest(c);
    
    if (!user || user.role !== 'approver' && user.role !== 'approver_store') {
      return c.json({ error: 'Only approvers can create stores' }, 403);
    }

    const { code, name } = await c.req.json();
    const storeId = crypto.randomUUID();

    const store: Store = {
      id: storeId,
      code,
      name
    };

    await kv.set(`store:${storeId}`, store);

    return c.json({ success: true, store });
  } catch (error) {
    console.log('Create store error:', error);
    return c.json({ error: 'Failed to create store' }, 500);
  }
});

// ===== USER MANAGEMENT ROUTES =====

// Create new user (admin only)
app.post("/make-server-b2c42f95/users", async (c) => {
  try {
    const user = await authenticateRequest(c);
    
    if (!user || user.role !== 'approver' && user.role !== 'approver_store') {
      return c.json({ error: 'Only approvers can create users' }, 403);
    }

    const { email, password, name, role, storeId } = await c.req.json();
    
    // Validate required fields
    if (!email || !password || !name || !role) {
      return c.json({ error: 'Email, password, name, and role are required' }, 400);
    }
    
    // Check if user already exists
    const existingUsers = await kv.getByPrefix('user:');
    const userExists = existingUsers.some((u: User) => u.email === email);
    
    if (userExists) {
      return c.json({ error: 'User with this email already exists' }, 400);
    }

    const userId = crypto.randomUUID();
    
    // Find store name if storeId provided
    let storeName = '';
    let storeCode = '';
    if (storeId) {
      const store = await kv.get(`store:${storeId}`);
      if (store) {
        storeName = store.name;
        storeCode = store.code;
      }
    }

    const newUser: User = {
      id: userId,
      email,
      name,
      role: role as 'store' | 'approver' | 'approver_store' | 'viewer',
      storeId: (role === 'store' || role === 'approver_store') ? storeId : undefined,
      storeName: (role === 'store' || role === 'approver_store') ? storeName : undefined,
      storeCode: (role === 'store' || role === 'approver_store') ? storeCode : undefined,
    };

    await kv.set(`user:${userId}`, newUser);
    
    // Store password separately for compatibility with setup endpoint
    await kv.set(`password:${userId}`, password);

    console.log('✅ User created:', email);
    return c.json({ success: true, user: newUser });
  } catch (error) {
    console.log('Create user error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Update user (admin only)
app.put("/make-server-b2c42f95/users/:email", async (c) => {
  try {
    const user = await authenticateRequest(c);
    
    if (!user || user.role !== 'approver' && user.role !== 'approver_store') {
      return c.json({ error: 'Only approvers can update users' }, 403);
    }

    const email = c.req.param('email');
    const { name, role, storeId, password } = await c.req.json();
    
    // Find user by email
    const allUsers = await kv.getByPrefix('user:');
    const targetUser = allUsers.find((u: User) => u.email === email);
    
    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Find store info if storeId provided
    let storeName = '';
    let storeCode = '';
    if (storeId) {
      const store = await kv.get(`store:${storeId}`);
      if (store) {
        storeName = store.name;
        storeCode = store.code;
      }
    }

    const updatedUser: User = {
      ...targetUser,
      name: name || targetUser.name,
      role: role || targetUser.role,
      storeId: (role === 'store' || role === 'approver_store') ? storeId : undefined,
      storeName: (role === 'store' || role === 'approver_store') ? storeName : undefined,
      storeCode: (role === 'store' || role === 'approver_store') ? storeCode : undefined,
    };
    
    // Remove password from user object (stored separately)
    delete updatedUser.password;

    await kv.set(`user:${targetUser.id}`, updatedUser);
    
    // Update password separately if provided
    if (password) {
      await kv.set(`password:${targetUser.id}`, password);
    }

    console.log('✅ User updated:', email);
    return c.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log('Update user error:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// Get all users (admin only)
app.get("/make-server-b2c42f95/users", async (c) => {
  try {
    console.log('📋 GET /users endpoint called');
    const sessionId = c.req.header('X-Session-ID');
    console.log('🔑 Session ID received:', sessionId ? 'YES' : 'NO');
    
    const user = await authenticateRequest(c);
    console.log('👤 Authenticated user:', user ? user.email : 'NOT AUTHENTICATED');
    console.log('👤 User role:', user?.role);
    
    if (!user || user.role !== 'approver' && user.role !== 'approver_store') {
      console.log('❌ Access denied - user role:', user?.role);
      return c.json({ error: 'Only approvers can list users' }, 403);
    }

    const users = await kv.getByPrefix('user:');
    console.log('✅ Found users:', users.length);
    
    // Remove passwords from response
    const usersWithoutPasswords = users.map((u: User) => ({
      ...u,
      password: undefined
    }));

    return c.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.log('❌ Get users error:', error);
    return c.json({ error: 'Failed to get users' }, 500);
  }
});

// Delete user (admin only)
app.delete("/make-server-b2c42f95/users/:email", async (c) => {
  try {
    const user = await authenticateRequest(c);
    
    if (!user || user.role !== 'approver' && user.role !== 'approver_store') {
      return c.json({ error: 'Only approvers can delete users' }, 403);
    }

    const email = c.req.param('email');
    
    // Prevent deleting self
    if (email === user.email) {
      return c.json({ error: 'You cannot delete your own account' }, 400);
    }
    
    // Find user by email
    const allUsers = await kv.getByPrefix('user:');
    const targetUser = allUsers.find((u: User) => u.email === email);
    
    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    await kv.del(`user:${targetUser.id}`);

    console.log('✅ User deleted:', email);
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete user error:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

// ===== REQUESTS ROUTES =====

// Create new request
app.post("/make-server-b2c42f95/requests", async (c) => {
  try {
    const user = await authenticateRequest(c);
    
    if (!user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const requestData = await c.req.json();
    const requestId = crypto.randomUUID();

    // Get store info
    const store = await kv.get(`store:${requestData.storeId}`);

    const request: Request = {
      id: requestId,
      storeId: requestData.storeId,
      storeName: store ? `${store.code} - ${store.name}` : '',
      requestedBy: requestData.requestedBy,
      type: requestData.type,
      justification: requestData.justification,
      value: requestData.value,
      date: requestData.date,
      osNumber: requestData.osNumber,
      chargedToClient: requestData.chargedToClient,
      status: 'pending',
      attachments: requestData.attachments || [],
      createdAt: new Date().toISOString()
    };

    await kv.set(`request:${requestId}`, request);

    // ⚠️ Emails enviados de forma SÍNCRONA — edge functions encerram após a resposta,
    // padrão fire-and-forget não funciona no Supabase Edge Runtime.
    try {
      const allUsers = await kv.getByPrefix('user:');
      const approvers = allUsers.filter((u: { role: string }) => u.role === 'approver' || u.role === 'approver_store');
      const emailData = {
        id: request.id,
        storeName: request.storeName,
        type: request.type,
        value: request.value,
        osNumber: request.osNumber,
        date: request.date,
        justification: request.justification,
        chargedToClient: request.chargedToClient ?? false,
        requestedBy: request.requestedBy,
      };
      console.log(`📧 Enviando email para ${approvers.length} aprovador(es)...`);
      await Promise.all(
        approvers.map((approver: { email: string }) =>
          sendNewRequestEmail(emailData, approver.email).catch(e => console.error('Email error:', e))
        )
      );
      console.log('📧 Emails enviados com sucesso');
    } catch (e) {
      console.error('Email dispatch error:', e);
    }

    // Push notification (best-effort, não bloqueia resposta)
    fcm.notifyNewRequest(
      request.storeName,
      request.type === 'montagem' ? 'Montagem' : 'Motoboy',
      request.value
    ).catch(error => {
      console.error('❌ Erro ao enviar notificação push:', error);
      // Don't fail the request creation if notification fails
    });

    return c.json({ success: true, request });
  } catch (error) {
    console.log('Create request error:', error);
    return c.json({ error: 'Failed to create request' }, 500);
  }
});

// Get all requests
app.get("/make-server-b2c42f95/requests", async (c) => {
  try {
    const user = await authenticateRequest(c);
    
    if (!user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    let requests = await kv.getByPrefix('request:');

    // Filter requests based on user role
    if (user.role === 'store' && user.storeId) {
      requests = requests.filter((r: Request) => r.storeId === user.storeId);
    }

    // Sort by creation date (newest first)
    requests.sort((a: Request, b: Request) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ requests });
  } catch (error) {
    console.log('Get requests error:', error);
    return c.json({ error: 'Failed to get requests' }, 500);
  }
});

// Get request by ID
app.get("/make-server-b2c42f95/requests/:id", async (c) => {
  try {
    const user = await authenticateRequest(c);
    
    if (!user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const requestId = c.req.param('id');
    const request = await kv.get(`request:${requestId}`);

    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }

    // Get approval if exists
    const approval = await kv.get(`approval:${requestId}`);

    return c.json({ request, approval });
  } catch (error) {
    console.log('Get request error:', error);
    return c.json({ error: 'Failed to get request' }, 500);
  }
});

// Update request (only for pending requests by store users)
app.put("/make-server-b2c42f95/requests/:id", async (c) => {
  try {
    const user = await authenticateRequest(c);
    
    if (!user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const requestId = c.req.param('id');
    const request = await kv.get(`request:${requestId}`);

    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }

    // Only allow store users to update their own pending requests
    if (user.role === 'store' && user.storeId !== request.storeId) {
      return c.json({ error: 'Você não tem permissão para editar esta solicitação' }, 403);
    }

    // Can only update pending requests
    if (request.status !== 'pending') {
      return c.json({ error: 'Apenas solicitações pendentes podem ser editadas' }, 400);
    }

    const updateData = await c.req.json();

    // Get store info if storeId changed
    let storeName = request.storeName;
    if (updateData.storeId && updateData.storeId !== request.storeId) {
      const store = await kv.get(`store:${updateData.storeId}`);
      storeName = store ? `${store.code} - ${store.name}` : '';
    }

    const updatedRequest: Request = {
      ...request,
      ...updateData,
      storeName,
      id: requestId, // Keep the same ID
      status: 'pending', // Keep as pending
      createdAt: request.createdAt, // Keep original creation date
      updatedAt: new Date().toISOString()
    };

    await kv.set(`request:${requestId}`, updatedRequest);

    return c.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.log('Update request error:', error);
    return c.json({ error: 'Failed to update request' }, 500);
  }
});

// Delete request (only for pending requests by store users)
app.delete("/make-server-b2c42f95/requests/:id", async (c) => {
  try {
    const user = await authenticateRequest(c);
    
    if (!user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const requestId = c.req.param('id');
    const request = await kv.get(`request:${requestId}`);

    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }

    // Only allow store users to delete their own pending requests
    if (user.role === 'store' && user.storeId !== request.storeId) {
      return c.json({ error: 'Você não tem permissão para excluir esta solicitação' }, 403);
    }

    // Can only delete pending requests
    if (request.status !== 'pending') {
      return c.json({ error: 'Apenas solicitações pendentes podem ser excluídas' }, 400);
    }

    await kv.del(`request:${requestId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete request error:', error);
    return c.json({ error: 'Failed to delete request' }, 500);
  }
});

// ===== APPROVAL ROUTES =====

// Approve or reject request
app.post("/make-server-b2c42f95/approvals", async (c) => {
  try {
    const user = await authenticateRequest(c);
    
    const canApprove = user && (user.role === 'approver' || user.role === 'approver_store');
    if (!canApprove) {
      return c.json({ error: 'Only approvers can approve/reject requests' }, 403);
    }

    const { requestId, action, observation } = await c.req.json();

    // Get request
    const request = await kv.get(`request:${requestId}`);

    if (!request) {
      return c.json({ error: 'Request not found' }, 404);
    }

    // Update request status
    request.status = action;
    await kv.set(`request:${requestId}`, request);

    // Create approval record
    const approval: Approval = {
      requestId,
      approvedBy: user.id,
      approverName: user.name,
      action,
      observation,
      timestamp: new Date().toISOString()
    };

    await kv.set(`approval:${requestId}`, approval);

    // Email síncrono ao solicitante — fire-and-forget não funciona no Supabase Edge Runtime
    try {
      const allUsersForEmail = await kv.getByPrefix('user:');
      const requester = allUsersForEmail.find((u: { role: string; storeId: string }) =>
        (u.role === 'store' || u.role === 'approver_store') && u.storeId === request.storeId
      );
      if (requester) {
        const emailData = {
          id: request.id,
          storeName: request.storeName,
          type: request.type,
          value: request.value,
          osNumber: request.osNumber,
          date: request.date,
          justification: request.justification,
          chargedToClient: request.chargedToClient ?? false,
          requestedBy: request.requestedBy,
        };
        console.log(`📧 Enviando email de ${action} para ${requester.email}...`);
        if (action === 'approved') {
          await sendApprovedEmail(emailData, requester.email, user.name);
        } else {
          await sendRejectedEmail(emailData, requester.email, user.name, observation ?? '');
        }
        console.log('📧 Email enviado com sucesso');
      } else {
        console.warn(`⚠️ Nenhum usuário encontrado para storeId: ${request.storeId}`);
      }
    } catch (e) {
      console.error('Email dispatch error:', e);
    }

    // Send push notification to store user who created the request
    // Find the user who created the request by storeId
    const allUsers = await kv.getByPrefix('user:');
    const storeUser = allUsers.find((u: User) => (u.role === 'store' || u.role === 'approver_store') && u.storeId === request.storeId);
    
    if (storeUser) {
      if (action === 'approved') {
        fcm.notifyRequestApproved(
          storeUser.id,
          request.type === 'montagem' ? 'Montagem' : 'Motoboy',
          request.value,
          observation
        ).catch(error => {
          console.error('❌ Erro ao enviar notificação push:', error);
        });
      } else if (action === 'rejected') {
        fcm.notifyRequestRejected(
          storeUser.id,
          request.type === 'montagem' ? 'Montagem' : 'Motoboy',
          request.value,
          observation || 'Sem motivo especificado'
        ).catch(error => {
          console.error('❌ Erro ao enviar notificação push:', error);
        });
      }
    }

    return c.json({ success: true, request, approval });
  } catch (error) {
    console.log('Approval error:', error);
    return c.json({ error: 'Failed to process approval' }, 500);
  }
});

// Get approval for a specific request
app.get("/make-server-b2c42f95/approvals/:requestId", async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user) return c.json({ error: 'Não autenticado' }, 401);

    const requestId = c.req.param('requestId');

    // Scope check: store users may only see approvals for their own requests
    if (user.role === 'store') {
      const request = await kv.get(`request:${requestId}`);
      if (!request || user.storeId !== request.storeId) {
        return c.json({ error: 'Não encontrado' }, 404);
      }
    }

    const approval = await kv.get(`approval:${requestId}`);

    if (!approval) {
      return c.json({ error: 'Approval not found' }, 404);
    }

    return c.json({ approval });
  } catch (error) {
    console.log('Get approval error:', error);
    return c.json({ error: 'Failed to get approval' }, 500);
  }
});

// ===== REPORTS ROUTES =====

// Get monthly report
app.get("/make-server-b2c42f95/reports/monthly", async (c) => {
  try {
    const user = await authenticateRequest(c);
    
    if (!user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const storeId = c.req.query('storeId');
    const month = c.req.query('month');
    const year = c.req.query('year');
    const type = c.req.query('type');

    let requests = await kv.getByPrefix('request:');

    // Apply filters
    if (storeId) {
      requests = requests.filter((r: Request) => r.storeId === storeId);
    }

    if (month && year) {
      requests = requests.filter((r: Request) => {
        const requestDate = new Date(r.date);
        return requestDate.getMonth() + 1 === parseInt(month) && 
               requestDate.getFullYear() === parseInt(year);
      });
    }

    if (type) {
      requests = requests.filter((r: Request) => r.type === type);
    }

    // Calculate totals
    const totals = {
      total: requests.reduce((sum: number, r: Request) => sum + r.value, 0),
      chargedToClient: requests.filter((r: Request) => r.chargedToClient).reduce((sum: number, r: Request) => sum + r.value, 0),
      notChargedToClient: requests.filter((r: Request) => !r.chargedToClient).reduce((sum: number, r: Request) => sum + r.value, 0),
      montagem: requests.filter((r: Request) => r.type === 'montagem').reduce((sum: number, r: Request) => sum + r.value, 0),
      motoboy: requests.filter((r: Request) => r.type === 'motoboy').reduce((sum: number, r: Request) => sum + r.value, 0),
    };

    return c.json({ requests, totals });
  } catch (error) {
    console.log('Get report error:', error);
    return c.json({ error: 'Failed to get report' }, 500);
  }
});

// ===== DASHBOARD STATS =====

app.get("/make-server-b2c42f95/stats", async (c) => {
  try {
    console.log('📊 Stats endpoint called');
    const user = await authenticateRequest(c);
    
    if (!user) {
      console.error('❌ No token provided');
      return c.json({ error: 'No token provided' }, 401);
    }

    console.log('✅ User authenticated:', user.email);
    
    let requests = await kv.getByPrefix('request:');
    console.log('📋 Total requests found:', requests.length);

    // Filter by store if user is store role
    if (user.role === 'store' && user.storeId) {
      requests = requests.filter((r: Request) => r.storeId === user.storeId);
      console.log('🏪 Filtered to store requests:', requests.length);
    }

    // Calculate current month stats
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthRequests = requests.filter((r: Request) => {
      const requestDate = new Date(r.date);
      return requestDate.getMonth() === currentMonth && 
             requestDate.getFullYear() === currentYear;
    });

    const stats = {
      totalRequests: requests.length,
      pendingRequests: requests.filter((r: Request) => r.status === 'pending').length,
      approvedRequests: requests.filter((r: Request) => r.status === 'approved').length,
      rejectedRequests: requests.filter((r: Request) => r.status === 'rejected').length,
      thisMonthTotal: thisMonthRequests.reduce((sum: number, r: Request) => sum + r.value, 0),
      thisMonthCount: thisMonthRequests.length,
    };

    console.log('📊 Stats calculated:', stats);
    return c.json({ stats });
  } catch (error) {
    console.log('❌ Get stats error:', error);
    return c.json({ error: 'Failed to get stats' }, 500);
  }
});

// ===== ADMIN ROUTES =====

// Clear all requests and approvals (admin only)
app.post("/make-server-b2c42f95/admin/clear-requests", async (c) => {
  try {
    const user = await authenticateRequest(c);
    
    if (!user || user.role !== 'approver' && user.role !== 'approver_store') {
      return c.json({ error: 'Apenas aprovadores podem limpar solicitações' }, 403);
    }

    // Get all requests and approvals
    const requests = await kv.getByPrefix('request:');
    const approvals = await kv.getByPrefix('approval:');
    
    // Delete all requests
    for (const request of requests) {
      await kv.del(`request:${request.id}`);
    }
    
    // Delete all approvals
    for (const approval of approvals) {
      await kv.del(`approval:${approval.requestId}`);
    }

    console.log(`✅ Cleared ${requests.length} requests and ${approvals.length} approvals`);
    
    return c.json({ 
      success: true, 
      message: `${requests.length} solicitações e ${approvals.length} aprovações foram removidas`,
      requestsDeleted: requests.length,
      approvalsDeleted: approvals.length
    });
  } catch (error) {
    console.log('❌ Clear requests error:', error);
    return c.json({ error: 'Falha ao limpar solicitações' }, 500);
  }
});

// Setup route - creates default users and stores
// This is a public endpoint with a master password for security
app.post("/make-server-b2c42f95/setup", async (c) => {
  try {
    console.log('🚀 Setup endpoint called');
    
    // Get master password from request (optional security)
    const body = await c.req.json().catch(() => ({}));
    const masterPassword = body.masterPassword || 'setup123';
    
    console.log('🔐 Master password provided:', masterPassword ? 'YES' : 'NO');
    
    // Simple master password check (you can change this)
    if (masterPassword !== 'setup123') {
      console.log('❌ Invalid master password');
      return c.json({ error: 'Invalid master password. Use "setup123"' }, 403);
    }
    
    const results = {
      users: [],
      stores: [],
      errors: []
    };

    // Create default users with fixed passwords
    const defaultUsers = [
      {
        email: 'admin@oticascarol.com.br',
        password: 'admin123',
        name: 'Administrador',
        role: 'approver',
      },
      {
        email: 'chris@oticascarol.com.br',
        password: 'chris123',
        name: 'Chris',
        role: 'approver',
      },
      // Store users
      {
        email: 'loja1640@oticascarol.com.br',
        password: 'senha123',
        name: 'Loja Frei Caneca',
        role: 'store',
        storeCode: '1640',
      },
      {
        email: 'loja1687@oticascarol.com.br',
        password: 'senha123',
        name: 'Loja Center 3',
        role: 'store',
        storeCode: '1687',
      },
      {
        email: 'loja1688@oticascarol.com.br',
        password: 'senha123',
        name: 'Loja Villalobos',
        role: 'store',
        storeCode: '1688',
      },
      {
        email: 'loja2189@oticascarol.com.br',
        password: 'senha123',
        name: 'Loja Vila Olimpia',
        role: 'store',
        storeCode: '2189',
      },
      {
        email: 'loja2667@oticascarol.com.br',
        password: 'senha123',
        name: 'Loja Patio Paulista',
        role: 'store',
        storeCode: '2667',
      },
      {
        email: 'loja2605@oticascarol.com.br',
        password: 'senha123',
        name: 'Loja Canario',
        role: 'store',
        storeCode: '2605',
      },
      {
        email: 'loja2606@oticascarol.com.br',
        password: 'senha123',
        name: 'Loja Ibirapuera',
        role: 'store',
        storeCode: '2606',
      },
      {
        email: 'loja2682@oticascarol.com.br',
        password: 'senha123',
        name: 'Loja Morumbi Town',
        role: 'store',
        storeCode: '2682',
      },
      {
        email: 'loja2783@oticascarol.com.br',
        password: 'senha123',
        name: 'Loja Maracatins',
        role: 'store',
        storeCode: '2783',
      },
    ];

    // Get existing users first
    const existingUsers = await kv.getByPrefix('user:');
    console.log('📋 Existing users:', existingUsers.length);
    
    // Create default stores first (so we can link users to stores)
    const defaultStores = [
      { code: '1640', name: 'FREI CANECA' },
      { code: '1687', name: 'CENTER 3' },
      { code: '1688', name: 'VILLALOBOS' },
      { code: '2189', name: 'VILA OLIMPIA' },
      { code: '2667', name: 'PATIO PAULISTA' },
      { code: '2605', name: 'CANARIO' },
      { code: '2606', name: 'IBIRAPUERA' },
      { code: '2682', name: 'MORUMBI TOWN' },
      { code: '2783', name: 'MARACATINS' },
    ];

    // Get existing stores first
    const existingStores = await kv.getByPrefix('store:');
    console.log('🏪 Existing stores:', existingStores.length);
    
    const storeMap = new Map();

    for (const storeData of defaultStores) {
      try {
        // Check if store already exists
        let store = existingStores.find((s: Store) => s.code === storeData.code);
        
        if (store) {
          console.log('🏪 Store already exists:', storeData.code);
          results.stores.push({ code: storeData.code, status: 'already_exists', id: store.id });
          storeMap.set(storeData.code, store.id);
        } else {
          const storeId = crypto.randomUUID();
          store = {
            id: storeId,
            code: storeData.code,
            name: storeData.name
          };
          await kv.set(`store:${storeId}`, store);
          console.log('✅ Store created:', storeData.code);
          results.stores.push({ code: storeData.code, status: 'created', id: storeId });
          storeMap.set(storeData.code, storeId);
        }
      } catch (err) {
        console.error('❌ Error creating store:', storeData.code, err);
        results.errors.push(`Store ${storeData.code}: ${err.message}`);
      }
    }

    // Now create users with store links
    for (const userData of defaultUsers) {
      try {
        // Check if user already exists
        const existingUser = existingUsers.find((u: User) => u.email === userData.email);
        
        if (existingUser) {
          console.log('👤 User already exists:', userData.email);
          
          // Update password and storeId for existing user
          await kv.set(`password:${existingUser.id}`, userData.password);
          
          // Update storeId if this is a store user
          if (userData.storeCode) {
            const storeId = storeMap.get(userData.storeCode);
            if (storeId) {
              existingUser.storeId = storeId;
              await kv.set(`user:${existingUser.id}`, existingUser);
              console.log('🔄 Updated storeId for:', userData.email);
            }
          }
          
          console.log('🔄 Password updated for:', userData.email);
          results.users.push({ email: userData.email, status: 'password_updated', id: existingUser.id });
        } else {
          const userId = crypto.randomUUID();
          
          // Get storeId if this is a store user
          let storeId = undefined;
          if (userData.storeCode) {
            storeId = storeMap.get(userData.storeCode);
          }
          
          const user: User = {
            id: userId,
            email: userData.email,
            name: userData.name,
            role: userData.role as any,
            storeId: storeId,
          };
          
          // Store user in KV
          await kv.set(`user:${userId}`, user);
          
          // Store password separately
          await kv.set(`password:${userId}`, userData.password);
          
          console.log('✅ User created:', userData.email, storeId ? `(linked to store ${userData.storeCode})` : '');
          results.users.push({ email: userData.email, status: 'created', id: userId });
        }
      } catch (err) {
        console.error('❌ Error creating user:', userData.email, err);
        results.errors.push(`User ${userData.email}: ${err.message}`);
      }
    }

    console.log('✅ Setup completed:', results);
    
    return c.json({ 
      success: true, 
      results,
      message: `Setup completed: ${results.users.filter((u: any) => u.status === 'created').length} users created, ${results.stores.filter((s: any) => s.status === 'created').length} stores created`
    });
  } catch (error) {
    console.error('❌ Setup error:', error);
    return c.json({ error: `Failed to run setup: ${error.message}` }, 500);
  }
});

// ===== FCM (PUSH NOTIFICATIONS) ROUTES =====

// Save FCM token
app.post("/make-server-b2c42f95/save-fcm-token", async (c) => {
  try {
    const { userId, email, fcmToken, platform } = await c.req.json(); 
    if (!userId || !fcmToken) {
      return c.json({ error: 'userId and fcmToken are required' }, 400);
    }

    await fcm.saveFCMToken(userId, email, fcmToken, platform);
    return c.json({ success: true, message: 'FCM token saved' });
  } catch (error) {
    console.error('❌ Save FCM token error:', error);
    return c.json({ error: 'Failed to save FCM token' }, 500);
  }
});

// Remove FCM token
app.post("/make-server-b2c42f95/remove-fcm-token", async (c) => {
  try {
    const { fcmToken } = await c.req.json(); 
    if (!fcmToken) {
      return c.json({ error: 'fcmToken is required' }, 400);
    }

    await fcm.removeFCMToken(fcmToken);
    return c.json({ success: true, message: 'FCM token removed' });
  } catch (error) {
    console.error('❌ Remove FCM token error:', error);
    return c.json({ error: 'Failed to remove FCM token' }, 500);
  }
});

Deno.serve(app.fetch);