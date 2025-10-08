

import React, { useState, useEffect, useMemo } from 'react';
import type { RentSettings, PaymentHistory, User, SentRemindersHistory, SentReminder, SmsTemplates, SubTenant } from '../../types';
import Card from '../common/Card';


interface QRCodeModalProps {
    user: User;
    onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ user, onClose }) => {
    const qrCodeUrl = useMemo(() => {
        const userData = { name: user.name, address: user.address, phone: user.phone, role: 'tenant', rentAmount: user.rentAmount, subTenants: user.subTenants || [] };
        const encodedData = encodeURIComponent(JSON.stringify(userData));
        return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodedData}&bgcolor=ffffff&color=0f172a&qzone=1`;
    }, [user]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 print:hidden" onClick={onClose}>
             <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #printable-qr, #printable-qr * {
                            visibility: visible;
                        }
                        #printable-qr {
                            position: fixed;
                            left: 50%;
                            top: 50%;
                            transform: translate(-50%, -50%);
                            padding: 2rem;
                            border: 2px solid #333;
                            border-radius: 12px;
                            background-color: white !important;
                        }
                         #printable-qr h3, #printable-qr p, #printable-qr img {
                             color: black !important;
                             background-color: white !important;
                         }
                    }
                `}
            </style>
            <div id="printable-qr" className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Login QR Code for {user.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-1">Address: {user.address}</p>
                    <p className="text-slate-500 dark:text-slate-400 mb-1">Phone: {user.phone}</p>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Monthly Rent: ${user.rentAmount?.toFixed(2)}</p>
                    <div className="bg-white p-4 rounded-lg inline-block">
                        <img src={qrCodeUrl} alt={`QR Code for ${user.name}`} className="rounded-md" />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-lg flex justify-end gap-3 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 py-2 px-4 text-sm font-medium text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Print
                    </button>
                    <button
                        onClick={onClose}
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

interface EditTenantModalProps {
    tenant: User;
    onClose: () => void;
    onUpdate: (originalName: string, updatedData: { name: string; address: string; phone: string; rentAmount: number; subTenants: SubTenant[] }) => { success: boolean, message?: string };
}

const EditTenantModal: React.FC<EditTenantModalProps> = ({ tenant, onClose, onUpdate }) => {
    const [name, setName] = useState(tenant.name);
    const [address, setAddress] = useState(tenant.address);
    const [phone, setPhone] = useState(tenant.phone);
    const [rent, setRent] = useState(tenant.rentAmount || 0);
    const [subTenants, setSubTenants] = useState<SubTenant[]>(tenant.subTenants || []);
    const [newSubTenantName, setNewSubTenantName] = useState('');
    const [newSubTenantDetails, setNewSubTenantDetails] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleAddSubTenant = () => {
        if (!newSubTenantName.trim() || !newSubTenantDetails.trim()) return;
        setSubTenants(prev => [...prev, { id: Date.now().toString(), name: newSubTenantName.trim(), leaseDetails: newSubTenantDetails.trim() }]);
        setNewSubTenantName('');
        setNewSubTenantDetails('');
    };

    const handleRemoveSubTenant = (id: string) => {
        setSubTenants(prev => prev.filter(st => st.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        if (!name.trim() || !address.trim() || !phone.trim() || rent <= 0) {
            setError('All fields are required and rent must be positive.');
            return;
        }

        const result = onUpdate(tenant.name, { name, address, phone, rentAmount: rent, subTenants });

        if (result.success) {
            setSuccessMessage('Tenant updated successfully!');
            setTimeout(() => {
                onClose();
            }, 1500);
        } else {
            setError(result.message || 'An unknown error occurred.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg transform transition-all" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Edit Tenant: {tenant.name}</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                <input id="edit-name" type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="edit-address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Property Address</label>
                                <input id="edit-address" type="text" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="edit-phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                                <input id="edit-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="edit-rent" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Rent ($)</label>
                                <input id="edit-rent" type="number" value={rent} onChange={e => setRent(Number(e.target.value))} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200">Sub-Tenant Leases</h4>
                                {subTenants.length > 0 && (
                                    <ul className="space-y-2 mt-2">
                                        {subTenants.map(st => (
                                            <li key={st.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700 p-2 rounded-md">
                                                <div>
                                                    <p className="font-medium text-sm">{st.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{st.leaseDetails}</p>
                                                </div>
                                                <button type="button" onClick={() => handleRemoveSubTenant(st.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">REMOVE</button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <div className="mt-4 space-y-2">
                                    <input type="text" placeholder="Sub-Tenant Name" value={newSubTenantName} onChange={e => setNewSubTenantName(e.target.value)} className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
                                    <textarea placeholder="Lease Details (e.g., duration, rent share)" value={newSubTenantDetails} onChange={e => setNewSubTenantDetails(e.target.value)} rows={2} className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
                                    <button type="button" onClick={handleAddSubTenant} className="w-full text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 py-1">Add Sub-Tenant</button>
                                </div>
                            </div>
                            
                            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                            {successMessage && <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-lg flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 py-2 px-4 text-sm font-medium text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Cancel</button>
                        <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface AdminPanelProps {
  settings: RentSettings;
  onSettingsChange: (newSettings: RentSettings) => void;
  paymentHistory: PaymentHistory;
  tenants: User[];
  onCreateTenant: (name: string, address: string, phone: string, rentAmount: number, subTenants: SubTenant[]) => boolean;
  onDeleteTenant: (tenantName: string) => void;
  onUpdateTenant: (originalName: string, updatedData: { name: string; address: string; phone: string; rentAmount: number; subTenants: SubTenant[] }) => { success: boolean, message?: string };
  sentReminders: SentRemindersHistory;
  smsTemplates: SmsTemplates;
  onSmsTemplatesChange: (newTemplates: SmsTemplates) => void;
  onSendManualSms: (tenantName: string, message: string) => void;
}

type SortKey = 'name' | 'address' | 'rentAmount';
type SortDirection = 'asc' | 'desc';
interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const getTenantPaymentStatus = (tenant: User, paymentHistory: PaymentHistory, settings: RentSettings): {text: 'Paid' | 'Due' | 'Overdue' | 'Upcoming', color: string} => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();

    const tenantPayments = paymentHistory[tenant.name] || [];
    
    // Updated logic: Check if total paid meets or exceeds rent amount
    const totalPaidThisMonth = tenantPayments
        .filter(p => p.month === currentMonth && p.year === currentYear)
        .reduce((sum, p) => sum + p.amount, 0);

    const rentAmount = tenant.rentAmount || 0;

    if (totalPaidThisMonth >= rentAmount) {
        return { text: 'Paid', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' };
    }

    if (currentDay > settings.endDay) {
        return { text: 'Overdue', color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' };
    }
    
    if (currentDay >= settings.startDay && currentDay <= settings.endDay) {
        return { text: 'Due', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' };
    }

    return { text: 'Upcoming', color: 'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-200' };
};


const AdminPanel: React.FC<AdminPanelProps> = ({ settings, onSettingsChange, paymentHistory, tenants, onCreateTenant, onDeleteTenant, onUpdateTenant, sentReminders, smsTemplates, onSmsTemplatesChange, onSendManualSms }) => {
  const [startDay, setStartDay] = useState(settings.startDay);
  const [endDay, setEndDay] = useState(settings.endDay);
  const [showSettingsSuccess, setShowSettingsSuccess] = useState(false);

  const [reminderTemplate, setReminderTemplate] = useState(smsTemplates.reminder);
  const [lateTemplate, setLateTemplate] = useState(smsTemplates.late);
  const [showTemplateSuccess, setShowTemplateSuccess] = useState(false);

  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantAddress, setNewTenantAddress] = useState('');
  const [newTenantPhone, setNewTenantPhone] = useState('');
  const [newTenantRent, setNewTenantRent] = useState(1200);
  const [newSubTenants, setNewSubTenants] = useState<SubTenant[]>([]);
  const [newSubTenantName, setNewSubTenantName] = useState('');
  const [newSubTenantLease, setNewSubTenantLease] = useState('');
  const [tenantCreationMessage, setTenantCreationMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [qrCodeForTenant, setQrCodeForTenant] = useState<User | null>(null);
  const [tenantToDelete, setTenantToDelete] = useState<User | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [tenantToEdit, setTenantToEdit] = useState<User | null>(null);
  
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const [manualSmsTenant, setManualSmsTenant] = useState('');
  const [manualSmsMessage, setManualSmsMessage] = useState('');
  const [manualSmsStatus, setManualSmsStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);


  useEffect(() => {
    setStartDay(settings.startDay);
    setEndDay(settings.endDay);
  }, [settings]);
  
  useEffect(() => {
    setReminderTemplate(smsTemplates.reminder);
    setLateTemplate(smsTemplates.late);
  }, [smsTemplates]);

  const handleSaveSettings = () => {
    onSettingsChange({ startDay, endDay });
    setShowSettingsSuccess(true);
    setTimeout(() => setShowSettingsSuccess(false), 3000);
  };
  
  const handleSaveTemplates = () => {
    onSmsTemplatesChange({
        reminder: reminderTemplate,
        late: lateTemplate,
    });
    setShowTemplateSuccess(true);
    setTimeout(() => setShowTemplateSuccess(false), 3000);
  };

  const handleAddSubTenant = () => {
    if (!newSubTenantName.trim() || !newSubTenantLease.trim()) return;
    setNewSubTenants(prev => [...prev, { id: Date.now().toString(), name: newSubTenantName.trim(), leaseDetails: newSubTenantLease.trim() }]);
    setNewSubTenantName('');
    setNewSubTenantLease('');
  };

  const handleRemoveSubTenant = (id: string) => {
    setNewSubTenants(prev => prev.filter(st => st.id !== id));
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim() || !newTenantAddress.trim() || !newTenantPhone.trim() || newTenantRent <= 0) {
        setTenantCreationMessage({ type: 'error', text: 'All primary tenant fields are required and rent must be positive.' });
        return;
    }
    const success = onCreateTenant(newTenantName, newTenantAddress, newTenantPhone, newTenantRent, newSubTenants);
    if (success) {
        setTenantCreationMessage({ type: 'success', text: `Tenant '${newTenantName}' created successfully!` });
        setNewTenantName('');
        setNewTenantAddress('');
        setNewTenantPhone('');
        setNewTenantRent(1200);
        setNewSubTenants([]);
        setNewSubTenantName('');
        setNewSubTenantLease('');
    } else {
        setTenantCreationMessage({ type: 'error', text: `A tenant with the name '${newTenantName}' already exists.` });
    }
    setTimeout(() => setTenantCreationMessage(null), 4000);
  };
  
  const populateTemplate = (template: string, tenantName: string) => {
    const tenant = tenants.find(t => t.name === tenantName);
    if (!tenant) return template;
    return template
        .replace(/{tenant_name}/g, tenant.name.split(' ')[0])
        .replace(/{rent_amount}/g, `$${tenant.rentAmount?.toFixed(2)}`)
        .replace(/{due_date_start}/g, `${settings.startDay}`)
        .replace(/{due_date_end}/g, `${settings.endDay}`);
  };

  const handleManualSmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSmsTenant || !manualSmsMessage.trim()) {
        setManualSmsStatus({ type: 'error', text: 'Please select a tenant and enter a message.' });
        return;
    }
    onSendManualSms(manualSmsTenant, manualSmsMessage);
    setManualSmsStatus({ type: 'success', text: 'Simulated SMS sent successfully!' });
    setManualSmsTenant('');
    setManualSmsMessage('');
    setTimeout(() => setManualSmsStatus(null), 3000);
  };

  const handleRequestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const handleCloseDeleteModal = () => {
    setTenantToDelete(null);
    setDeleteConfirmationText('');
  };

  const handleToggleExpand = (tenantName: string) => {
    setExpandedTenant(prev => (prev === tenantName ? null : tenantName));
  };

  const handleCopyMessage = (message: string, index: number) => {
    navigator.clipboard.writeText(message).then(() => {
        setCopiedIndex(index);
        setTimeout(() => {
            setCopiedIndex(null);
        }, 2000); // Reset after 2 seconds
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  };

  const { totalRevenue, totalTransactions, recentTransactions } = useMemo(() => {
    if (!paymentHistory) return { totalRevenue: 0, totalTransactions: 0, recentTransactions: [] };

    const allPayments = Object.keys(paymentHistory).flatMap((tenantName) =>
      paymentHistory[tenantName].map(p => ({ ...p, tenantName }))
    );

    const sorted = allPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      totalRevenue: sorted.reduce((sum, p) => sum + p.amount, 0),
      totalTransactions: sorted.length,
      recentTransactions: sorted.slice(0, 10),
    };
  }, [paymentHistory]);
  
  const sortedTenants = useMemo(() => {
    let sortableTenants = [...tenants];
    sortableTenants.sort((a, b) => {
        const key = sortConfig.key;
        const direction = sortConfig.direction === 'asc' ? 1 : -1;

        if (key === 'name' || key === 'address') {
            return a[key].localeCompare(b[key]) * direction;
        } else if (key === 'rentAmount') {
            const valA = a.rentAmount ?? 0;
            const valB = b.rentAmount ?? 0;
            return (valA - valB) * direction;
        }
        return 0;
    });
    return sortableTenants;
  }, [tenants, sortConfig]);

  const allReminders = useMemo(() => {
    return Object.entries(sentReminders).flatMap(([tenantName, reminders]) => 
        // FIX: Add type assertion to treat `reminders` as SentReminder[]
        (reminders as SentReminder[]).map(r => ({ ...r, tenantName }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sentReminders]);

  const ChevronDownIcon = ({ expanded }: { expanded: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-500 dark:text-slate-400 transform transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );

  const AdminIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
  
  const DirectMessageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V8z" />
    </svg>
  );

  const SummaryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );

  const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a4 4 0 110-5.292" />
    </svg>
  );

  const SmsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );

  const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
  
  const getReminderTypeClass = (type: 'reminder' | 'late' | 'manual') => {
    switch (type) {
        case 'late':
            return 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        case 'reminder':
            return 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
        case 'manual':
            return 'bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
        default:
            return 'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-200';
    }
  };

  return (
    <div className="space-y-8">
        <Card title="Global Settings" titleIcon={<AdminIcon />}>
          <div className="space-y-6">
            <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    These settings apply to all tenants. Individual rent amounts are set per tenant.
                </p>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Payment Window (Day of Month)
                </label>
                <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="start-day" className="block text-xs text-slate-500 dark:text-slate-400">
                            Start Day
                        </label>
                        <input
                            id="start-day"
                            type="number"
                            min="1"
                            max="31"
                            value={startDay}
                            onChange={(e) => setStartDay(Number(e.target.value))}
                            className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="end-day" className="block text-xs text-slate-500 dark:text-slate-400">
                            End Day
                        </label>
                        <input
                            id="end-day"
                            type="number"
                            min="1"
                            max="31"
                            value={endDay}
                            onChange={(e) => setEndDay(Number(e.target.value))}
                            className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end space-x-4">
                {showSettingsSuccess && <p className="text-sm text-green-600 dark:text-green-400">Settings saved successfully!</p>}
                <button
                onClick={handleSaveSettings}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                Save Settings
                </button>
            </div>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <Card title="SMS Template Customization" titleIcon={<SmsIcon />}>
                <div className="space-y-6">
                     <div>
                        <label htmlFor="reminder-template" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Payment Reminder Template
                        </label>
                        <textarea
                            id="reminder-template"
                            rows={3}
                            value={reminderTemplate}
                            onChange={(e) => setReminderTemplate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                     <div>
                        <label htmlFor="late-template" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Late Payment Template
                        </label>
                        <textarea
                            id="late-template"
                            rows={3}
                            value={lateTemplate}
                            onChange={(e) => setLateTemplate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Available placeholders:
                            <code className="bg-slate-200 dark:bg-slate-600 rounded p-0.5 mx-1 font-mono">{'{tenant_name}'}</code>
                            <code className="bg-slate-200 dark:bg-slate-600 rounded p-0.5 mx-1 font-mono">{'{rent_amount}'}</code>
                            <code className="bg-slate-200 dark:bg-slate-600 rounded p-0.5 mx-1 font-mono">{'{due_date_start}'}</code>
                            <code className="bg-slate-200 dark:bg-slate-600 rounded p-0.5 mx-1 font-mono">{'{due_date_end}'}</code>
                        </p>
                    </div>
                    <div className="flex items-center justify-end space-x-4">
                        {showTemplateSuccess && <p className="text-sm text-green-600 dark:text-green-400">Templates saved successfully!</p>}
                        <button
                            onClick={handleSaveTemplates}
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Save Templates
                        </button>
                    </div>
                </div>
            </Card>

            <Card title="Direct Communication" titleIcon={<DirectMessageIcon />}>
                <form onSubmit={handleManualSmsSubmit} className="space-y-4">
                    <div>
                    <label htmlFor="manual-sms-tenant" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Recipient Tenant
                    </label>
                    <select
                        id="manual-sms-tenant"
                        value={manualSmsTenant}
                        onChange={(e) => setManualSmsTenant(e.target.value)}
                        className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="">-- Select a Tenant --</option>
                        {tenants.map(t => (
                        <option key={t.name} value={t.name}>{t.name}</option>
                        ))}
                    </select>
                    </div>
                    <div>
                    <label htmlFor="manual-sms-message" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Message
                    </label>
                    <textarea
                        id="manual-sms-message"
                        rows={3}
                        value={manualSmsMessage}
                        onChange={(e) => setManualSmsMessage(e.target.value)}
                        className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Type your custom message here..."
                    />
                    <div className="mt-2 flex gap-4">
                        <button type="button" disabled={!manualSmsTenant} onClick={() => setManualSmsMessage(populateTemplate(smsTemplates.reminder, manualSmsTenant))} className="text-xs font-medium text-indigo-600 hover:underline disabled:text-slate-400 disabled:no-underline">Load Reminder Template</button>
                        <button type="button" disabled={!manualSmsTenant} onClick={() => setManualSmsMessage(populateTemplate(smsTemplates.late, manualSmsTenant))} className="text-xs font-medium text-indigo-600 hover:underline disabled:text-slate-400 disabled:no-underline">Load Late Template</button>
                    </div>
                    </div>
                    <div className="flex items-center justify-end space-x-4">
                        {manualSmsStatus && <p className={`text-sm ${manualSmsStatus.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{manualSmsStatus.text}</p>}
                        <button
                            type="submit"
                            disabled={!manualSmsTenant || !manualSmsMessage.trim()}
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            Send Simulated SMS
                        </button>
                    </div>
                </form>
            </Card>
        </div>

        <Card title="Tenant Management" titleIcon={<UsersIcon />}>
            <form onSubmit={handleCreateTenant} className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-700">
                <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200">Create New Tenant</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Tenant Full Name"
                        value={newTenantName}
                        onChange={(e) => setNewTenantName(e.target.value)}
                        className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Property Address"
                        value={newTenantAddress}
                        onChange={(e) => setNewTenantAddress(e.target.value)}
                        className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        value={newTenantPhone}
                        onChange={(e) => setNewTenantPhone(e.target.value)}
                        className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                     <input
                        id="rent-amount"
                        type="number"
                        placeholder="Monthly Rent ($)"
                        value={newTenantRent}
                        onChange={(e) => setNewTenantRent(Number(e.target.value))}
                        className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Sub-Tenant Leases (Optional)</h5>
                     {newSubTenants.length > 0 && (
                        <ul className="space-y-2 mt-2 mb-4 max-h-40 overflow-y-auto">
                            {newSubTenants.map(st => (
                                <li key={st.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700 p-2 rounded-md">
                                    <div>
                                        <p className="font-medium text-sm">{st.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{st.leaseDetails}</p>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveSubTenant(st.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">REMOVE</button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <input
                            type="text"
                            placeholder="Sub-Tenant Name"
                            value={newSubTenantName}
                            onChange={(e) => setNewSubTenantName(e.target.value)}
                            className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Lease Details (e.g., duration, rent share)"
                            value={newSubTenantLease}
                            onChange={(e) => setNewSubTenantLease(e.target.value)}
                            className="w-full md:col-span-2 rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                     <button type="button" onClick={handleAddSubTenant} className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200">
                        + Add Sub-Tenant
                    </button>
                </div>
                
                <div className="flex items-center justify-end space-x-4">
                    {tenantCreationMessage && <p className={`text-sm ${tenantCreationMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{tenantCreationMessage.text}</p>}
                    <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Create Tenant
                    </button>
                </div>
            </form>

             <div className="mt-6">
                <h4 className="text-md font-semibold mb-4 text-slate-800 dark:text-slate-200">Registered Tenants</h4>
                
                {tenants.length > 1 && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Sort by:</span>
                        <div className="flex items-center gap-2">
                            {(['name', 'address', 'rentAmount'] as SortKey[]).map((key) => {
                                const isActive = sortConfig.key === key;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handleRequestSort(key)}
                                        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors flex items-center gap-1 ${
                                            isActive
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                                        }`}
                                    >
                                        {key === 'rentAmount' ? 'Rent' : key.charAt(0).toUpperCase() + key.slice(1)}
                                        {isActive && (
                                            <span className="text-xs">
                                                {sortConfig.direction === 'asc' ? '▲' : '▼'}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                {sortedTenants.length > 0 ? (
                    <ul className="space-y-3 max-h-[40rem] overflow-y-auto pr-2">
                        {sortedTenants.map(tenant => {
                             const status = getTenantPaymentStatus(tenant, paymentHistory, settings);
                             return (
                                <li key={tenant.name} className="bg-slate-100 dark:bg-slate-700 rounded-md transition-shadow hover:shadow-lg">
                                    <div onClick={() => handleToggleExpand(tenant.name)} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 cursor-pointer">
                                        <div className='flex items-center gap-3'>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>{status.text}</span>
                                            <div>
                                                <p className="font-semibold">{tenant.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{tenant.address}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 mt-2 sm:mt-0 flex-shrink-0">
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">${tenant.rentAmount?.toFixed(2)}/mo</p>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setQrCodeForTenant(tenant); }}
                                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
                                                aria-label={`Show QR code for ${tenant.name}`}
                                            >
                                                Show QR
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setTenantToEdit(tenant); }}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                                aria-label={`Edit ${tenant.name}`}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setTenantToDelete(tenant); }}
                                                className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                                                aria-label={`Delete ${tenant.name}`}
                                            >
                                                Delete
                                            </button>
                                            <ChevronDownIcon expanded={expandedTenant === tenant.name} />
                                        </div>
                                    </div>
                                    {expandedTenant === tenant.name && (() => {
                                        const tenantPayments = paymentHistory[tenant.name] || [];
                                        const totalPaid = tenantPayments.reduce((acc, p) => acc + p.amount, 0);
                                        const onTimePayments = tenantPayments.filter(p => {
                                            const paymentDate = new Date(p.date);
                                            const dayOfMonthPaid = paymentDate.getDate();
                                            return dayOfMonthPaid >= settings.startDay && dayOfMonthPaid <= settings.endDay;
                                        }).length;
                                        const latePayments = tenantPayments.length - onTimePayments;

                                        return (
                                            <div className="p-4 border-t border-slate-200 dark:border-slate-600 space-y-4 bg-slate-50 dark:bg-slate-700/50 rounded-b-md">
                                                <div>
                                                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Payment Summary</h5>
                                                    {tenantPayments.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                            <div className="flex items-center gap-3 bg-slate-200 dark:bg-slate-600 p-3 rounded-lg">
                                                                <div className="flex-shrink-0">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Total Paid</p>
                                                                    <p className="font-semibold text-md">${totalPaid.toFixed(2)}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 bg-green-100 dark:bg-green-900/50 p-3 rounded-lg">
                                                                <div className="flex-shrink-0">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-semibold text-green-700 dark:text-green-300">On-Time Payments</p>
                                                                    <p className="font-bold text-lg text-green-800 dark:text-green-200">{onTimePayments}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">
                                                                <div className="flex-shrink-0">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-semibold text-red-700 dark:text-red-300">Late Payments</p>
                                                                    <p className="font-bold text-lg text-red-800 dark:text-red-200">{latePayments}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-4 bg-slate-100 dark:bg-slate-600/50 rounded-lg">
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">No payment history for this tenant.</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {tenant.subTenants && tenant.subTenants.length > 0 && (
                                                    <div className="pt-4 border-t border-slate-300 dark:border-slate-600">
                                                        <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Sub-Tenant Leases</h5>
                                                        <ul className="space-y-2">
                                                            {tenant.subTenants.map(st => (
                                                                <li key={st.id} className="bg-slate-200 dark:bg-slate-600 p-3 rounded-lg">
                                                                    <p className="font-semibold text-sm">{st.name}</p>
                                                                    <p className="text-xs text-slate-600 dark:text-slate-300">{st.leaseDetails}</p>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </li>
                            )
                        })}
                    </ul>
                ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-4">No tenants have been created yet.</p>
                )}
            </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <Card title="Payment Summary" titleIcon={<SummaryIcon />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg text-center sm:text-left">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg text-center sm:text-left">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Transactions</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalTransactions}</p>
                    </div>
                </div>

                <h4 className="text-md font-semibold mb-4 text-slate-800 dark:text-slate-200">Recent Transactions</h4>
                {recentTransactions.length > 0 ? (
                    <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {recentTransactions.map(p => (
                            <li key={p.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-slate-100 dark:bg-slate-700 p-3 rounded-md">
                                <div className="mb-2 sm:mb-0">
                                    <p className="font-semibold">{p.tenantName}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {new Date(p.date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600 dark:text-green-400">${p.amount.toFixed(2)}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">{p.id}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">No payments have been made yet.</p>
                )}
            </Card>

            <Card title="Simulated SMS Log" titleIcon={<SmsIcon />}>
                {allReminders.length > 0 ? (
                     <ul className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
                        {allReminders.map((r, index) => (
                             <li key={index} className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <p className="font-semibold">{r.tenantName}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(r.date).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${getReminderTypeClass(r.type)}`}>
                                        {r.type}
                                    </span>
                                </div>
                                <div className="mt-2">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">From: 609383</p>
                                    <div className="mt-1 flex items-start justify-between gap-4">
                                        <p className="text-sm text-slate-600 dark:text-slate-300 italic flex-grow">"{r.message}"</p>
                                        <button
                                            onClick={() => handleCopyMessage(r.message, index)}
                                            className="flex items-center gap-1.5 flex-shrink-0 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 px-2 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                            aria-label="Copy message"
                                        >
                                            {copiedIndex === index ? (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <CopyIcon />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                             </li>
                        ))}
                     </ul>
                ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">No reminders have been sent yet.</p>
                )}
            </Card>
        </div>


        {qrCodeForTenant && <QRCodeModal user={qrCodeForTenant} onClose={() => setQrCodeForTenant(null)} />}
        {tenantToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={handleCloseDeleteModal}>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md transform transition-all" onClick={e => e.stopPropagation()}>
                    <div className="p-6">
                        <div className="text-center">
                            <svg className="mx-auto mb-4 h-14 w-14 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Tenant Account</h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                This will permanently remove <strong>{tenantToDelete.name}</strong> and all associated payment history. This action cannot be undone.
                            </p>
                        </div>
                        <div className="mt-4 text-left">
                            <label htmlFor="delete-confirm" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                To confirm, please type "<strong>{tenantToDelete.name}</strong>" below:
                            </label>
                            <input
                                id="delete-confirm"
                                type="text"
                                value={deleteConfirmationText}
                                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                autoComplete="off"
                            />
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-lg flex justify-end gap-3">
                        <button
                            onClick={handleCloseDeleteModal}
                            className="inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 py-2 px-4 text-sm font-medium text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (tenantToDelete) {
                                    onDeleteTenant(tenantToDelete.name);
                                    handleCloseDeleteModal();
                                }
                            }}
                            disabled={deleteConfirmationText !== tenantToDelete.name}
                            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Delete Tenant
                        </button>
                    </div>
                </div>
            </div>
        )}
        {tenantToEdit && (
            <EditTenantModal 
                tenant={tenantToEdit} 
                onClose={() => setTenantToEdit(null)} 
                onUpdate={onUpdateTenant}
            />
        )}
    </div>
  );
};

export default AdminPanel;