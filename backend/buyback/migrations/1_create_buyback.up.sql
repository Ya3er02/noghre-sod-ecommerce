-- Create buyback_requests table
CREATE TABLE IF NOT EXISTS buyback_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    product_id UUID,
    serial_number VARCHAR(50) NOT NULL,
    weight DECIMAL(10, 2) NOT NULL,
    purity VARCHAR(3) NOT NULL CHECK (purity IN ('925', '999')),
    condition VARCHAR(20) NOT NULL CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    estimated_price DECIMAL(15, 2) NOT NULL,
    final_price DECIMAL(15, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_buyback_user_id ON buyback_requests(user_id);
CREATE INDEX idx_buyback_serial_number ON buyback_requests(serial_number);
CREATE INDEX idx_buyback_status ON buyback_requests(status);
CREATE INDEX idx_buyback_created_at ON buyback_requests(created_at DESC);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_buyback_updated_at 
    BEFORE UPDATE ON buyback_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
