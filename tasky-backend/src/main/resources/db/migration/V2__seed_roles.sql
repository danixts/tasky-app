-- =============================================
-- V2: Seed initial roles
-- =============================================

INSERT INTO roles (code, description, is_active, user_create, create_date, update_date)
VALUES
    ('ADMIN', 'Administrator role with full access', TRUE, 'system', NOW(), NOW()),
    ('USER', 'Standard user role', TRUE, 'system', NOW(), NOW());
