import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Crypto assets table
export const cryptoAssets = pgTable("crypto_assets", {
  id: serial("id").primaryKey(),
  coinId: text("coin_id").notNull().unique(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  currentPrice: real("current_price"),
  priceChangePercentage24h: real("price_change_percentage_24h"),
  marketCap: real("market_cap"),
  volume: real("volume"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// User wallets table
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  address: text("address").notNull(),
  status: text("status").default("Active"),
  balance: jsonb("balance"), // Store balance for multiple assets
  createdAt: timestamp("created_at").defaultNow(),
});

// User portfolio table
export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  assetId: integer("asset_id").references(() => cryptoAssets.id),
  balance: real("balance").notNull(),
  walletId: integer("wallet_id").references(() => wallets.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // info, success, warning, error
  title: text("title").notNull(),
  message: text("message").notNull(),
  time: text("time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isRead: boolean("is_read").default(false),
});

// Define relations
export const usersRelations = relations(users, ({ many }: { many: any }) => ({
  wallets: many(wallets),
  portfolios: many(portfolios),
  notifications: many(notifications),
}));

export const walletsRelations = relations(wallets, ({ one, many }: { one: any, many: any }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  portfolios: many(portfolios),
}));

export const cryptoAssetsRelations = relations(cryptoAssets, ({ many }: { many: any }) => ({
  portfolios: many(portfolios),
}));

export const portfoliosRelations = relations(portfolios, ({ one }: { one: any }) => ({
  user: one(users, {
    fields: [portfolios.userId],
    references: [users.id],
  }),
  asset: one(cryptoAssets, {
    fields: [portfolios.assetId],
    references: [cryptoAssets.id],
  }),
  wallet: one(wallets, {
    fields: [portfolios.walletId],
    references: [wallets.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }: { one: any }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Insert schema definitions
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertCryptoAssetSchema = createInsertSchema(cryptoAssets).omit({
  id: true,
  lastUpdated: true
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  updatedAt: true
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCryptoAsset = z.infer<typeof insertCryptoAssetSchema>;
export type CryptoAsset = typeof cryptoAssets.$inferSelect;

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolios.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
