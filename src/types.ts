// Frontend types for Óticas Carol system

export type UserRole = 'store' | 'approver' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  storeId?: string;
}

export type RequestType = 'montagem' | 'motoboy';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface Request {
  id: string;
  storeId: string;
  storeName: string;
  requestedBy: string;
  type: RequestType;
  justification: string;
  value: number;
  date: string;
  osNumber: string;
  chargedToClient: boolean;
  status: RequestStatus;
  attachments?: string[];
  createdAt: string;
}

export interface Approval {
  requestId: string;
  approvedBy: string;
  approverName: string;
  action: 'approved' | 'rejected';
  observation?: string;
  timestamp: string;
}

export interface Store {
  id: string;
  code: string;
  name: string;
}

export interface Stats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  thisMonthTotal: number;
  thisMonthCount: number;
}
