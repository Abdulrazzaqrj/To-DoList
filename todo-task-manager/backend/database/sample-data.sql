-- Optional demo data (dates are relative to today so some tasks are overdue).
USE todo_task_manager;
INSERT INTO tasks (title, description, priority, status, stage, created_by, assigned_date, due_date, created_at, updated_at) VALUES
('Prepare sprint report',      'Summarise velocity and blockers.',        'HIGH',   'IN_PROGRESS','ACCEPTED','Maia',           CURDATE(), DATE_SUB(CURDATE(), INTERVAL 5 DAY),  NOW(6), NOW(6)),
('Review pull requests',       'Review the open backend PRs.',            'MEDIUM', 'PENDING',    'ASSIGNED','Maia Burjanadze',CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 DAY),  NOW(6), NOW(6)),
('Update API documentation',   'Sync Swagger descriptions with code.',    'LOW',    'COMPLETED',  'REVIEW',  'Maia',           DATE_SUB(CURDATE(), INTERVAL 9 DAY), DATE_SUB(CURDATE(), INTERVAL 1 DAY), NOW(6), NOW(6)),
('Study for database exam',    'Normalisation, indexes and joins.',       'HIGH',   'PENDING',    'ASSIGNED','Me',             CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY),  NOW(6), NOW(6)),
('Fix login page bug',         'Validation message overlaps the button.', 'MEDIUM', 'IN_PROGRESS','ACCEPTED','Maia',           CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 DAY),  NOW(6), NOW(6)),
('Design onboarding email',    NULL,                                      'LOW',    'PENDING',    'ASSIGNED','Me',             CURDATE(), DATE_ADD(CURDATE(), INTERVAL 10 DAY), NOW(6), NOW(6));
