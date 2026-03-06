export type UserRole = 'store' | 'approver' | 'viewer';

export type RequestType = 'montagem' | 'motoboy';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  storeId?: string;
}

export interface Store {
  id: string;
  code: string;
  name: string;
}

export interface Request {
  id: string;
  storeId: string;
  storeName: string;
  requestedBy: string;
  type: RequestType;
  justification: string;
  value: number;
  date: string;
  osNumber?: string;
  chargedToClient: boolean;
  status: RequestStatus;
  attachments?: string[];
  createdAt: string;
}

export interface Approval {
  requestId: string;
  approvedBy: string;
  approverName: string;
  action: RequestStatus;
  observation?: string;
  timestamp: string;
}
