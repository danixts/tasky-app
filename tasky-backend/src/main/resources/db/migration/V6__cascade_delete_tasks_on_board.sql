ALTER TABLE tasks
    DROP CONSTRAINT IF EXISTS tasks_board_id_fkey,
    ADD CONSTRAINT tasks_board_id_fkey
        FOREIGN KEY (board_id) REFERENCES boards(board_id) ON DELETE CASCADE;

ALTER TABLE tasks
    DROP CONSTRAINT IF EXISTS tasks_status_id_fkey,
    ADD CONSTRAINT tasks_status_id_fkey
        FOREIGN KEY (status_id) REFERENCES board_statuses(status_id) ON DELETE CASCADE;
