-- =============================================
-- V1: Create initial schema
-- =============================================

-- Table: roles
CREATE TABLE roles (
    role_id     SERIAL PRIMARY KEY,
    code        VARCHAR(50),
    description VARCHAR(255),
    is_active    BOOLEAN DEFAULT TRUE,
    user_update  VARCHAR(255),
    user_create  VARCHAR(255),
    create_date  TIMESTAMPTZ DEFAULT NOW(),
    update_date  TIMESTAMPTZ DEFAULT NOW()
);

-- Table: users
CREATE TABLE users (
    user_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    super_user  BOOLEAN DEFAULT FALSE,
    username    VARCHAR(255) UNIQUE,
    password    VARCHAR(255),
    email       VARCHAR(255) UNIQUE,
    state_user  BOOLEAN DEFAULT TRUE,
    role_id     INTEGER NOT NULL REFERENCES roles(role_id),
    is_active    BOOLEAN DEFAULT TRUE,
    user_update  VARCHAR(255),
    user_create  VARCHAR(255),
    create_date  TIMESTAMPTZ DEFAULT NOW(),
    update_date  TIMESTAMPTZ DEFAULT NOW()
);

-- Table: tokens
CREATE TABLE tokens (
    id          BIGSERIAL PRIMARY KEY,
    token       VARCHAR(512),
    token_type  VARCHAR(50),
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    user_user_id UUID REFERENCES users(user_id)
);

-- Table: tasks
CREATE TABLE tasks (
    task_id     UUID PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    status      VARCHAR(50) NOT NULL,
    user_id     UUID NOT NULL REFERENCES users(user_id),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tokens_user_id ON tokens(user_user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
