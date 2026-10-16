-- To-Do Task Manager schema (MySQL 8.x). Run in SQLyog (Ctrl+Shift+F9 = run all) or the mysql CLI.
CREATE DATABASE IF NOT EXISTS todo_task_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE todo_task_manager;

CREATE TABLE IF NOT EXISTS tasks (
    id            BIGINT        NOT NULL AUTO_INCREMENT,
    title         VARCHAR(150)  NOT NULL,
    description   VARCHAR(2000) NULL,
    priority      VARCHAR(10)   NOT NULL,              -- LOW | MEDIUM | HIGH
    status        VARCHAR(20)   NOT NULL,              -- PENDING | IN_PROGRESS | COMPLETED
    stage         VARCHAR(10)   NOT NULL,              -- ASSIGNED | ACCEPTED | REVIEW (UI tab)
    created_by    VARCHAR(100)  NOT NULL,
    assigned_date DATE          NOT NULL,
    due_date      DATE          NOT NULL,
    created_at    DATETIME(6)   NOT NULL,
    updated_at    DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    KEY idx_tasks_status (status),
    KEY idx_tasks_due_date (due_date),
    KEY idx_tasks_stage (stage),
    CONSTRAINT chk_tasks_priority CHECK (priority IN ('LOW','MEDIUM','HIGH')),
    CONSTRAINT chk_tasks_status   CHECK (status IN ('PENDING','IN_PROGRESS','COMPLETED')),
    CONSTRAINT chk_tasks_stage    CHECK (stage IN ('ASSIGNED','ACCEPTED','REVIEW'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
