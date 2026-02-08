-- 20260208120000_create_extensions.sql
-- Create extensions present in the project that are relevant to migrations.
-- Only install extensions that require explicit creation in a fresh DB.
-- Note: Some extensions may be provided by the managed Postgres image; if CREATE EXTENSION fails, you can skip or adjust.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
-- Add any other required extensions from your environment. Omit ones that fail in hosted environments.