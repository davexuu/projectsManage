-- CreateTable
CREATE TABLE `sys_area` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NULL,
    `parentId` VARCHAR(191) NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('ENABLED', 'DISABLED') NOT NULL DEFAULT 'ENABLED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sys_area_code_key`(`code`),
    INDEX `sys_area_parentId_idx`(`parentId`),
    INDEX `sys_area_level_idx`(`level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_config` (
    `id` VARCHAR(191) NOT NULL,
    `configKey` VARCHAR(191) NOT NULL,
    `configValue` VARCHAR(191) NOT NULL,
    `valueType` VARCHAR(191) NOT NULL DEFAULT 'string',
    `remark` VARCHAR(191) NULL,
    `status` ENUM('ENABLED', 'DISABLED') NOT NULL DEFAULT 'ENABLED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sys_config_configKey_key`(`configKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_datarule` (
    `id` VARCHAR(191) NOT NULL,
    `ruleCode` VARCHAR(191) NOT NULL,
    `ruleName` VARCHAR(191) NOT NULL,
    `target` VARCHAR(191) NOT NULL,
    `conditionJson` JSON NULL,
    `status` ENUM('ENABLED', 'DISABLED') NOT NULL DEFAULT 'ENABLED',
    `remark` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sys_datarule_ruleCode_key`(`ruleCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_dict_type` (
    `id` VARCHAR(191) NOT NULL,
    `dictCode` VARCHAR(191) NOT NULL,
    `dictName` VARCHAR(191) NOT NULL,
    `status` ENUM('ENABLED', 'DISABLED') NOT NULL DEFAULT 'ENABLED',
    `remark` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sys_dict_type_dictCode_key`(`dictCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_dict_value` (
    `id` VARCHAR(191) NOT NULL,
    `dictTypeId` VARCHAR(191) NOT NULL,
    `dictLabel` VARCHAR(191) NOT NULL,
    `dictValue` VARCHAR(191) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('ENABLED', 'DISABLED') NOT NULL DEFAULT 'ENABLED',
    `remark` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `sys_dict_value_dictTypeId_idx`(`dictTypeId`),
    UNIQUE INDEX `sys_dict_value_dictTypeId_dictValue_key`(`dictTypeId`, `dictValue`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_folder` (
    `id` VARCHAR(191) NOT NULL,
    `folderName` VARCHAR(191) NOT NULL,
    `folderPath` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('ENABLED', 'DISABLED') NOT NULL DEFAULT 'ENABLED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `sys_folder_parentId_idx`(`parentId`),
    UNIQUE INDEX `sys_folder_parentId_folderName_key`(`parentId`, `folderName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_login_count` (
    `id` VARCHAR(191) NOT NULL,
    `statDate` DATE NOT NULL,
    `loginCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sys_login_count_statDate_key`(`statDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_menu` (
    `id` VARCHAR(191) NOT NULL,
    `menuCode` VARCHAR(191) NULL,
    `menuName` VARCHAR(191) NOT NULL,
    `menuType` ENUM('DIRECTORY', 'MENU', 'BUTTON') NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `path` VARCHAR(191) NULL,
    `component` VARCHAR(191) NULL,
    `permission` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `keepAlive` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('ENABLED', 'DISABLED') NOT NULL DEFAULT 'ENABLED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sys_menu_menuCode_key`(`menuCode`),
    INDEX `sys_menu_parentId_idx`(`parentId`),
    INDEX `sys_menu_menuType_idx`(`menuType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_office` (
    `id` VARCHAR(191) NOT NULL,
    `officeCode` VARCHAR(191) NOT NULL,
    `officeName` VARCHAR(191) NOT NULL,
    `officeType` VARCHAR(191) NOT NULL DEFAULT 'DEPARTMENT',
    `parentId` VARCHAR(191) NULL,
    `leader` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('ENABLED', 'DISABLED') NOT NULL DEFAULT 'ENABLED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sys_office_officeCode_key`(`officeCode`),
    INDEX `sys_office_parentId_idx`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_post` (
    `id` VARCHAR(191) NOT NULL,
    `postCode` VARCHAR(191) NOT NULL,
    `postName` VARCHAR(191) NOT NULL,
    `officeId` VARCHAR(191) NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('ENABLED', 'DISABLED') NOT NULL DEFAULT 'ENABLED',
    `remark` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sys_post_postCode_key`(`postCode`),
    INDEX `sys_post_officeId_idx`(`officeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_role` (
    `id` VARCHAR(191) NOT NULL,
    `roleCode` VARCHAR(191) NOT NULL,
    `roleName` VARCHAR(191) NOT NULL,
    `dataScope` ENUM('ALL', 'ORG_AND_CHILD', 'ORG', 'SELF', 'CUSTOM') NOT NULL DEFAULT 'SELF',
    `sort` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('ENABLED', 'DISABLED') NOT NULL DEFAULT 'ENABLED',
    `remark` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sys_role_roleCode_key`(`roleCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_role_datarule` (
    `id` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `dataRuleId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sys_role_datarule_roleId_dataRuleId_key`(`roleId`, `dataRuleId`),
    INDEX `sys_role_datarule_dataRuleId_idx`(`dataRuleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_role_menu` (
    `id` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `menuId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sys_role_menu_roleId_menuId_key`(`roleId`, `menuId`),
    INDEX `sys_role_menu_menuId_idx`(`menuId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_schedule` (
    `id` VARCHAR(191) NOT NULL,
    `scheduleName` VARCHAR(191) NOT NULL,
    `cronExpression` VARCHAR(191) NOT NULL,
    `invokeTarget` VARCHAR(191) NOT NULL,
    `payload` JSON NULL,
    `status` ENUM('ENABLED', 'DISABLED') NOT NULL DEFAULT 'ENABLED',
    `lastRunAt` DATETIME(3) NULL,
    `nextRunAt` DATETIME(3) NULL,
    `failCount` INTEGER NOT NULL DEFAULT 0,
    `remark` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_user` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `officeId` VARCHAR(191) NULL,
    `mobile` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `status` ENUM('ENABLED', 'DISABLED') NOT NULL DEFAULT 'ENABLED',
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sys_user_username_key`(`username`),
    INDEX `sys_user_officeId_idx`(`officeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_user_post` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sys_user_post_userId_postId_key`(`userId`, `postId`),
    INDEX `sys_user_post_postId_idx`(`postId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_user_role` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sys_user_role_userId_roleId_key`(`userId`, `roleId`),
    INDEX `sys_user_role_roleId_idx`(`roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_log` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `module` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `requestUrl` VARCHAR(191) NULL,
    `requestMethod` VARCHAR(191) NULL,
    `requestIp` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `requestBody` JSON NULL,
    `responseBody` JSON NULL,
    `isSuccess` BOOLEAN NOT NULL DEFAULT true,
    `errorMessage` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sys_log_userId_idx`(`userId`),
    INDEX `sys_log_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_file` (
    `id` VARCHAR(191) NOT NULL,
    `folderId` VARCHAR(191) NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileKey` VARCHAR(191) NOT NULL,
    `fileExt` VARCHAR(191) NULL,
    `fileSize` BIGINT NOT NULL,
    `mimeType` VARCHAR(191) NULL,
    `uploaderId` VARCHAR(191) NULL,
    `status` ENUM('ENABLED', 'DISABLED') NOT NULL DEFAULT 'ENABLED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sys_file_fileKey_key`(`fileKey`),
    INDEX `sys_file_folderId_idx`(`folderId`),
    INDEX `sys_file_uploaderId_idx`(`uploaderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sys_area` ADD CONSTRAINT `sys_area_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `sys_area`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_dict_value` ADD CONSTRAINT `sys_dict_value_dictTypeId_fkey` FOREIGN KEY (`dictTypeId`) REFERENCES `sys_dict_type`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_folder` ADD CONSTRAINT `sys_folder_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `sys_folder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_menu` ADD CONSTRAINT `sys_menu_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `sys_menu`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_office` ADD CONSTRAINT `sys_office_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `sys_office`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_post` ADD CONSTRAINT `sys_post_officeId_fkey` FOREIGN KEY (`officeId`) REFERENCES `sys_office`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_role_datarule` ADD CONSTRAINT `sys_role_datarule_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `sys_role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_role_datarule` ADD CONSTRAINT `sys_role_datarule_dataRuleId_fkey` FOREIGN KEY (`dataRuleId`) REFERENCES `sys_datarule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_role_menu` ADD CONSTRAINT `sys_role_menu_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `sys_role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_role_menu` ADD CONSTRAINT `sys_role_menu_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `sys_menu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_user` ADD CONSTRAINT `sys_user_officeId_fkey` FOREIGN KEY (`officeId`) REFERENCES `sys_office`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_user_post` ADD CONSTRAINT `sys_user_post_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `sys_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_user_post` ADD CONSTRAINT `sys_user_post_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `sys_post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_user_role` ADD CONSTRAINT `sys_user_role_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `sys_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_user_role` ADD CONSTRAINT `sys_user_role_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `sys_role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_log` ADD CONSTRAINT `sys_log_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `sys_user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_file` ADD CONSTRAINT `sys_file_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `sys_folder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_file` ADD CONSTRAINT `sys_file_uploaderId_fkey` FOREIGN KEY (`uploaderId`) REFERENCES `sys_user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
