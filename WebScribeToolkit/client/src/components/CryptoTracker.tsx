import { useState } from "react";
import { CryptoAsset } from "../types/crypto";
import { CryptoCard } from "./CryptoCard";

interface CryptoTrackerProps {
  assets: CryptoAsset[];
  chartData: Record<string, number[]>;
}

type TabType = 'all' | 'm2e' | 'crypto';

export function CryptoTracker({ assets, chartData }: CryptoTrackerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const filteredAssets = assets.filter(asset => {
    if (activeTab === 'all') return true;
    if (activeTab === 'm2e') return ['GST', 'SAND', 'GMT'].includes(asset.symbol);
    if (activeTab === 'crypto') return ['ETH', 'BTC', 'LTC'].includes(asset.symbol);
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8 dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-6">Crypto Portfolio Tracker</h2>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <a 
              href="#" 
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'all' 
                  ? 'border-b-2 border-indigo-600 text-indigo-600' 
                  : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('all');
              }}
            >
              All Assets
            </a>
          </li>
          <li className="mr-2">
            <a 
              href="#" 
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'm2e' 
                  ? 'border-b-2 border-indigo-600 text-indigo-600' 
                  : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('m2e');
              }}
            >
              M2E Tokens
            </a>
          </li>
          <li className="mr-2">
            <a 
              href="#" 
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'crypto' 
                  ? 'border-b-2 border-indigo-600 text-indigo-600' 
                  : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('crypto');
              }}
            >
              Cryptocurrencies
            </a>
          </li>
        </ul>
      </div>

      {/* Crypto Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {filteredAssets.map((asset) => (
          <CryptoCard 
            key={asset.id} 
            asset={asset} 
            chartData={chartData[asset.id] || []} 
          />
        ))}
      </div>
    </div>
  );
}
