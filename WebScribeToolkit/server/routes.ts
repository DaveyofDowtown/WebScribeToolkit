import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import crypto from 'crypto';

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to fetch crypto prices
  app.get("/api/crypto/prices", async (req, res) => {
    try {
      // Get cryptocurrency data from CoinGecko API
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "usd",
            ids: "bitcoin,ethereum,litecoin,the-sandbox,green-satoshi-token,stepn",
            order: "market_cap_desc",
            per_page: 100,
            page: 1,
            sparkline: false,
            price_change_percentage: "24h",
          },
        }
      );

      res.json(response.data);
    } catch (error) {
      console.error("Error fetching cryptocurrency data:", error);

      // Fallback data in case of rate limiting or other API errors
      const fallbackData = [
        {
          id: "bitcoin",
          symbol: "btc",
          name: "Bitcoin",
          image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
          current_price: 64352.12,
          price_change_percentage_24h: 1.25,
          market_cap: 1259000000000,
          total_volume: 29853000000
        },
        {
          id: "ethereum",
          symbol: "eth",
          name: "Ethereum",
          image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
          current_price: 3050.87,
          price_change_percentage_24h: 0.75,
          market_cap: 366700000000,
          total_volume: 12853000000
        },
        {
          id: "litecoin",
          symbol: "ltc",
          name: "Litecoin",
          image: "https://assets.coingecko.com/coins/images/2/large/litecoin.png",
          current_price: 78.24,
          price_change_percentage_24h: -0.5,
          market_cap: 5800000000,
          total_volume: 452000000
        },
        {
          id: "the-sandbox",
          symbol: "sand",
          name: "The Sandbox",
          image: "https://assets.coingecko.com/coins/images/12129/large/sandbox_logo.jpg",
          current_price: 0.45,
          price_change_percentage_24h: -2.1,
          market_cap: 842000000,
          total_volume: 98000000
        },
        {
          id: "green-satoshi-token",
          symbol: "gst",
          name: "Green Satoshi Token",
          image: "https://assets.coingecko.com/coins/images/21841/large/gst.png",
          current_price: 0.02,
          price_change_percentage_24h: -5.2,
          market_cap: 12500000,
          total_volume: 850000
        },
        {
          id: "stepn",
          symbol: "gmt",
          name: "STEPN",
          image: "https://assets.coingecko.com/coins/images/23597/large/gmt.png",
          current_price: 0.15,
          price_change_percentage_24h: -3.8,
          market_cap: 92000000,
          total_volume: 4500000
        }
      ];

      res.json(fallbackData);
    }
  });

  // API route to fetch historical data for a specific crypto
  app.get("/api/crypto/history/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { days = 7 } = req.query;

      // Get historical data from CoinGecko API
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
        {
          params: {
            vs_currency: "usd",
            days: days,
          },
        }
      );

      res.json(response.data);
    } catch (error) {
      console.error(`Error fetching historical data for ${req.params.id}:`, error);

      // Generate some realistic-looking fallback data for the chart
      const numPoints = Number(days) * 24; // Hourly data points
      const prices = [];
      const marketCaps = [];
      const volumes = [];

      let startPrice = 0;

      // Set a realistic starting price based on the cryptocurrency
      switch(id) {
        case 'bitcoin': startPrice = 64000; break;
        case 'ethereum': startPrice = 3000; break;
        case 'litecoin': startPrice = 80; break;
        case 'the-sandbox': startPrice = 0.45; break;
        case 'green-satoshi-token': startPrice = 0.02; break;
        case 'stepn': startPrice = 0.15; break;
        default: startPrice = 100;
      }

      // Generate random prices with realistic volatility
      const now = Date.now();
      for (let i = 0; i < numPoints; i++) {
        const timestamp = now - (numPoints - i) * 3600000; // One hour intervals
        const change = (Math.random() - 0.5) * 0.02; // Random price change within ±1%
        startPrice = startPrice * (1 + change);
        prices.push([timestamp, startPrice]);
        marketCaps.push([timestamp, startPrice * 1000000]);
        volumes.push([timestamp, startPrice * 10000]);
      }

      res.json({
        prices,
        market_caps: marketCaps,
        total_volumes: volumes
      });
    }
  });

  // API route to fetch user wallets
  app.get("/api/wallets", async (req, res) => {
    try {
      const wallets = await storage.getWallets();

      // If no wallets exist in the database yet, seed with sample data
      if (wallets.length === 0) {
        const sampleWallets = [
          {
            userId: 1, // Default user ID
            name: "My STEPN Wallet",
            address: "0x8f26a53C2B7D71aF5C22D6CeB4aB295627135a6f",
            status: "Active",
            balance: {
              "gst": 120.5,
              "gmt": 50.2
            }
          },
          {
            userId: 1, // Default user ID
            name: "Main Exchange Wallet",
            address: "0x3a92b69eBcf91B23481712F738f0892F55a6c8f5",
            status: "Active",
            balance: {
              "btc": 0.05,
              "eth": 1.2
            }
          },
          {
            userId: 1, // Default user ID
            name: "SAND Gaming Wallet",
            address: "0x4f7A8c1b1C88BDd92b7950a740Fc81865a8d38F2",
            status: "Active",
            balance: {
              "sand": 325.75
            }
          }
        ];

        // Create a default user if it doesn't exist
        let user = await storage.getUserByUsername("demo");
        if (!user) {
          user = await storage.createUser({
            username: "demo",
            password: "password" // In a real app, this would be hashed
          });
        }

        // Insert the sample wallets
        for (const wallet of sampleWallets) {
          await storage.createWallet({
            ...wallet,
            userId: user.id
          });
        }

        // Fetch the wallets again to get the inserted ones
        const newWallets = await storage.getWallets();
        res.json(newWallets);
      } else {
        res.json(wallets);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      res.status(500).json({ 
        error: "Failed to fetch wallet data", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Add wallet
  app.post("/api/wallets", async (req, res) => {
    try {
      const wallet = await storage.createWallet(req.body);
      res.status(201).json(wallet);
    } catch (error) {
      console.error("Error creating wallet:", error);
      res.status(500).json({
        error: "Failed to create wallet",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update wallet
  app.put("/api/wallets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const wallet = await storage.updateWallet(Number(id), req.body);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      res.json(wallet);
    } catch (error) {
      console.error("Error updating wallet:", error);
      res.status(500).json({
        error: "Failed to update wallet",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Transfer tokens
  app.post("/api/transfer", async (req, res) => {
    try {
      const { fromWalletId, toAddress, amount, currency } = req.body;

      // Get source wallet
      const sourceWallet = await storage.getWalletById(fromWalletId);
      if (!sourceWallet) {
        return res.status(404).json({ error: "Source wallet not found" });
      }

      // Validate BTC address format for BTC withdrawals
      if (currency.toLowerCase() === 'btc' && !toAddress.match(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/)) {
        return res.status(400).json({ error: "Invalid BTC address format" });
      }

      // Validate balance
      if (!sourceWallet.balance?.[currency] || sourceWallet.balance[currency] < amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Update source wallet balance
      const updatedBalance = {
        ...sourceWallet.balance,
        [currency]: sourceWallet.balance[currency] - amount
      };

      // Generate transaction ID
      const transactionId = `tx-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

      await storage.updateWallet(fromWalletId, {
        ...sourceWallet,
        balance: updatedBalance
      });

      // Log the transaction with detailed BTC info
      const txDetails = {
        from: sourceWallet.address,
        to: toAddress,
        amount,
        currency,
        timestamp: new Date().toISOString(),
        status: 'pending_broadcast',
        networkType: currency.toLowerCase() === 'btc' ? 'bitcoin_mainnet' : 'other',
        balanceBefore: sourceWallet.balance[currency],
        balanceAfter: updatedBalance[currency],
        transactionId
      };
      
      console.log('Transaction Details:', txDetails);
      
      // Store transaction details for tracking
      await storage.storeTransaction(txDetails);

      // Return detailed transaction info
      res.json({ 
        success: true,
        transaction: {
          id: transactionId,
          from: sourceWallet.address,
          to: toAddress,
          amount,
          currency,
          timestamp: new Date().toISOString(),
          status: 'completed',
          balanceChange: `-${amount} ${currency}`
        },
        transactionId,
        details: {
          from: sourceWallet.address,
          to: toAddress,
          amount: amount,
          currency: currency
        }
      });
    } catch (error) {
      console.error("Error processing transfer:", error);
      res.status(500).json({
        error: "Failed to process transfer",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Delete wallet
  app.delete("/api/wallets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteWallet(Number(id));
      if (!deleted) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting wallet:", error);
      res.status(500).json({
        error: "Failed to delete wallet",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // API route to fetch notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await storage.getNotifications();

      // If no notifications exist in the database yet, seed with sample data
      if (notifications.length === 0) {
        const sampleNotifications = [
          {
            userId: 1, // Default user ID
            type: "info",
            title: "Price Alert",
            message: "GST is down 5% in the last 24 hours",
            time: "10 minutes ago",
            isRead: false
          },
          {
            userId: 1, // Default user ID
            type: "success",
            title: "Transaction Complete",
            message: "Your purchase of 25 SAND was successful",
            time: "1 hour ago",
            isRead: false
          },
          {
            userId: 1, // Default user ID
            type: "warning",
            title: "Market Alert",
            message: "Bitcoin volatility has increased by 12%",
            time: "5 hours ago",
            isRead: false
          },
          {
            userId: 1, // Default user ID
            type: "error",
            title: "Connection Error",
            message: "Failed to sync with STEPN wallet",
            time: "2 hours ago",
            isRead: false
          }
        ];

        // Create a default user if it doesn't exist
        let user = await storage.getUserByUsername("demo");
        if (!user) {
          user = await storage.createUser({
            username: "demo",
            password: "password" // In a real app, this would be hashed
          });
        }

        // Insert the sample notifications
        for (const notification of sampleNotifications) {
          await storage.createNotification({
            ...notification,
            userId: user.id
          });
        }

        // Fetch the notifications again to get the inserted ones
        const newNotifications = await storage.getNotifications();
        res.json(newNotifications);
      } else {
        res.json(notifications);
      }
    } catch (error) {
      console.error("Error fetching notification data:", error);
      res.status(500).json({ 
        error: "Failed to fetch notification data", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}