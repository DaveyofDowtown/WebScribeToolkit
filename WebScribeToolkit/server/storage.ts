import { users, wallets, notifications, portfolios, cryptoAssets, type User, type InsertUser, type Wallet, type InsertWallet, type Notification, type InsertNotification, type Portfolio, type InsertPortfolio, type CryptoAsset, type InsertCryptoAsset } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Wallet methods
  getWallets(): Promise<Wallet[]>;
  getWalletById(id: number): Promise<Wallet | undefined>;
  getWalletsByUserId(userId: number): Promise<Wallet[]>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWallet(id: number, wallet: Partial<InsertWallet>): Promise<Wallet | undefined>;
  deleteWallet(id: number): Promise<boolean>;
  
  // Notification methods
  getNotifications(): Promise<Notification[]>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  
  // CryptoAsset methods
  getCryptoAssets(): Promise<CryptoAsset[]>;
  getCryptoAssetById(id: number): Promise<CryptoAsset | undefined>;
  createCryptoAsset(asset: InsertCryptoAsset): Promise<CryptoAsset>;
  updateCryptoAsset(id: number, asset: Partial<InsertCryptoAsset>): Promise<CryptoAsset | undefined>;
  
  // Portfolio methods
  getPortfolios(): Promise<Portfolio[]>;
  getPortfoliosByUserId(userId: number): Promise<Portfolio[]>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: number, portfolio: Partial<InsertPortfolio>): Promise<Portfolio | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Wallet methods
  async getWallets(): Promise<Wallet[]> {
    return db.select().from(wallets);
  }
  
  async getWalletById(id: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet || undefined;
  }
  
  async getWalletsByUserId(userId: number): Promise<Wallet[]> {
    return db.select().from(wallets).where(eq(wallets.userId, userId));
  }
  
  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const [newWallet] = await db
      .insert(wallets)
      .values(wallet)
      .returning();
    return newWallet;
  }
  
  async updateWallet(id: number, wallet: Partial<InsertWallet>): Promise<Wallet | undefined> {
    const [updatedWallet] = await db
      .update(wallets)
      .set(wallet)
      .where(eq(wallets.id, id))
      .returning();
    return updatedWallet || undefined;
  }
  
  async deleteWallet(id: number): Promise<boolean> {
    const [deletedWallet] = await db
      .delete(wallets)
      .where(eq(wallets.id, id))
      .returning();
    return !!deletedWallet;
  }
  
  // Notification methods
  async getNotifications(): Promise<Notification[]> {
    return db.select().from(notifications);
  }
  
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return db.select().from(notifications).where(eq(notifications.userId, userId));
  }
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }
  
  // CryptoAsset methods
  async getCryptoAssets(): Promise<CryptoAsset[]> {
    return db.select().from(cryptoAssets);
  }
  
  async getCryptoAssetById(id: number): Promise<CryptoAsset | undefined> {
    const [asset] = await db.select().from(cryptoAssets).where(eq(cryptoAssets.id, id));
    return asset || undefined;
  }
  
  async createCryptoAsset(asset: InsertCryptoAsset): Promise<CryptoAsset> {
    const [newAsset] = await db
      .insert(cryptoAssets)
      .values(asset)
      .returning();
    return newAsset;
  }
  
  async updateCryptoAsset(id: number, asset: Partial<InsertCryptoAsset>): Promise<CryptoAsset | undefined> {
    const [updatedAsset] = await db
      .update(cryptoAssets)
      .set(asset)
      .where(eq(cryptoAssets.id, id))
      .returning();
    return updatedAsset || undefined;
  }
  
  // Portfolio methods
  async getPortfolios(): Promise<Portfolio[]> {
    return db.select().from(portfolios);
  }
  
  async getPortfoliosByUserId(userId: number): Promise<Portfolio[]> {
    return db.select().from(portfolios).where(eq(portfolios.userId, userId));
  }
  
  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const [newPortfolio] = await db
      .insert(portfolios)
      .values(portfolio)
      .returning();
    return newPortfolio;
  }
  
  async updatePortfolio(id: number, portfolio: Partial<InsertPortfolio>): Promise<Portfolio | undefined> {
    const [updatedPortfolio] = await db
      .update(portfolios)
      .set(portfolio)
      .where(eq(portfolios.id, id))
      .returning();
    return updatedPortfolio || undefined;
  }
}

export const storage = new DatabaseStorage();
