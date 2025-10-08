
import React from 'react';
import type { PaymentRecord, User } from '../../types';

interface ReceiptModalProps {
  payment: PaymentRecord;
  user: User;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ payment, user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="p-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Receipt</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Transaction ID: {payment.id}</p>
                </div>
                 <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>

        <div className="border-t border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-6 space-y-4">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Paid To</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">RentPay Portal Management</p>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Paid By</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{user.address}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Payment Date</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{new Date(payment.date).toLocaleString()}</p>
            </div>
        </div>

        <div className="p-6">
             <div className="flex justify-between items-center">
                <p className="font-semibold text-slate-800 dark:text-slate-200">Rent for {new Date(payment.date).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">${payment.amount.toFixed(2)}</p>
            </div>
             <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>
             <div className="flex justify-between items-center text-xl font-bold">
                <p>Total Paid</p>
                <p className="text-indigo-600 dark:text-indigo-400">${payment.amount.toFixed(2)}</p>
            </div>
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-b-lg text-center">
            <button
                onClick={onClose}
                className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-8 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
