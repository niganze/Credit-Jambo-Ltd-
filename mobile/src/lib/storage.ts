import { hashPassword, generateToken } from './crypto';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  deviceId: string;
  isVerified: boolean;
  balance: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  timestamp: string;
  description: string;
}

export interface Session {
  userId: string;
  token: string;
  deviceId: string;
  expiresAt: number;
}

const STORAGE_KEYS = {
  USERS: 'credit_jambo_users',
  TRANSACTIONS: 'credit_jambo_transactions',
  CURRENT_SESSION: 'credit_jambo_session',
  LAST_ACTIVITY: 'credit_jambo_last_activity'
};

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Users
export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const updateUser = (userId: string, updates: Partial<User>): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
};

export const getUserById = (userId: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(u => u.email === email) || null;
};

// Transactions
export const getTransactions = (userId: string): Transaction[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  const allTransactions: Transaction[] = data ? JSON.parse(data) : [];
  return allTransactions.filter(t => t.userId === userId).sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export const saveTransaction = (transaction: Transaction): void => {
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  const transactions: Transaction[] = data ? JSON.parse(data) : [];
  transactions.push(transaction);
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

// Session Management
export const createSession = (userId: string, deviceId: string): string => {
  const token = generateToken();
  const session: Session = {
    userId,
    token,
    deviceId,
    expiresAt: Date.now() + SESSION_TIMEOUT
  };
  localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
  updateLastActivity();
  return token;
};

export const getSession = (): Session | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  if (!data) return null;
  
  const session: Session = JSON.parse(data);
  
  // Check if session expired
  if (Date.now() > session.expiresAt) {
    clearSession();
    return null;
  }
  
  return session;
};

export const clearSession = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
};

export const updateLastActivity = (): void => {
  localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
};

export const checkSessionTimeout = (): boolean => {
  const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
  if (!lastActivity) return true;
  
  const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
  if (timeSinceLastActivity > SESSION_TIMEOUT) {
    clearSession();
    return true;
  }
  
  return false;
};

// Authentication
export const register = (
  fullName: string,
  email: string,
  phoneNumber: string,
  password: string,
  deviceId: string
): { success: boolean; message: string; userId?: string } => {
  // Check if email already exists
  if (getUserByEmail(email)) {
    return { success: false, message: 'Email already registered' };
  }
  
  const user: User = {
    id: generateToken(),
    fullName,
    email,
    phoneNumber,
    password: hashPassword(password),
    deviceId,
    isVerified: false,
    balance: 0,
    createdAt: new Date().toISOString()
  };
  
  saveUser(user);
  
  return { 
    success: true, 
    message: 'Registration successful. Please wait for admin verification.',
    userId: user.id
  };
};

export const login = (
  email: string,
  password: string,
  deviceId: string
): { success: boolean; message: string; token?: string; user?: User } => {
  const user = getUserByEmail(email);
  
  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }
  
  if (hashPassword(password) !== user.password) {
    return { success: false, message: 'Invalid email or password' };
  }
  
  if (user.deviceId !== deviceId) {
    return { success: false, message: 'Device not recognized. Please contact admin.' };
  }
  
  if (!user.isVerified) {
    return { success: false, message: 'Account pending verification. Please wait for admin approval.' };
  }
  
  const token = createSession(user.id, deviceId);
  
  return { 
    success: true, 
    message: 'Login successful',
    token,
    user
  };
};

// Transaction Operations
export const deposit = (
  userId: string,
  amount: number,
  description: string = 'Deposit'
): { success: boolean; message: string; newBalance?: number } => {
  const user = getUserById(userId);
  if (!user) {
    return { success: false, message: 'User not found' };
  }
  
  if (amount <= 0) {
    return { success: false, message: 'Amount must be greater than zero' };
  }
  
  const balanceBefore = user.balance;
  const balanceAfter = balanceBefore + amount;
  
  const transaction: Transaction = {
    id: generateToken(),
    userId,
    type: 'deposit',
    amount,
    balanceBefore,
    balanceAfter,
    timestamp: new Date().toISOString(),
    description
  };
  
  updateUser(userId, { balance: balanceAfter });
  saveTransaction(transaction);
  
  return {
    success: true,
    message: `Successfully deposited RWF ${amount.toLocaleString()}`,
    newBalance: balanceAfter
  };
};

export const withdraw = (
  userId: string,
  amount: number,
  description: string = 'Withdrawal'
): { success: boolean; message: string; newBalance?: number } => {
  const user = getUserById(userId);
  if (!user) {
    return { success: false, message: 'User not found' };
  }
  
  if (amount <= 0) {
    return { success: false, message: 'Amount must be greater than zero' };
  }
  
  if (user.balance < amount) {
    return { success: false, message: 'Insufficient balance' };
  }
  
  const balanceBefore = user.balance;
  const balanceAfter = balanceBefore - amount;
  
  const transaction: Transaction = {
    id: generateToken(),
    userId,
    type: 'withdraw',
    amount,
    balanceBefore,
    balanceAfter,
    timestamp: new Date().toISOString(),
    description
  };
  
  updateUser(userId, { balance: balanceAfter });
  saveTransaction(transaction);
  
  return {
    success: true,
    message: `Successfully withdrew RWF ${amount.toLocaleString()}`,
    newBalance: balanceAfter
  };
};
