-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'PM', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `passwordHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` VARCHAR(191) NOT NULL,
    `projectName` VARCHAR(191) NOT NULL,
    `projectType` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `leadDepartment` VARCHAR(191) NOT NULL,
    `projectOwner` VARCHAR(191) NOT NULL,
    `participants` VARCHAR(191) NOT NULL,
    `background` VARCHAR(191) NULL,
    `goal` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `expectedOutcome` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WbsTask` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `level1Stage` ENUM('启动', '规划', '执行', '验收') NOT NULL,
    `level2WorkPackage` VARCHAR(191) NOT NULL,
    `taskName` VARCHAR(191) NOT NULL,
    `taskDetail` VARCHAR(191) NOT NULL,
    `deliverable` VARCHAR(191) NOT NULL,
    `taskOwner` VARCHAR(191) NOT NULL,
    `plannedStartDate` DATETIME(3) NOT NULL,
    `plannedEndDate` DATETIME(3) NOT NULL,
    `currentStatus` ENUM('未开始', '进行中', '已完成', '延期') NOT NULL,
    `isCritical` ENUM('是', '否') NOT NULL,
    `riskHint` VARCHAR(191) NULL,
    `linkedMasterTask` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WbsTask_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Milestone` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `milestoneCode` VARCHAR(191) NOT NULL,
    `milestoneName` VARCHAR(191) NOT NULL,
    `level1Stage` ENUM('启动', '规划', '执行', '验收') NOT NULL,
    `relatedWorkPackage` VARCHAR(191) NOT NULL,
    `keyOutcome` VARCHAR(191) NOT NULL,
    `doneCriteria` VARCHAR(191) NOT NULL,
    `plannedFinishDate` DATETIME(3) NOT NULL,
    `actualFinishDate` DATETIME(3) NULL,
    `owner` VARCHAR(191) NOT NULL,
    `currentStatus` ENUM('未开始', '进行中', '已完成', '延期') NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Milestone_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProgressRecord` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `statPeriod` DATETIME(3) NOT NULL,
    `currentStage` ENUM('启动', '规划', '执行', '验收') NOT NULL,
    `milestoneCode` VARCHAR(191) NOT NULL,
    `finishedWork` VARCHAR(191) NOT NULL,
    `overallProgressPct` DOUBLE NOT NULL,
    `issuesAndRisks` VARCHAR(191) NOT NULL,
    `needsCoordination` VARCHAR(191) NOT NULL,
    `nextPlan` VARCHAR(191) NOT NULL,
    `recorder` VARCHAR(191) NOT NULL,
    `recordDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProgressRecord_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StatusAssessment` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `evalPeriod` DATETIME(3) NOT NULL,
    `currentStage` ENUM('启动', '规划', '执行', '验收') NOT NULL,
    `overallStatus` ENUM('绿', '黄', '红') NOT NULL,
    `scheduleStatus` ENUM('绿', '黄', '红') NOT NULL,
    `qualityStatus` ENUM('绿', '黄', '红') NOT NULL,
    `riskStatus` ENUM('绿', '黄', '红') NOT NULL,
    `assessmentBasis` VARCHAR(191) NOT NULL,
    `watchItems` VARCHAR(191) NOT NULL,
    `assessor` VARCHAR(191) NOT NULL,
    `assessmentDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StatusAssessment_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RiskItem` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `riskCode` VARCHAR(191) NOT NULL,
    `riskType` VARCHAR(191) NOT NULL,
    `stage` ENUM('启动', '规划', '执行', '验收') NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `impactLevel` VARCHAR(191) NOT NULL,
    `mitigationPlan` VARCHAR(191) NOT NULL,
    `owner` VARCHAR(191) NOT NULL,
    `plannedResolveDate` DATETIME(3) NOT NULL,
    `currentStatus` ENUM('未开始', '进行中', '已完成', '延期') NOT NULL,
    `actualResolveDate` DATETIME(3) NULL,
    `escalateToManagement` ENUM('是', '否') NOT NULL,
    `linkedMilestoneOrTask` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RiskItem_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChangeRequest` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `changeCode` VARCHAR(191) NOT NULL,
    `changeType` VARCHAR(191) NOT NULL,
    `requestDate` DATETIME(3) NOT NULL,
    `requester` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `beforeContent` VARCHAR(191) NOT NULL,
    `afterContent` VARCHAR(191) NOT NULL,
    `impactAnalysis` VARCHAR(191) NOT NULL,
    `impactsMilestoneOrWbs` ENUM('是', '否') NOT NULL,
    `evaluationConclusion` VARCHAR(191) NOT NULL,
    `approver` VARCHAR(191) NULL,
    `approvalDate` DATETIME(3) NULL,
    `currentStatus` ENUM('未开始', '进行中', '已完成', '延期') NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ChangeRequest_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WbsTask` ADD CONSTRAINT `WbsTask_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Milestone` ADD CONSTRAINT `Milestone_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgressRecord` ADD CONSTRAINT `ProgressRecord_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StatusAssessment` ADD CONSTRAINT `StatusAssessment_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RiskItem` ADD CONSTRAINT `RiskItem_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChangeRequest` ADD CONSTRAINT `ChangeRequest_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
