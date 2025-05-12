import { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/utils';

interface StepTrackerProps {
  onEarnTokens: (amount: number, token: string) => void;
}

export function StepTracker({ onEarnTokens }: StepTrackerProps) {
  const [steps, setSteps] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [calories, setCalories] = useState<number>(0);
  const [earnedTokens, setEarnedTokens] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [selectedToken, setSelectedToken] = useState<string>('gst');
  const [stepsInSession, setStepsInSession] = useState<number>(0);
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [stepInterval, setStepInterval] = useState<NodeJS.Timeout | null>(null);

  // Token earning rates (tokens per 1000 steps)
  const tokenRates: Record<string, number> = {
    gst: 0.5,  // 0.5 GST per 1000 steps
    gmt: 0.05, // 0.05 GMT per 1000 steps
    sand: 0.2  // 0.2 SAND per 1000 steps
  };

  // Calculate distance and calories based on steps
  useEffect(() => {
    // Average stride length ~0.76 meters
    const calculatedDistance = steps * 0.76 / 1000; // in kilometers
    // Average calorie burn ~0.04 calories per step
    const calculatedCalories = steps * 0.04;
    
    // Calculate tokens earned (based on the rate for the selected token)
    const calculatedTokens = (steps / 1000) * (tokenRates[selectedToken] || 0);
    
    setDistance(calculatedDistance);
    setCalories(calculatedCalories);
    setEarnedTokens(calculatedTokens);
  }, [steps, selectedToken]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (stepInterval) {
        clearInterval(stepInterval);
      }
    };
  }, [stepInterval]);

  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedToken(e.target.value);
  };

  const toggleWalking = () => {
    if (isWalking) {
      // Stop walking
      if (stepInterval) {
        clearInterval(stepInterval);
        setStepInterval(null);
      }
      setIsWalking(false);
    } else {
      // Start walking
      setIsWalking(true);
      setStepsInSession(0);
      
      // Add steps at random intervals to simulate real walking
      const interval = setInterval(() => {
        const newSteps = Math.floor(Math.random() * 3) + 1; // 1-3 steps per interval
        setStepsInSession(prev => prev + newSteps);
        setSteps(prev => prev + newSteps);
      }, 300); // Roughly 100-300 steps per minute
      
      setStepInterval(interval);
    }
  };

  const handleSync = async () => {
    if (steps <= 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the callback to update wallet balance
      onEarnTokens(earnedTokens, selectedToken);
      
      // Update last sync time
      setLastSyncTime(new Date());
      
      // Reset the steps count
      setStepsInSession(0);
      setSteps(0);
      
      // Stop walking if active
      if (isWalking) {
        toggleWalking();
      }
    } catch (error) {
      console.error('Error submitting steps:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manual step addition
  const addSteps = (amount: number) => {
    setSteps(prev => prev + amount);
    setStepsInSession(prev => prev + amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4">Step Tracker</h2>
      
      <div className="space-y-5">
        {/* Active Walking Simulation */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
              {steps}
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Steps</p>
          
          {isWalking && (
            <div className="animate-pulse text-green-600 dark:text-green-400 text-sm font-medium">
              Walking in progress...
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              type="button"
              onClick={toggleWalking}
              className={`py-2 px-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isWalking 
                  ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500'
                  : 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500'
              }`}
            >
              {isWalking ? 'Stop Walking' : 'Start Walking'}
            </button>
            
            <button
              type="button"
              onClick={() => addSteps(100)}
              className="py-2 px-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 dark:text-indigo-400"
            >
              +100 Steps
            </button>
          </div>
        </div>
        
        {/* Token Selection */}
        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Earn Token
          </label>
          <select
            id="token"
            value={selectedToken}
            onChange={handleTokenChange}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isSubmitting}
          >
            <option value="gst">GST (STEPN)</option>
            <option value="gmt">GMT (STEPN Governance)</option>
            <option value="sand">SAND (Sandbox)</option>
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Earning rate: {tokenRates[selectedToken]} {selectedToken.toUpperCase()} per 1000 steps
          </p>
        </div>
        
        {/* Statistics Display */}
        {steps > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Distance</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{distance.toFixed(2)} km</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Calories</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{calories.toFixed(0)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Earnings</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {earnedTokens.toFixed(4)} {selectedToken.toUpperCase()}
              </p>
            </div>
          </div>
        )}
        
        {/* Current Session Info */}
        {stepsInSession > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Current Session:</span>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{stepsInSession} steps</span>
            </div>
          </div>
        )}
        
        {/* Last Sync Info */}
        {lastSyncTime && (
          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
            Last synchronized: {lastSyncTime.toLocaleString()}
          </div>
        )}
        
        {/* Sync Button */}
        <div>
          <button
            onClick={handleSync}
            disabled={steps <= 0 || isSubmitting}
            className="w-full py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-md hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Sync & Earn Tokens'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}