import { useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { DashboardOverview } from "../components/DashboardOverview";
import { CryptoTracker } from "../components/CryptoTracker";
import { WalletManagement } from "../components/WalletManagement";
import { ActivityChart } from "../components/ActivityChart";
import { StepTracker } from "../components/StepTracker";
import { useCryptoData } from "../hooks/useCryptoData";
import { useWalletData } from "../hooks/useWalletData";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

export default function Home() {
  const [earning, setEarning] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Fetch crypto data
  const { 
    assets, 
    isLoading: cryptoLoading, 
    error: cryptoError, 
    chartData, 
    historicalData, 
    lastUpdated, 
    refetch: refetchCrypto
  } = useCryptoData();

  // Fetch wallet and notification data
  const {
    wallets,
    notifications,
    isLoading: walletLoading,
    error: walletError,
    refetch: refetchWallets
  } = useWalletData();

  const isLoading = cryptoLoading || walletLoading;
  const error = cryptoError || walletError;

  const handleRefresh = () => {
    refetchCrypto();
    refetchWallets();
  };
  
  const handleEarnTokens = async (amount: number, token: string) => {
    if (amount <= 0) return;
    
    setEarning(true);
    
    try {
      // In a real app, this would be a call to an API endpoint to update the wallet
      // For this prototype, we'll simulate a successful update with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Tokens Earned",
        description: `Successfully earned ${amount.toFixed(4)} ${token.toUpperCase()} from your steps!`,
      });
      
      // Update wallets data
      refetchWallets();
    } catch (error) {
      console.error("Error earning tokens:", error);
      toast({
        title: "Error",
        description: "There was a problem earning tokens from your steps. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEarning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full dark:bg-gray-800">
          <div className="flex items-center text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m15 9-6 6"></path>
              <path d="m9 9 6 6"></path>
            </svg>
            <h2 className="text-xl font-bold">Error Loading Data</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error instanceof Error ? error.message : "An unknown error occurred while fetching data."}
          </p>
          <button 
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 w-full"
            onClick={handleRefresh}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <DashboardOverview 
          assets={assets} 
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
        />
        <CryptoTracker 
          assets={assets}
          chartData={chartData}
        />
        
        {/* Move-to-Earn Section */}
        <div className="my-8">
          <h2 className="text-2xl font-bold mb-6">Move to Earn</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StepTracker onEarnTokens={handleEarnTokens} />
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">How It Works</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Click to Generate Steps</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Start walking and generate steps by clicking on the interface elements
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Choose Your Token</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Select which cryptocurrency you want to earn from your steps
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Sync & Claim Your Rewards</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click sync to transfer your earned tokens to your connected wallet
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    Each token has a different earning rate. GST earns 0.5 tokens per 1000 steps, 
                    while GMT earns 0.05 tokens per 1000 steps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <WalletManagement 
          wallets={wallets}
          notifications={notifications}
        />
        <ActivityChart 
          assets={assets}
          historicalData={historicalData}
        />
      </main>
      <Footer />
    </div>
  );
}
