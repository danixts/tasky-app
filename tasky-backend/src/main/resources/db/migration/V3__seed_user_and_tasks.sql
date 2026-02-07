-- =============================================
-- V3: Seed default user and tasks
-- =============================================

-- Create default user (password: 1234)
INSERT INTO users (user_id, super_user, username, password, email, state_user, role_id, is_active, user_create, create_date, update_date)
VALUES (
    gen_random_uuid(),
    FALSE,
    'daniel',
    '$2y$10$2e4WirdH4FnKyVuc9dAED.LJRKJyI4GZ7o24qmSi86ia9cGUMkla.',
    'daniel@gmail.com',
    TRUE,
    (SELECT role_id FROM roles WHERE code = 'USER'),
    TRUE,
    'system',
    NOW(),
    NOW()
);

-- Create default tasks for the user
INSERT INTO tasks (task_id, title, description, status, user_id, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'Configurar entorno de desarrollo', 'Instalar dependencias y configurar el proyecto local', 'COMPLETED',
     (SELECT user_id FROM users WHERE email = 'daniel@gmail.com'), NOW(), NOW()),

    (gen_random_uuid(), 'Revisar documentacion del proyecto', 'Leer README y entender la arquitectura del backend', 'IN_PROGRESS',
     (SELECT user_id FROM users WHERE email = 'daniel@gmail.com'), NOW(), NOW()),

    (gen_random_uuid(), 'Implementar nuevas funcionalidades', 'Desarrollar los endpoints pendientes del modulo de tareas', 'PENDING',
     (SELECT user_id FROM users WHERE email = 'daniel@gmail.com'), NOW(), NOW());
