-- SQLite3 Schema Definition

-- =============================================
-- Category Table
-- Stores different expense/income categories.
-- =============================================
CREATE TABLE category (
    name TEXT PRIMARY KEY NOT NULL UNIQUE -- The unique name of the category (e.g., 'Food', 'Salary')
);

-- =============================================
-- Wallet Table
-- Stores information about different money sources/accounts.
-- =============================================
CREATE TABLE wallet (
    name TEXT PRIMARY KEY NOT NULL UNIQUE, -- The unique name of the wallet (e.g., 'Cash', 'Bank Account')
    init_amount REAL NOT NULL DEFAULT 0,   -- The initial amount of money in the wallet
    currency TEXT NOT NULL,                -- The currency code (e.g., 'VND', 'USD')
    visible_category TEXT,                 -- Optional: Link to a category (purpose unclear from design, nullable)
    FOREIGN KEY (visible_category) REFERENCES category(name) ON DELETE SET NULL ON UPDATE CASCADE
);

-- =============================================
-- Transaction Table
-- Records individual income or expense transactions.
-- =============================================
CREATE TABLE transaction_log ( -- Renamed from 'transaction' as it's an SQL keyword
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique identifier for the transaction
    type TEXT NOT NULL CHECK(type IN ('expense', 'income')), -- Type of transaction: 'expense' or 'income'
    amount REAL NOT NULL,                 -- The amount of the transaction
    currency TEXT NOT NULL,               -- The currency code (e.g., 'VND', 'USD')
    date TEXT NOT NULL,                   -- Date and time of the transaction (ISO8601 format recommended: 'YYYY-MM-DD HH:MM:SS')
    wallet TEXT NOT NULL,                 -- The wallet used for this transaction
    category TEXT NOT NULL,               -- The category this transaction belongs to
    repeat TEXT NOT NULL DEFAULT 'None',  -- Repetition rule (e.g., 'None', 'daily', 'weekly', 'custom_days_json')
    note TEXT NULL,                       -- Optional note about the transaction
    picture TEXT NULL,                    -- Optional path or identifier for an associated picture
    FOREIGN KEY (wallet) REFERENCES wallet(name) ON DELETE CASCADE ON UPDATE CASCADE, -- If wallet is deleted, delete transactions
    FOREIGN KEY (category) REFERENCES category(name) ON DELETE RESTRICT ON UPDATE CASCADE -- Prevent deleting category if used in transactions
);

-- Create indexes for faster lookups on foreign keys and date
CREATE INDEX idx_transaction_wallet ON transaction_log(wallet);
CREATE INDEX idx_transaction_category ON transaction_log(category);
CREATE INDEX idx_transaction_date ON transaction_log(date);

-- =============================================
-- Budget Table
-- Defines spending limits for specific categories/wallets over a period.
-- =============================================
CREATE TABLE budget (
    name TEXT PRIMARY KEY NOT NULL UNIQUE, -- Unique name for the budget (e.g., 'Monthly Food Budget')
    amount REAL NOT NULL,                 -- The budget amount
    currency TEXT NOT NULL,               -- The currency code (e.g., 'VND', 'USD')
    wallet TEXT NOT NULL,                 -- The wallet this budget applies to
    repeat TEXT NOT NULL DEFAULT 'None',  -- Repetition rule (e.g., 'None', 'monthly', 'yearly')
    FOREIGN KEY (wallet) REFERENCES wallet(name) ON DELETE CASCADE ON UPDATE CASCADE -- If wallet is deleted, delete budgets
);

-- Create index for faster lookups on wallet
CREATE INDEX idx_budget_wallet ON budget(wallet);

-- =============================================
-- Subscription Table
-- Tracks recurring payments like subscriptions.
-- =============================================
CREATE TABLE subscription (
    name TEXT PRIMARY KEY NOT NULL UNIQUE, -- Unique name of the subscription (e.g., 'Netflix', 'Gym Membership')
    amount REAL NOT NULL,                 -- The subscription amount
    currency TEXT NOT NULL,               -- The currency code (e.g., 'VND', 'USD')
    billing_date TEXT NOT NULL,           -- The next billing date (ISO8601 format recommended)
    repeat TEXT NOT NULL,                 -- Repetition rule (e.g., 'monthly', 'yearly', 'custom_days_json')
    reminder_before INTEGER DEFAULT 0,    -- Reminder time in minutes before the billing date (0 for no reminder)
    category TEXT NOT NULL,               -- The category this subscription belongs to
    FOREIGN KEY (category) REFERENCES category(name) ON DELETE RESTRICT ON UPDATE CASCADE -- Prevent deleting category if used
);

-- Create index for faster lookups on category
CREATE INDEX idx_subscription_category ON subscription(category);

-- =============================================
-- User Table
-- Stores user profile information.
-- =============================================
CREATE TABLE user_profile ( -- Renamed from 'user' as it's often an SQL keyword
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Added an ID for better referencing if needed
    password TEXT NOT NULL,               -- Stores the user's password HASH (store hashes, not plain text!)
    name TEXT NOT NULL,                   -- The user's name
    avatar TEXT NULL                      -- Optional path or identifier for the user's avatar image
);

-- Add a unique constraint on name if usernames should be unique
CREATE UNIQUE INDEX idx_user_name ON user_profile(name);

