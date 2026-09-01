-- AlterTable
ALTER TABLE `participants` 
    ADD COLUMN `birth_date_encrypted` TEXT NULL,
    ADD COLUMN `address_encrypted` TEXT NULL,
    ADD COLUMN `education_level` VARCHAR(191) NULL,
    ADD COLUMN `education_room` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `participants_education_level_idx` ON `participants`(`education_level`);
