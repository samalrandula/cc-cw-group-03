-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS salary;

-- Create salaries table
CREATE TABLE IF NOT EXISTS salary.salaries (
    id BIGSERIAL PRIMARY KEY,
    country VARCHAR(100) NOT NULL,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    salary NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) NOT NULL,
    anonymize BOOLEAN NOT NULL DEFAULT false,
    submitted_at TIMESTAMP NOT NULL,
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_country_status ON salary.salaries(country, status);
CREATE INDEX idx_role_status ON salary.salaries(role, status);
CREATE INDEX idx_company_status ON salary.salaries(company, status);
CREATE INDEX idx_status ON salary.salaries(status);