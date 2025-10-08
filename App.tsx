
import React, { useEffect } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import type { User, RentSettings, PaymentHistory, PaymentRecord, SentRemindersHistory, SmsTemplates, SubTenant } from './types';
import AuthScreen from './components/auth/AuthScreen';
import TenantDashboard from './components/tenant/TenantDashboard';
import AdminPanel from './components/admin/AdminPanel';
import Header from './components/common/Header';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [rentSettings, setRentSettings] = useLocalStorage<RentSettings>('rentSettings', {
    startDay: 1,
    endDay: 5,
  });
  const [paymentHistory, setPaymentHistory] = useLocalStorage<PaymentHistory>('paymentHistory', {});
  const [tenants, setTenants] = useLocalStorage<User[]>('tenants', []);
  const [sentReminders, setSentReminders] = useLocalStorage<SentRemindersHistory>('sentReminders', {});
  const [smsTemplates, setSmsTemplates] = useLocalStorage<SmsTemplates>('smsTemplates', {
    reminder: `Hi {tenant_name}, just a friendly reminder that your rent of {rent_amount} is due by the {due_date_end}th.`,
    late: `Hi {tenant_name}, your rent payment of {rent_amount} is now overdue. Please submit payment as soon as possible.`,
  });

  // Effect to simulate checking for and "sending" SMS reminders.
  // This runs when key data changes (e.g., a payment is made).
  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const newRemindersHistory: SentRemindersHistory = JSON.parse(JSON.stringify(sentReminders)); // Deep copy to prevent mutation issues
    let remindersUpdatedOverall = false;

    tenants.forEach(tenant => {
      if (tenant.role !== 'tenant' || !tenant.phone) return;

      const tenantPayments = paymentHistory[tenant.name] || [];
      const hasPaidThisMonth = tenantPayments.some(p => p.month === currentMonth && p.year === currentYear);
      
      // No need to send reminders if they've paid
      if (hasPaidThisMonth) return;

      const tenantReminders = newRemindersHistory[tenant.name] || [];
      let newReminderSentForTenant = false;
      
      const hasSentReminderThisMonth = tenantReminders.some(r => {
          const rDate = new Date(r.date);
          return r.type === 'reminder' && rDate.getMonth() === currentMonth && rDate.getFullYear() === currentYear;
      });
      
      const hasSentLateNoticeThisMonth = tenantReminders.some(r => {
        const rDate = new Date(r.date);
        return r.type === 'late' && rDate.getMonth() === currentMonth && rDate.getFullYear() === currentYear;
      });

      const populateTemplate = (template: string) => {
        return template
          .replace(/{tenant_name}/g, tenant.name.split(' ')[0])
          .replace(/{rent_amount}/g, `$${tenant.rentAmount?.toFixed(2)}`)
          .replace(/{due_date_start}/g, `${rentSettings.startDay}`)
          .replace(/{due_date_end}/g, `${rentSettings.endDay}`);
      };

      // Send payment window reminder
      if (currentDay >= rentSettings.startDay && currentDay <= rentSettings.endDay && !hasSentReminderThisMonth) {
        tenantReminders.push({
          date: today.toISOString(),
          type: 'reminder',
          message: populateTemplate(smsTemplates.reminder),
        });
        newReminderSentForTenant = true;
      }
      // Send late payment reminder
      else if (currentDay > rentSettings.endDay && !hasSentLateNoticeThisMonth) {
         tenantReminders.push({
          date: today.toISOString(),
          type: 'late',
          message: populateTemplate(smsTemplates.late),
        });
        newReminderSentForTenant = true;
      }
    
       if (newReminderSentForTenant) {
         newRemindersHistory[tenant.name] = tenantReminders;
         remindersUpdatedOverall = true;
       }
    });

    if (remindersUpdatedOverall) {
        setSentReminders(newRemindersHistory);
    }
  }, [tenants, paymentHistory, rentSettings, sentReminders, setSentReminders, smsTemplates]);


  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleSettingsChange = (newSettings: RentSettings) => {
    setRentSettings(newSettings);
  };

  const handlePayment = (paymentRecord: PaymentRecord) => {
    if (currentUser && currentUser.role === 'tenant') {
      setPaymentHistory(prev => ({
        ...prev,
        [currentUser.name]: [...(prev[currentUser.name] || []), paymentRecord],
      }));
    }
  };
  
  const handleCreateTenant = (name: string, address: string, phone: string, rentAmount: number, subTenants: SubTenant[]): boolean => {
    const nameExists = tenants.some(t => t.name.toLowerCase() === name.trim().toLowerCase());
    if (nameExists) {
      return false; // Indicate failure
    }
    const newTenant: User = { name: name.trim(), address: address.trim(), phone: phone.trim(), role: 'tenant', rentAmount, subTenants };
    setTenants(prev => [...prev, newTenant]);
    setPaymentHistory(prev => {
      // Initialize payment history for the new tenant to ensure they exist in the system
      if (!prev[newTenant.name]) {
        return { ...prev, [newTenant.name]: [] };
      }
      return prev;
    });
    return true; // Indicate success
  };

  const handleDeleteTenant = (tenantName: string) => {
    setTenants(prev => prev.filter(t => t.name !== tenantName));
    setPaymentHistory(prev => {
      const newHistory = { ...prev };
      delete newHistory[tenantName];
      return newHistory;
    });
    setSentReminders(prev => {
      const newReminders = { ...prev };
      delete newReminders[tenantName];
      return newReminders;
    });
  };

  const handleUpdateTenant = (originalName: string, updatedData: { name: string; address: string; phone: string; rentAmount: number; subTenants: SubTenant[] }): { success: boolean, message?: string } => {
    const { name: newName, address, phone, rentAmount, subTenants } = updatedData;
    const trimmedNewName = newName.trim();
    const trimmedAddress = address.trim();
    const trimmedPhone = phone.trim();

    // Check if new name already exists (and it's not the same tenant)
    if (originalName.toLowerCase() !== trimmedNewName.toLowerCase() && tenants.some(t => t.name.toLowerCase() === trimmedNewName.toLowerCase())) {
      return { success: false, message: `A tenant with the name '${trimmedNewName}' already exists.` };
    }

    // Update tenants array
    setTenants(prevTenants => prevTenants.map(t => {
      if (t.name === originalName) {
        return { ...t, name: trimmedNewName, address: trimmedAddress, phone: trimmedPhone, rentAmount, subTenants };
      }
      return t;
    }));

    // If name changed, migrate payment history and reminders
    if (originalName !== trimmedNewName) {
      setPaymentHistory(prevHistory => {
        const newHistory = { ...prevHistory };
        if (newHistory[originalName]) {
          newHistory[trimmedNewName] = newHistory[originalName];
          delete newHistory[originalName];
        }
        return newHistory;
      });
      setSentReminders(prevReminders => {
        const newReminders = { ...prevReminders };
        if (newReminders[originalName]) {
          newReminders[trimmedNewName] = newReminders[originalName];
          delete newReminders[originalName];
        }
        return newReminders;
      });
    }

    return { success: true };
  };
  
  const handleSendManualSms = (tenantName: string, message: string) => {
    setSentReminders(prev => {
        const newHistory = JSON.parse(JSON.stringify(prev)); // Deep copy
        const tenantReminders = newHistory[tenantName] || [];
        tenantReminders.push({
            date: new Date().toISOString(),
            type: 'manual',
            message: message,
        });
        newHistory[tenantName] = tenantReminders;
        return newHistory;
    });
  };


  const renderContent = () => {
    if (!currentUser) {
      return <AuthScreen onLogin={handleLogin} tenants={tenants} />;
    }
    switch (currentUser.role) {
      case 'tenant':
        return (
          <TenantDashboard
            user={currentUser}
            settings={rentSettings}
            history={paymentHistory[currentUser.name] || []}
            onPayment={handlePayment}
          />
        );
      case 'admin':
        return (
            <AdminPanel 
                settings={rentSettings} 
                onSettingsChange={handleSettingsChange} 
                paymentHistory={paymentHistory}
                tenants={tenants}
                onCreateTenant={handleCreateTenant}
                onDeleteTenant={handleDeleteTenant}
                onUpdateTenant={handleUpdateTenant}
                sentReminders={sentReminders}
                smsTemplates={smsTemplates}
                onSmsTemplatesChange={setSmsTemplates}
                onSendManualSms={handleSendManualSms}
            />
        );
      default:
        return <AuthScreen onLogin={handleLogin} tenants={tenants} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      {currentUser && <Header user={currentUser} onLogout={handleLogout} />}
      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;