-- Enhance sys_office with legacy-compatible fields
ALTER TABLE `sys_office`
    ADD COLUMN `parentIds` VARCHAR(2000) NULL AFTER `parentId`,
    ADD COLUMN `areaId` VARCHAR(191) NULL AFTER `parentIds`,
    ADD COLUMN `grade` VARCHAR(32) NULL AFTER `officeType`,
    ADD COLUMN `zipCode` VARCHAR(64) NULL AFTER `address`,
    ADD COLUMN `fax` VARCHAR(191) NULL AFTER `phone`,
    ADD COLUMN `useable` CHAR(1) NOT NULL DEFAULT '1' AFTER `status`,
    ADD COLUMN `primaryPerson` VARCHAR(191) NULL AFTER `useable`,
    ADD COLUMN `deputyPerson` VARCHAR(191) NULL AFTER `primaryPerson`,
    ADD COLUMN `delFlag` TINYINT NOT NULL DEFAULT 0 AFTER `deputyPerson`;

CREATE INDEX `sys_office_delFlag_idx` ON `sys_office`(`delFlag`);
CREATE INDEX `sys_office_officeType_idx` ON `sys_office`(`officeType`);
CREATE INDEX `sys_office_useable_idx` ON `sys_office`(`useable`);
CREATE INDEX `sys_office_parentId_delFlag_idx` ON `sys_office`(`parentId`, `delFlag`);

-- Optional uniqueness guard for sibling names under soft-delete mode
CREATE UNIQUE INDEX `sys_office_parentId_officeName_delFlag_key`
ON `sys_office`(`parentId`, `officeName`, `delFlag`);

-- Seed hierarchy roots required by provided data
INSERT INTO `sys_office` (
    `id`, `officeCode`, `officeName`, `officeType`, `grade`, `parentId`, `parentIds`,
    `sort`, `status`, `useable`, `delFlag`, `createdAt`, `updatedAt`
) VALUES
    ('1704304844541562882', 'OFF-1704304844541562882', '信息中心根节点', 'DEPARTMENT', '1', NULL, '0,', 0, 'ENABLED', '1', 0, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
    ('1633709086054821889', 'OFF-1633709086054821889', '信息中心', 'DEPARTMENT', '2', '1704304844541562882', '0,1704304844541562882,', 0, 'ENABLED', '1', 0, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000')
ON DUPLICATE KEY UPDATE
    `officeName` = VALUES(`officeName`),
    `officeType` = VALUES(`officeType`),
    `grade` = VALUES(`grade`),
    `parentId` = VALUES(`parentId`),
    `parentIds` = VALUES(`parentIds`),
    `sort` = VALUES(`sort`),
    `status` = VALUES(`status`),
    `useable` = VALUES(`useable`),
    `delFlag` = VALUES(`delFlag`),
    `updatedAt` = VALUES(`updatedAt`);

-- Seed office data converted from legacy sys_office
INSERT INTO `sys_office` (
    `id`, `officeCode`, `officeName`, `officeType`, `grade`, `parentId`, `parentIds`,
    `sort`, `status`, `useable`, `delFlag`, `createdAt`, `updatedAt`
) VALUES
    ('1712027221975179266', 'OFF-1712027221975179266', '智能气田信息化研究所', 'DEPARTMENT', '3', '1633709086054821889', '0,1704304844541562882,1633709086054821889,', 1, 'ENABLED', '1', 0, '2023-10-11 16:47:52.000', '2024-04-23 16:27:20.000'),
    ('1782687751391461377', 'OFF-1782687751391461377', '信息技术研究所', 'DEPARTMENT', '3', '1633709086054821889', '0,1704304844541562882,1633709086054821889,', 1, 'ENABLED', '1', 0, '2024-04-23 16:27:35.000', '2024-04-23 16:27:35.000'),
    ('1782687843498377217', 'OFF-1782687843498377217', '油气生产信息化研究所', 'DEPARTMENT', '3', '1633709086054821889', '0,1704304844541562882,1633709086054821889,', 1, 'ENABLED', '1', 0, '2024-04-23 16:27:57.000', '2024-04-23 16:27:57.000'),
    ('1782687929246728194', 'OFF-1782687929246728194', '勘探开发信息化研究所', 'DEPARTMENT', '3', '1633709086054821889', '0,1704304844541562882,1633709086054821889,', 1, 'ENABLED', '1', 0, '2024-04-23 16:28:18.000', '2024-04-23 16:28:18.000'),
    ('1782688082129108993', 'OFF-1782688082129108993', '信息规划与数据资源研究所', 'DEPARTMENT', '3', '1633709086054821889', '0,1704304844541562882,1633709086054821889,', 1, 'ENABLED', '1', 0, '2024-04-23 16:28:54.000', '2024-04-23 16:28:59.000'),
    ('1782688191478808577', 'OFF-1782688191478808577', '云网安全研究所', 'DEPARTMENT', '3', '1633709086054821889', '0,1704304844541562882,1633709086054821889,', 1, 'ENABLED', '1', 0, '2024-04-23 16:29:20.000', '2024-04-23 16:29:20.000'),
    ('1782688314636156929', 'OFF-1782688314636156929', '经营管理信息化研究所', 'DEPARTMENT', '3', '1633709086054821889', '0,1704304844541562882,1633709086054821889,', 1, 'ENABLED', '1', 0, '2024-04-23 16:29:50.000', '2024-04-23 16:29:50.000'),
    ('1795626878822809601', 'OFF-1795626878822809601', '信息外协', 'DEPARTMENT', '3', '1633709086054821889', '0,1704304844541562882,1633709086054821889,', 30, 'ENABLED', '1', 0, '2024-05-29 09:23:04.000', '2024-05-29 09:23:04.000'),
    ('1864564601356562434', 'OFF-1864564601356562434', '信息中心领导班子', 'DEPARTMENT', '3', '1633709086054821889', '0,1704304844541562882,1633709086054821889,', 0, 'ENABLED', '1', 0, '2024-12-05 14:56:58.000', '2024-12-05 14:56:58.000')
ON DUPLICATE KEY UPDATE
    `officeName` = VALUES(`officeName`),
    `officeType` = VALUES(`officeType`),
    `grade` = VALUES(`grade`),
    `parentId` = VALUES(`parentId`),
    `parentIds` = VALUES(`parentIds`),
    `sort` = VALUES(`sort`),
    `status` = VALUES(`status`),
    `useable` = VALUES(`useable`),
    `delFlag` = VALUES(`delFlag`),
    `updatedAt` = VALUES(`updatedAt`);
