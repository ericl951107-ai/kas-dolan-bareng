-- Add settings table
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for settings updated_at
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_settings_updated_at();

-- Insert default settings if not exist
INSERT INTO settings (key, value, description) VALUES
('bank_account_number', '1234567890', 'Nomor rekening untuk pembayaran'),
('bank_name', 'Bank BCA', 'Nama bank'),
('account_holder_name', 'Kas Dolan Bareng', 'Nama pemilik rekening')
ON CONFLICT (key) DO NOTHING;
