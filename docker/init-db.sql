-- Ferme du Vardier - Database initialization script
-- This script runs automatically when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: Tables are created by Prisma migrations
-- This file is for any initial setup that needs to happen before Prisma

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE fermeduvardier TO fermeduvardier;
