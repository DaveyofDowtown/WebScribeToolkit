import { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Notification } from '../types/crypto';

export function useWalletData() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWallets = async () => {
    try {
      setIsLoading(true);
      const [walletsResponse, notificationsResponse] = await Promise.all([
        axios.get('/api/wallets'),
        axios.get('/api/notifications')
      ]);
      
      // Ensure we always have an array for wallets and notifications
      const walletsData = Array.isArray(walletsResponse.data) ? walletsResponse.data : [];
      const notificationsData = Array.isArray(notificationsResponse.data) ? notificationsResponse.data : [];
      
      setWallets(walletsData);
      setNotifications(notificationsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch wallet data'));
      // Set empty arrays on error to prevent map function errors
      setWallets([]);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  return {
    wallets: wallets || [],
    notifications: notifications || [],
    isLoading,
    error,
    refetch: fetchWallets
  };
}