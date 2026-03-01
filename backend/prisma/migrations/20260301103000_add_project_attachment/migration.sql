-- CreateTable
CREATE TABLE `ProjectAttachment` (
  `id` VARCHAR(191) NOT NULL,
  `projectId` VARCHAR(191) NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `fileName` VARCHAR(191) NOT NULL,
  `objectKey` VARCHAR(191) NOT NULL,
  `mimeType` VARCHAR(191) NULL,
  `fileSize` BIGINT NOT NULL,
  `uploaderId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `ProjectAttachment_objectKey_key`(`objectKey`),
  INDEX `ProjectAttachment_projectId_category_idx`(`projectId`, `category`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProjectAttachment` ADD CONSTRAINT `ProjectAttachment_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
