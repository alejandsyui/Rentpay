

import React, { useState, useMemo } from 'react';
import type { User, RentSettings, PaymentRecord } from '../../types';
import RentCalendar from './RentCalendar';
import PaymentSection from './PaymentSection';
import ReceiptModal from './ReceiptModal';
import Card from '../common/Card';

interface TenantDashboardProps {
  user: User;
  settings: RentSettings;
  history: PaymentRecord[];
  onPayment: (paymentRecord: PaymentRecord) => void;
}

const TenantDashboard: React.FC<TenantDashboardProps> = ({ user, settings, history, onPayment }) => {
  const [receipt, setReceipt] = useState<PaymentRecord | null>(null);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDate = today.getDate();

  const isPaidForCurrentMonth = useMemo(() => 
    history.some(p => p.month === currentMonth && p.year === currentYear),
    [history, currentMonth, currentYear]
  );
  
  const isWithinPayWindow = useMemo(() => 
    currentDate >= settings.startDay && currentDate <= settings.endDay,
    [currentDate, settings]
  );

  const handlePaymentSuccess = () => {
    const newPayment: PaymentRecord = {
      id: `PAY-${Date.now()}`,
      date: new Date().toISOString(),
      amount: user.rentAmount || 0,
      month: currentMonth,
      year: currentYear,
    };
    onPayment(newPayment);
    setReceipt(newPayment);
  };
  
  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
  
  const GroupIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );

  const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className="space-y-8">
        <Card title="Tenant Information" titleIcon={<UserIcon />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Name</p>
                    <p className="font-semibold text-lg">{user.name}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Address</p>
                    <p className="font-semibold text-lg">{user.address}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Phone</p>
                    <p className="font-semibold text-lg">{user.phone}</p>
                </div>
                 <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Monthly Rent</p>
                    <p className="font-semibold text-lg text-indigo-600 dark:text-indigo-400">${(user.rentAmount || 0).toFixed(2)}</p>
                </div>
            </div>
        </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <RentCalendar settings={settings} paymentHistory={history} />
            <PaymentSection
              amount={user.rentAmount || 0}
              settings={settings}
              onPay={handlePaymentSuccess}
              isPaidForMonth={isPaidForCurrentMonth}
              isWithinPayWindow={isWithinPayWindow}
            />
            {user.subTenants && user.subTenants.length > 0 && (
                <Card title="Sub-Tenant Leases" titleIcon={<GroupIcon />}>
                     <ul className="space-y-3">
                        {user.subTenants.map((st) => (
                            <li key={st.id} className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md">
                                <p className="font-semibold">{st.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{st.leaseDetails}</p>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}
        </div>
        
        <Card title="Payment History" titleIcon={<HistoryIcon />} className="lg:col-span-1">
          {history.length > 0 ? (
            <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {[...history].reverse().map(p => (
                <li key={p.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700 p-3 rounded-md">
                  <div>
                    <p className="font-semibold">
                        {new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{p.id}</p>
                  </div>
                  <p className="font-bold text-green-600 dark:text-green-400">${p.amount.toFixed(2)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">No payments made yet.</p>
          )}
        </Card>
      </div>

      {receipt && <ReceiptModal payment={receipt} user={user} onClose={() => setReceipt(null)} />}
    </div>
  );
};

export default TenantDashboard;