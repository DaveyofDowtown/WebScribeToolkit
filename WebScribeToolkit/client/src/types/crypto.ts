export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume: number;
  balance: number;
  icon: string;
  color: string;
}

export interface Wallet {
  id: number;
  name: string;
  address: string;
  status: string;
  balance?: Record<string, number>;
}

export interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
}

export interface CryptoHistory {
  timestamp: string;
  price: number;
}
