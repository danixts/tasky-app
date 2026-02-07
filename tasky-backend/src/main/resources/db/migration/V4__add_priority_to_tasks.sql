ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL';
CREATE INDEX idx_tasks_priority ON tasks(priority);
