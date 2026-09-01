-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'STAFF', 'VIEWER') NOT NULL DEFAULT 'STAFF',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `last_login` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_active_idx`(`active`),
    INDEX `users_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `screening_forms` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('DRAFT', 'ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `screening_forms_code_key`(`code`),
    INDEX `screening_forms_status_idx`(`status`),
    INDEX `screening_forms_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `screening_questions` (
    `id` VARCHAR(191) NOT NULL,
    `form_id` VARCHAR(191) NOT NULL,
    `question_order` INTEGER NOT NULL,
    `question_text` TEXT NOT NULL,
    `question_type` ENUM('radio', 'checkbox', 'number', 'text', 'scale') NOT NULL DEFAULT 'radio',
    `required` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `screening_questions_form_id_idx`(`form_id`),
    INDEX `screening_questions_question_order_idx`(`question_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `screening_options` (
    `id` VARCHAR(191) NOT NULL,
    `question_id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL DEFAULT 0,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `screening_options_question_id_idx`(`question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `risk_rules` (
    `id` VARCHAR(191) NOT NULL,
    `form_id` VARCHAR(191) NOT NULL,
    `min_score` INTEGER NOT NULL,
    `max_score` INTEGER NOT NULL,
    `risk_level` ENUM('LOW', 'MODERATE', 'HIGH', 'CRITICAL') NOT NULL,
    `recommendation` TEXT NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `risk_rules_form_id_idx`(`form_id`),
    INDEX `risk_rules_risk_level_idx`(`risk_level`),
    INDEX `risk_rules_active_idx`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `screening_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `public_token` VARCHAR(191) NOT NULL,
    `form_id` VARCHAR(191) NOT NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,
    `status` ENUM('STARTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'STARTED',
    `total_score` INTEGER NULL,
    `risk_level` ENUM('LOW', 'MODERATE', 'HIGH', 'CRITICAL') NULL,
    `ip_hash` VARCHAR(191) NULL,
    `user_agent` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `screening_sessions_public_token_key`(`public_token`),
    INDEX `screening_sessions_public_token_idx`(`public_token`),
    INDEX `screening_sessions_form_id_idx`(`form_id`),
    INDEX `screening_sessions_status_idx`(`status`),
    INDEX `screening_sessions_risk_level_idx`(`risk_level`),
    INDEX `screening_sessions_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `screening_answers` (
    `id` VARCHAR(191) NOT NULL,
    `session_id` VARCHAR(191) NOT NULL,
    `question_id` VARCHAR(191) NOT NULL,
    `option_id` VARCHAR(191) NULL,
    `answer_value` TEXT NULL,
    `score` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `screening_answers_session_id_idx`(`session_id`),
    INDEX `screening_answers_question_id_idx`(`question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `participants` (
    `id` VARCHAR(191) NOT NULL,
    `screening_session_id` VARCHAR(191) NOT NULL,
    `citizen_id_encrypted` TEXT NULL,
    `first_name_encrypted` TEXT NULL,
    `last_name_encrypted` TEXT NULL,
    `phone_encrypted` TEXT NULL,
    `age` INTEGER NULL,
    `gender` VARCHAR(191) NULL,
    `district` VARCHAR(191) NULL,
    `consent` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `participants_screening_session_id_key`(`screening_session_id`),
    INDEX `participants_screening_session_id_idx`(`screening_session_id`),
    INDEX `participants_age_idx`(`age`),
    INDEX `participants_gender_idx`(`gender`),
    INDEX `participants_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alerts` (
    `id` VARCHAR(191) NOT NULL,
    `screening_session_id` VARCHAR(191) NOT NULL,
    `severity` ENUM('LOW', 'MODERATE', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'HIGH',
    `status` ENUM('NEW', 'ACKNOWLEDGED', 'CLOSED') NOT NULL DEFAULT 'NEW',
    `acknowledged_at` DATETIME(3) NULL,
    `acknowledged_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `alerts_screening_session_id_key`(`screening_session_id`),
    INDEX `alerts_severity_idx`(`severity`),
    INDEX `alerts_status_idx`(`status`),
    INDEX `alerts_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `follow_up_cases` (
    `id` VARCHAR(191) NOT NULL,
    `screening_session_id` VARCHAR(191) NOT NULL,
    `assigned_to` VARCHAR(191) NULL,
    `status` ENUM('NEW', 'CONTACTED', 'FOLLOWING', 'REFERRED', 'CLOSED') NOT NULL DEFAULT 'NEW',
    `priority` ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    `next_follow_up_date` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `follow_up_cases_screening_session_id_key`(`screening_session_id`),
    INDEX `follow_up_cases_status_idx`(`status`),
    INDEX `follow_up_cases_priority_idx`(`priority`),
    INDEX `follow_up_cases_assigned_to_idx`(`assigned_to`),
    INDEX `follow_up_cases_next_follow_up_date_idx`(`next_follow_up_date`),
    INDEX `follow_up_cases_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `follow_up_notes` (
    `id` VARCHAR(191) NOT NULL,
    `case_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `note` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `follow_up_notes_case_id_idx`(`case_id`),
    INDEX `follow_up_notes_user_id_idx`(`user_id`),
    INDEX `follow_up_notes_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NULL,
    `metadata` TEXT NULL,
    `ip_hash` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_user_id_idx`(`user_id`),
    INDEX `audit_logs_action_idx`(`action`),
    INDEX `audit_logs_entity_idx`(`entity`),
    INDEX `audit_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_settings` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `system_settings_key_key`(`key`),
    INDEX `system_settings_key_idx`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `screening_questions` ADD CONSTRAINT `screening_questions_form_id_fkey` FOREIGN KEY (`form_id`) REFERENCES `screening_forms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `screening_options` ADD CONSTRAINT `screening_options_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `screening_questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_rules` ADD CONSTRAINT `risk_rules_form_id_fkey` FOREIGN KEY (`form_id`) REFERENCES `screening_forms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `screening_sessions` ADD CONSTRAINT `screening_sessions_form_id_fkey` FOREIGN KEY (`form_id`) REFERENCES `screening_forms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `screening_answers` ADD CONSTRAINT `screening_answers_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `screening_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `screening_answers` ADD CONSTRAINT `screening_answers_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `screening_questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `screening_answers` ADD CONSTRAINT `screening_answers_option_id_fkey` FOREIGN KEY (`option_id`) REFERENCES `screening_options`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `participants` ADD CONSTRAINT `participants_screening_session_id_fkey` FOREIGN KEY (`screening_session_id`) REFERENCES `screening_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_screening_session_id_fkey` FOREIGN KEY (`screening_session_id`) REFERENCES `screening_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow_up_cases` ADD CONSTRAINT `follow_up_cases_screening_session_id_fkey` FOREIGN KEY (`screening_session_id`) REFERENCES `screening_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow_up_cases` ADD CONSTRAINT `follow_up_cases_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow_up_notes` ADD CONSTRAINT `follow_up_notes_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `follow_up_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow_up_notes` ADD CONSTRAINT `follow_up_notes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

