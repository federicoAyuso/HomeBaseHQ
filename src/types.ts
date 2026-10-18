export type UserRole = 'main' | 'admin' | 'manager' | 'tenant';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  email: string;
  avatar?: string;
  googleConnected: boolean;
  googleEmail?: string;
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
  assignedUnitNumber?: string;
  requestedUnitNumber?: string;
}

export interface Region {
  id: string;
  name: string;
  code: string;
  description?: string;
  propertyCount?: number;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  regionId: string;
  totalUnits: number;
  imageUrl?: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  status: 'Available' | 'Occupied' | 'Maintenance';
  meterSerial?: string;
  waterMeterSerial?: string;
  rentAmount: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  currentTenantId?: string | null;
}

export interface TenantNote {
  id: string;
  text: string;
  author: string;
  date: string;
  category: 'General' | 'Payment History' | 'Condition & Move-Out' | 'Reference & Conduct' | 'Deposit Settlement';
}

export interface Tenant {
  id: string;
  name: string;
  contact: string;
  email?: string;
  bankDetails: string;
  kycIdPassport?: string;
  kycStatus: 'Verified' | 'Pending' | 'Rejected';
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
  requestedUnitId?: string;
  requestedUnitNumber?: string;
  requestedPropertyName?: string;
  agreedRent?: number;
  securityDeposit?: number;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  leaseStart?: string;
  leaseEnd?: string;
  assignedUnitIds: string[];
  notes?: string;
  createdAt: string;
  status?: 'Active' | 'Past' | 'Moved Out' | 'Evicted';
  isPastTenant?: boolean;
  formerUnitNumber?: string;
  formerPropertyName?: string;
  moveOutDate?: string;
  departureReason?: string;
  forwardingAddress?: string;
  depositRefunded?: number;
  depositDeductions?: number;
  depositNotes?: string;
  historyNotes?: TenantNote[];
}

export interface Payment {
  id: string;
  tenantId: string;
  unitId?: string;
  amount: number;
  expense: number;
  date: string;
  receiptNumber: string;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Credit Card' | 'Check' | 'Online Portal';
  status: 'Paid' | 'Pending' | 'Overdue';
  notes?: string;
  createdAt: string;
  isHistorical?: boolean;
  periodCovered?: string;
}

export interface MaintenanceTicket {
  id: string;
  unitId: string;
  propertyId: string;
  tenantId?: string;
  title: string;
  description: string;
  category: 'Plumbing' | 'Electrical' | 'HVAC' | 'Structural' | 'Appliance' | 'General';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  assignedTo?: string;
  imageUrl?: string;
  updates?: {
    id: string;
    author: string;
    text: string;
    timestamp: string;
  }[];
}

export interface Reminder {
  id: string;
  tenantId: string;
  unitId?: string;
  dueDate: string;
  amount: number;
  status: 'Scheduled' | 'Sent' | 'Acknowledged';
  message: string;
  sentAt?: string;
  channel: 'WhatsApp' | 'Email' | 'SMS';
  tone: 'Polite' | 'Firm' | 'Urgent';
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'ticket' | 'reminder' | 'kyc' | 'google' | 'unit' | 'system';
  createdAt: string;
  read: boolean;
  targetRole?: UserRole | 'all';
  actionUrl?: string;
}

export interface GoogleSyncConfig {
  isConnected: boolean;
  userEmail?: string;
  lastSyncedAt?: string;
  driveFolderId?: string;
  spreadsheetId?: string;
  backupFileCount?: number;
  autoSyncEnabled: boolean;
}

export interface FinancialStats {
  totalIncome: number;
  totalExpenses: number;
  netRevenue: number;
  occupancyRate: number;
  totalUnits: number;
  occupiedUnits: number;
  availableUnits: number;
  maintenanceUnits: number;
  pendingRentCount: number;
  openTicketsCount: number;
}
