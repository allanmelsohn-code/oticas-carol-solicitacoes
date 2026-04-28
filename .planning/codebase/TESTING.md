# Testing Patterns

**Analysis Date:** 2026-04-28

## Test Framework

**Current Status:** No testing framework configured

- No `jest.config.js`, `vitest.config.ts`, or similar test runner config files detected
- No test dependencies in `package.json` (@testing-library, jest, vitest, etc.)
- No test files found in repository (no `*.test.ts`, `*.spec.tsx`, etc.)
- Testing is not currently implemented in this codebase

**Implication:** All testing must be implemented from scratch if this becomes a requirement.

## Project Setup (Vite-based)

**Build Tool:**
- Vite configured as build tool and dev server
- React 18.3.1 as peer dependency
- TypeScript 5.9.3 for type checking

**Package Manager:**
- pnpm used (based on `pnpm` overrides in `package.json`)
- Lock file present but not inspected for secrets

## Current Code Patterns (For Future Test Writing)

Since testing is not yet implemented, here are patterns observed in the code that would guide test structure if testing is added:

### API Layer (`src/lib/api.ts`)

**Pattern:** Centralized API client with organized endpoint groups

```typescript
export const auth = {
  async signin(email: string, password: string) {
    // API call implementation
    return { success: true, user: result.user };
  },
  async getMe(): Promise<{ user: User }> {
    return apiCall('/me');
  },
};

export const requests = {
  async create(data: Partial<Request>) { ... },
  async getAll(): Promise<{ requests: Request[] }> { ... },
  async getById(id: string) { ... },
};
```

**Test Opportunities:**
- Mock fetch calls for `signin`, `getMe`, CRUD operations
- Test session ID persistence in localStorage
- Test 401 error handling and session clearing
- Test header injection (Authorization, X-Session-ID)
- Error response parsing and user-facing error messages

### Component Patterns (`src/app/components/*.tsx`)

**Async Data Loading Pattern:**
```typescript
useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    const result = await requestsApi.getAll();
    setStats({ ... });
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
```

**Test Opportunities:**
- Test initial load state
- Mock API responses and verify state updates
- Test error states and error messages
- Test loading indicators

**Error Handling Pattern:**
```typescript
try {
  const result = await auth.signin(email, password);
  onLogin(result.user);
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
  setError(errorMessage);
}
```

**Test Opportunities:**
- Test successful auth flows
- Test error message extraction and display
- Test callback invocation on success

**State Management Pattern:**
```typescript
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

// Inline handlers
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  // ... logic
};
```

**Test Opportunities:**
- Test form submission and validation
- Test state transitions
- Test input change handlers

### Conditional Rendering Pattern:
```typescript
if (loading) {
  return <div>Carregando...</div>;
}

if (!user) {
  return <Login onLogin={handleLogin} />;
}

return <AppShell>...</AppShell>;
```

**Test Opportunities:**
- Test different render states based on props/state
- Test visibility of UI elements

## Recommended Testing Setup

If testing is to be implemented, the following stack would be compatible:

**Test Runner:** 
- Vitest (lightweight, Vite-native)
- Alternative: Jest (with babel-jest for ESM)

**React Testing:**
- @testing-library/react
- @testing-library/user-event

**Mocking:**
- vitest.mock() for modules and API calls
- MSW (Mock Service Worker) for API mocking (alternative to fetch mocks)

**Setup Steps:**
1. Install testing dependencies: `npm install --save-dev vitest @testing-library/react @testing-library/dom`
2. Create `vitest.config.ts` with React plugin configuration
3. Create `src/setupTests.ts` for global test configuration
4. Create `.test.tsx` files co-located with components

## Integration Testing (Current Code Approach)

**Current Manual Testing Pattern:**
- Components tested via app behavior in browser
- API integration tested end-to-end against Supabase backend
- Manual QA via login flow, request creation, approvals
- Console logging used for debugging and verification

**Would Benefit From:**
- Component snapshot tests for UI consistency
- Integration tests for approval workflows
- API error recovery tests
- localStorage session persistence tests

## Example Test Structure (Recommended Pattern)

Based on existing code patterns, tests should follow this structure:

```typescript
// src/lib/api.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { auth, setSessionId, getSessionId, clearSessionId } from './api';

describe('auth', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('signin', () => {
    it('should return user and store session ID on successful login', async () => {
      // Mock fetch
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessionId: 'test-sid', user: { id: '1', name: 'Test' } }),
      });

      const result = await auth.signin('test@example.com', 'password');
      
      expect(result.success).toBe(true);
      expect(getSessionId()).toBe('test-sid');
    });

    it('should throw error on failed login', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      await expect(auth.signin('test@example.com', 'wrong')).rejects.toThrow();
    });
  });
});

// src/app/components/Login.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from './Login';

describe('Login component', () => {
  it('should render email and password inputs', () => {
    const handleLogin = vi.fn();
    render(<Login onLogin={handleLogin} />);
    
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it('should call onLogin callback with user data on successful submission', async () => {
    const handleLogin = vi.fn();
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, user: { id: '1', name: 'Test' } }),
    });

    render(<Login onLogin={handleLogin} />);
    
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(handleLogin).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
    });
  });

  it('should display error message on login failure', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    render(<Login onLogin={vi.fn()} />);
    
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

## Critical Areas for Testing

**High Priority (If Testing Implemented):**
1. **Authentication flow** (`src/lib/api.ts` - `auth` module)
   - Session persistence and validation
   - 401 error handling
   
2. **Request approval workflow** (`src/app/components/ApprovalPanel.tsx`)
   - Single and bulk approval/rejection
   - Observation validation
   - Request list updates after action

3. **Form submission** (`src/app/components/NewRequest.tsx`, `UserForm.tsx`)
   - Input validation
   - API call triggering
   - Success/error feedback

4. **Error handling** (global pattern)
   - User-facing error messages
   - Graceful degradation on API failure

**Medium Priority:**
1. Date and currency formatting (`src/lib/utils.ts`)
2. Push notification initialization (`src/lib/pushNotifications.ts`)
3. Dashboard stats calculation (`src/app/components/Dashboard.tsx`)

**Low Priority (More Stable):**
1. Layout and navigation components
2. UI rendering with different props
3. Accessibility features

---

*Testing analysis: 2026-04-28*
