-- liquibase formatted sql

-- changeset salary_submission_service:demote-flagged-submissions splitStatements:false
-- Normalizes legacy FLAGGED rows (only present if add_flagged migration ran previously).
UPDATE salary_submissions
SET status = 'PENDING'::salary_status_enum
WHERE status::text = 'FLAGGED';
