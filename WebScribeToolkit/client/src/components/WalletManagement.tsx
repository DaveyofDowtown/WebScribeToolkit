import { useState } from "react";
import { Wallet, Notification } from "../types/crypto";
import { formatCurrency } from "../lib/utils";
import { CurrencyActionModal } from "./CurrencyActionModal";

interface WalletManagementProps {
  wallets: Wallet[];
  notifications: Notification[];
}

export function WalletManagement({ wallets = [], notifications = [] }: WalletManagementProps) {
  // Ensure wallets and notifications are always arrays
  const walletsArray = Array.isArray(wallets) ? wallets : [];
  const notificationsArray = Array.isArray(notifications) ? notifications : [];
  
  // State for currency action modal
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<'swap' | 'transfer' | 'cashout'>('swap');
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Wallets Column */}
        <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2 dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-6">Linked Wallets</h2>
          
          {/* Wallet List */}
          <div className="space-y-4 mb-6">
            {walletsArray.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg dark:border-gray-700">
                <div className="text-gray-400 text-4xl mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">No wallets connected yet</p>
              </div>
            ) : (
              walletsArray.map((wallet) => (
                <div key={wallet.id} className="border border-gray-200 rounded-lg p-4 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">{wallet.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 wallet-address font-mono">
                          {wallet.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full dark:bg-green-900 dark:text-green-200">
                        {wallet.status}
                      </span>
                      <button className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="19" cy="12" r="1"></circle>
                          <circle cx="5" cy="12" r="1"></circle>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Wallet Balance */}
                  {wallet.balance && Object.keys(wallet.balance).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Wallet Balance</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedWallet(wallet);
                              setCurrentAction('swap');
                              setModalOpen(true);
                            }}
                            className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50"
                          >
                            Swap
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedWallet(wallet);
                              setCurrentAction('transfer');
                              setModalOpen(true);
                            }}
                            className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-800/50"
                          >
                            Transfer
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedWallet(wallet);
                              setCurrentAction('cashout');
                              setModalOpen(true);
                            }}
                            className="text-xs px-2 py-1 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-800/50"
                          >
                            Cash Out
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(wallet.balance).map(([currency, amount]) => (
                          <div key={currency} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            <span className="font-medium">{amount.toFixed(2)}</span> {currency.toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Add New Wallet Button */}
          <button className="flex items-center justify-center w-full p-3 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-600 dark:border-gray-600 dark:hover:border-indigo-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
            <span>Connect New Wallet</span>
          </button>
        </div>
        
        {/* Notification Column */}
        <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-6">Notifications</h2>
          
          <div className="space-y-4">
            {notificationsArray.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg dark:border-gray-700">
                <div className="text-gray-400 text-4xl mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notificationsArray.map((notification) => {
                const getNotificationColor = (type: string) => {
                  switch (type) {
                    case 'info': return 'blue';
                    case 'success': return 'green';
                    case 'warning': return 'yellow';
                    case 'error': return 'red';
                    default: return 'blue';
                  }
                };
                
                const color = getNotificationColor(notification.type);
                
                // Use dynamic class concatenation instead of template literals for Tailwind
                const bgClass = `bg-${color}-50 dark:bg-${color}-900/20`;
                const borderClass = `border-${color}-100 dark:border-${color}-800`;
                const textClass = `text-${color}-500 dark:text-${color}-400`;
                const headingClass = `text-${color}-800 dark:text-${color}-300`;
                const messageClass = `text-${color}-600 dark:text-${color}-400`;
                const timeClass = `text-${color}-500 dark:text-${color}-500`;
                
                // Get icon based on notification type
                const getNotificationIcon = (type: string) => {
                  switch (type) {
                    case 'info':
                      return (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 16v-4"></path>
                          <path d="M12 8h.01"></path>
                        </svg>
                      );
                    case 'success':
                      return (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <path d="m9 11 3 3L22 4"></path>
                        </svg>
                      );
                    case 'warning':
                      return (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                          <path d="M12 9v4"></path>
                          <path d="M12 17h.01"></path>
                        </svg>
                      );
                    case 'error':
                      return (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="m15 9-6 6"></path>
                          <path d="m9 9 6 6"></path>
                        </svg>
                      );
                    default:
                      return null;
                  }
                };
                
                return (
                  <div key={notification.id} className={`flex items-start space-x-3 p-3 ${bgClass} border ${borderClass} rounded-lg`}>
                    <div className={`${textClass} mt-1`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div>
                      <h3 className={`font-medium ${headingClass}`}>{notification.title}</h3>
                      <p className={`text-sm ${messageClass}`}>{notification.message}</p>
                      <p className={`text-xs ${timeClass} mt-1`}>{notification.time}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {notificationsArray.length > 0 && (
            <div className="mt-4 text-center">
              <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                View all notifications
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Currency Action Modal */}
      {selectedWallet && modalOpen && (
        <CurrencyActionModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedWallet(null);
          }}
          action={currentAction}
          currencies={selectedWallet.balance || {}}
          walletAddress={selectedWallet.address}
        />
      )}
    </>
  );
}