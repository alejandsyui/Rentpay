import React, { useState } from 'react';
import type { User } from '../../types';
import Card from '../common/Card';
import QRCodeScanner from './QRCodeScanner';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  tenants: User[];
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, tenants }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'tenant' | 'admin'>('tenant');
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (newRole: 'tenant' | 'admin') => {
    setRole(newRole);
    setName('');
    setError(null);
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (role === 'admin') {
      if (name === '42119937298') {
        onLogin({ name: 'Admin User', address: 'Control Panel', role: 'admin', phone: '' });
      } else {
        setError('Invalid Admin ID. Please try again.');
      }
    }
  };
  
  const QRIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4L12 8M12 16L12 20M8 12L4 12M20 12L16 12M7 7L4 4M20 20L17 17M7 17L4 20M20 7L17 4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6v6H9z" />
     </svg>
  );

  return (
    <>
      {showScanner && <QRCodeScanner onScanSuccess={onLogin} onClose={() => setShowScanner(false)} />}

      <div className="flex justify-center items-center min-h-[calc(100vh-100px)]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
              <div className="flex justify-center items-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                  </svg>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome to RentPay Portal</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                {role === 'tenant' 
                    ? 'Scan your personal QR code to log in.' 
                    : 'Enter your Admin ID to access the control panel.'
                }
              </p>
          </div>
          <Card>
            <div className="space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                    <div className="mt-2 flex rounded-md shadow-sm">
                        <button type="button" onClick={() => handleRoleChange('tenant')} className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md transition-colors ${role === 'tenant' ? 'bg-indigo-600 text-white z-10' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                            Tenant
                        </button>
                        <button type="button" onClick={() => handleRoleChange('admin')} className={`-ml-px flex-1 py-2 px-4 text-sm font-medium rounded-r-md transition-colors ${role === 'admin' ? 'bg-indigo-600 text-white z-10' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                            Admin
                        </button>
                    </div>
                </div>

                {role === 'tenant' ? (
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tenant Login</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">Please use the QR code provided by your administrator to sign in.</p>
                        <button
                            type="button"
                            onClick={() => setShowScanner(true)}
                            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                            <QRIcon />
                            Scan QR Code to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Admin ID
                        </label>
                        <input
                        id="name"
                        type="password"
                        value={name}
                        onChange={(e) => handleInputChange(setName, e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter your Admin ID"
                        autoComplete="current-password"
                        />
                    </div>
                    
                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-300" role="alert">
                        <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Login
                    </button>
                    </form>
                )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

// FIX: Add default export for the component
export default AuthScreen;