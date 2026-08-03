-- Add approval tracking fields to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update existing pending transactions if needed
UPDATE transactions 
SET status = 'pending' 
WHERE status IS NULL OR status = '';
