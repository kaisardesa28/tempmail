import fs from 'fs';
import path from 'path';
import { ServiceId } from './types';

export interface AdminMailboxEntry {
  id: string; // encoded address
  address: string;
  token: string;
  serviceId: ServiceId;
  label?: string;
  notes?: string;
  savedAt: string;
  lastChecked?: string;
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'setomail2026';
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'admin_mailboxes.json');

// In-memory fallback
let inMemoryStore: AdminMailboxEntry[] = [];

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch {
    // Vercel serverless read-only filesystem fallback
  }
}

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function getAdminMailboxes(): AdminMailboxEntry[] {
  ensureDataFile();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      inMemoryStore = JSON.parse(content);
      return inMemoryStore;
    }
  } catch {
    // Fallback to in-memory
  }
  return inMemoryStore;
}

export function saveAdminMailbox(entry: {
  address: string;
  token: string;
  serviceId: ServiceId;
  label?: string;
  notes?: string;
}): AdminMailboxEntry {
  ensureDataFile();
  const list = getAdminMailboxes();
  const normAddress = entry.address.toLowerCase();
  const id = encodeURIComponent(normAddress);

  // Check if already exists
  const existingIdx = list.findIndex((m) => m.address.toLowerCase() === normAddress);
  const newEntry: AdminMailboxEntry = {
    id,
    address: normAddress,
    token: entry.token,
    serviceId: entry.serviceId || 'server-1',
    label: entry.label?.trim() || 'Email Pantauan',
    notes: entry.notes?.trim() || '',
    savedAt: existingIdx >= 0 ? list[existingIdx].savedAt : new Date().toISOString(),
    lastChecked: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    list[existingIdx] = newEntry;
  } else {
    list.unshift(newEntry);
  }

  inMemoryStore = list;

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch {
    // Read-only filesystem fallback
  }

  return newEntry;
}

export function deleteAdminMailbox(id: string): boolean {
  ensureDataFile();
  const list = getAdminMailboxes();
  const filtered = list.filter((m) => m.id !== id && m.address.toLowerCase() !== decodeURIComponent(id).toLowerCase());

  inMemoryStore = filtered;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch {
    // Fallback
  }

  return true;
}
