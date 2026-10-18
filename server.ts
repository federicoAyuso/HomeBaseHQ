import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_REGIONS,
  INITIAL_PROPERTIES,
  INITIAL_UNITS,
  INITIAL_TENANTS,
  INITIAL_PAYMENTS,
  INITIAL_TICKETS,
  INITIAL_REMINDERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_GOOGLE_CONFIG,
} from './src/data/initialData.js';
import {
  Region,
  Property,
  Unit,
  Tenant,
  Payment,
  MaintenanceTicket,
  Reminder,
  SystemNotification,
  GoogleSyncConfig,
  User,
  TenantNote,
} from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize In-Memory Data Store
let regions: Region[] = [...INITIAL_REGIONS];
let properties: Property[] = [...INITIAL_PROPERTIES];
let units: Unit[] = [...INITIAL_UNITS];
let tenants: Tenant[] = [...INITIAL_TENANTS];
let payments: Payment[] = [...INITIAL_PAYMENTS];
let tickets: MaintenanceTicket[] = [...INITIAL_TICKETS];
let reminders: Reminder[] = [...INITIAL_REMINDERS];
let notifications: SystemNotification[] = [...INITIAL_NOTIFICATIONS];
let googleConfig: GoogleSyncConfig = { ...INITIAL_GOOGLE_CONFIG };

// User credentials mapping according to spec
// Miranda: password 71811930
// Federico: password 74170800
const INITIAL_USERS_DB = [
  {
    id: 'usr-main',
    name: 'Miranda E Cavanagh',
    username: 'Miranda',
    aliases: ['miranda', 'miranda e cavanagh', 'miranda.cavanagh@homebasehq.com'],
    password: '71811930',
    role: 'main' as const,
    email: 'miranda.cavanagh@homebasehq.com',
  },
  {
    id: 'usr-admin',
    name: 'Federico',
    username: 'Federico',
    aliases: [
      'federico',
      'admin',
      'admin.federico@homebasehq.com',
      'ayusofederico01@gmail.com',
      'ayusofederico01@gmail.comm',
    ],
    password: '74170800',
    role: 'admin' as const,
    email: 'ayusofederico01@gmail.com',
  },
  {
    id: 'usr-tenant',
    name: 'Marcus Vance',
    username: 'tenant',
    aliases: ['tenant', 'marcus', 'marcus vance', 'marcus.vance@example.com'],
    password: 'tenant123',
    role: 'tenant' as const,
    email: 'marcus.vance@example.com',
    approvalStatus: 'Approved' as const,
    assignedUnitNumber: '101 - Garden View',
  },
  {
    id: 'usr-tenant-pending',
    name: 'Kagiso Modise',
    username: 'kagiso',
    aliases: ['kagiso', 'kagiso modise', 'kagiso.modise@example.com'],
    password: 'tenant123',
    role: 'tenant' as const,
    email: 'kagiso.modise@example.com',
    approvalStatus: 'Pending' as const,
    requestedUnitNumber: '102 - Garden View',
  },
];

let USERS_DB = JSON.parse(JSON.stringify(INITIAL_USERS_DB));

// Current Session State - initially null so user starts at the login page
let currentUser: User | null = null;

// Helper: Add Realtime Notification
function triggerNotification(
  title: string,
  message: string,
  type: SystemNotification['type'],
  targetRole: SystemNotification['targetRole'] = 'all'
) {
  const newNotif: SystemNotification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title,
    message,
    type,
    createdAt: new Date().toISOString(),
    read: false,
    targetRole,
  };
  notifications.unshift(newNotif);
  return newNotif;
}

// ================= AUTH ROUTES =================
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const query = String(username).trim().toLowerCase();
  const cleanPass = String(password).trim();

  const userRecord = USERS_DB.find(
    (u) =>
      u.username.toLowerCase() === query ||
      u.name.toLowerCase() === query ||
      u.email.toLowerCase() === query ||
      u.aliases.includes(query)
  );

  if (userRecord && userRecord.password === cleanPass) {
    const tRec = tenants.find((t) => t.email && t.email.toLowerCase() === userRecord.email.toLowerCase());
    const assignedUnit = tRec && tRec.assignedUnitIds.length > 0
      ? units.find((u) => u.id === tRec.assignedUnitIds[0])?.unitNumber
      : userRecord.assignedUnitNumber;

    currentUser = {
      id: userRecord.id,
      name: userRecord.name,
      username: userRecord.username,
      role: userRecord.role,
      email: userRecord.email,
      googleConnected: userRecord.id === 'usr-main' ? googleConfig.isConnected : false,
      googleEmail: userRecord.id === 'usr-main' ? googleConfig.userEmail : undefined,
      approvalStatus: tRec?.approvalStatus || userRecord.approvalStatus || (userRecord.role === 'tenant' ? 'Approved' : undefined),
      assignedUnitNumber: assignedUnit,
      requestedUnitNumber: tRec?.requestedUnitNumber || userRecord.requestedUnitNumber,
    };

    triggerNotification(
      'User Login',
      `${currentUser.name} (${currentUser.role.toUpperCase()}) logged in successfully.`,
      'system',
      'all'
    );
    return res.json({ success: true, user: currentUser });
  }

  return res.status(401).json({ error: 'Invalid username or password. Please check your credentials.' });
});

app.post('/api/auth/register-tenant', (req: Request, res: Response) => {
  const { name, email, password, phone, unitId, unitNumber, kycIdPassport, emergencyContact, notes } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Full name, email address, and password are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanName = String(name).trim();
  const cleanPass = String(password).trim();
  const cleanPhone = phone ? String(phone).trim() : '+267 71 000 000';

  if (cleanPass.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
  }

  // Check if user already exists
  const existing = USERS_DB.find(
    (u) => u.email.toLowerCase() === cleanEmail || u.aliases.includes(cleanEmail)
  );
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists. Please log in instead.' });
  }

  // Find requested unit details (NOTE: do not occupy unit yet - must be approved with unit number by manager)
  let requestedUnitObj: Unit | undefined;
  if (unitId) {
    requestedUnitObj = units.find((un) => un.id === unitId);
  } else if (unitNumber) {
    requestedUnitObj = units.find((un) => un.unitNumber.toLowerCase() === String(unitNumber).toLowerCase());
  }

  const reqUnitId = requestedUnitObj?.id || (unitId ? String(unitId) : '');
  const reqUnitNumber = requestedUnitObj?.unitNumber || (unitNumber ? String(unitNumber) : 'Unit Pending Assignment');
  const reqProp = requestedUnitObj ? properties.find((p) => p.id === requestedUnitObj?.propertyId) : properties[0];
  const reqPropName = reqProp ? reqProp.name : 'Sunset Park Apartments';
  const reqRent = requestedUnitObj ? requestedUnitObj.rentAmount : 1450;

  const newTenantId = `ten-${Date.now()}`;
  const newTenant: Tenant = {
    id: newTenantId,
    name: cleanName,
    contact: cleanPhone,
    email: cleanEmail,
    bankDetails: 'Online Tenant Portal - Direct Debit / Card',
    kycIdPassport: kycIdPassport ? String(kycIdPassport).trim() : 'OMANG-PENDING',
    kycStatus: 'Pending',
    approvalStatus: 'Pending',
    requestedUnitId: reqUnitId,
    requestedUnitNumber: reqUnitNumber,
    requestedPropertyName: reqPropName,
    agreedRent: reqRent,
    securityDeposit: reqRent,
    leaseStart: new Date().toISOString().split('T')[0],
    leaseEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedUnitIds: [], // Unit is NOT assigned until manager approval!
    notes: notes || (emergencyContact ? `Emergency Contact: ${emergencyContact}` : `Application for ${reqUnitNumber}. Pending manager review.`),
    createdAt: new Date().toISOString().split('T')[0],
    status: 'Active',
    isPastTenant: false,
    historyNotes: [
      {
        id: `note-${Date.now()}`,
        text: `Application submitted online requesting Unit ${reqUnitNumber} (${reqPropName}). Status: Pending Manager Approval.`,
        author: 'Applicant (Online Portal)',
        date: new Date().toISOString().split('T')[0],
        category: 'General',
      },
    ],
  };
  tenants.push(newTenant);

  // Create User account with approvalStatus: 'Pending'
  const usernameVal = cleanEmail.split('@')[0].toLowerCase();
  const newUserRecord = {
    id: `usr-${Date.now()}`,
    name: cleanName,
    username: usernameVal,
    aliases: [
      cleanName.toLowerCase(),
      cleanEmail,
      usernameVal,
      cleanName.replace(/\s+/g, '').toLowerCase(),
    ],
    password: cleanPass,
    role: 'tenant' as const,
    email: cleanEmail,
    approvalStatus: 'Pending' as const,
    requestedUnitNumber: reqUnitNumber,
  };
  USERS_DB.push(newUserRecord);

  // Auto sign-in
  currentUser = {
    id: newUserRecord.id,
    name: newUserRecord.name,
    username: newUserRecord.username,
    role: newUserRecord.role,
    email: newUserRecord.email,
    googleConnected: false,
    approvalStatus: 'Pending',
    requestedUnitNumber: reqUnitNumber,
  };

  triggerNotification(
    'New Tenant Application Pending Approval',
    `${newUserRecord.name} applied for Unit ${reqUnitNumber} (${reqPropName}). Federico or Miranda must review & approve.`,
    'kyc',
    'all'
  );

  return res.status(201).json({
    success: true,
    user: currentUser,
    tenant: newTenant,
    message: `Application submitted for Unit ${reqUnitNumber}. Awaiting manager approval.`,
  });
});

app.get('/api/auth/registration-units', (_req: Request, res: Response) => {
  const available = units.map((u) => {
    const prop = properties.find((p) => p.id === u.propertyId);
    return {
      id: u.id,
      unitNumber: u.unitNumber,
      propertyName: prop ? prop.name : 'Homebase Property',
      address: prop ? prop.address : 'Gaborone, Botswana',
      status: u.status,
      rentAmount: u.rentAmount,
    };
  });
  res.json({ units: available });
});

app.get('/api/auth/me', (_req: Request, res: Response) => {
  res.json({ user: currentUser });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  if (currentUser) {
    triggerNotification('User Logout', `${currentUser.name} logged out.`, 'system');
  }
  currentUser = null;
  res.json({ success: true });
});

// Switch User Profile for testing multi-role access
app.post('/api/auth/switch-role', (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required.' });

  const query = String(username).trim().toLowerCase();
  const userRecord = USERS_DB.find(
    (u) =>
      u.username.toLowerCase() === query ||
      u.name.toLowerCase() === query ||
      u.email.toLowerCase() === query ||
      u.aliases.includes(query)
  );

  if (userRecord) {
    const tRec = tenants.find((t) => t.email && t.email.toLowerCase() === userRecord.email.toLowerCase());
    const assignedUnit = tRec && tRec.assignedUnitIds.length > 0
      ? units.find((u) => u.id === tRec.assignedUnitIds[0])?.unitNumber
      : userRecord.assignedUnitNumber;

    currentUser = {
      id: userRecord.id,
      name: userRecord.name,
      username: userRecord.username,
      role: userRecord.role,
      email: userRecord.email,
      googleConnected: userRecord.id === 'usr-main' ? googleConfig.isConnected : false,
      googleEmail: userRecord.id === 'usr-main' ? googleConfig.userEmail : undefined,
      approvalStatus: tRec?.approvalStatus || userRecord.approvalStatus || (userRecord.role === 'tenant' ? 'Approved' : undefined),
      assignedUnitNumber: assignedUnit,
      requestedUnitNumber: tRec?.requestedUnitNumber || userRecord.requestedUnitNumber,
    };
    return res.json({ success: true, user: currentUser });
  }
  res.status(400).json({ error: 'Invalid target username.' });
});

// ================= REGIONS API =================
app.get('/api/regions', (_req: Request, res: Response) => {
  res.json(regions);
});

app.post('/api/regions', (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Region name is required' });

  const code = name.slice(0, 3).toUpperCase();
  const newRegion: Region = {
    id: `reg-${Date.now()}`,
    name,
    code,
    description: description || '',
  };
  regions.push(newRegion);
  triggerNotification('New Region Created', `Region "${name}" added to dashboard.`, 'unit');
  res.status(201).json(newRegion);
});

app.delete('/api/regions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  regions = regions.filter((r) => r.id !== id);
  res.json({ success: true });
});

// ================= PROPERTIES API =================
app.get('/api/properties', (_req: Request, res: Response) => {
  res.json(properties);
});

app.post('/api/properties', (req: Request, res: Response) => {
  const { name, address, regionId, imageUrl } = req.body;
  if (!name || !address || !regionId) {
    return res.status(400).json({ error: 'Name, address, and region are required.' });
  }

  const newProp: Property = {
    id: `prop-${Date.now()}`,
    name,
    address,
    regionId,
    totalUnits: 0,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80',
  };
  properties.push(newProp);
  triggerNotification('New Property Added', `Property "${name}" registered at ${address}.`, 'unit');
  res.status(201).json(newProp);
});

// ================= UNITS API =================
app.get('/api/units', (_req: Request, res: Response) => {
  res.json(units);
});

app.post('/api/units', (req: Request, res: Response) => {
  const { unitNumber, propertyId, meterSerial, waterMeterSerial, rentAmount, bedrooms, bathrooms } = req.body;
  if (!unitNumber || !propertyId) {
    return res.status(400).json({ error: 'Unit number and property ID are required.' });
  }

  const newUnit: Unit = {
    id: `unit-${Date.now()}`,
    propertyId,
    unitNumber,
    status: 'Available',
    meterSerial: meterSerial || `MTR-${Math.floor(10000 + Math.random() * 90000)}-X`,
    waterMeterSerial: waterMeterSerial || `WTR-${Math.floor(10000 + Math.random() * 90000)}-W`,
    rentAmount: Number(rentAmount) || 1200,
    bedrooms: Number(bedrooms) || 2,
    bathrooms: Number(bathrooms) || 1,
    currentTenantId: null,
  };
  units.push(newUnit);

  // Update total units count on property
  const prop = properties.find((p) => p.id === propertyId);
  if (prop) {
    prop.totalUnits += 1;
  }

  triggerNotification(
    'Unit Registered',
    `${unitNumber} added to property (Power: ${newUnit.meterSerial}, Water: ${newUnit.waterMeterSerial}).`,
    'unit'
  );
  res.status(201).json(newUnit);
});

app.put('/api/units/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = units.findIndex((u) => u.id === id);
  if (index === -1) return res.status(404).json({ error: 'Unit not found' });

  units[index] = { ...units[index], ...req.body };
  res.json(units[index]);
});

// ================= TENANTS & KYC API =================
app.get('/api/tenants', (_req: Request, res: Response) => {
  res.json(tenants);
});

app.post('/api/tenants', (req: Request, res: Response) => {
  const {
    name,
    contact,
    email,
    bankDetails,
    kycIdPassport,
    leaseStart,
    leaseEnd,
    unitIds,
    isPastTenant,
    status,
    formerUnitNumber,
    formerPropertyName,
    moveOutDate,
    departureReason,
    forwardingAddress,
    depositRefunded,
    depositDeductions,
    depositNotes,
    notes,
    initialNote,
    initialPayment,
  } = req.body;

  if (!name || !contact) {
    return res.status(400).json({ error: 'Name and contact number are required.' });
  }

  const assignedUnitIds: string[] = Array.isArray(unitIds) ? unitIds : [];
  const isPast = Boolean(isPastTenant);

  const initialHistoryNotes: any[] = [];
  if (initialNote && typeof initialNote === 'string' && initialNote.trim()) {
    initialHistoryNotes.push({
      id: `note-${Date.now()}`,
      text: initialNote.trim(),
      author: currentUser?.name || 'Manager',
      date: new Date().toISOString().split('T')[0],
      category: isPast ? 'Condition & Move-Out' : 'General',
    });
  }

  const newTenant: Tenant = {
    id: `ten-${Date.now()}`,
    name: name.trim(),
    contact: contact.trim(),
    email: (email || '').trim(),
    bankDetails: (bankDetails || 'N/A').trim(),
    kycIdPassport: (kycIdPassport || '').trim(),
    kycStatus: kycIdPassport ? 'Verified' : 'Pending',
    leaseStart: leaseStart || '',
    leaseEnd: leaseEnd || '',
    assignedUnitIds: isPast ? [] : assignedUnitIds,
    createdAt: new Date().toISOString().split('T')[0],
    isPastTenant: isPast,
    status: isPast ? (status || 'Past') : 'Active',
    formerUnitNumber: formerUnitNumber || '',
    formerPropertyName: formerPropertyName || '',
    moveOutDate: moveOutDate || '',
    departureReason: departureReason || '',
    forwardingAddress: forwardingAddress || '',
    depositRefunded: depositRefunded !== undefined ? Number(depositRefunded) : undefined,
    depositDeductions: depositDeductions !== undefined ? Number(depositDeductions) : undefined,
    depositNotes: depositNotes || '',
    notes: notes || '',
    historyNotes: initialHistoryNotes,
  };

  tenants.push(newTenant);

  // If active tenant, mark assigned units as Occupied
  if (!isPast) {
    assignedUnitIds.forEach((uId) => {
      const unit = units.find((u) => u.id === uId);
      if (unit) {
        unit.status = 'Occupied';
        unit.currentTenantId = newTenant.id;
      }
    });
  }

  // If an initial historical payment was provided with this tenant
  if (initialPayment && initialPayment.amount) {
    const histPay: Payment = {
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenantId: newTenant.id,
      unitId: isPast ? '' : (assignedUnitIds[0] || ''),
      amount: Number(initialPayment.amount),
      expense: Number(initialPayment.expense || 0),
      date: initialPayment.date || new Date().toISOString().split('T')[0],
      receiptNumber: initialPayment.receiptNumber || `HIST-${Date.now().toString().slice(-6)}`,
      paymentMethod: initialPayment.paymentMethod || 'Bank Transfer',
      status: 'Paid',
      notes: initialPayment.notes || (isPast ? 'Historical payment record logged during past tenant creation.' : 'Initial payment'),
      createdAt: new Date().toISOString(),
      isHistorical: isPast,
      periodCovered: initialPayment.periodCovered || '',
    };
    payments.unshift(histPay);
  }

  triggerNotification(
    isPast ? 'Past Tenant Record Added' : 'Tenant Onboarded & KYC Logged',
    isPast
      ? `Historical record for past tenant ${name} logged with tenancy notes & payment history.`
      : `${name} onboarded with ${assignedUnitIds.length} unit(s) assigned. KYC: ${newTenant.kycStatus}.`,
    isPast ? 'system' : 'kyc'
  );

  res.status(201).json(newTenant);
});

// Add a note to a tenant's history
app.post('/api/tenants/:id/notes', (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, category, author } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Note text is required.' });
  }

  const tenant = tenants.find((t) => t.id === id);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found.' });

  if (!tenant.historyNotes) {
    tenant.historyNotes = [];
  }

  const newNote = {
    id: `note-${Date.now()}`,
    text: text.trim(),
    author: author || currentUser?.name || 'Federico (Admin)',
    date: new Date().toISOString().split('T')[0],
    category: category || 'General',
  };

  tenant.historyNotes.unshift(newNote);

  triggerNotification(
    'Tenant Note Logged',
    `New note recorded for ${tenant.name} under ${newNote.category}: "${text.slice(0, 40)}..."`,
    'system'
  );

  res.status(201).json({ success: true, note: newNote, tenant });
});

// Move out an active tenant & transition to Past Tenant
app.post('/api/tenants/:id/move-out', (req: Request, res: Response) => {
  const { id } = req.params;
  const { moveOutDate, departureReason, exitNotes, depositRefunded, depositDeductions, depositNotes, forwardingAddress } = req.body;

  const tenant = tenants.find((t) => t.id === id);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found.' });

  // Find units formerly occupied
  const formerlyOccupiedUnits = units.filter((u) => tenant.assignedUnitIds.includes(u.id) || u.currentTenantId === tenant.id);
  const formerUnitNames = formerlyOccupiedUnits.map((u) => u.unitNumber).join(', ');
  
  // Free units
  formerlyOccupiedUnits.forEach((u) => {
    u.status = 'Available';
    u.currentTenantId = null;
  });

  tenant.isPastTenant = true;
  tenant.status = 'Past';
  tenant.moveOutDate = moveOutDate || new Date().toISOString().split('T')[0];
  tenant.departureReason = departureReason || 'Lease completed / moved out';
  tenant.formerUnitNumber = formerUnitNames || tenant.formerUnitNumber || '';
  tenant.forwardingAddress = forwardingAddress || '';
  tenant.depositRefunded = depositRefunded !== undefined ? Number(depositRefunded) : undefined;
  tenant.depositDeductions = depositDeductions !== undefined ? Number(depositDeductions) : undefined;
  tenant.depositNotes = depositNotes || '';
  tenant.assignedUnitIds = [];

  if (!tenant.historyNotes) tenant.historyNotes = [];

  if (exitNotes && exitNotes.trim()) {
    tenant.historyNotes.unshift({
      id: `note-${Date.now()}`,
      text: `Move-Out Inspection & Exit Notes: ${exitNotes.trim()}`,
      author: currentUser?.name || 'Federico (Admin)',
      date: tenant.moveOutDate,
      category: 'Condition & Move-Out',
    });
  }

  triggerNotification(
    'Tenant Moved Out & Archived to History',
    `${tenant.name} moved out from unit(s) ${formerUnitNames || ''}. Unit is now Available. Record transferred to Past Tenants History.`,
    'unit'
  );

  res.json({ success: true, tenant });
});

app.put('/api/tenants/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = tenants.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Tenant not found' });

  tenants[idx] = { ...tenants[idx], ...req.body };
  res.json(tenants[idx]);
});

// ================= TENANT APPROVAL & REJECTION APIs =================
app.post('/api/tenants/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const { unitId, unitNumber, leaseStart, leaseEnd, agreedRent, securityDeposit, approvedBy, notes } = req.body;

  const tenant = tenants.find((t) => t.id === id);
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant record not found.' });
  }

  // Determine unit to assign
  let targetUnit: Unit | undefined;
  if (unitId) {
    targetUnit = units.find((u) => u.id === unitId);
  } else if (unitNumber) {
    targetUnit = units.find((u) => u.unitNumber.toLowerCase() === String(unitNumber).toLowerCase());
  } else if (tenant.requestedUnitId) {
    targetUnit = units.find((u) => u.id === tenant.requestedUnitId);
  }

  if (!targetUnit) {
    return res.status(400).json({ error: 'Please select a valid unit number to approve and assign this tenant.' });
  }

  // Check if unit is already occupied by someone else
  if (targetUnit.status === 'Occupied' && targetUnit.currentTenantId && targetUnit.currentTenantId !== tenant.id) {
    const occTenant = tenants.find((t) => t.id === targetUnit?.currentTenantId);
    return res.status(400).json({
      error: `Unit ${targetUnit.unitNumber} is already occupied by ${occTenant?.name || 'another tenant'}. Please choose an available unit.`,
    });
  }

  // Update unit status to Occupied and assign tenant
  targetUnit.status = 'Occupied';
  targetUnit.currentTenantId = tenant.id;

  const assignedUnitNumber = targetUnit.unitNumber;
  const targetProp = properties.find((p) => p.id === targetUnit?.propertyId);

  // Update tenant
  tenant.approvalStatus = 'Approved';
  tenant.status = 'Active';
  tenant.isPastTenant = false;
  tenant.assignedUnitIds = [targetUnit.id];
  tenant.kycStatus = 'Verified';
  tenant.approvedAt = new Date().toISOString().split('T')[0];
  tenant.approvedBy = approvedBy || (currentUser ? currentUser.name : 'Federico');
  if (leaseStart) tenant.leaseStart = leaseStart;
  if (leaseEnd) tenant.leaseEnd = leaseEnd;
  if (agreedRent) tenant.agreedRent = Number(agreedRent);
  if (securityDeposit) tenant.securityDeposit = Number(securityDeposit);

  // Add history audit note
  const approverName = tenant.approvedBy;
  const approvalNote: TenantNote = {
    id: `note-${Date.now()}`,
    text: `Application & Unit Assignment APPROVED by ${approverName}. Assigned to Unit ${assignedUnitNumber} (${targetProp?.name || 'Homebase Property'}). Rent: P${agreedRent || targetUnit.rentAmount}/month. ${notes ? `Remarks: ${notes}` : ''}`,
    author: approverName,
    date: new Date().toISOString().split('T')[0],
    category: 'General',
  };
  if (!tenant.historyNotes) tenant.historyNotes = [];
  tenant.historyNotes.unshift(approvalNote);

  // Update user in USERS_DB
  const userRecord = USERS_DB.find(
    (u) => u.email.toLowerCase() === (tenant.email || '').toLowerCase()
  );
  if (userRecord) {
    userRecord.approvalStatus = 'Approved';
    userRecord.assignedUnitNumber = assignedUnitNumber;
  }

  triggerNotification(
    'Tenant Approved & Unit Assigned',
    `${tenant.name} has been approved with Unit ${assignedUnitNumber} (${targetProp?.name || 'Property'}). Lease activated.`,
    'kyc',
    'all'
  );

  return res.json({
    success: true,
    tenant,
    unit: targetUnit,
    message: `Tenant ${tenant.name} approved with Unit ${assignedUnitNumber}.`,
  });
});

app.post('/api/tenants/:id/reject', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason, rejectedBy } = req.body;

  const tenant = tenants.find((t) => t.id === id);
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant record not found.' });
  }

  tenant.approvalStatus = 'Rejected';
  tenant.rejectionReason = reason || 'Application did not meet tenancy criteria or unit already assigned.';
  tenant.assignedUnitIds = [];

  const rejectorName = rejectedBy || (currentUser ? currentUser.name : 'Federico');
  const rejectNote: TenantNote = {
    id: `note-${Date.now()}`,
    text: `Application REJECTED by ${rejectorName}. Reason: ${tenant.rejectionReason}`,
    author: rejectorName,
    date: new Date().toISOString().split('T')[0],
    category: 'Reference & Conduct',
  };
  if (!tenant.historyNotes) tenant.historyNotes = [];
  tenant.historyNotes.unshift(rejectNote);

  // Update user in USERS_DB if exists
  const userRecord = USERS_DB.find(
    (u) => u.email.toLowerCase() === (tenant.email || '').toLowerCase()
  );
  if (userRecord) {
    userRecord.approvalStatus = 'Rejected';
  }

  triggerNotification(
    'Tenant Application Rejected',
    `Application for ${tenant.name} was rejected by ${rejectorName}: ${tenant.rejectionReason}`,
    'kyc',
    'all'
  );

  return res.json({
    success: true,
    tenant,
    message: `Tenant ${tenant.name} application has been rejected.`,
  });
});

// ================= RESET ALL DATA FOR TESTING =================
app.post('/api/reset-data', (_req: Request, res: Response) => {
  regions = JSON.parse(JSON.stringify(INITIAL_REGIONS));
  properties = JSON.parse(JSON.stringify(INITIAL_PROPERTIES));
  units = JSON.parse(JSON.stringify(INITIAL_UNITS));
  tenants = JSON.parse(JSON.stringify(INITIAL_TENANTS));
  payments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS));
  tickets = JSON.parse(JSON.stringify(INITIAL_TICKETS));
  reminders = JSON.parse(JSON.stringify(INITIAL_REMINDERS));
  notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
  googleConfig = { ...INITIAL_GOOGLE_CONFIG };
  USERS_DB = JSON.parse(JSON.stringify(INITIAL_USERS_DB));

  triggerNotification(
    'Demo Data Reset Successfully',
    'All units and tenant records have been reset. Kagiso Modise is pending approval for Unit 102 - Garden View for testing.',
    'system',
    'all'
  );

  return res.json({
    success: true,
    message: 'System data reset to clean initial testing state.',
    units,
    tenants,
    payments,
    tickets,
    reminders,
    notifications,
  });
});

// ================= PAYMENTS & RECEIPTS API =================
app.get('/api/payments', (_req: Request, res: Response) => {
  res.json(payments);
});

app.post('/api/payments', (req: Request, res: Response) => {
  const { tenantId, unitId, amount, expense, date, receiptNumber, paymentMethod, notes, isHistorical, periodCovered } = req.body;
  if (!tenantId || !amount || !date || !receiptNumber) {
    return res.status(400).json({ error: 'Tenant, amount, date, and receipt number are required.' });
  }

  const tenant = tenants.find((t) => t.id === tenantId);
  const tenantName = tenant ? tenant.name : 'Tenant';

  const newPayment: Payment = {
    id: `pay-${Date.now()}`,
    tenantId,
    unitId: unitId || (tenant?.assignedUnitIds[0] || ''),
    amount: Number(amount),
    expense: Number(expense) || 0,
    date,
    receiptNumber,
    paymentMethod: paymentMethod || 'Bank Transfer',
    status: 'Paid',
    notes: notes || '',
    createdAt: new Date().toISOString(),
    isHistorical: Boolean(isHistorical || tenant?.isPastTenant),
    periodCovered: periodCovered || '',
  };

  payments.unshift(newPayment);

  // If this payment has notes, optionally also record in tenant's historyNotes
  if (notes && notes.trim() && tenant) {
    if (!tenant.historyNotes) tenant.historyNotes = [];
    tenant.historyNotes.unshift({
      id: `note-${Date.now()}`,
      text: `Payment ${receiptNumber} (P${Number(amount).toLocaleString()} on ${date}): ${notes.trim()}`,
      author: currentUser?.name || 'Federico (Admin)',
      date,
      category: 'Payment History',
    });
  }

  triggerNotification(
    newPayment.isHistorical ? 'Historical Payment Logged' : 'Payment Recorded & Receipt Issued',
    `Payment of P${Number(amount).toLocaleString()} recorded for ${tenantName} (${receiptNumber}). Notes: ${notes || 'Standard rent settlement'}.`,
    'payment'
  );

  res.status(201).json(newPayment);
});

// ================= MAINTENANCE TICKETS API =================
app.get('/api/tickets', (_req: Request, res: Response) => {
  res.json(tickets);
});

app.post('/api/tickets', (req: Request, res: Response) => {
  const { unitId, propertyId, title, description, category, priority, assignedTo, imageUrl } = req.body;
  if (!title || !unitId || !category) {
    return res.status(400).json({ error: 'Title, unit, and category are required.' });
  }

  const unit = units.find((u) => u.id === unitId);
  const tenantId = unit?.currentTenantId || undefined;

  const newTicket: MaintenanceTicket = {
    id: `tick-${Date.now()}`,
    unitId,
    propertyId: propertyId || unit?.propertyId || '',
    tenantId,
    title,
    description: description || '',
    category: category || 'General',
    priority: priority || 'Medium',
    status: 'Open',
    createdAt: new Date().toISOString(),
    assignedTo: assignedTo || 'Property Management Team',
    imageUrl,
    updates: [
      {
        id: `up-${Date.now()}`,
        author: currentUser ? currentUser.name : 'System',
        text: 'Ticket created and assigned.',
        timestamp: new Date().toISOString(),
      },
    ],
  };

  tickets.unshift(newTicket);

  triggerNotification(
    'New Maintenance Ticket',
    `[${priority.toUpperCase()}] ${title} logged for Unit #${unit?.unitNumber || 'Selected'}.`,
    'ticket'
  );

  res.status(201).json(newTicket);
});

app.put('/api/tickets/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = tickets.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Ticket not found' });

  const { status, assignedTo, updateText } = req.body;

  if (status) tickets[idx].status = status;
  if (assignedTo) tickets[idx].assignedTo = assignedTo;

  if (updateText) {
    if (!tickets[idx].updates) tickets[idx].updates = [];
    tickets[idx].updates!.push({
      id: `up-${Date.now()}`,
      author: currentUser ? currentUser.name : 'Manager',
      text: updateText,
      timestamp: new Date().toISOString(),
    });
  }

  triggerNotification(
    'Ticket Updated',
    `Maintenance Ticket "${tickets[idx].title}" marked as ${tickets[idx].status}.`,
    'ticket'
  );

  res.json(tickets[idx]);
});

// ================= AUTOMATED REMINDERS API =================
app.get('/api/reminders', (_req: Request, res: Response) => {
  res.json(reminders);
});

app.post('/api/reminders', (req: Request, res: Response) => {
  const { tenantId, dueDate, amount, message, channel, tone } = req.body;
  if (!tenantId || !dueDate || !amount) {
    return res.status(400).json({ error: 'Tenant, due date, and amount are required.' });
  }

  const tenant = tenants.find((t) => t.id === tenantId);
  const newReminder: Reminder = {
    id: `rem-${Date.now()}`,
    tenantId,
    unitId: tenant?.assignedUnitIds[0],
    dueDate,
    amount: Number(amount),
    status: 'Scheduled',
    message: message || `Payment of P${amount} is due on ${dueDate}.`,
    channel: channel || 'WhatsApp',
    tone: tone || 'Polite',
  };

  reminders.unshift(newReminder);
  res.status(201).json(newReminder);
});

app.post('/api/reminders/:id/send', (req: Request, res: Response) => {
  const { id } = req.params;
  const reminder = reminders.find((r) => r.id === id);
  if (!reminder) return res.status(404).json({ error: 'Reminder not found' });

  reminder.status = 'Sent';
  reminder.sentAt = new Date().toISOString();

  const tenant = tenants.find((t) => t.id === reminder.tenantId);
  triggerNotification(
    'Payment Reminder Sent',
    `Automated ${reminder.channel} payment reminder sent to ${tenant?.name || 'Tenant'} ($${reminder.amount}).`,
    'reminder'
  );

  res.json({ success: true, reminder });
});

// ================= REALTIME NOTIFICATIONS API =================
app.get('/api/notifications', (_req: Request, res: Response) => {
  res.json(notifications);
});

app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const notif = notifications.find((n) => n.id === id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

app.put('/api/notifications/read-all', (_req: Request, res: Response) => {
  notifications.forEach((n) => (n.read = true));
  res.json({ success: true });
});

app.post('/api/notifications/trigger-simulation', (req: Request, res: Response) => {
  const { title, message, type } = req.body;
  const notif = triggerNotification(
    title || 'Mobile Notification Test',
    message || 'Real-time alert triggered from Homebase HQ mobile system.',
    type || 'system'
  );
  res.json({ success: true, notification: notif });
});

// ================= GOOGLE PRIVATE CLOUD STORAGE SYNC API =================
app.get('/api/google/status', (_req: Request, res: Response) => {
  res.json(googleConfig);
});

app.post('/api/google/confirm-account', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Google account email is required.' });
  }

  googleConfig.isConnected = true;
  googleConfig.userEmail = email;
  googleConfig.lastSyncedAt = new Date().toISOString();

  if (currentUser) {
    currentUser.googleConnected = true;
    currentUser.googleEmail = googleConfig.userEmail;
  }

  triggerNotification(
    'Google Cloud Account Linked',
    `Account (${googleConfig.userEmail}) linked. Private cloud storage activated for backups.`,
    'google'
  );

  res.json({ success: true, googleConfig });
});

app.post('/api/google/disconnect-account', (_req: Request, res: Response) => {
  googleConfig.isConnected = false;
  googleConfig.userEmail = undefined;

  if (currentUser) {
    currentUser.googleConnected = false;
    currentUser.googleEmail = undefined;
  }

  triggerNotification(
    'Google Cloud Disconnected',
    'Google account unlinked. Cloud backups suspended until account is configured.',
    'google'
  );

  res.json({ success: true, googleConfig });
});

app.post('/api/google/sync-drive', (_req: Request, res: Response) => {
  if (!googleConfig.isConnected) {
    return res.status(400).json({ error: 'Main account Google authorization required first.' });
  }

  googleConfig.lastSyncedAt = new Date().toISOString();
  googleConfig.backupFileCount = (googleConfig.backupFileCount || 0) + 1;

  triggerNotification(
    'Google Drive Backup Saved',
    `Successfully saved transaction ledger, KYC documents, and receipt PDFs to private Google Drive folder (${googleConfig.driveFolderId}).`,
    'google'
  );

  res.json({
    success: true,
    lastSyncedAt: googleConfig.lastSyncedAt,
    backupFileCount: googleConfig.backupFileCount,
    driveFolderUrl: `https://drive.google.com/drive/folders/${googleConfig.driveFolderId}`,
  });
});

app.post('/api/google/sync-sheets', (_req: Request, res: Response) => {
  if (!googleConfig.isConnected) {
    return res.status(400).json({ error: 'Main account Google authorization required first.' });
  }

  googleConfig.lastSyncedAt = new Date().toISOString();

  triggerNotification(
    'Google Sheets Ledger Synced',
    `All ${payments.length} payment records and income/expense totals exported to Google Sheet (${googleConfig.spreadsheetId}).`,
    'google'
  );

  res.json({
    success: true,
    lastSyncedAt: googleConfig.lastSyncedAt,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${googleConfig.spreadsheetId}`,
    totalRowsExported: payments.length,
  });
});

// ================= GEMINI AI SERVICES API =================
app.post('/api/ai/analyze', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        analysis: `📊 **Homebase HQ Automated Analysis**:
- **Occupancy Rate**: ${((units.filter((u) => u.status === 'Occupied').length / units.length) * 100).toFixed(1)}% (${units.filter((u) => u.status === 'Occupied').length} of ${units.length} units filled).
- **Revenue Collected**: P${payments.reduce((s, p) => s + p.amount, 0).toLocaleString()} across ${payments.length} payments.
- **Maintenance Load**: ${tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length} open tickets require management team attention.
- **Recommendation**: Send payment reminders to upcoming due dates to maintain healthy cashflow.`,
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are Homebase HQ's AI Chief Property Analyst operating in Botswana (Currency: Botswana Pula, P / BWP).
Analyze the current property portfolio data:
- Properties: ${JSON.stringify(properties)}
- Units: ${JSON.stringify(units)}
- Tenants: ${JSON.stringify(tenants)}
- Recent Payments: ${JSON.stringify(payments)}
- Open Tickets: ${JSON.stringify(tickets)}

Provide a concise, professional, 3-bullet executive summary with actionable suggestions for the property owner and management team. Format amounts in Botswana Pula (P). Use markdown bullet points and emojis.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error('Gemini AI Error:', error);
    res.status(500).json({ error: 'Failed to generate AI analysis', details: error.message });
  }
});

app.post('/api/ai/reminder-template', async (req: Request, res: Response) => {
  const { tenantName, unitNumber, amount, dueDate, tone } = req.body;
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallbackMsg = `Dear ${tenantName || 'Tenant'}, this is a ${tone || 'Polite'} reminder from Homebase HQ Management that rent of P${amount || '1,500'} for ${unitNumber || 'your unit'} is due on ${dueDate || 'the 1st'}. Thank you!`;
      return res.json({ message: fallbackMsg });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Draft a personalized rental payment reminder notification for a tenant in Botswana:
Tenant Name: ${tenantName}
Unit: ${unitNumber}
Amount Due: P${amount} (Botswana Pula)
Due Date: ${dueDate}
Requested Tone: ${tone} (Options: Polite, Firm, Urgent)

Keep it suitable for WhatsApp/SMS (under 280 characters), clear, professional, and friendly. Include payment instructions reference.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ message: response.text?.trim() });
  } catch (error: any) {
    res.json({
      message: `Dear ${tenantName || 'Tenant'}, this is a ${tone || 'Polite'} reminder from Homebase HQ Management that rent of P${amount} for ${unitNumber} is due on ${dueDate}. Please proceed with transfer.`,
    });
  }
});

// ================= VITE / PRODUCTION SERVING =================
async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Homebase HQ Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
