CREATE OR REPLACE FUNCTION get_tasks_by_status_for_user(p_user_id UUID)
RETURNS TABLE ("statusCode" VARCHAR(50), "statusLabel" VARCHAR(255), "taskCount" BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT bs.code AS "statusCode", bs.label AS "statusLabel", COUNT(t.task_id) AS "taskCount"
  FROM boards b
  JOIN board_statuses bs ON bs.board_id = b.board_id
  LEFT JOIN tasks t ON t.status_id = bs.status_id AND t.board_id = b.board_id
  WHERE b.user_id = p_user_id
  GROUP BY bs.code, bs.label
  ORDER BY MIN(bs.position);
$$;

CREATE OR REPLACE FUNCTION get_tasks_by_board_and_status_for_user(p_user_id UUID)
RETURNS TABLE (
  "boardId" UUID,
  "boardName" VARCHAR(255),
  "statusCode" VARCHAR(50),
  "statusLabel" VARCHAR(255),
  "taskCount" BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT b.board_id AS "boardId", b.name AS "boardName", bs.code AS "statusCode", bs.label AS "statusLabel", COUNT(t.task_id) AS "taskCount"
  FROM boards b
  JOIN board_statuses bs ON bs.board_id = b.board_id
  LEFT JOIN tasks t ON t.status_id = bs.status_id AND t.board_id = b.board_id
  WHERE b.user_id = p_user_id
  GROUP BY b.board_id, b.name, bs.code, bs.label, bs.position
  ORDER BY b.board_id, bs.position;
$$;
