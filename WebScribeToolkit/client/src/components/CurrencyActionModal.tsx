import { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/utils';

interface CurrencyActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'swap' | 'transfer' | 'cashout';
  currencies: Record<string, number>;
  walletAddress?: string;
}

export function CurrencyActionModal({ 
  isOpen, 
  onClose, 
  action, 
  currencies, 
  walletAddress 
}: CurrencyActionModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(Object.keys(currencies)[0] || '');
  const [amount, setAmount] = useState<string>('');
  const [targetCurrency, setTargetCurrency] = useState<string>('');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [cashoutMethod, setCashoutMethod] = useState<string>('');
  const [cashoutAccount, setCashoutAccount] = useState<string>('');
  const [estimatedUsdValue, setEstimatedUsdValue] = useState<number>(0);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Get available amount for selected currency
  const availableAmount = selectedCurrency ? currencies[selectedCurrency] || 0 : 0;
  
  // Handle selection changes
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurrency(e.target.value);
    setAmount('');
    setError(null);
  };

  const handleTargetCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTargetCurrency(e.target.value);
    setError(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError(null);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestinationAddress(e.target.value);
    setError(null);
  };
  
  const handleCashoutMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCashoutMethod(e.target.value);
    setError(null);
  };
  
  const handleCashoutAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCashoutAccount(e.target.value);
    setError(null);
  };
  
  // Calculate estimated USD value when currency or amount changes
  useEffect(() => {
    if (selectedCurrency && amount && !isNaN(parseFloat(amount))) {
      // Approximate exchange rates (in a real app, these would come from an API)
      const exchangeRates: Record<string, number> = {
        btc: 64000,
        eth: 3000,
        sol: 140,
        gst: 0.02,
        gmt: 0.15,
        sand: 0.45
      };
      
      const rate = exchangeRates[selectedCurrency.toLowerCase()] || 0;
      setEstimatedUsdValue(parseFloat(amount) * rate);
    } else {
      setEstimatedUsdValue(0);
    }
  }, [selectedCurrency, amount]);

  // Validate input before submission
  const validateInput = () => {
    if (!selectedCurrency) {
      setError('Please select a currency');
      return false;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    
    if (parseFloat(amount) > availableAmount) {
      setError(`Amount exceeds available balance of ${availableAmount.toFixed(2)} ${selectedCurrency.toUpperCase()}`);
      return false;
    }
    
    if (action === 'swap' && !targetCurrency) {
      setError('Please select a target currency to swap to');
      return false;
    }
    
    if (action === 'transfer' && !destinationAddress) {
      setError('Please enter a destination wallet address');
      return false;
    }
    
    // Additional validation for Ethereum addresses if needed
    if (action === 'transfer' && !destinationAddress.startsWith('0x')) {
      setError('Please enter a valid wallet address (should start with 0x)');
      return false;
    }
    
    if (action === 'cashout') {
      if (!cashoutMethod) {
        setError('Please select a cashout method');
        return false;
      }
      
      if (!cashoutAccount) {
        setError('Please enter your account information');
        return false;
      }
      
      // Validation for minimum cashout amount (at least $10 worth)
      if (estimatedUsdValue < 10) {
        setError(`Minimum cashout amount is $10.00 (current value: $${estimatedUsdValue.toFixed(2)})`);
        return false;
      }
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInput()) {
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      if (action === 'transfer') {
        await axios.post('/api/transfer', {
          fromWalletId: selectedWallet?.id,
          toAddress: destinationAddress,
          amount: parseFloat(amount),
          currency: selectedCurrency
        });
      } else {
        // Simulate API call for other actions
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setSuccess(true);
      
      // Reset form after successful operation
      setTimeout(() => {
        setProcessing(false);
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError('An error occurred while processing your request. Please try again.');
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {action === 'swap' ? 'Swap Currencies' : 
             action === 'transfer' ? 'Transfer to External Wallet' : 
             'Cash Out Earnings'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500 dark:bg-green-900/30 dark:text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <path d="m9 11 3 3L22 4"></path>
                </svg>
              </div>
              <h4 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                Operation Successful
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                {action === 'swap' 
                  ? `You've successfully swapped ${amount} ${selectedCurrency.toUpperCase()} to ${targetCurrency.toUpperCase()}.`
                  : action === 'transfer'
                  ? `You've successfully transferred ${amount} ${selectedCurrency.toUpperCase()} to the external wallet.`
                  : `You've successfully cashed out ${amount} ${selectedCurrency.toUpperCase()} (approx. $${estimatedUsdValue.toFixed(2)}) to your ${cashoutMethod} account.`
                }
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* From Currency Selection */}
              <div className="mb-4">
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Currency
                </label>
                <select
                  id="currency"
                  value={selectedCurrency}
                  onChange={handleCurrencyChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={processing}
                >
                  <option value="">Select a currency</option>
                  {Object.entries(currencies).map(([currency, balance]) => (
                    <option key={currency} value={currency}>
                      {currency.toUpperCase()} - Balance: {balance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Amount Input */}
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount to {action === 'swap' ? 'Swap' : action === 'transfer' ? 'Transfer' : 'Cash Out'}
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="amount"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={processing}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {selectedCurrency ? selectedCurrency.toUpperCase() : ''}
                    </span>
                  </div>
                </div>
                {selectedCurrency && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Available: {availableAmount.toFixed(2)} {selectedCurrency.toUpperCase()}
                  </p>
                )}
              </div>
              
              {/* Additional fields based on action */}
              {action === 'swap' && (
                <div className="mb-4">
                  <label htmlFor="targetCurrency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Swap To
                  </label>
                  <select
                    id="targetCurrency"
                    value={targetCurrency}
                    onChange={handleTargetCurrencyChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={processing}
                  >
                    <option value="">Select target currency</option>
                    <option value="btc">BTC</option>
                    <option value="eth">ETH</option>
                    <option value="sol">SOL</option>
                    <option value="gst">GST</option>
                    <option value="gmt">GMT</option>
                    <option value="sand">SAND</option>
                  </select>
                </div>
              )}
              
              {action === 'transfer' && (
                <div className="mb-4">
                  <label htmlFor="destinationAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Destination Wallet Address
                  </label>
                  <input
                    type="text"
                    id="destinationAddress"
                    value={destinationAddress}
                    onChange={handleAddressChange}
                    placeholder="0x..."
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                    disabled={processing}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Enter the wallet address where you want to send your funds
                  </p>
                </div>
              )}
              
              {action === 'cashout' && (
                <>
                  {/* Estimated Value Display */}
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Value:</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        ${estimatedUsdValue.toFixed(2)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Cash out value may vary slightly based on market fluctuations
                    </p>
                  </div>
                  
                  {/* Cashout Method Selection */}
                  <div className="mb-4">
                    <label htmlFor="cashoutMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cashout Method
                    </label>
                    <select
                      id="cashoutMethod"
                      value={cashoutMethod}
                      onChange={handleCashoutMethodChange}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={processing}
                    >
                      <option value="">Select a payment method</option>
                      <option value="cashapp">CashApp</option>
                      <option value="venmo">Venmo</option>
                      <option value="paypal">PayPal</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                  
                  {/* Account Information Input */}
                  <div className="mb-4">
                    <label htmlFor="cashoutAccount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {cashoutMethod === 'bank' ? 'Account Number' : 'Username/Account ID'}
                    </label>
                    <input
                      type="text"
                      id="cashoutAccount"
                      value={cashoutAccount}
                      onChange={handleCashoutAccountChange}
                      placeholder={
                        cashoutMethod === 'cashapp' ? '$username' : 
                        cashoutMethod === 'venmo' ? '@username' :
                        cashoutMethod === 'paypal' ? 'email or username' :
                        cashoutMethod === 'bank' ? 'Account number' : 
                        'Enter account information'
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={processing}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Enter your {cashoutMethod} account information to receive funds
                    </p>
                  </div>
                </>
              )}
              
              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md dark:bg-red-900/30 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                  disabled={processing}
                >
                  {processing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span>
                      {action === 'swap' ? 'Swap Currency' : 
                       action === 'transfer' ? 'Transfer Funds' : 
                       'Cash Out Funds'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}