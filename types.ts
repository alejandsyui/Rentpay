
export interface SubTenant {
  id: string;
  name: string;
  leaseDetails: string;
}

export interface User {
  name: string;
  address: string;
  role: 'tenant' | 'admin';
  phone: string;
  rentAmount?: number;
  subTenants?: SubTenant[];
}

export interface RentSettings {
  startDay: number;
  endDay: number;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  month: number; // 0-11
  year: number;
}

export type PaymentHistory = Record<string, PaymentRecord[]>;

export interface SentReminder {
  date: string; // ISO String
  type: 'reminder' | 'late' | 'manual';
  message: string;
}

export type SentRemindersHistory = Record<string, SentReminder[]>;

export interface SmsTemplates {
  reminder: string;
  late: string;
}