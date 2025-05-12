import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CryptoAsset } from "../types/crypto";
import { useState, useEffect } from "react";

interface CoinGeckoResponse {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

export function useCryptoData() {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [chartData, setChartData] = useState<Record<string, number[]>>({});
  const [historicalData, setHistoricalData] = useState<Record<string, number[]>>({});

  // Define crypto assets with their initial data
  const assetMappings = [
    {
      id: 'green-satoshi-token',
      symbol: 'GST',
      name: 'Green Satoshi Token',
      balance: 1243,
      icon: 'fas fa-shoe-prints',
      color: '#4CAF50'
    },
    {
      id: 'the-sandbox',
      symbol: 'SAND',
      name: 'The Sandbox',
      balance: 256,
      icon: 'fas fa-cubes',
      color: '#DCB272'
    },
    {
      id: 'stepn',
      symbol: 'GMT',
      name: 'STEPN Token',
      balance: 823,
      icon: 'fas fa-shoe-prints',
      color: '#33CCFF'
    },
    {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      balance: 0.32,
      icon: 'fab fa-ethereum',
      color: '#627EEA'
    },
    {
      id: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      balance: 0.015,
      icon: 'fab fa-bitcoin',
      color: '#F7931A'
    },
    {
      id: 'litecoin',
      symbol: 'LTC',
      name: 'Litecoin',
      balance: 0.12,
      icon: 'fab fa-litecoin',
      color: '#345D9D'
    }
  ];

  // Fetch crypto data from CoinGecko
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/crypto/prices'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  });

  // Generate random chart data for each asset
  useEffect(() => {
    const generateChartData = () => {
      const newChartData: Record<string, number[]> = {};
      const newHistoricalData: Record<string, number[]> = {};
      
      assetMappings.forEach(asset => {
        // Small chart data (14 points)
        newChartData[asset.id] = Array(14).fill(0).map(() => 
          Math.floor(Math.random() * 40) + 10
        );
        
        // Historical data for the activity chart (30 points)
        newHistoricalData[asset.id] = Array(30).fill(0).map(() => 
          Math.floor(Math.random() * 10) - 5
        );
      });
      
      setChartData(newChartData);
      setHistoricalData(newHistoricalData);
    };
    
    generateChartData();
  }, []);

  // Transform API response to our asset format
  const assets: CryptoAsset[] = data?.map((coin: CoinGeckoResponse) => {
    const mappedAsset = assetMappings.find(asset => asset.id === coin.id);
    
    if (!mappedAsset) {
      return null;
    }
    
    return {
      id: coin.id,
      symbol: mappedAsset.symbol,
      name: mappedAsset.name,
      currentPrice: coin.current_price,
      priceChangePercentage24h: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
      volume: coin.total_volume,
      balance: mappedAsset.balance,
      icon: mappedAsset.icon,
      color: mappedAsset.color
    };
  }).filter(Boolean) as CryptoAsset[] || [];

  // Handle manual refresh
  const handleRefetch = async () => {
    await refetch();
    setLastUpdated(new Date());
  };

  return {
    assets: assets.length > 0 ? assets : assetMappings.map(asset => ({
      ...asset,
      id: asset.id,
      currentPrice: 0,
      priceChangePercentage24h: 0,
      marketCap: 0,
      volume: 0
    })),
    isLoading,
    error,
    chartData,
    historicalData,
    lastUpdated,
    refetch: handleRefetch
  };
}
