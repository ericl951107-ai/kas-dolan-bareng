-- Create database
CREATE DATABASE kas_dolan_bareng;

-- Connect to database
\c kas_dolan_bareng;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member', -- admin, bendahara, member
    avatar TEXT,
    total_contribution DECIMAL(15, 2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'unpaid', -- paid, unpaid
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- income, expense
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    method VARCHAR(100), -- qris, transfer, cash
    receipt TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    receipt TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment QR codes table
CREATE TABLE payment_qr_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    qr_string TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- active, used, expired
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs table
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_expenses_created_by ON expenses(created_by);
CREATE INDEX idx_payment_qr_user_id ON payment_qr_codes(user_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (password: admin123)
INSERT INTO users (name, nickname, email, password, role) VALUES
('Administrator', 'Admin', 'admin@kasdolan.com', '$2a$10$8ZJ5qJ5qJ5qJ5qJ5qJ5qJOK5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X', 'admin');

-- Insert sample data for testing
INSERT INTO users (name, nickname, email, password, role, total_contribution) VALUES
('Budi Santoso', 'Budi', 'budi@email.com', '$2a$10$8ZJ5qJ5qJ5qJ5qJ5qJ5qJOK5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X', 'member', 500000),
('Siti Nurhaliza', 'Siti', 'siti@email.com', '$2a$10$8ZJ5qJ5qJ5qJ5qJ5qJ5qJOK5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X', 'member', 350000),
('Ahmad Fauzan', 'Fauzan', 'fauzan@email.com', '$2a$10$8ZJ5qJ5qJ5qJ5qJ5qJ5qJOK5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X', 'bendahara', 600000);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('bank_account_number', '1234567890', 'Nomor rekening untuk pembayaran'),
('bank_name', 'Bank BCA', 'Nama bank'),
('account_holder_name', 'Kas Dolan Bareng', 'Nama pemilik rekening');
