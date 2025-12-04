-- Create silver_prices table for storing historical price data
CREATE TABLE IF NOT EXISTS silver_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    price_usd DECIMAL(15, 6) NOT NULL,
    price_irt DECIMAL(15, 2) NOT NULL,
    change_24h DECIMAL(15, 2) DEFAULT 0,
    change_percent_24h DECIMAL(8, 4) DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for time-based queries
CREATE INDEX idx_silver_prices_timestamp ON silver_prices(timestamp DESC);

-- Note: If using TimescaleDB, uncomment the following line:
-- SELECT create_hypertable('silver_prices', 'timestamp', if_not_exists => TRUE);

-- Create a view for latest price
CREATE OR REPLACE VIEW latest_silver_price AS
SELECT * FROM silver_prices
ORDER BY timestamp DESC
LIMIT 1;
