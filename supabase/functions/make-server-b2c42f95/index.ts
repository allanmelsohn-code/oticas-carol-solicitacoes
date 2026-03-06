import { Hono } from 'npm:hono@4.0.2';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';
import * as fcm from './fcm.ts';
import * as email from './email.tsx';
import type { User, Store, Request, Approval } from './types.ts';

const app = new Hono();

// ===== CONSTANTS =====
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas

// Origem permitida — ajuste para a URL real do seu frontend em produção
const ALLOWED_ORIGIN = Deno.env.get('FRONTEND_URL') ?? '*';

// ===== MIDDLEWARE =====
app.use('*', cors({
  origin: ALLOWED_ORIGIN,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: false,
}));
app.use('*', logger(console.log));

// ===== HELPERS =====

/** Autentica a requisição pelo header X-Session-ID */
async function authenticateRequest(c: any): Promise<User | null> {
  try {
    const sessionId = c.req.header('X-Session-ID');
    if (!sessionId) return null;

    const session = await kv.get(`session:${sessionId}`);
    if (!session) return null;

    // Verifica expiração da sessão
    if (session.expiresAt && Date.now() > session.expiresAt) {
      await kv.del(`session:${sessionId}`);
      return null;
    }

    const user = await kv.get(`user:${session.userId}`);
    return user || null;
  } catch (error) {
    console.error('❌ Auth error:', error);
    return null;
  }
}

/** Normaliza e-mail para evitar variações de case */
const normalizeEmail = (e: string) => e.trim().toLowerCase();

// ===== HEALTH CHECK =====
app.get('/health', (c) => c.json({ status: 'ok' }));

// ===== AUTH ROUTES =====

/**
 * POST /signin
 * Autentica usuário por e-mail e senha armazenados no KV.
 * 
 * FIX: senha agora é buscada SEMPRE na chave separada `password:<id>`,
 * pois o fluxo antigo dependia do campo `user.password` que pode não
 * existir após um `kv.set` que omite a senha (e.g., após update de usuário).
 * 
 * FIX: sessão agora tem expiração de 8h para evitar tokens eternos.
 */
app.post('/signin', async (c) => {
  try {
    const body = await c.req.json();
    const emailInput = normalizeEmail(body.email ?? '');
    const password = body.password ?? '';

    if (!emailInput || !password) {
      return c.json({ error: 'E-mail e senha são obrigatórios' }, 400);
    }

    // Busca todos os usuários e localiza pelo e-mail (case-insensitive)
    const users = await kv.getByPrefix('user:');
    const user = users.find((u: User) => normalizeEmail(u.email) === emailInput);

    if (!user) {
      console.log(`⚠️ [signin] Usuário não encontrado: ${emailInput}`);
      return c.json({ error: 'E-mail ou senha incorretos' }, 401);
    }

    // SEMPRE busca a senha na chave separada `password:<id>`
    // Nunca depende do campo `user.password` para autenticação
    const storedPassword = await kv.get(`password:${user.id}`);

    if (!storedPassword) {
      console.error(`❌ [signin] Senha não encontrada no KV para usuário: ${user.id}`);
      // Banco pode estar sem as senhas inicializadas — instrui o admin
      return c.json({ 
        error: 'Senha não configurada. Execute /setup para inicializar os usuários.' 
      }, 401);
    }

    if (storedPassword !== password) {
      console.log(`⚠️ [signin] Senha incorreta para: ${emailInput}`);
      return c.json({ error: 'E-mail ou senha incorretos' }, 401);
    }

    // Cria sessão com expiração
    const sessionId = crypto.randomUUID();
    await kv.set(`session:${sessionId}`, {
      userId: user.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    });

    // Nunca retorna a senha
    const { password: _pw, ...userResponse } = user;

    console.log(`✅ [signin] Login bem-sucedido: ${emailInput}`);
    return c.json({ success: true, sessionId, user: userResponse });
  } catch (error) {
    console.error('❌ [signin] Erro inesperado:', error);
    return c.json({ error: 'Erro ao fazer login' }, 500);
  }
});

/** POST /signout — Invalida a sessão atual */
app.post('/signout', async (c) => {
  try {
    const sessionId = c.req.header('X-Session-ID');
    if (sessionId) {
      await kv.del(`session:${sessionId}`);
    }
    return c.json({ success: true });
  } catch (error) {
    console.error('❌ [signout] Erro:', error);
    return c.json({ error: 'Erro ao fazer logout' }, 500);
  }
});

/** GET /me — Valida sessão e retorna usuário atual */
app.get('/me', async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user) {
      return c.json({ error: 'Não autenticado ou sessão expirada' }, 401);
    }
    const { password: _pw, ...userResponse } = user;
    return c.json({ user: userResponse });
  } catch (error) {
    console.error('❌ [me] Erro:', error);
    return c.json({ error: 'Erro ao obter usuário' }, 500);
  }
});

// ===== STORES ROUTES =====

app.get('/stores', async (c) => {
  try {
    const stores = await kv.getByPrefix('store:');
    return c.json({ stores });
  } catch (error) {
    console.error('[stores GET] Erro:', error);
    return c.json({ error: 'Falha ao buscar lojas' }, 500);
  }
});

app.post('/stores', async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user || user.role !== 'approver') {
      return c.json({ error: 'Apenas aprovadores podem criar lojas' }, 403);
    }

    const { code, name } = await c.req.json();
    if (!code || !name) {
      return c.json({ error: 'Código e nome são obrigatórios' }, 400);
    }

    const storeId = crypto.randomUUID();
    const store: Store = { id: storeId, code, name };
    await kv.set(`store:${storeId}`, store);

    return c.json({ success: true, store });
  } catch (error) {
    console.error('[stores POST] Erro:', error);
    return c.json({ error: 'Falha ao criar loja' }, 500);
  }
});

// ===== USER MANAGEMENT ROUTES =====

app.get('/users', async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user) return c.json({ error: 'Não autenticado' }, 401);
    if (user.role !== 'approver') return c.json({ error: 'Acesso negado' }, 403);

    const users = await kv.getByPrefix('user:');
    const usersWithoutPasswords = users.map(({ password: _pw, ...u }: User) => u);
    return c.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error('[users GET] Erro:', error);
    return c.json({ error: 'Falha ao buscar usuários' }, 500);
  }
});

app.post('/users', async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user || user.role !== 'approver') {
      return c.json({ error: 'Apenas aprovadores podem criar usuários' }, 403);
    }

    const { email: newEmail, password, name, role, storeId } = await c.req.json();

    if (!newEmail || !password || !name || !role) {
      return c.json({ error: 'E-mail, senha, nome e perfil são obrigatórios' }, 400);
    }

    const normalizedNewEmail = normalizeEmail(newEmail);
    const existingUsers = await kv.getByPrefix('user:');
    if (existingUsers.some((u: User) => normalizeEmail(u.email) === normalizedNewEmail)) {
      return c.json({ error: 'Já existe um usuário com este e-mail' }, 400);
    }

    let storeName = '';
    let storeCode = '';
    if (storeId) {
      const store = await kv.get(`store:${storeId}`);
      if (store) { storeName = store.name; storeCode = store.code; }
    }

    const userId = crypto.randomUUID();
    const newUser: User = {
      id: userId,
      email: normalizedNewEmail,
      name,
      role: role as User['role'],
      storeId: role === 'store' ? storeId : undefined,
      storeName: role === 'store' ? storeName : undefined,
      storeCode: role === 'store' ? storeCode : undefined,
    };

    await kv.set(`user:${userId}`, newUser);
    await kv.set(`password:${userId}`, password);

    console.log('✅ [users POST] Usuário criado:', normalizedNewEmail);
    return c.json({ success: true, user: newUser });
  } catch (error) {
    console.error('[users POST] Erro:', error);
    return c.json({ error: 'Falha ao criar usuário' }, 500);
  }
});

app.put('/users/:email', async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user || user.role !== 'approver') {
      return c.json({ error: 'Apenas aprovadores podem editar usuários' }, 403);
    }

    const targetEmail = normalizeEmail(c.req.param('email'));
    const { name, role, storeId, password } = await c.req.json();

    const allUsers = await kv.getByPrefix('user:');
    const targetUser = allUsers.find((u: User) => normalizeEmail(u.email) === targetEmail);

    if (!targetUser) return c.json({ error: 'Usuário não encontrado' }, 404);

    let storeName = '';
    let storeCode = '';
    if (storeId) {
      const store = await kv.get(`store:${storeId}`);
      if (store) { storeName = store.name; storeCode = store.code; }
    }

    const updatedUser: User = {
      ...targetUser,
      name: name || targetUser.name,
      role: role || targetUser.role,
      storeId: role === 'store' ? storeId : undefined,
      storeName: role === 'store' ? storeName : undefined,
      storeCode: role === 'store' ? storeCode : undefined,
    };
    delete updatedUser.password;

    await kv.set(`user:${targetUser.id}`, updatedUser);
    if (password) await kv.set(`password:${targetUser.id}`, password);

    return c.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('[users PUT] Erro:', error);
    return c.json({ error: 'Falha ao atualizar usuário' }, 500);
  }
});

app.delete('/users/:email', async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user || user.role !== 'approver') {
      return c.json({ error: 'Apenas aprovadores podem excluir usuários' }, 403);
    }

    const targetEmail = normalizeEmail(c.req.param('email'));
    if (normalizeEmail(user.email) === targetEmail) {
      return c.json({ error: 'Você não pode excluir sua própria conta' }, 400);
    }

    const allUsers = await kv.getByPrefix('user:');
    const targetUser = allUsers.find((u: User) => normalizeEmail(u.email) === targetEmail);
    if (!targetUser) return c.json({ error: 'Usuário não encontrado' }, 404);

    await kv.del(`user:${targetUser.id}`);
    await kv.del(`password:${targetUser.id}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('[users DELETE] Erro:', error);
    return c.json({ error: 'Falha ao excluir usuário' }, 500);
  }
});

// ===== REQUESTS ROUTES =====

app.post('/requests', async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user) return c.json({ error: 'Não autenticado' }, 401);

    const requestData = await c.req.json();
    const requestId = crypto.randomUUID();
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
      createdAt: new Date().toISOString(),
    };

    await kv.set(`request:${requestId}`, request);

    // Notificações em background — não bloqueiam a resposta
    fcm.notifyNewRequest(
      request.storeName,
      request.type === 'montagem' ? 'Montagem' : 'Motoboy',
      request.value
    ).catch((e) => console.error('❌ Push notification error:', e));

    email.sendEmail(
      email.newRequestEmail(
        request.storeName,
        request.type === 'montagem' ? 'Montagem' : 'Motoboy',
        request.value,
        request.osNumber,
        request.requestedBy,
        request.justification
      )
    ).catch((e) => console.error('❌ Email notification error:', e));

    return c.json({ success: true, request });
  } catch (error) {
    console.error('[requests POST] Erro:', error);
    return c.json({ error: 'Falha ao criar solicitação' }, 500);
  }
});

app.get('/requests', async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user) return c.json({ error: 'Não autenticado' }, 401);

    let requests = await kv.getByPrefix('request:');

    if (user.role === 'store' && user.storeId) {
      requests = requests.filter((r: Request) => r.storeId === user.storeId);
    }

    requests.sort((a: Request, b: Request) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ requests });
  } catch (error) {
    console.error('[requests GET] Erro:', error);
    return c.json({ error: 'Falha ao buscar solicitações' }, 500);
  }
});

app.get('/requests/:id', async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user) return c.json({ error: 'Não autenticado' }, 401);

    const requestId = c.req.param('id');
    const request = await kv.get(`request:${requestId}`);
    if (!request) return c.json({ error: 'Solicitação não encontrada' }, 404);

    const approval = await kv.get(`approval:${requestId}`);
    return c.json({ request, approval });
  } catch (error) {
    console.error('[requests/:id GET] Erro:', error);
    return c.json({ error: 'Falha ao buscar solicitação' }, 500);
  }
});

app.put('/requests/:id', async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user) return c.json({ error: 'Não autenticado' }, 401);

    const requestId = c.req.param('id');
    const request = await kv.get(`request:${requestId}`);
    if (!request) return c.json({ error: 'Solicitação não encontrada' }, 404);

    if (user.role === 'store' && user.storeId !== request.storeId) {
      return c.json({ error: 'Sem permissão para editar esta solicitação' }, 403);
    }
    if (request.status !== 'pending') {
      return c.json({ error: 'Apenas solicitações pendentes podem ser editadas' }, 400);
    }

    const updateData = await c.req.json();
    let storeName = request.storeName;
    if (updateData.storeId && updateData.storeId !== request.storeId) {
      const store = await kv.get(`store:${updateData.storeId}`);
      storeName = store ? `${store.code} - ${store.name}` : '';
    }

    const updatedRequest: Request = {
      ...request,
      ...updateData,
      storeName,
      id: requestId,
      status: 'pending',
      createdAt: request.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`request:${requestId}`, updatedRequest);
    return c.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error('[requests/:id PUT] Erro:', error);
    return c.json({ error: 'Falha ao atualizar solicitação' }, 500);
  }
});

app.delete('/requests/:id', async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user) return c.json({ error: 'Não autenticado' }, 401);

    const requestId = c.req.param('id');
    const request = await kv.get(`request:${requestId}`);
    if (!request) return c.json({ error: 'Solicitação não encontrada' }, 404);

    if (user.role === 'store' && user.storeId !== request.storeId) {
      return c.json({ error: 'Sem permissão para excluir esta solicitação' }, 403);
    }
    if (request.status !== 'pending') {
      return c.json({ error: 'Apenas solicitações pendentes podem ser excluídas' }, 400);
    }

    await kv.del(`request:${requestId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('[requests/:id DELETE] Erro:', error);
    return c.json({ error: 'Falha ao excluir solicitação' }, 500);
  }
});

// ===== APPROVAL ROUTES =====

app.post('/approvals', async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user || user.role !== 'approver') {
      return c.json({ error: 'Apenas aprovadores podem aprovar/reprovar solicitações' }, 403);
    }

    const { requestId, action, observation } = await c.req.json();
    if (!requestId || !action) {
      return c.json({ error: 'requestId e action são obrigatórios' }, 400);
    }
    if (!['approved', 'rejected'].includes(action)) {
      return c.json({ error: 'action deve ser "approved" ou "rejected"' }, 400);
    }

    const request = await kv.get(`request:${requestId}`);
    if (!request) return c.json({ error: 'Solicitação não encontrada' }, 404);
    if (request.status !== 'pending') {
      return c.json({ error: 'Solicitação já foi processada' }, 400);
    }

    request.status = action;
    request.updatedAt = new Date().toISOString();
    await kv.set(`request:${requestId}`, request);

    const approval: Approval = {
      requestId,
      approvedBy: user.id,
      approverName: user.name,
      action,
      observation,
      timestamp: new Date().toISOString(),
    };
    await kv.set(`approval:${requestId}`, approval);

    // Notifica a loja em background
    const allUsers = await kv.getByPrefix('user:');
    const storeUser = allUsers.find((u: User) => u.role === 'store' && u.storeId === request.storeId);

    if (storeUser) {
      const typeLabel = request.type === 'montagem' ? 'Montagem' : 'Motoboy';
      if (action === 'approved') {
        fcm.notifyRequestApproved(storeUser.id, typeLabel, request.value, observation)
          .catch((e) => console.error('❌ Push error:', e));
        email.sendEmail(
          email.approvedRequestEmail(request.storeName, typeLabel, request.value, request.osNumber, storeUser.email, observation)
        ).catch((e) => console.error('❌ Email error:', e));
      } else {
        fcm.notifyRequestRejected(storeUser.id, typeLabel, request.value, observation || 'Sem motivo especificado')
          .catch((e) => console.error('❌ Push error:', e));
        email.sendEmail(
          email.rejectedRequestEmail(request.storeName, typeLabel, request.value, request.osNumber, storeUser.email, observation || 'Sem motivo especificado')
        ).catch((e) => console.error('❌ Email error:', e));
      }
    }

    return c.json({ success: true, request, approval });
  } catch (error) {
    console.error('[approvals POST] Erro:', error);
    return c.json({ error: 'Falha ao processar aprovação' }, 500);
  }
});

// ===== REPORTS ROUTES =====

app.get('/reports/monthly', async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user) return c.json({ error: 'Não autenticado' }, 401);

    const storeId = c.req.query('storeId');
    const month = c.req.query('month');
    const year = c.req.query('year');
    const type = c.req.query('type');

    let requests = await kv.getByPrefix('request:');

    if (storeId) requests = requests.filter((r: Request) => r.storeId === storeId);
    if (month && year) {
      requests = requests.filter((r: Request) => {
        const d = new Date(r.date);
        return d.getMonth() + 1 === parseInt(month) && d.getFullYear() === parseInt(year);
      });
    }
    if (type) requests = requests.filter((r: Request) => r.type === type);

    const totals = {
      total: requests.reduce((s: number, r: Request) => s + r.value, 0),
      chargedToClient: requests.filter((r: Request) => r.chargedToClient).reduce((s: number, r: Request) => s + r.value, 0),
      notChargedToClient: requests.filter((r: Request) => !r.chargedToClient).reduce((s: number, r: Request) => s + r.value, 0),
      montagem: requests.filter((r: Request) => r.type === 'montagem').reduce((s: number, r: Request) => s + r.value, 0),
      motoboy: requests.filter((r: Request) => r.type === 'motoboy').reduce((s: number, r: Request) => s + r.value, 0),
    };

    return c.json({ requests, totals });
  } catch (error) {
    console.error('[reports/monthly GET] Erro:', error);
    return c.json({ error: 'Falha ao gerar relatório' }, 500);
  }
});

// ===== DASHBOARD STATS =====

app.get('/stats', async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user) return c.json({ error: 'Não autenticado' }, 401);

    let requests = await kv.getByPrefix('request:');
    if (user.role === 'store' && user.storeId) {
      requests = requests.filter((r: Request) => r.storeId === user.storeId);
    }

    const now = new Date();
    const thisMonthRequests = requests.filter((r: Request) => {
      const d = new Date(r.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const stats = {
      totalRequests: requests.length,
      pendingRequests: requests.filter((r: Request) => r.status === 'pending').length,
      approvedRequests: requests.filter((r: Request) => r.status === 'approved').length,
      rejectedRequests: requests.filter((r: Request) => r.status === 'rejected').length,
      thisMonthTotal: thisMonthRequests.reduce((s: number, r: Request) => s + r.value, 0),
      thisMonthCount: thisMonthRequests.length,
    };

    return c.json({ stats });
  } catch (error) {
    console.error('[stats GET] Erro:', error);
    return c.json({ error: 'Falha ao buscar estatísticas' }, 500);
  }
});

// ===== AUDIT LOG ROUTES =====

app.post('/audit', async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user) return c.json({ error: 'Não autenticado' }, 401);

    const { action, targetType, targetId, details } = await c.req.json();
    if (!action || !targetType) {
      return c.json({ error: 'action e targetType são obrigatórios' }, 400);
    }

    const auditId = crypto.randomUUID();
    const auditEntry = {
      id: auditId,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      action,
      targetType,
      targetId: targetId || null,
      details: details || null,
      timestamp: new Date().toISOString(),
    };

    await kv.set(`audit:${auditId}`, auditEntry);
    return c.json({ success: true, audit: auditEntry });
  } catch (error) {
    console.error('[audit POST] Erro:', error);
    return c.json({ error: 'Falha ao registrar auditoria' }, 500);
  }
});

app.get('/audit', async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user || user.role !== 'approver') {
      return c.json({ error: 'Acesso negado' }, 403);
    }

    const targetType = c.req.query('targetType');
    const targetId = c.req.query('targetId');
    const limit = parseInt(c.req.query('limit') || '100');

    let entries = await kv.getByPrefix('audit:');

    if (targetType) entries = entries.filter((e: any) => e.targetType === targetType);
    if (targetId) entries = entries.filter((e: any) => e.targetId === targetId);

    entries.sort((a: any, b: any) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return c.json({ audit: entries.slice(0, limit) });
  } catch (error) {
    console.error('[audit GET] Erro:', error);
    return c.json({ error: 'Falha ao buscar auditoria' }, 500);
  }
});

// ===== PENDING REPORT ROUTE =====

app.get('/reports/pending', async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user) return c.json({ error: 'Não autenticado' }, 401);
    if (user.role !== 'approver') return c.json({ error: 'Acesso negado' }, 403);

    let requests = await kv.getByPrefix('request:');
    requests = requests.filter((r: Request) => r.status === 'pending');

    const stores = await kv.getByPrefix('store:');
    const storeMap = new Map(stores.map((s: any) => [s.id, s]));

    const byStore: Record<string, any> = {};
    for (const r of requests) {
      const storeId = r.storeId;
      if (!byStore[storeId]) {
        const store = storeMap.get(storeId) as any;
        byStore[storeId] = {
          storeId,
          storeName: r.storeName || (store ? `${store.code} - ${store.name}` : storeId),
          storeCode: store?.code || '',
          count: 0,
          totalValue: 0,
          oldestDate: r.createdAt,
          requests: [],
        };
      }
      byStore[storeId].count++;
      byStore[storeId].totalValue += r.value;
      byStore[storeId].requests.push(r);
      if (new Date(r.createdAt) < new Date(byStore[storeId].oldestDate)) {
        byStore[storeId].oldestDate = r.createdAt;
      }
    }

    const summary = Object.values(byStore).sort((a: any, b: any) =>
      new Date(a.oldestDate).getTime() - new Date(b.oldestDate).getTime()
    );

    const totals = {
      totalPending: requests.length,
      totalValue: requests.reduce((s: number, r: Request) => s + r.value, 0),
      storesWithPending: summary.length,
    };

    return c.json({ summary, totals, requests });
  } catch (error) {
    console.error('[reports/pending GET] Erro:', error);
    return c.json({ error: 'Falha ao gerar relatório de pendências' }, 500);
  }
});

// ===== ADMIN ROUTES =====

app.post('/admin/clear-requests', async (c) => {
  try {
    const user = await authenticateRequest(c);
    if (!user || user.role !== 'approver') {
      return c.json({ error: 'Apenas aprovadores podem limpar solicitações' }, 403);
    }

    const requests = await kv.getByPrefix('request:');
    const approvals = await kv.getByPrefix('approval:');

    for (const r of requests) await kv.del(`request:${r.id}`);
    for (const a of approvals) await kv.del(`approval:${a.requestId}`);

    return c.json({
      success: true,
      message: `${requests.length} solicitações e ${approvals.length} aprovações removidas`,
      requestsDeleted: requests.length,
      approvalsDeleted: approvals.length,
    });
  } catch (error) {
    console.error('[admin/clear-requests] Erro:', error);
    return c.json({ error: 'Falha ao limpar solicitações' }, 500);
  }
});

// ===== SETUP ROUTE =====
/**
 * POST /setup
 * Cria usuários e lojas padrão.
 * 
 * FIX: senha master agora lida obrigatoriamente pela variável de ambiente
 * SETUP_MASTER_PASSWORD. Se não configurada, o endpoint é desabilitado.
 * Isso evita que qualquer pessoa com a URL possa resetar o sistema.
 */
app.post('/setup', async (c) => {
  try {
    const masterPasswordEnv = Deno.env.get('SETUP_MASTER_PASSWORD');
    if (!masterPasswordEnv) {
      return c.json({ error: 'Setup desabilitado: configure a variável SETUP_MASTER_PASSWORD para usar este endpoint.' }, 403);
    }

    const body = await c.req.json().catch(() => ({}));
    if (body.masterPassword !== masterPasswordEnv) {
      return c.json({ error: 'Senha master inválida' }, 403);
    }

    const results: { users: any[], stores: any[], errors: any[] } = { users: [], stores: [], errors: [] };

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

    // Lê senhas das variáveis de ambiente (nunca hardcoded)
    const defaultUsers = [
      { email: 'admin@oticascarol.com.br', password: Deno.env.get('ADMIN_PASSWORD') ?? 'CHANGE_ME', name: 'Administrador', role: 'approver' },
      { email: 'chris@oticascarol.com.br', password: Deno.env.get('CHRIS_PASSWORD') ?? 'CHANGE_ME', name: 'Chris', role: 'approver' },
      { email: 'loja1640@oticascarol.com.br', password: Deno.env.get('STORE_DEFAULT_PASSWORD') ?? 'CHANGE_ME', name: 'Loja Frei Caneca', role: 'store', storeCode: '1640' },
      { email: 'loja1687@oticascarol.com.br', password: Deno.env.get('STORE_DEFAULT_PASSWORD') ?? 'CHANGE_ME', name: 'Loja Center 3', role: 'store', storeCode: '1687' },
      { email: 'loja1688@oticascarol.com.br', password: Deno.env.get('STORE_DEFAULT_PASSWORD') ?? 'CHANGE_ME', name: 'Loja Villalobos', role: 'store', storeCode: '1688' },
      { email: 'loja2189@oticascarol.com.br', password: Deno.env.get('STORE_DEFAULT_PASSWORD') ?? 'CHANGE_ME', name: 'Loja Vila Olimpia', role: 'store', storeCode: '2189' },
      { email: 'loja2667@oticascarol.com.br', password: Deno.env.get('STORE_DEFAULT_PASSWORD') ?? 'CHANGE_ME', name: 'Loja Patio Paulista', role: 'store', storeCode: '2667' },
      { email: 'loja2605@oticascarol.com.br', password: Deno.env.get('STORE_DEFAULT_PASSWORD') ?? 'CHANGE_ME', name: 'Loja Canario', role: 'store', storeCode: '2605' },
      { email: 'loja2606@oticascarol.com.br', password: Deno.env.get('STORE_DEFAULT_PASSWORD') ?? 'CHANGE_ME', name: 'Loja Ibirapuera', role: 'store', storeCode: '2606' },
      { email: 'loja2682@oticascarol.com.br', password: Deno.env.get('STORE_DEFAULT_PASSWORD') ?? 'CHANGE_ME', name: 'Loja Morumbi Town', role: 'store', storeCode: '2682' },
      { email: 'loja2783@oticascarol.com.br', password: Deno.env.get('STORE_DEFAULT_PASSWORD') ?? 'CHANGE_ME', name: 'Loja Maracatins', role: 'store', storeCode: '2783' },
    ];

    const existingStores = await kv.getByPrefix('store:');
    const existingUsers = await kv.getByPrefix('user:');
    const storeMap = new Map<string, string>();

    for (const storeData of defaultStores) {
      try {
        let store = existingStores.find((s: Store) => s.code === storeData.code);
        if (store) {
          storeMap.set(storeData.code, store.id);
          results.stores.push({ code: storeData.code, status: 'already_exists' });
        } else {
          const storeId = crypto.randomUUID();
          store = { id: storeId, code: storeData.code, name: storeData.name };
          await kv.set(`store:${storeId}`, store);
          storeMap.set(storeData.code, storeId);
          results.stores.push({ code: storeData.code, status: 'created' });
        }
      } catch (err: any) {
        results.errors.push(`Store ${storeData.code}: ${err.message}`);
      }
    }

    for (const userData of defaultUsers) {
      try {
        const normalizedEmail = normalizeEmail(userData.email);
        const existingUser = existingUsers.find((u: User) => normalizeEmail(u.email) === normalizedEmail);

        if (existingUser) {
          await kv.set(`password:${existingUser.id}`, userData.password);
          if (userData.storeCode) {
            const storeId = storeMap.get(userData.storeCode);
            if (storeId) {
              existingUser.storeId = storeId;
              await kv.set(`user:${existingUser.id}`, existingUser);
            }
          }
          results.users.push({ email: normalizedEmail, status: 'password_updated' });
        } else {
          const userId = crypto.randomUUID();
          const storeId = userData.storeCode ? storeMap.get(userData.storeCode) : undefined;
          const newUser: User = {
            id: userId,
            email: normalizedEmail,
            name: userData.name,
            role: userData.role as User['role'],
            storeId,
          };
          await kv.set(`user:${userId}`, newUser);
          await kv.set(`password:${userId}`, userData.password);
          results.users.push({ email: normalizedEmail, status: 'created' });
        }
      } catch (err: any) {
        results.errors.push(`User ${userData.email}: ${err.message}`);
      }
    }

    return c.json({ success: true, results });
  } catch (error: any) {
    console.error('❌ [setup] Erro:', error);
    return c.json({ error: `Falha no setup: ${error.message}` }, 500);
  }
});

// ===== FCM ROUTES =====

app.post('/save-fcm-token', async (c) => {
  try {
    const { userId, email: userEmail, fcmToken, platform } = await c.req.json();
    if (!userId || !fcmToken) return c.json({ error: 'userId e fcmToken são obrigatórios' }, 400);
    await fcm.saveFCMToken(userId, userEmail, fcmToken, platform);
    return c.json({ success: true });
  } catch (error) {
    console.error('[save-fcm-token] Erro:', error);
    return c.json({ error: 'Falha ao salvar token FCM' }, 500);
  }
});

app.post('/remove-fcm-token', async (c) => {
  try {
    const { fcmToken } = await c.req.json();
    if (!fcmToken) return c.json({ error: 'fcmToken é obrigatório' }, 400);
    await fcm.removeFCMToken(fcmToken);
    return c.json({ success: true });
  } catch (error) {
    console.error('[remove-fcm-token] Erro:', error);
    return c.json({ error: 'Falha ao remover token FCM' }, 500);
  }
});

Deno.serve((req) => {
  const url = new URL(req.url);
  url.pathname = url.pathname.replace('/make-server-b2c42f95', '') || '/';
  return app.fetch(new Request(url.toString(), req));
});