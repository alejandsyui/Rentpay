
import React, { useState } from 'react';
import type { RentSettings } from '../../types';
import Card from '../common/Card';
import { StripeIcon, CashAppIcon, ZelleIcon, CryptoIcon } from '../../constants';

interface PaymentSectionProps {
  settings: RentSettings;
  amount: number;
  onPay: () => void;
  isPaidForMonth: boolean;
  isWithinPayWindow: boolean;
}

const paymentMethods = [
    { label: 'Stripe', icon: <StripeIcon /> },
    { label: 'Cash App', icon: <CashAppIcon /> },
    { label: 'Zelle', icon: <ZelleIcon /> },
    { label: 'Crypto', icon: <CryptoIcon /> },
];

const PaymentSection: React.FC<PaymentSectionProps> = ({ settings, amount, onPay, isPaidForMonth, isWithinPayWindow }) => {
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  
  const handlePayment = () => {
    if (!selectedMethod) return;
    setProcessing(true);
    setTimeout(() => {
      onPay();
      setProcessing(false);
      setSelectedMethod(null);
    }, 1500);
  };

  const getStatusMessage = () => {
    if (isPaidForMonth) {
      return { text: "Rent paid for this month!", color: "text-green-600 dark:text-green-400" };
    }
    if (!isWithinPayWindow) {
      return { text: `Payment is only accepted from the ${settings.startDay}th to the ${settings.endDay}th.`, color: "text-amber-600 dark:text-amber-400" };
    }
    return { text: "Rent is due for this month.", color: "text-red-600 dark:text-red-400" };
  };
  
  const status = getStatusMessage();
  const canPay = !isPaidForMonth && isWithinPayWindow;
  
  const PaymentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );

  return (
    <Card title="Make a Payment" titleIcon={<PaymentIcon />}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Amount Due</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">${amount.toFixed(2)}</p>
          <p className={`text-sm mt-1 ${status.color}`}>{status.text}</p>
        </div>
      </div>
      
      <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
        <h4 className="font-semibold mb-4">1. Choose a payment method:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {paymentMethods.map((method) => (
             <PaymentButton 
                key={method.label}
                icon={method.icon} 
                label={method.label} 
                onClick={() => setSelectedMethod(method.label)} 
                disabled={!canPay}
                isSelected={selectedMethod === method.label}
             />
          ))}
        </div>
        
        {canPay && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold mb-4">2. Confirm Payment</h4>
                <button
                    onClick={handlePayment}
                    disabled={!selectedMethod || processing}
                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors"
                >
                    {processing ? (
                         <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                         </>
                    ) : (
                        selectedMethod
                            ? `Pay $${amount.toFixed(2)} with ${selectedMethod}`
                            : 'Select a payment method above'
                    )}
                </button>
            </div>
        )}
      </div>
    </Card>
  );
};

interface PaymentButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled: boolean;
    isSelected: boolean;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ icon, label, onClick, disabled, isSelected}) => {
    const baseClasses = "flex flex-row items-center justify-center p-4 border rounded-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed gap-2";
    const inactiveClasses = "border-slate-300 dark:border-slate-600 hover:enabled:border-indigo-500 hover:enabled:shadow-lg hover:enabled:-translate-y-1 hover:enabled:text-indigo-600 dark:hover:enabled:text-indigo-400";
    const activeClasses = "border-indigo-500 ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 shadow-lg -translate-y-1";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${isSelected ? activeClasses : inactiveClasses}`}
        >
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </button>
    );
}

export default PaymentSection;
