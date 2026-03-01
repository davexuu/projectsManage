-- CreateTable
CREATE TABLE `ProjectReport` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `reportType` ENUM('WEEKLY', 'MONTHLY') NOT NULL,
    `period` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED') NOT NULL DEFAULT 'DRAFT',
    `content` LONGTEXT NOT NULL,
    `sourceSnapshot` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProjectReport_projectId_reportType_idx`(`projectId`, `reportType`),
    UNIQUE INDEX `ProjectReport_projectId_reportType_period_key`(`projectId`, `reportType`, `period`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProjectReport` ADD CONSTRAINT `ProjectReport_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
