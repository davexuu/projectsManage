-- AlterTable
ALTER TABLE `WbsTask`
  ADD COLUMN `wbsCode` VARCHAR(191) NULL,
  ADD COLUMN `parentTaskId` VARCHAR(191) NULL,
  ADD COLUMN `predecessorTaskIds` JSON NULL,
  ADD COLUMN `milestoneId` VARCHAR(191) NULL,
  ADD COLUMN `sortOrder` INTEGER NULL;

-- Indexes
CREATE INDEX `WbsTask_projectId_parentTaskId_idx` ON `WbsTask`(`projectId`, `parentTaskId`);
CREATE INDEX `WbsTask_projectId_wbsCode_idx` ON `WbsTask`(`projectId`, `wbsCode`);
CREATE INDEX `WbsTask_milestoneId_idx` ON `WbsTask`(`milestoneId`);
CREATE INDEX `Milestone_projectId_milestoneCode_idx` ON `Milestone`(`projectId`, `milestoneCode`);

-- Foreign keys
ALTER TABLE `WbsTask`
  ADD CONSTRAINT `WbsTask_parentTaskId_fkey`
    FOREIGN KEY (`parentTaskId`) REFERENCES `WbsTask`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `WbsTask_milestoneId_fkey`
    FOREIGN KEY (`milestoneId`) REFERENCES `Milestone`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
