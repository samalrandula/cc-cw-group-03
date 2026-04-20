-- liquibase formatted sql

-- changeset salary_submission_service:add-flagged-salary-status splitStatements:false
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'salary_status_enum'
          AND e.enumlabel = 'FLAGGED'
    ) THEN
        ALTER TYPE salary_status_enum ADD VALUE 'FLAGGED';
    END IF;
END;
$$;
