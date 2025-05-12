import { CryptoAsset } from "../types/crypto";

interface DashboardOverviewProps {
  assets: CryptoAsset[];
  lastUpdated: Date;
  onRefresh: () => void;
}

export function DashboardOverview({ assets, lastUpdated, onRefresh }: DashboardOverviewProps) {
  // Calculate portfolio values
  const totalValue = assets.reduce((total, asset) => total + (asset.balance * asset.currentPrice), 0);
  
  const m2eTokens = assets.filter(asset => ['GST', 'SAND', 'GMT'].includes(asset.symbol));
  const m2eValue = m2eTokens.reduce((total, asset) => total + (asset.balance * asset.currentPrice), 0);
  
  const cryptoTokens = assets.filter(asset => ['ETH', 'BTC', 'LTC'].includes(asset.symbol));
  const cryptoValue = cryptoTokens.reduce((total, asset) => total + (asset.balance * asset.currentPrice), 0);

  // Calculate daily changes
  const totalChange = assets.reduce((total, asset) => 
    total + (asset.balance * asset.currentPrice * asset.priceChangePercentage24h / 100), 0);
  
  const m2eChange = m2eTokens.reduce((total, asset) => 
    total + (asset.balance * asset.currentPrice * asset.priceChangePercentage24h / 100), 0);
  
  const cryptoChange = cryptoTokens.reduce((total, asset) => 
    total + (asset.balance * asset.currentPrice * asset.priceChangePercentage24h / 100), 0);

  // Format values for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center p-2 bg-white rounded-lg shadow-sm dark:bg-gray-800">
            <span className="text-gray-500 mr-2">Last updated:</span>
            <span className="font-medium">{formatTime(lastUpdated)}</span>
            <button 
              className="ml-2 text-indigo-600 hover:text-indigo-800"
              onClick={onRefresh}
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm">Total Portfolio Value</h3>
            <span className={totalChange >= 0 ? "text-green-500" : "text-red-500"}>
              <i className={`fas fa-arrow-${totalChange >= 0 ? 'up' : 'down'}`}></i> 
              {Math.abs((totalChange / totalValue * 100)).toFixed(1)}%
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalValue)}</p>
          <p className="text-gray-500 text-sm mt-1">
            {totalChange >= 0 ? '+' : ''}{formatCurrency(totalChange)} today
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm">M2E Tokens</h3>
            <span className={m2eChange >= 0 ? "text-green-500" : "text-red-500"}>
              <i className={`fas fa-arrow-${m2eChange >= 0 ? 'up' : 'down'}`}></i> 
              {Math.abs((m2eChange / m2eValue * 100)).toFixed(1)}%
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">{formatCurrency(m2eValue)}</p>
          <p className="text-gray-500 text-sm mt-1">
            {m2eChange >= 0 ? '+' : ''}{formatCurrency(m2eChange)} today
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm">Cryptocurrencies</h3>
            <span className={cryptoChange >= 0 ? "text-green-500" : "text-red-500"}>
              <i className={`fas fa-arrow-${cryptoChange >= 0 ? 'up' : 'down'}`}></i> 
              {Math.abs((cryptoChange / cryptoValue * 100)).toFixed(1)}%
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">{formatCurrency(cryptoValue)}</p>
          <p className="text-gray-500 text-sm mt-1">
            {cryptoChange >= 0 ? '+' : ''}{formatCurrency(cryptoChange)} today
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm">Total Earnings (30d)</h3>
            <span className="text-green-500">
              <i className="fas fa-arrow-up"></i> 15.7%
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalValue * 0.157)}</p>
          <p className="text-gray-500 text-sm mt-1">
            +{formatCurrency(totalValue * 0.157 * 0.12)} vs last month
          </p>
        </div>
      </div>
    </div>
  );
}
