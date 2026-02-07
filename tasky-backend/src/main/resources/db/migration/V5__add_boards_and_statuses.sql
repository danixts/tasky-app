CREATE TABLE boards (
    board_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(user_id),
    name       VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE board_statuses (
    status_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id   UUID NOT NULL REFERENCES boards(board_id) ON DELETE CASCADE,
    code       VARCHAR(50) NOT NULL,
    label      VARCHAR(255) NOT NULL,
    position   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_boards_user_id ON boards(user_id);
CREATE INDEX idx_board_statuses_board_id ON board_statuses(board_id);

ALTER TABLE tasks ADD COLUMN board_id UUID REFERENCES boards(board_id);
ALTER TABLE tasks ADD COLUMN status_id UUID REFERENCES board_statuses(status_id);
ALTER TABLE tasks ADD COLUMN position INTEGER DEFAULT 0;

INSERT INTO boards (board_id, user_id, name, created_at, updated_at)
SELECT gen_random_uuid(), user_id, 'Mi tablero', NOW(), NOW()
FROM users;

INSERT INTO board_statuses (status_id, board_id, code, label, position)
SELECT gen_random_uuid(), b.board_id, s.code, s.label, s.ord
FROM boards b
CROSS JOIN (
    SELECT 'TODO' AS code, 'To Do' AS label, 0 AS ord
    UNION ALL SELECT 'IN_PROGRESS', 'In Progress', 1
    UNION ALL SELECT 'COMPLETED', 'Complete', 2
) s;

UPDATE tasks t
SET board_id = b.board_id,
    status_id = bs.status_id,
    position = 0
FROM boards b, board_statuses bs
WHERE b.user_id = t.user_id
  AND bs.board_id = b.board_id
  AND bs.code = CASE t.status
    WHEN 'PENDING' THEN 'TODO'
    WHEN 'IN_PROGRESS' THEN 'IN_PROGRESS'
    WHEN 'COMPLETED' THEN 'COMPLETED'
  END;

ALTER TABLE tasks ALTER COLUMN board_id SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN status_id SET NOT NULL;
ALTER TABLE tasks DROP COLUMN status;

CREATE INDEX idx_tasks_board_id ON tasks(board_id);
CREATE INDEX idx_tasks_status_id ON tasks(status_id);
