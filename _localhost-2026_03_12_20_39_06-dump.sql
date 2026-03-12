-- MySQL dump 10.13  Distrib 9.2.0, for macos15.2 (arm64)
--
-- Host: 127.0.0.1    Database: pmp_manage
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES ('63df9bef-7ba6-4809-91f1-d8afbad9fec3','31887a59bfb4d3d8bcfdccda3adfa0baa29fbfc28ccac3f0117bfb660387c5b7','2026-02-09 06:09:34.798','20260209121000_stage5_office_enhance',NULL,NULL,'2026-02-09 06:09:34.769',1),('b3bd9350-9df1-46c4-85b1-28ed293b37a3','c44e1dc707ac712b5318fde4587e013c348867abd8715f8f816fcd97adffc9b9','2026-02-09 06:09:34.769','20260208202000_stage5_system_base',NULL,NULL,'2026-02-09 06:09:34.614',1),('e796b108-d917-45d5-9892-da3b6d3d1bbc','a6486a7a20dbc435147ae83ca81a9f56f2cab01b6ed27370b3662ac2b0902a48','2026-02-09 06:09:34.606','20260208100949_init',NULL,NULL,'2026-02-09 06:09:34.543',1),('f01d9ffd-ea30-4ab7-b59c-3b35fdc9a16b','248b58cda50a3f02994baeb9ddd47bdb691b592e0ddc956a1ac4f8894ee48a69','2026-02-09 06:09:34.614','20260208104134_stage4_project_access',NULL,NULL,'2026-02-09 06:09:34.606',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ChangeRequest`
--

DROP TABLE IF EXISTS `ChangeRequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChangeRequest` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `projectId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `changeCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `changeType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requestDate` datetime(3) NOT NULL,
  `requester` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `beforeContent` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `afterContent` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `impactAnalysis` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `impactsMilestoneOrWbs` enum('是','否') COLLATE utf8mb4_unicode_ci NOT NULL,
  `evaluationConclusion` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approver` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approvalDate` datetime(3) DEFAULT NULL,
  `currentStatus` enum('未开始','进行中','已完成','延期') COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ChangeRequest_projectId_idx` (`projectId`),
  CONSTRAINT `ChangeRequest_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChangeRequest`
--

LOCK TABLES `ChangeRequest` WRITE;
/*!40000 ALTER TABLE `ChangeRequest` DISABLE KEYS */;
INSERT INTO `ChangeRequest` (`id`, `projectId`, `changeCode`, `changeType`, `requestDate`, `requester`, `reason`, `beforeContent`, `afterContent`, `impactAnalysis`, `impactsMilestoneOrWbs`, `evaluationConclusion`, `approver`, `approvalDate`, `currentStatus`, `note`, `createdAt`, `updatedAt`) VALUES ('2ecf2723-25b0-4001-8658-a9c183ddbc21','90b6ab92-690d-442b-b675-e60deb40a10b','C-03','进度变更','2026-02-18 00:00:00.000','系统管理员','需重新排期','原计划A','新计划B','影响进度','否','提交审批',NULL,NULL,'未开始',NULL,'2026-03-01 08:39:18.912','2026-03-01 08:39:18.912'),('517ef41d-c85e-4262-8570-bcf5ad5d0922','4ccf3a07-e37e-471d-b327-5ed6470a7705','C-01','范围变更','2026-02-16 00:00:00.000','系统管理员','范围调整','原范围','新范围','影响里程碑','是','待审批','徐聪','2026-03-12 00:00:00.000','进行中',NULL,'2026-03-01 08:42:30.316','2026-03-12 11:30:37.284'),('608e6af1-eb8e-4621-9928-1e9f3b2088c5','4ccf3a07-e37e-471d-b327-5ed6470a7705','C-03','进度变更','2026-02-18 00:00:00.000','系统管理员','需重新排期','原计划A','新计划B','影响进度','否','提交审批','徐聪','2026-03-12 00:00:00.000','进行中',NULL,'2026-03-01 08:42:30.327','2026-03-12 11:30:28.775'),('71a0b8ed-4550-454f-b5e4-b9ad8ef1338a','90b6ab92-690d-442b-b675-e60deb40a10b','C-01','范围变更','2026-02-16 00:00:00.000','系统管理员','范围调整','原范围','新范围','影响里程碑','是','待审批',NULL,NULL,'未开始',NULL,'2026-03-01 08:39:18.893','2026-03-01 08:39:18.893');
/*!40000 ALTER TABLE `ChangeRequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Milestone`
--

DROP TABLE IF EXISTS `Milestone`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Milestone` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `projectId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `milestoneCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `milestoneName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level1Stage` enum('启动','规划','执行','验收') COLLATE utf8mb4_unicode_ci NOT NULL,
  `relatedWorkPackage` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `keyOutcome` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doneCriteria` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plannedFinishDate` datetime(3) NOT NULL,
  `actualFinishDate` datetime(3) DEFAULT NULL,
  `owner` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `currentStatus` enum('未开始','进行中','已完成','延期') COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Milestone_projectId_idx` (`projectId`),
  KEY `Milestone_projectId_milestoneCode_idx` (`projectId`,`milestoneCode`),
  CONSTRAINT `Milestone_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Milestone`
--

LOCK TABLES `Milestone` WRITE;
/*!40000 ALTER TABLE `Milestone` DISABLE KEYS */;
INSERT INTO `Milestone` (`id`, `projectId`, `milestoneCode`, `milestoneName`, `level1Stage`, `relatedWorkPackage`, `keyOutcome`, `doneCriteria`, `plannedFinishDate`, `actualFinishDate`, `owner`, `currentStatus`, `note`, `createdAt`, `updatedAt`) VALUES ('5922e52a-1f71-4e37-a6ba-201efb016073','90b6ab92-690d-442b-b675-e60deb40a10b','M1','形成整合方案','规划','功能梳理与整合','形成方案','通过评审','2026-03-01 00:00:00.000',NULL,'系统管理员','进行中',NULL,'2026-03-01 08:39:18.789','2026-03-01 08:39:18.789'),('b02e4a7b-5638-4c9a-ab74-f572d8560498','4ccf3a07-e37e-471d-b327-5ed6470a7705','M1','形成整合方案','规划','功能梳理与整合','形成方案','通过评审','2026-03-01 00:00:00.000',NULL,'系统管理员','进行中',NULL,'2026-03-01 08:42:30.232','2026-03-01 08:42:30.232');
/*!40000 ALTER TABLE `Milestone` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProgressRecord`
--

DROP TABLE IF EXISTS `ProgressRecord`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ProgressRecord` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `projectId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `statPeriod` datetime(3) NOT NULL,
  `currentStage` enum('启动','规划','执行','验收') COLLATE utf8mb4_unicode_ci NOT NULL,
  `milestoneCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finishedWork` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `overallProgressPct` double NOT NULL,
  `issuesAndRisks` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `needsCoordination` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nextPlan` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recorder` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recordDate` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ProgressRecord_projectId_idx` (`projectId`),
  CONSTRAINT `ProgressRecord_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProgressRecord`
--

LOCK TABLES `ProgressRecord` WRITE;
/*!40000 ALTER TABLE `ProgressRecord` DISABLE KEYS */;
/*!40000 ALTER TABLE `ProgressRecord` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Project`
--

DROP TABLE IF EXISTS `Project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Project` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `projectName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `projectType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year` int NOT NULL,
  `leadDepartment` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `projectOwner` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `participants` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `background` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `goal` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scope` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expectedOutcome` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Project`
--

LOCK TABLES `Project` WRITE;
/*!40000 ALTER TABLE `Project` DISABLE KEYS */;
INSERT INTO `Project` (`id`, `projectName`, `projectType`, `year`, `leadDepartment`, `projectOwner`, `participants`, `background`, `goal`, `scope`, `expectedOutcome`, `createdAt`, `updatedAt`) VALUES ('058ca7fd-3fc8-4b42-bddc-02c33a4edbed','幸福中原功能提升','视同收入',2026,'经营管理信息化研究所','徐聪','郭雨涵、郭琳','165','25266','45 南京南京',' 15115','2026-02-15 09:32:13.295','2026-02-21 16:11:18.579'),('08eff46d-0c0c-4d7a-bcb8-81c23d871864','环境保护税功能优化升级','视同收入',2026,'经营管理信息化研究所','郭琳','郭琳、丁秀鹃',NULL,NULL,'优化报表样式和分类汇总、异常值与典型任务监控、申报缴税规则、数据变更与回溯机制，并持续进行反馈优化。','提高报税准确性与业务效率，形成阶段性优化成果。','2026-02-21 16:14:48.634','2026-03-01 07:08:55.188'),('24fe0aef-16da-4915-85ab-719170686966','中原油田宣传成果共享平台','视同收入',2026,'党委宣传部','李士铮','李士铮、林程思源',NULL,NULL,'建设宣传成果沉淀、共享与传播平台能力。','统一宣传成果管理口径，提升复用和传播效率。','2026-02-21 16:14:48.633','2026-02-21 16:18:14.900'),('40414ae5-d7de-47dc-b59a-3eacb0170a7f','中原油田党委巡察工作信息系统提升项目','视同收入',2026,'党委巡察办公室','郭雨涵','郭雨涵',NULL,NULL,'建设巡察工具、归档资料、整改督改、综合管理、工作动态等模块，覆盖资料归档、整改闭环、统计分析与信息发布。','构建统一在线学习与巡察工作协同平台。','2026-02-21 16:14:48.630','2026-02-21 16:18:14.896'),('4ccf3a07-e37e-471d-b327-5ed6470a7705','回归测试项目-1772354550165','A 类科研',2026,'经营管理信息化研究所','系统管理员','项目经理,项目成员','回归测试','验证P0规则','接口回归','规则可用','2026-03-01 08:42:30.171','2026-03-01 08:42:30.171'),('8718e8b1-b87f-4624-9f97-f8844c89a8b1','党建思维导图功能提升','视同收入',2026,'党委组织部','徐聪','徐聪、郭雨涵、郭琳',NULL,NULL,'新增意见反馈回复闭环；优化内容更新管理；增强督办提醒和倒计时；优化统计分析；优化PC与移动端协同体验。','形成闭环管理，提升处理效率和督办可视化能力。','2026-02-21 16:14:48.625','2026-02-21 16:18:14.893'),('90b6ab92-690d-442b-b675-e60deb40a10b','回归测试项目-1772354358732','A 类科研',2026,'经营管理信息化研究所','系统管理员','项目经理,项目成员','回归测试','验证P0规则','接口回归','规则可用','2026-03-01 08:39:18.735','2026-03-01 08:39:18.735'),('a2becd2f-62a9-4108-bc97-3adf9a381e09','ERP及周边系统运行技术支持','视同收入',2026,'经营管理信息化研究所','鲁欣','鲁欣、郭琳、丁秀鹏、林程思源、陈惠',NULL,NULL,'保障ERP财务物流投资销售四模块稳定运行；覆盖权限与主数据管理、年结审计配合；支持ERS/MDG/TMS/FIRMS/AIC等周边系统；推进接口与字段梳理。','保障核心系统稳定与合规运行，持续完成业务需求对接。','2026-02-21 16:14:48.635','2026-03-01 05:56:23.043'),('afa43e11-a6e5-4288-bcaf-3458019d3a5e','中心财务预算系统功能提升','视同收入',2026,'经营管理信息化研究所','丁秀鹃','郭琳',NULL,NULL,'新增中心绩效考核管理、指标分解配置、预算编制审批、统计分析与查询、权限控制和数据安全机制。','实现绩效与预算闭环管理，提升审批效率与数据治理能力。','2026-02-21 16:14:48.631','2026-03-01 07:09:23.002'),('cf2f174f-51f9-4e69-8e0a-07fb0d43a3af','回归测试项目-1772354185113','A 类科研',2026,'经营管理信息化研究所','系统管理员','项目经理,项目成员','回归测试','验证P0规则','接口回归','规则可用','2026-03-01 08:36:25.120','2026-03-01 08:36:25.120');
/*!40000 ALTER TABLE `Project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProjectMember`
--

DROP TABLE IF EXISTS `ProjectMember`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ProjectMember` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `projectId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accessRole` enum('OWNER','EDITOR','VIEWER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VIEWER',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ProjectMember_projectId_userId_key` (`projectId`,`userId`),
  KEY `ProjectMember_projectId_idx` (`projectId`),
  CONSTRAINT `ProjectMember_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProjectMember`
--

LOCK TABLES `ProjectMember` WRITE;
/*!40000 ALTER TABLE `ProjectMember` DISABLE KEYS */;
INSERT INTO `ProjectMember` (`id`, `projectId`, `userId`, `accessRole`, `createdAt`, `updatedAt`) VALUES ('2bef2ab9-ed6f-4d9b-9cd7-5733cf5d395b','4ccf3a07-e37e-471d-b327-5ed6470a7705','cmlerwwo60003tcgpe5qngz9l','OWNER','2026-03-01 08:42:30.177','2026-03-01 08:42:30.177'),('37403ac6-3f2e-4c74-8247-2ac751da1761','058ca7fd-3fc8-4b42-bddc-02c33a4edbed','cmlerwwo60003tcgpe5qngz9l','OWNER','2026-02-15 09:32:13.309','2026-02-15 09:32:13.309'),('48346fd3-3558-443f-9511-317f75471f43','cf2f174f-51f9-4e69-8e0a-07fb0d43a3af','cmlerwwo60003tcgpe5qngz9l','OWNER','2026-03-01 08:36:25.132','2026-03-01 08:36:25.132'),('5ceff1a6-bc37-4659-b8a4-3bfb729e4152','4ccf3a07-e37e-471d-b327-5ed6470a7705','cmlerwwof0009tcgpqy3mm1xu','EDITOR','2026-03-01 08:42:30.186','2026-03-01 08:42:30.186'),('9487a81a-b51f-4766-b205-336019a875df','90b6ab92-690d-442b-b675-e60deb40a10b','cmlerwwof0009tcgpqy3mm1xu','EDITOR','2026-03-01 08:39:18.752','2026-03-01 08:39:18.752'),('b71885da-82ff-4ee1-8102-eec042a76b26','90b6ab92-690d-442b-b675-e60deb40a10b','cmlerwwo60003tcgpe5qngz9l','OWNER','2026-03-01 08:39:18.741','2026-03-01 08:39:18.741'),('f6613549-7b5a-4ae0-8078-18bd86f2002e','cf2f174f-51f9-4e69-8e0a-07fb0d43a3af','cmlerwwof0009tcgpqy3mm1xu','EDITOR','2026-03-01 08:36:25.143','2026-03-01 08:36:25.143');
/*!40000 ALTER TABLE `ProjectMember` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProjectReport`
--

DROP TABLE IF EXISTS `ProjectReport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ProjectReport` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `projectId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reportType` enum('WEEKLY','MONTHLY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `period` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('DRAFT','SUBMITTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `sourceSnapshot` json DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ProjectReport_projectId_reportType_period_key` (`projectId`,`reportType`,`period`),
  KEY `ProjectReport_projectId_reportType_idx` (`projectId`,`reportType`),
  CONSTRAINT `ProjectReport_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProjectReport`
--

LOCK TABLES `ProjectReport` WRITE;
/*!40000 ALTER TABLE `ProjectReport` DISABLE KEYS */;
/*!40000 ALTER TABLE `ProjectReport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RiskItem`
--

DROP TABLE IF EXISTS `RiskItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `RiskItem` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `projectId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `riskCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `riskType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stage` enum('启动','规划','执行','验收') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `impactLevel` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mitigationPlan` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plannedResolveDate` datetime(3) NOT NULL,
  `currentStatus` enum('未开始','进行中','已完成','延期') COLLATE utf8mb4_unicode_ci NOT NULL,
  `actualResolveDate` datetime(3) DEFAULT NULL,
  `escalateToManagement` enum('是','否') COLLATE utf8mb4_unicode_ci NOT NULL,
  `linkedMilestoneOrTask` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `RiskItem_projectId_idx` (`projectId`),
  CONSTRAINT `RiskItem_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RiskItem`
--

LOCK TABLES `RiskItem` WRITE;
/*!40000 ALTER TABLE `RiskItem` DISABLE KEYS */;
INSERT INTO `RiskItem` (`id`, `projectId`, `riskCode`, `riskType`, `stage`, `description`, `impactLevel`, `mitigationPlan`, `owner`, `plannedResolveDate`, `currentStatus`, `actualResolveDate`, `escalateToManagement`, `linkedMilestoneOrTask`, `note`, `createdAt`, `updatedAt`) VALUES ('13c9f9da-471c-4f90-97e1-2b11936f1ae2','90b6ab92-690d-442b-b675-e60deb40a10b','R-01','协同风险','规划','跨部门确认慢','高','专项沟通','系统管理员','2026-03-05 00:00:00.000','进行中',NULL,'是',NULL,NULL,'2026-03-01 08:39:18.831','2026-03-01 08:39:18.831'),('b9ef5d20-33e7-4c71-94de-0e1658824860','4ccf3a07-e37e-471d-b327-5ed6470a7705','R-01','协同风险','规划','跨部门确认慢','高','专项沟通','系统管理员','2026-03-05 00:00:00.000','进行中',NULL,'是',NULL,NULL,'2026-03-01 08:42:30.274','2026-03-01 08:42:30.274');
/*!40000 ALTER TABLE `RiskItem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `StatusAssessment`
--

DROP TABLE IF EXISTS `StatusAssessment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `StatusAssessment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `projectId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `evalPeriod` datetime(3) NOT NULL,
  `currentStage` enum('启动','规划','执行','验收') COLLATE utf8mb4_unicode_ci NOT NULL,
  `overallStatus` enum('绿','黄','红') COLLATE utf8mb4_unicode_ci NOT NULL,
  `scheduleStatus` enum('绿','黄','红') COLLATE utf8mb4_unicode_ci NOT NULL,
  `qualityStatus` enum('绿','黄','红') COLLATE utf8mb4_unicode_ci NOT NULL,
  `riskStatus` enum('绿','黄','红') COLLATE utf8mb4_unicode_ci NOT NULL,
  `assessmentBasis` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `watchItems` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assessor` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assessmentDate` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `StatusAssessment_projectId_idx` (`projectId`),
  CONSTRAINT `StatusAssessment_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `StatusAssessment`
--

LOCK TABLES `StatusAssessment` WRITE;
/*!40000 ALTER TABLE `StatusAssessment` DISABLE KEYS */;
INSERT INTO `StatusAssessment` (`id`, `projectId`, `evalPeriod`, `currentStage`, `overallStatus`, `scheduleStatus`, `qualityStatus`, `riskStatus`, `assessmentBasis`, `watchItems`, `assessor`, `assessmentDate`, `createdAt`, `updatedAt`) VALUES ('684016b5-11f6-43ab-acb8-2b0d5da30d59','90b6ab92-690d-442b-b675-e60deb40a10b','2026-02-15 00:00:00.000','规划','黄','绿','绿','黄','存在升级风险','需跟进','系统管理员','2026-02-15 00:00:00.000','2026-03-01 08:39:18.862','2026-03-01 08:39:18.862'),('dbee7f35-6340-4ceb-a4c9-c06789208eb7','4ccf3a07-e37e-471d-b327-5ed6470a7705','2026-02-15 00:00:00.000','规划','黄','绿','绿','黄','存在升级风险','需跟进','系统管理员','2026-02-15 00:00:00.000','2026-03-01 08:42:30.296','2026-03-01 08:42:30.296');
/*!40000 ALTER TABLE `StatusAssessment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_area`
--

DROP TABLE IF EXISTS `sys_area`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_area` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fullName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` int NOT NULL DEFAULT '1',
  `sort` int NOT NULL DEFAULT '0',
  `status` enum('ENABLED','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENABLED',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_area_code_key` (`code`),
  KEY `sys_area_parentId_idx` (`parentId`),
  KEY `sys_area_level_idx` (`level`),
  CONSTRAINT `sys_area_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `sys_area` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_area`
--

LOCK TABLES `sys_area` WRITE;
/*!40000 ALTER TABLE `sys_area` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_area` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_config`
--

DROP TABLE IF EXISTS `sys_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_config` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `configKey` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `configValue` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valueType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  `remark` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ENABLED','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENABLED',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_config_configKey_key` (`configKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_config`
--

LOCK TABLES `sys_config` WRITE;
/*!40000 ALTER TABLE `sys_config` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_datarule`
--

DROP TABLE IF EXISTS `sys_datarule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_datarule` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ruleCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ruleName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conditionJson` json DEFAULT NULL,
  `status` enum('ENABLED','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENABLED',
  `remark` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_datarule_ruleCode_key` (`ruleCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_datarule`
--

LOCK TABLES `sys_datarule` WRITE;
/*!40000 ALTER TABLE `sys_datarule` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_datarule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_dict_type`
--

DROP TABLE IF EXISTS `sys_dict_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_dict_type` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dictCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dictName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ENABLED','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENABLED',
  `remark` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_dict_type_dictCode_key` (`dictCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_dict_type`
--

LOCK TABLES `sys_dict_type` WRITE;
/*!40000 ALTER TABLE `sys_dict_type` DISABLE KEYS */;
INSERT INTO `sys_dict_type` (`id`, `dictCode`, `dictName`, `status`, `remark`, `createdAt`, `updatedAt`) VALUES ('cmlerwwom000ctcgpbf5ggfm0','projectType','项目类型','ENABLED',NULL,'2026-02-09 06:10:50.615','2026-03-12 12:07:05.979'),('cmlerwwp2000ptcgp82khy0cv','year','所属年度','ENABLED',NULL,'2026-02-09 06:10:50.630','2026-03-12 12:07:05.989');
/*!40000 ALTER TABLE `sys_dict_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_dict_value`
--

DROP TABLE IF EXISTS `sys_dict_value`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_dict_value` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dictTypeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dictLabel` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dictValue` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isDefault` tinyint(1) NOT NULL DEFAULT '0',
  `sort` int NOT NULL DEFAULT '0',
  `status` enum('ENABLED','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENABLED',
  `remark` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_dict_value_dictTypeId_dictValue_key` (`dictTypeId`,`dictValue`),
  KEY `sys_dict_value_dictTypeId_idx` (`dictTypeId`),
  CONSTRAINT `sys_dict_value_dictTypeId_fkey` FOREIGN KEY (`dictTypeId`) REFERENCES `sys_dict_type` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_dict_value`
--

LOCK TABLES `sys_dict_value` WRITE;
/*!40000 ALTER TABLE `sys_dict_value` DISABLE KEYS */;
INSERT INTO `sys_dict_value` (`id`, `dictTypeId`, `dictLabel`, `dictValue`, `isDefault`, `sort`, `status`, `remark`, `createdAt`, `updatedAt`) VALUES ('cmlerwwop000etcgpsp0rhtyu','cmlerwwom000ctcgpbf5ggfm0','视同收入','视同收入',0,1,'ENABLED',NULL,'2026-02-09 06:10:50.617','2026-03-12 12:07:05.980'),('cmlerwwor000gtcgpxkaus05j','cmlerwwom000ctcgpbf5ggfm0','A 类科研','A 类科研',0,2,'ENABLED',NULL,'2026-02-09 06:10:50.620','2026-03-12 12:07:05.981'),('cmlerwwot000itcgpu4x8kdl0','cmlerwwom000ctcgpbf5ggfm0','B 类科研','B 类科研',0,3,'ENABLED',NULL,'2026-02-09 06:10:50.622','2026-03-12 12:07:05.983'),('cmlerwwow000ktcgpsip1t21e','cmlerwwom000ctcgpbf5ggfm0','C 类科研','C 类科研',0,4,'ENABLED',NULL,'2026-02-09 06:10:50.624','2026-03-12 12:07:05.985'),('cmlerwwoy000mtcgpbqpni8yg','cmlerwwom000ctcgpbf5ggfm0','内部劳务','内部劳务',0,5,'ENABLED',NULL,'2026-02-09 06:10:50.626','2026-03-12 12:07:05.986'),('cmlerwwoz000otcgpqkkpycbl','cmlerwwom000ctcgpbf5ggfm0','外部劳务','外部劳务',0,6,'ENABLED',NULL,'2026-02-09 06:10:50.627','2026-03-12 12:07:05.988'),('cmlerwwp4000rtcgpabyrm5sl','cmlerwwp2000ptcgp82khy0cv','2024','2024',0,1,'ENABLED',NULL,'2026-02-09 06:10:50.632','2026-03-12 12:07:05.991'),('cmlerwwp5000ttcgpyc61boob','cmlerwwp2000ptcgp82khy0cv','2025','2025',0,2,'ENABLED',NULL,'2026-02-09 06:10:50.634','2026-03-12 12:07:05.992'),('cmlerwwp6000vtcgp4akh7r6y','cmlerwwp2000ptcgp82khy0cv','2026','2026',0,3,'ENABLED',NULL,'2026-02-09 06:10:50.635','2026-03-12 12:07:05.993'),('cmlerwwp7000xtcgpe2s6n4s5','cmlerwwp2000ptcgp82khy0cv','2027','2027',0,4,'ENABLED',NULL,'2026-02-09 06:10:50.636','2026-03-12 12:07:05.994'),('cmlerwwp9000ztcgpz42cfpb7','cmlerwwp2000ptcgp82khy0cv','2028','2028',0,5,'ENABLED',NULL,'2026-02-09 06:10:50.637','2026-03-12 12:07:05.995'),('cmlerwwp90011tcgpmwk5ri7s','cmlerwwp2000ptcgp82khy0cv','2029','2029',0,6,'ENABLED',NULL,'2026-02-09 06:10:50.638','2026-03-12 12:07:05.996'),('cmlerwwpa0013tcgp4ruq9q53','cmlerwwp2000ptcgp82khy0cv','2030','2030',0,7,'ENABLED',NULL,'2026-02-09 06:10:50.639','2026-03-12 12:07:05.996');
/*!40000 ALTER TABLE `sys_dict_value` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_file`
--

DROP TABLE IF EXISTS `sys_file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_file` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `folderId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fileName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fileKey` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fileExt` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fileSize` bigint NOT NULL,
  `mimeType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaderId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ENABLED','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENABLED',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_file_fileKey_key` (`fileKey`),
  KEY `sys_file_folderId_idx` (`folderId`),
  KEY `sys_file_uploaderId_idx` (`uploaderId`),
  CONSTRAINT `sys_file_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `sys_folder` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sys_file_uploaderId_fkey` FOREIGN KEY (`uploaderId`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_file`
--

LOCK TABLES `sys_file` WRITE;
/*!40000 ALTER TABLE `sys_file` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_file` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_folder`
--

DROP TABLE IF EXISTS `sys_folder`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_folder` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `folderName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `folderPath` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort` int NOT NULL DEFAULT '0',
  `status` enum('ENABLED','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENABLED',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_folder_parentId_folderName_key` (`parentId`,`folderName`),
  KEY `sys_folder_parentId_idx` (`parentId`),
  CONSTRAINT `sys_folder_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `sys_folder` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_folder`
--

LOCK TABLES `sys_folder` WRITE;
/*!40000 ALTER TABLE `sys_folder` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_folder` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_log`
--

DROP TABLE IF EXISTS `sys_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_log` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `module` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requestUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requestMethod` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requestIp` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requestBody` json DEFAULT NULL,
  `responseBody` json DEFAULT NULL,
  `isSuccess` tinyint(1) NOT NULL DEFAULT '1',
  `errorMessage` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `sys_log_userId_idx` (`userId`),
  KEY `sys_log_createdAt_idx` (`createdAt`),
  CONSTRAINT `sys_log_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_log`
--

LOCK TABLES `sys_log` WRITE;
/*!40000 ALTER TABLE `sys_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_login_count`
--

DROP TABLE IF EXISTS `sys_login_count`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_login_count` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `statDate` date NOT NULL,
  `loginCount` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_login_count_statDate_key` (`statDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_login_count`
--

LOCK TABLES `sys_login_count` WRITE;
/*!40000 ALTER TABLE `sys_login_count` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_login_count` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_menu`
--

DROP TABLE IF EXISTS `sys_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_menu` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `menuCode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `menuName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `menuType` enum('DIRECTORY','MENU','BUTTON') COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `path` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `component` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permission` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort` int NOT NULL DEFAULT '0',
  `visible` tinyint(1) NOT NULL DEFAULT '1',
  `keepAlive` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('ENABLED','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENABLED',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_menu_menuCode_key` (`menuCode`),
  KEY `sys_menu_parentId_idx` (`parentId`),
  KEY `sys_menu_menuType_idx` (`menuType`),
  CONSTRAINT `sys_menu_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `sys_menu` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_menu`
--

LOCK TABLES `sys_menu` WRITE;
/*!40000 ALTER TABLE `sys_menu` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_office`
--

DROP TABLE IF EXISTS `sys_office`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_office` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `officeCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `officeName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `officeType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DEPARTMENT',
  `grade` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parentIds` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `areaId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `leader` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fax` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zipCode` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort` int NOT NULL DEFAULT '0',
  `status` enum('ENABLED','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENABLED',
  `useable` char(1) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1',
  `primaryPerson` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deputyPerson` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delFlag` tinyint NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_office_officeCode_key` (`officeCode`),
  UNIQUE KEY `sys_office_parentId_officeName_delFlag_key` (`parentId`,`officeName`,`delFlag`),
  KEY `sys_office_parentId_idx` (`parentId`),
  KEY `sys_office_delFlag_idx` (`delFlag`),
  KEY `sys_office_officeType_idx` (`officeType`),
  KEY `sys_office_useable_idx` (`useable`),
  KEY `sys_office_parentId_delFlag_idx` (`parentId`,`delFlag`),
  CONSTRAINT `sys_office_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `sys_office` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_office`
--

LOCK TABLES `sys_office` WRITE;
/*!40000 ALTER TABLE `sys_office` DISABLE KEYS */;
INSERT INTO `sys_office` (`id`, `officeCode`, `officeName`, `officeType`, `grade`, `parentId`, `parentIds`, `areaId`, `leader`, `phone`, `fax`, `email`, `address`, `zipCode`, `sort`, `status`, `useable`, `primaryPerson`, `deputyPerson`, `delFlag`, `createdAt`, `updatedAt`) VALUES ('1633709086054821889','OFF-1633709086054821889','信息中心','DEPARTMENT','2','1704304844541562882','0,1704304844541562882,',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'ENABLED','1',NULL,NULL,0,'2024-01-01 00:00:00.000','2024-01-01 00:00:00.000'),('1704304844541562882','OFF-1704304844541562882','信息中心根节点','DEPARTMENT','1',NULL,'0,',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'ENABLED','1',NULL,NULL,0,'2024-01-01 00:00:00.000','2024-01-01 00:00:00.000'),('1712027221975179266','OFF-1712027221975179266','智能气田信息化研究所','DEPARTMENT','3','1633709086054821889','0,1704304844541562882,1633709086054821889,',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'ENABLED','1',NULL,NULL,0,'2023-10-11 16:47:52.000','2024-04-23 16:27:20.000'),('1782687751391461377','OFF-1782687751391461377','信息技术研究所','DEPARTMENT','3','1633709086054821889','0,1704304844541562882,1633709086054821889,',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'ENABLED','1',NULL,NULL,0,'2024-04-23 16:27:35.000','2024-04-23 16:27:35.000'),('1782687843498377217','OFF-1782687843498377217','油气生产信息化研究所','DEPARTMENT','3','1633709086054821889','0,1704304844541562882,1633709086054821889,',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'ENABLED','1',NULL,NULL,0,'2024-04-23 16:27:57.000','2024-04-23 16:27:57.000'),('1782687929246728194','OFF-1782687929246728194','勘探开发信息化研究所','DEPARTMENT','3','1633709086054821889','0,1704304844541562882,1633709086054821889,',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'ENABLED','1',NULL,NULL,0,'2024-04-23 16:28:18.000','2024-04-23 16:28:18.000'),('1782688082129108993','OFF-1782688082129108993','信息规划与数据资源研究所','DEPARTMENT','3','1633709086054821889','0,1704304844541562882,1633709086054821889,',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'ENABLED','1',NULL,NULL,0,'2024-04-23 16:28:54.000','2024-04-23 16:28:59.000'),('1782688191478808577','OFF-1782688191478808577','云网安全研究所','DEPARTMENT','3','1633709086054821889','0,1704304844541562882,1633709086054821889,',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'ENABLED','1',NULL,NULL,0,'2024-04-23 16:29:20.000','2024-04-23 16:29:20.000'),('1782688314636156929','OFF-1782688314636156929','经营管理信息化研究所','DEPARTMENT','3','1633709086054821889','0,1704304844541562882,1633709086054821889,',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'ENABLED','1',NULL,NULL,0,'2024-04-23 16:29:50.000','2024-04-23 16:29:50.000'),('1795626878822809601','OFF-1795626878822809601','信息外协','DEPARTMENT','3','1633709086054821889','0,1704304844541562882,1633709086054821889,',NULL,NULL,NULL,NULL,NULL,NULL,NULL,30,'ENABLED','1',NULL,NULL,0,'2024-05-29 09:23:04.000','2024-05-29 09:23:04.000'),('1864564601356562434','OFF-1864564601356562434','信息中心领导班子','DEPARTMENT','3','1633709086054821889','0,1704304844541562882,1633709086054821889,',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'ENABLED','1',NULL,NULL,0,'2024-12-05 14:56:58.000','2024-12-05 14:56:58.000'),('54ca0bd60a4811f1b4703dedefe5afbc','OFF-AUTO-026F7A17','科研生产室','DEPARTMENT','3','1633709086054821889','0,1704304844541562882,1633709086054821889,',NULL,NULL,NULL,NULL,NULL,NULL,NULL,99,'ENABLED','1',NULL,NULL,0,'2026-02-15 16:28:40.000','2026-02-15 16:28:40.000'),('54ca3cc80a4811f1b4703dedefe5afbc','OFF-AUTO-E167F20D','财务经营室','DEPARTMENT','3','1633709086054821889','0,1704304844541562882,1633709086054821889,',NULL,NULL,NULL,NULL,NULL,NULL,NULL,99,'ENABLED','1',NULL,NULL,0,'2026-02-15 16:28:40.000','2026-02-15 16:28:40.000'),('54ca3e120a4811f1b4703dedefe5afbc','OFF-AUTO-9D2533E0','综合办公室','DEPARTMENT','3','1633709086054821889','0,1704304844541562882,1633709086054821889,',NULL,NULL,NULL,NULL,NULL,NULL,NULL,99,'ENABLED','1',NULL,NULL,0,'2026-02-15 16:28:40.000','2026-02-15 16:28:40.000');
/*!40000 ALTER TABLE `sys_office` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_post`
--

DROP TABLE IF EXISTS `sys_post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_post` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `officeId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort` int NOT NULL DEFAULT '0',
  `status` enum('ENABLED','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENABLED',
  `remark` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_post_postCode_key` (`postCode`),
  KEY `sys_post_officeId_idx` (`officeId`),
  CONSTRAINT `sys_post_officeId_fkey` FOREIGN KEY (`officeId`) REFERENCES `sys_office` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_post`
--

LOCK TABLES `sys_post` WRITE;
/*!40000 ALTER TABLE `sys_post` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_role`
--

DROP TABLE IF EXISTS `sys_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_role` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roleCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roleName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dataScope` enum('ALL','ORG_AND_CHILD','ORG','SELF','CUSTOM') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SELF',
  `sort` int NOT NULL DEFAULT '0',
  `status` enum('ENABLED','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENABLED',
  `remark` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_role_roleCode_key` (`roleCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_role`
--

LOCK TABLES `sys_role` WRITE;
/*!40000 ALTER TABLE `sys_role` DISABLE KEYS */;
INSERT INTO `sys_role` (`id`, `roleCode`, `roleName`, `dataScope`, `sort`, `status`, `remark`, `createdAt`, `updatedAt`) VALUES ('cmlerwwnu0000tcgpi7wc7n9i','ADMIN','系统管理员','ALL',1,'ENABLED',NULL,'2026-02-09 06:10:50.586','2026-03-12 12:07:05.964'),('cmlerwwnz0001tcgpvqi67vv4','PM','项目经理','CUSTOM',2,'ENABLED',NULL,'2026-02-09 06:10:50.592','2026-03-12 12:07:05.969'),('cmlerwwo20002tcgp35ttua0t','MEMBER','项目成员','SELF',3,'ENABLED',NULL,'2026-02-09 06:10:50.594','2026-03-12 12:07:05.970');
/*!40000 ALTER TABLE `sys_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_role_datarule`
--

DROP TABLE IF EXISTS `sys_role_datarule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_role_datarule` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roleId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dataRuleId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_role_datarule_roleId_dataRuleId_key` (`roleId`,`dataRuleId`),
  KEY `sys_role_datarule_dataRuleId_idx` (`dataRuleId`),
  CONSTRAINT `sys_role_datarule_dataRuleId_fkey` FOREIGN KEY (`dataRuleId`) REFERENCES `sys_datarule` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sys_role_datarule_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_role_datarule`
--

LOCK TABLES `sys_role_datarule` WRITE;
/*!40000 ALTER TABLE `sys_role_datarule` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_role_datarule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_role_menu`
--

DROP TABLE IF EXISTS `sys_role_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_role_menu` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roleId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `menuId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_role_menu_roleId_menuId_key` (`roleId`,`menuId`),
  KEY `sys_role_menu_menuId_idx` (`menuId`),
  CONSTRAINT `sys_role_menu_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `sys_menu` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sys_role_menu_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_role_menu`
--

LOCK TABLES `sys_role_menu` WRITE;
/*!40000 ALTER TABLE `sys_role_menu` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_role_menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_schedule`
--

DROP TABLE IF EXISTS `sys_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_schedule` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scheduleName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cronExpression` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invokeTarget` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` json DEFAULT NULL,
  `status` enum('ENABLED','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENABLED',
  `lastRunAt` datetime(3) DEFAULT NULL,
  `nextRunAt` datetime(3) DEFAULT NULL,
  `failCount` int NOT NULL DEFAULT '0',
  `remark` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_schedule`
--

LOCK TABLES `sys_schedule` WRITE;
/*!40000 ALTER TABLE `sys_schedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_user`
--

DROP TABLE IF EXISTS `sys_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_user` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `displayName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `officeId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ENABLED','DISABLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENABLED',
  `lastLoginAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_user_username_key` (`username`),
  KEY `sys_user_officeId_idx` (`officeId`),
  CONSTRAINT `sys_user_officeId_fkey` FOREIGN KEY (`officeId`) REFERENCES `sys_office` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_user`
--

LOCK TABLES `sys_user` WRITE;
/*!40000 ALTER TABLE `sys_user` DISABLE KEYS */;
INSERT INTO `sys_user` (`id`, `username`, `displayName`, `passwordHash`, `officeId`, `mobile`, `email`, `status`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES ('cmlerwwo60003tcgpe5qngz9l','admin','系统管理员','e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7',NULL,NULL,NULL,'ENABLED',NULL,'2026-02-09 06:10:50.599','2026-03-12 12:07:05.973'),('cmlerwwob0006tcgpw00mlyrl','pm','项目经理','0bca22c86f474095410454f94f23cdf9b7e49a4c5baf0cbf706a35e2464361d6',NULL,NULL,NULL,'ENABLED',NULL,'2026-02-09 06:10:50.603','2026-03-12 12:07:05.976'),('cmlerwwof0009tcgpqy3mm1xu','member','项目成员','abe2d3ed5419e1a2293c034a6b375a622ff5a60e5ac30f29c461220898ffdd97',NULL,NULL,NULL,'ENABLED',NULL,'2026-02-09 06:10:50.608','2026-03-12 12:07:05.977'),('e5cf4db20a4811f1b4703dedefe5afbc','lism259.zyyt','李斯敏','120ee9f8991568b71cc867366261bd9b6a65879a13376638b57e4bfafa783752','54ca0bd60a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d0ed200a4811f1b4703dedefe5afbc','dongxm169','董旭淼','52d02f6293f8bbaeff5127bd176d0ae8610ec0180ab2e7464a492ca92d57bbff','1795626878822809601',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d0f64e0a4811f1b4703dedefe5afbc','wumin.zyyt','吴敏','3681b888db3831a258a81cd3121b9c10603976bdf40d6a75dcc31c616a5b7bfb','54ca3cc80a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d0fc340a4811f1b4703dedefe5afbc','fuy210.zyyt','付瑜','539fa60fd6b4a2bf3ccb724a750603a0c38639c31722aabcaf921ccfd136f8f2','54ca3cc80a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d102240a4811f1b4703dedefe5afbc','lilei.zyyt','李蕾','c782b56b9066adc2ccdb1815f88e343fe66f8e7341ca42fabf877efd79cbdd5d','54ca3cc80a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d107ec0a4811f1b4703dedefe5afbc','wuwy2070.zyyt','吴婉蓥','a0f38229b3df5fc69e26f39642e46177551b67d8fd586d578e990f01a334ec51','54ca3cc80a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d11f200a4811f1b4703dedefe5afbc','guizx.zyyt','桂真雪','ee6df83bc6960654814656fe5c78f8708d21d16dc296d156cb9cbc498149afed','54ca3cc80a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d127180a4811f1b4703dedefe5afbc','wanghengyao.zyyt','王恒耀','ab4bb68cbc247d01b48c398086b0ce81d2dc08dfc16ed8a9e78a1191b409587c','54ca0bd60a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d12c720a4811f1b4703dedefe5afbc','suncl.zyyt','孙朝林','1ded3431fd3fce6e9a01570f83926f9ce139ea39757e75ea37cd20c1f6f5d573','54ca0bd60a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d12ef20a4811f1b4703dedefe5afbc','liull.zyyt','刘玲玲','42bd93a16adac050cd51df53108030c4b1eb4e7df0bef0cdac7252b607f343fc','54ca0bd60a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d143240a4811f1b4703dedefe5afbc','fengjsh.zyyt','冯继盛','bf380ace8f07602dff7099f440ab9602dbf19c2596a2c3f17af814338222ff8a','54ca0bd60a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d145e00a4811f1b4703dedefe5afbc','yanjy4263.zyyt','闫靖雨','e14b2f8196ab825e7fb2f8deed8641909ab6c78188c692b707d7326f9e1595cb','54ca0bd60a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d14a0e0a4811f1b4703dedefe5afbc','zhangjw.zyyt','张江玮','951f8ccf6ea895ad8bf70ebf77d4a808ea5f0b515c5edf4d475e9812a72c6486','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d14fae0a4811f1b4703dedefe5afbc','liangbo.zyyt','梁波','05699ad8d445e97c7b31bcf89ca6f1e5151d7cff337942c2fa645fb531c1421a','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1559e0a4811f1b4703dedefe5afbc','zhangdaw.zyyt','张大伟','986513f768eca6a16661f7b5dd5e39c479e9ad2475c5333eb2850da98606132b','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d15b700a4811f1b4703dedefe5afbc','hujj29.zyyt','胡娟娟','31d665531ac4e547dae0027b00f851d5368f7ae8283c07c484d57acb91332a90','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d163360a4811f1b4703dedefe5afbc','mashif.zyyt','马世防','818c080f2d48e0891f90f5076f18cccf94df169b70c4df8d278a2d51f94ba617','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d16f020a4811f1b4703dedefe5afbc','chenxiaol.zyyt','陈小龙','82400b23b91000ecbfb9b32239ecaeb49fde63db6fd13191f5c826a0085422a3','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d179e80a4811f1b4703dedefe5afbc','zhaozw.zyyt','赵志伟','0eec13736b302fd3102508096046f9359daf66afecefe9fdfbba4a876db7187c','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d180aa0a4811f1b4703dedefe5afbc','luanwei.zyyt','栾伟','7eb6522a3d72efc6c880aca58f86ac657e56e05cc2cfab27ce40fa396779d737','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d187760a4811f1b4703dedefe5afbc','zhjl.zyyt','张建丽','5e1ea04288f478e6734bc64b17c325056606bd18bfc7607029eddd0dc06aa2e0','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d18d5c0a4811f1b4703dedefe5afbc','zyyangjie.zyyt','杨洁','2ed5b547c507cf3b932311e3e60879964bd4c146596a26e559ee2e54b7cb3ada','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1932e0a4811f1b4703dedefe5afbc','xiaxb66.zyyt','夏晓斌','8786445c5047c9d253eae3e9bbb8246c6d72d4bcdc7cfe74aae1aa30aa8a077e','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1a21a0a4811f1b4703dedefe5afbc','yinhang.zyyt','尹航','ccf2050e7a670e094a6d03f5ae19cc84261d80e0e178245ed4d24801024444dc','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1b1e20a4811f1b4703dedefe5afbc','wangfei.zyyt','王飞','bc5d8f016db2091164459bbff83a35baefc28be799a00afcf4cdc25dd5600c53','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1bb240a4811f1b4703dedefe5afbc','tlhu.zyyt','李虎','c0b153fefae541913848810b4d239fcc2a28429f44e1e1476d53a0cf0075efd9','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1c1780a4811f1b4703dedefe5afbc','lvq.zyyt','吕强','78642da066073d816a32c8e5e194a7ed7e61c36e1f8266b511169fd540fa3b4b','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1c75e0a4811f1b4703dedefe5afbc','niex.zyyt','聂霞','5e6b77a1834566764ee3ada9449dc89dc1c428205e63bb5124ba21ee1d7317d7','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1cd1c0a4811f1b4703dedefe5afbc','zhanggq06.zyyt','张古泉','b90396490293ac468a5cab65b417702b273831db2571e977758b03ce1d30676e','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1d2f80a4811f1b4703dedefe5afbc','zanj.zyyt','昝健','7247791311f5797025955a1d7b91e9257f20ca23b78b94705e52eb33b455c343','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1d6540a4811f1b4703dedefe5afbc','zhangcl-09.zyyt','张春林','71003e598c58aff7c00325ea1ba479fad59696b0103f81203a36d7f96cd804a7','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1d8840a4811f1b4703dedefe5afbc','wangxy0516.zyyt','王欣怡','43b972077ef54cb0057b24518e7cb7e788de882d878ea1364e7189e071c666c0','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1db900a4811f1b4703dedefe5afbc','wangwanq.zyyt','王万庆','a44b60ba12a5776418748d88dadd88b190c4bb052b6c7b9fd28645e2ea7ee470','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1de100a4811f1b4703dedefe5afbc','zc.zyyt','朱苁','3f7a0e7fa41007aa8a70f4c6cb543e1e744a7d6116af8db156bb90021fa39add','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1e04a0a4811f1b4703dedefe5afbc','shiyp.zyyt','石亚平','78cff1c02c48ac5e041b8f16eee237a02c792b6b05b1850888c7bf54dd0d8bc9','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1e4280a4811f1b4703dedefe5afbc','xiaoll.zyyt','肖莉莉','3300ae4fefcf5853e877efda587e34576812ad2f90212c3936f82f2f7e9fba58','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1ed7e0a4811f1b4703dedefe5afbc','liuz.zyyt','刘真','1dd0adc78296fd97c8758052c52e54249d5cdd7a0c37bb232736f0a735fc4991','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1f31e0a4811f1b4703dedefe5afbc','yij8888.zyyt','伊进','4833f11631f36c7846c9d3eed620a09d5c1f9c9961f6fa785df1abd7fbf9e718','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1f8e60a4811f1b4703dedefe5afbc','panzhh.zyyt','潘震环','7276daefd15a887cbe4d4fecd92e51696eb6dcc99cd242cf83544947c1bcb830','1782688191478808577',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d1fecc0a4811f1b4703dedefe5afbc','zhangjh1124.zyyt','张佳卉','db222d1318585f0d4f42553b8434ebaad52c5f6052f9cecf023dcfa0f61aa6d8','1782687929246728194',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d205de0a4811f1b4703dedefe5afbc','xuz.zyyt','徐真','47ac970c889724b8969ce7dbab203be011deffc88ef99ffe4678d698ce9c77a5','54ca3e120a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d20b920a4811f1b4703dedefe5afbc','lhm01.zyyt','刘怀民','f62b9185b4cf4c36a7101d0d362beeee405cf9d8798eed6433015d5663cc5a22','54ca3e120a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d210ce0a4811f1b4703dedefe5afbc','longf.zyyt','龙飞','6bd4ace07f7f4de1a98ab43858d687a32687e76d801a15037dfb4ca8d83314f8','1864564601356562434',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d217400a4811f1b4703dedefe5afbc','baifh.zyyt','白福海','f56749afdf22c99dfbc830e27a5b41ecbe9825b787220906a191ba1f9b3e4dbf','54ca3e120a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d21b640a4811f1b4703dedefe5afbc','liqinglong.zyyt','李青龙','63ad86d9b4f10eaf86fc068343e7f5adbb42a399fcb9fe191a2cbfcc14999f30','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d220aa0a4811f1b4703dedefe5afbc','lich95.zyyt','李畅','e54c707374554e9f1ce1333b783841d6dbd43fd7ed71e465073e90cb04086d51','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d222d00a4811f1b4703dedefe5afbc','maoam.zyyt','毛爱梅','40ab0eede254d090ac82ef9b8426d7bc7d26d09bd1b0f674e3f30d0a6f073da7','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d2250a0a4811f1b4703dedefe5afbc','zhaom.zyyt','赵明','8d7f67bdd5e855be0ba3e0759a01eccabe12b33e28f4a3731f74cef8e45f26b4','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d227e40a4811f1b4703dedefe5afbc','llgs.zyyt','刘玲','39a9e52554eb37c6946a288902d7dca1213e9c2028d5ebeadea0f2bcc889065c','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d22b2c0a4811f1b4703dedefe5afbc','zhanghy01.zyyt','张海英','cbb6f77af155b888a51a889f6e574bca53a7627830d263fc11ced3226172fe2f','54ca3e120a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d22da20a4811f1b4703dedefe5afbc','zhaoqiyu6666.zyyt','赵齐宇','cfde971d3507856f130871beed2487f16ff32ce9119062f0a097f90b49cdcd63','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d230360a4811f1b4703dedefe5afbc','gongp06.zyyt','龚攀','9a8e3a30920d5bf429ccef6118dbe69b49ea2da6935edc0e16dbfd7e7a35dcac','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d233380a4811f1b4703dedefe5afbc','wxm.zyyt','王晓梅','ca01e9d22b3e82a348c44589939713876824f2ebc55d3324f147b0ad2308dc8a','54ca3e120a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d235400a4811f1b4703dedefe5afbc','panhj.zyyt','潘怀景','7e88306fdc6d512c76b670847d3aadc4407124e4fe184957533a3550e2f235b2','1864564601356562434',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d237d40a4811f1b4703dedefe5afbc','liup.zyyt','刘平','2f488d799cba33c3dfaaf792fbbd2d94dd8f1740296ca5133a824df8f23a2855','1864564601356562434',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d23a5e0a4811f1b4703dedefe5afbc','lifw6837.zyyt','李方微','691b5e8c9cb186024e661cd03afad0364cfc1c56df839ce91aaea34f03c47a21','54ca3e120a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d23c520a4811f1b4703dedefe5afbc','cyscyjf.zyyt','易建锋','5d5e0bc246dccc4754af1c8f2b0406e9bff46853e071ef76e33b844f2402d8eb','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d23ebe0a4811f1b4703dedefe5afbc','hanyr06.zyyt','韩彦睿','36be1a10a121cc4030bac57095d03f9baf91ad56c1c100a842de118076759465','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d240f80a4811f1b4703dedefe5afbc','lzh919.zyyt','李子涵','52046b0fa70b9e6204429419e6bb259ea25b008f6edb07773892666ee87ec80c','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d243e60a4811f1b4703dedefe5afbc','guohw.zyyt','郭海伟','035cc284103547258737063f52942968829e88e7f6de1d5f411cf3d6b9ce964a','1864564601356562434',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d245da0a4811f1b4703dedefe5afbc','xieyjczx.zyyt','谢遥','a078ae75278fc0407992a512226da0732f9cac6775c7d82037597c9cdb537266','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d2499a0a4811f1b4703dedefe5afbc','haon.zyyt','郝宁','a0474fd6421c979330d5daf6d7deeb5a981ffd9a8a9792b18b40e91fd456e14f','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d24bfc0a4811f1b4703dedefe5afbc','wanghygd.zyyt','王海洋','5d5826c8b80a8b650a80088c733b6fe8716f51956d3a22fbea0e3bc96e461c26','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d24e2c0a4811f1b4703dedefe5afbc','zhengl28332.zyyt','郑丽','fee686b341837ff9a988078c0e4c50af021ab11c071ba919cb4fdae7c9ba8f5c','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d2505c0a4811f1b4703dedefe5afbc','kangw01.zyyt','康玮','37ecba7eac070e4c05749c41f5cd199fbc873fa4556686041109beed60b0269a','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d252960a4811f1b4703dedefe5afbc','lh09.zyyt','李辉','6a40f28770cf18f56c2ecc12e521801abcd3a24edf1bdb3f8f82a9c1a14dc72c','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d254b20a4811f1b4703dedefe5afbc','yangjw9985.zyyt','杨嘉薇','165a2d8a6e84ec178f58a9bf803b65f37317a61d705eec65bc17da9270f590c4','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d256ce0a4811f1b4703dedefe5afbc','lh.zyyt','刘华','f90a5ff5cd1e1596a34d38fef6d3e8b2d4d1f3e1786ae0f0358282dcec462334','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d258f40a4811f1b4703dedefe5afbc','scj06.zyyt','商程锦','2ff020704e08dd7c47db436f4f82e3c935ff294981ad2553e212466a6a89e985','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d25b420a4811f1b4703dedefe5afbc','gengsy.zyyt','耿淑亚','084a4db49120cab98bc9e5b2754251c6aae6e3cde66c66e9d4cc5b77e90386d7','1782688082129108993',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d25d5e0a4811f1b4703dedefe5afbc','hcy.zyyt','何成彦','5386130e6e3b315b945776b6a8edf11abd172cf5cfde140640ce9a45b4769283','1782687929246728194',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d25f980a4811f1b4703dedefe5afbc','mengyp.zyyt','蒙玉平','c2f103f3fedba7bbc34fdb7b72317e1060b41e032b51563dc46801175deb9442','1782688082129108993',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d261be0a4811f1b4703dedefe5afbc','zenglan.zyyt','曾兰','77e82f36b21ee736d89a582f77e8ea016fec88e97792f9067f1b874748058022','1782688082129108993',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d263ee0a4811f1b4703dedefe5afbc','zhangry.zyyt','张瑞英','91ba1390684bbc62e18e8904e0188037f849527497956a0a9df44b22fec93e53','1782688082129108993',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d2661e0a4811f1b4703dedefe5afbc','wangsr.zyyt','王守认','18ea08434bc049c6b2107180985154228cfe453d075f9703384a2f19d1fae98d','1782688082129108993',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d268580a4811f1b4703dedefe5afbc','zhouzl05.zyyt','周子立','81a3ab15574cb147b4c1bc76ab01382fc5cbc51b5e861c2c5f81493651ce52f8','1782688082129108993',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d26a920a4811f1b4703dedefe5afbc','duxiangm.zyyt','杜香梅','297ac107fe937eaf33e3a423fb93a7b299713a2005a14214a2869111f8cb24a8','1782688082129108993',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d26cfe0a4811f1b4703dedefe5afbc','caomeng.zyyt','曹梦','1de431e882fefe23f7b88cac70b46d253410a4bad62967ca466fcb54d58d8948','1782688082129108993',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d26f6a0a4811f1b4703dedefe5afbc','weijr.zyyt','魏进荣','74cec4bd757a53a7b8f9d7d929a5741becbb8ca1c8a193c23857bf0c3717af71','1782688082129108993',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d2719a0a4811f1b4703dedefe5afbc','mabo.zyyt','马博','9510a1e020c7f33b3a1bea117e374df9672a4f9a039d6fb65d3859bdb23d5bd0','1782688082129108993',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d2738e0a4811f1b4703dedefe5afbc','hecg.zyyt','贺春光','555d5f53d97c9a25516d8ebee590f30ae3263a653f360477c1170eb90273d41a','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d27b360a4811f1b4703dedefe5afbc','lij1201.zyyt','李静','5e1fe5394726469b99b30a11c2213f7f5d55a69228954cc0cb97bb20afc977a2','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d27dd40a4811f1b4703dedefe5afbc','wk19980204.zyyt','韦凯','7bb0db0bdaa3d8e0f475b842202e47b4df361693c632c832a912dc005297c422','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d280220a4811f1b4703dedefe5afbc','wangcr.zyyt','王朝瑞','f8d11340db121c88fe10096729232d7a7e589fb72ae9788308942106d5f14159','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d32d9c0a4811f1b4703dedefe5afbc','liynan.zyyt','李雅男','a741c0e51b8aab65930f627016ee4c32a8687f7eefa0ab2c5496dfbab80f693a','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d332920a4811f1b4703dedefe5afbc','sundan.zyyt','孙丹','842df53345adb4686442b4a20b940ca2b8a3eb1919802b68b6f3528b1b4130c9','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d336a20a4811f1b4703dedefe5afbc','gongwh.zyyt','龚文慧','b1e5f7f88741b68716e16d85923fe76f24bf984a01250625e294f8a658be0e59','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d33af80a4811f1b4703dedefe5afbc','renchsh5016.zyyt','任重山','23e29cecd0cd8e51a1062c569437af1d88364ca5b2baaf07c5638437bf72d8a3','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d33f580a4811f1b4703dedefe5afbc','zhangmm06.zyyt','张蒙蒙','ee5b8fa71a11576ea93d57ca98c6a0d48eacf4ed692ab8ae982ce7965c2286ab','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d343540a4811f1b4703dedefe5afbc','lvdsh06.zyyt','吕端士','2440fb9f8db1bd08d5b7d91715348453f131caee28ca40c29386f8f60371f79e','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d347460a4811f1b4703dedefe5afbc','liur.zyyt','刘蓉','e9c88c5380e38081ab617853b56d0ff350f0dcbb241e8ce14bee6ddee8e5dea0','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d34b600a4811f1b4703dedefe5afbc','yukl89486.zyyt','于楷麟','107b0bb19f5f3ac36cfaa982328bd936075aed416d80aab332295c483496fc57','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d34fb60a4811f1b4703dedefe5afbc','zhangda98.zyyt','张德傲','86b54eac7539f67db964238835a039c22385deb817da5d97c837e97bf3264fa4','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d354f20a4811f1b4703dedefe5afbc','marj.zyyt','马瑞婧','5f3edcaa4daf61bb87b02378c4a53ec20e456d39f8a8e1a6ead83f2cd45aef46','54ca3cc80a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3584e0a4811f1b4703dedefe5afbc','shixy0501.zyyt','史晓阳','f19a938936d8df87cd1f5edc9b466a10c9e5c542600c00d3ac78a8b6ccc568f2','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d35c860a4811f1b4703dedefe5afbc','chenk06.zyyt','陈凯','016f0f13b1b576363698e7ec069140fe80f3e4fe3604c65fda7b2654078b8149','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d362b20a4811f1b4703dedefe5afbc','wangb545.zyyt','王波','fdbe35b846fae8689d634b61b82d629002fda32e275b5f0931c083dd425cc0f3','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d367ee0a4811f1b4703dedefe5afbc','zhoujcy04.zyyt','周敬','444b676798d0eb110a5eeee370172de3fef69c2192b9ac65012a2fef480a9925','1864564601356562434',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d36bf40a4811f1b4703dedefe5afbc','shenqsh6789.zyyt','申青山','f059a79d894019e975a6a5d8db9a62126683528f69720beb2e246d641d1c03d6','1782688082129108993',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d370680a4811f1b4703dedefe5afbc','yangshl9527.zyyt','杨世磊','ff039e9a52cc730d2c67e7215e34ed118b61e3ad05df397e56b179239f1ed093','1782688082129108993',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3754a0a4811f1b4703dedefe5afbc','fanky.zyyt','范凯阳','621c5dffa20553d798ace3afcbb2daaaa6c430b9c44870dd39aaf0d013a56930','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d379f00a4811f1b4703dedefe5afbc','lixk3321.zyyt','李肖珂','577f63ec2371f6682af7c00bcbaf7ab6516950d4b1f73c691367cfd9b88f1a31','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d37e320a4811f1b4703dedefe5afbc','lizh8698.zyyt','李真','fcff0e43a570f83ec948269aaf69d2c1d94a45b9cfbe7c5d6852a88bd498df87','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d382880a4811f1b4703dedefe5afbc','zhangzq2970.zyyt','张紫乾','bfd9ad5b40b4d22aca9eff9ec6ceb171fb6faa9b87ff0ae576f4cd23db6d3fad','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d388be0a4811f1b4703dedefe5afbc','jiaqiuqiu.zyyt','贾秋璇','2a20f8e1b230bc3fcdeafeabc8ce4a06c00a7294ed16482a90b64bbd5b2bdb0e','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d38d500a4811f1b4703dedefe5afbc','qixy888.zyyt','祁欣雨','5b0d09eba60fdcffc8a1f537610ada086a7d3daa8f55d3abd5c1c7863d65e4ed','1782687929246728194',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d391e20a4811f1b4703dedefe5afbc','lizhelin1998.zyyt','李哲林','e4915a495d75b6a54363ef47db9d027d1edeb60cb0b9746383b01761a6eb1863','1782688082129108993',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d396560a4811f1b4703dedefe5afbc','duzhhjczx.zyyt','杜志宏','baafe7558f61cfdd8e3ce612fe78c09e49c7c0fb8a6d5a1613d4230cb0cf2f94','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d39aca0a4811f1b4703dedefe5afbc','yanmy296','燕梦莹','9f24feccea1294021aead0f554739336aec8f460eeb2b73ba78f22dd94c28ec5','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d39f020a4811f1b4703dedefe5afbc','liuxy1366','刘心怡','8bc77045de1f219b396d5365f6b81cce7ec040fa1a2db3c27b68145705f294bd','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3a4160a4811f1b4703dedefe5afbc','qinshh8312','秦顺骅','22e2b848f7eac1e3a5e106c719b5f54ead3a2d167aa929a0b306ea12e0eec722','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3aa380a4811f1b4703dedefe5afbc','wangy0114.zyyt','王瑜','bcd6f9ce82321ad7a13d8f8ea6e40b3fe9013fdec166c2b6921f63ccd385f0ad','1782687929246728194',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3ae7a0a4811f1b4703dedefe5afbc','yangzhihua.zyyt','杨智华','5662e66e3918d6e17d06c11ed25b549d8c52762b21e9e841c1ed3db78bc511ec','1782687843498377217',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3b2f80a4811f1b4703dedefe5afbc','niuja.zyyt','牛佳安','944577ee8cc4d71666f191c2a310712795332aa18ab2f008387b82535b67a988','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3b7c60a4811f1b4703dedefe5afbc','shixw06','石信望','59013883736b4c1ee2758a39a6eb2a3e4f334299093ceaaace21f07f269337cb','1795626878822809601',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3bb9a0a4811f1b4703dedefe5afbc','zhaoxy4493.zyyt','赵雪雅','e5c65ffd2972d8105040d7ab98d138035a2bfd73427dac5c92991a8d490fa0b1','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3c00e0a4811f1b4703dedefe5afbc','guoza1230.zyyt','郭子昂','08aa1fe28313f42ac1be921e62a20aabed48b0e8b814c3d0126794324e947d82','1712027221975179266',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3c4320a4811f1b4703dedefe5afbc','likaige3909','李凯歌','af01cc2c2bb0533eea8d5de92f8736637703514798aec7fbaeb2a1c87663fc32','1782687751391461377',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3c90a0a4811f1b4703dedefe5afbc','wangtao01.zyyt','王涛','6f97c0689721bbe71ae18f2f701762fecce36cee381fade00108e3bf1fe4858d','1782688314636156929',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3cd1a0a4811f1b4703dedefe5afbc','konghw.zyyt','孔红委','b14237433f64629a4941aea2062d7957fbb88df84144bdb900ade99bca63f19f','1712027221975179266',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3d1ac0a4811f1b4703dedefe5afbc','liy032.zyyt','李杨','6538f4f11db8da72341489f92dca6acf804f49f1cd12a14bb82477c66a49ec00','1782687929246728194',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3d5bc0a4811f1b4703dedefe5afbc','zhugx222.zyyt','朱庚雪','b8b476d4ed6e1b011b965ac48a1fad0b4768b932eebf15e5bcc737ecfdb0cfef','1782687929246728194',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3da260a4811f1b4703dedefe5afbc','lishiz.zyyt','李士铮','2ecbe070ed61dc0d8097c49174952432eaa00f9f7210adbd185d25c15b785f18','1782688314636156929',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3de2c0a4811f1b4703dedefe5afbc','luxingyc.zyyt','鲁欣','bb457ec743848cda243fa659b36f1910dc832d73b392f431f6d307d4ea807e20','1782688314636156929',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3e2c80a4811f1b4703dedefe5afbc','wangmj6690.zyyt','王铭江','639d6daf9f08da3ab750bcf4a4111f587eb48635523f4c65f041cfb7361a489f','54ca3e120a4811f1b4703dedefe5afbc',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3e6a60a4811f1b4703dedefe5afbc','tianr06.zyyt','田瑞','e206bc317f2f4705096cc7ab6c6c3ccf734b5d0b7e018814bdb2689b89428670','1782687929246728194',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3eb560a4811f1b4703dedefe5afbc','guojy06.zyyt','郭瑾懿','e4378a0a36b6e49a1d5b64d856609b493f113f5a378d8458409bd650502ac46b','1782687929246728194',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d3f9de0a4811f1b4703dedefe5afbc','dingxj06.zyyt','丁秀鹃','97665ab8325ff5d844113e4f07678e71f25932c55c942abdd4a104b503130b8b','1782688314636156929',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d400c80a4811f1b4703dedefe5afbc','trqch.zyyt','陈惠','254981aa29940e576be06586d8bf1f6b5fbb60731071c1509d2991ea23b04c6c','1782688314636156929',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d404b00a4811f1b4703dedefe5afbc','guol1029.zyyt','郭琳','6457105321b843f80e8b454d21a5247a181134958fb8a761957b64de50447715','1782688314636156929',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d407120a4811f1b4703dedefe5afbc','chenxd77.zyyt','陈晓丹','bd0e826def9f662171990de0a9cce4dd462ab3eb4e652d4e94e912890a14ee0e','1782687929246728194',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d4094c0a4811f1b4703dedefe5afbc','wangzhifeng.zyyt','王志锋','13bf2583cd3bfa0aa708b180bfa310bcf945189ef2ad48f05035dab20cc90798','1782687929246728194',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d40b720a4811f1b4703dedefe5afbc','gaolp3301.zyyt','高禄鹏','f59081bc0eceab29005f8e2a9953160e1fb14cada85814ed61521674d0d6336b','1782687929246728194',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d40d980a4811f1b4703dedefe5afbc','zhongqi.zyyt','钟琪','11478ce35b196990a07b5e9c6e76811f57a9338a1bff0f1d074a10f1f2894ded','1782687929246728194',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d40faa0a4811f1b4703dedefe5afbc','chengling.zyyt','程羚','4a7f32803bb653056377074b0ab4839991c9fba1a58e79264a81b8cd559f1486','1782687929246728194',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d411ee0a4811f1b4703dedefe5afbc','guoyh0916.zyyt','郭雨涵','2a89695baa0e1c364f82af52294f49d68b1793186e60150a6f149c05cc44c2a2','1782688314636156929',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d4143c0a4811f1b4703dedefe5afbc','lyf1998.zyyt','赖一夫','73bb27891e14497952c056095b429fdaeddc8d9159d331a08f651af789153e4b','1782688314636156929',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d416620a4811f1b4703dedefe5afbc','renzr0521.zyyt','任子瑞','2298d8a64ae30b6b9749fadb756cbe118a6e28dd332d62803630ffa480b02777','1782687929246728194',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d418ec0a4811f1b4703dedefe5afbc','fanchl66.zyyt','范成龙','b57ed74512f4a4bd36fb103ae48702af09e855ccc987950d72ad3bcd35eb5a22','1782688314636156929',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d41b120a4811f1b4703dedefe5afbc','lcsy.zyyt.zyyt','林程思源','23ddfdf820cf5068a030b8f60dfa1d6af723268c94c12751cb3da2af8af5ff84','1782688314636156929',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d41d920a4811f1b4703dedefe5afbc','cy03xuc.zyyt','徐聪','d1fae3b8f51ef41fd17e782129da655b3e0270ca9cefc258b20aef9b67b6f2c5','1782688314636156929',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d420bc0a4811f1b4703dedefe5afbc','lunx06.zyyt','卢乃昕','a9fc3b5266194998876ccd800ed05fbba6ee303f4f78b7304355e01ebf933665','1782687929246728194',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d424040a4811f1b4703dedefe5afbc','tangming.zyyt','唐明','e41cd6b26008af7aa2407cc5286cb5ed8160ac97aa41388d18a3d408e3c89f18','1782687929246728194',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000'),('e5d427600a4811f1b4703dedefe5afbc','huangjh8707.zyyt','黄嘉昊','9e3ec7435e2d4a20fe404f1379924e3b9ec4ec3b71145236426c2eee7edc4c44','1782687929246728194',NULL,NULL,'ENABLED',NULL,'2026-02-15 16:32:43.000','2026-02-15 16:32:43.000');
/*!40000 ALTER TABLE `sys_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_user_post`
--

DROP TABLE IF EXISTS `sys_user_post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_user_post` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_user_post_userId_postId_key` (`userId`,`postId`),
  KEY `sys_user_post_postId_idx` (`postId`),
  CONSTRAINT `sys_user_post_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `sys_post` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sys_user_post_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_user_post`
--

LOCK TABLES `sys_user_post` WRITE;
/*!40000 ALTER TABLE `sys_user_post` DISABLE KEYS */;
/*!40000 ALTER TABLE `sys_user_post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_user_role`
--

DROP TABLE IF EXISTS `sys_user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_user_role` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roleId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_user_role_userId_roleId_key` (`userId`,`roleId`),
  KEY `sys_user_role_roleId_idx` (`roleId`),
  CONSTRAINT `sys_user_role_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sys_user_role_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_user_role`
--

LOCK TABLES `sys_user_role` WRITE;
/*!40000 ALTER TABLE `sys_user_role` DISABLE KEYS */;
INSERT INTO `sys_user_role` (`id`, `userId`, `roleId`, `createdAt`) VALUES ('cmlerwwo90005tcgp0a7dc33f','cmlerwwo60003tcgpe5qngz9l','cmlerwwnu0000tcgpi7wc7n9i','2026-02-09 06:10:50.601'),('cmlerwwod0008tcgpjcgkqejn','cmlerwwob0006tcgpw00mlyrl','cmlerwwnz0001tcgpvqi67vv4','2026-02-09 06:10:50.605'),('cmlerwwoi000btcgpppd3nnzh','cmlerwwof0009tcgpqy3mm1xu','cmlerwwo20002tcgp35ttua0t','2026-02-09 06:10:50.610');
/*!40000 ALTER TABLE `sys_user_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `displayName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('ADMIN','PM','MEMBER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEMBER',
  `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_username_key` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `WbsTask`
--

DROP TABLE IF EXISTS `WbsTask`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WbsTask` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `projectId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level1Stage` enum('启动','规划','执行','验收') COLLATE utf8mb4_unicode_ci NOT NULL,
  `level2WorkPackage` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `taskName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `taskDetail` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deliverable` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `taskOwner` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plannedStartDate` datetime(3) NOT NULL,
  `plannedEndDate` datetime(3) NOT NULL,
  `currentStatus` enum('未开始','进行中','已完成','延期') COLLATE utf8mb4_unicode_ci NOT NULL,
  `isCritical` enum('是','否') COLLATE utf8mb4_unicode_ci NOT NULL,
  `riskHint` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkedMasterTask` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `wbsCode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parentTaskId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `predecessorTaskIds` json DEFAULT NULL,
  `milestoneId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sortOrder` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `WbsTask_projectId_idx` (`projectId`),
  KEY `WbsTask_projectId_parentTaskId_idx` (`projectId`,`parentTaskId`),
  KEY `WbsTask_projectId_wbsCode_idx` (`projectId`,`wbsCode`),
  KEY `WbsTask_milestoneId_idx` (`milestoneId`),
  KEY `WbsTask_parentTaskId_fkey` (`parentTaskId`),
  CONSTRAINT `WbsTask_milestoneId_fkey` FOREIGN KEY (`milestoneId`) REFERENCES `Milestone` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `WbsTask_parentTaskId_fkey` FOREIGN KEY (`parentTaskId`) REFERENCES `WbsTask` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `WbsTask_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `WbsTask`
--

LOCK TABLES `WbsTask` WRITE;
/*!40000 ALTER TABLE `WbsTask` DISABLE KEYS */;
INSERT INTO `WbsTask` (`id`, `projectId`, `level1Stage`, `level2WorkPackage`, `taskName`, `taskDetail`, `deliverable`, `taskOwner`, `plannedStartDate`, `plannedEndDate`, `currentStatus`, `isCritical`, `riskHint`, `linkedMasterTask`, `createdAt`, `updatedAt`, `wbsCode`, `parentTaskId`, `predecessorTaskIds`, `milestoneId`, `sortOrder`) VALUES ('100b221b-3eb3-4d3c-9310-8cae57bd8ffd','4ccf3a07-e37e-471d-b327-5ed6470a7705','执行','后端实现','完成新增图片上传功能能，3 月底上线运行后端实现','完成新增图片上传功能能，3 月底上线运行相关接口、服务逻辑、权限或校验能力的开发与自测。','新增图片上传功能能，3 月底上线运行后端实现记录','系统管理员','2026-03-15 00:00:00.000','2026-03-16 00:00:00.000','未开始','是',NULL,NULL,'2026-03-12 11:33:43.694','2026-03-12 11:33:43.694','3.2.2',NULL,'[]',NULL,3002002),('3345c314-4dc7-46f4-acf0-d38996026513','058ca7fd-3fc8-4b42-bddc-02c33a4edbed','执行','联调测试','完成新增 AI 场景，将宣贯内容、政策内容、联系电话等形成知识库，做到用户能与 AI 对话，获取相关信息联调与回归测试','覆盖主流程、异常流程和边界条件并关闭阻断缺陷','联调记录、测试报告','徐聪','2026-03-12 00:00:00.000','2026-03-14 00:00:00.000','未开始','否',NULL,NULL,'2026-03-03 06:18:45.801','2026-03-03 06:18:45.801','3.4.1',NULL,'[]',NULL,3004001),('50b28251-6e09-497b-bd73-7de7ada97668','4ccf3a07-e37e-471d-b327-5ed6470a7705','规划','集成联调','批量任务-01','测试批量提交','记录','系统管理员','2026-03-01 00:00:00.000','2026-03-05 00:00:00.000','未开始','否',NULL,NULL,'2026-03-01 08:42:30.219','2026-03-01 08:42:30.219','1.4',NULL,'[\"bf3025c3-f071-4363-a468-2da996dc9768\"]',NULL,NULL),('605366af-aca4-4fe9-8e9e-73dc95631333','4ccf3a07-e37e-471d-b327-5ed6470a7705','执行','前端实现','完成新增订单导出功能前端实现','完成新增订单导出功能相关页面入口、交互、展示或表单改造，并确保主流程可操作。','新增订单导出功能前端实现记录','系统管理员','2026-03-19 00:00:00.000','2026-03-20 00:00:00.000','未开始','否',NULL,NULL,'2026-03-12 11:31:52.536','2026-03-12 11:31:52.536','3.2.1',NULL,'[]',NULL,3002001),('6a92c6a2-a9e2-4543-b401-afdf30d1164c','4ccf3a07-e37e-471d-b327-5ed6470a7705','验收','事项跟进','跟进参加公共事业部的需求调研会会议结论','跟踪参加公共事业部的需求调研会会议结论的责任分工、完成情况和后续动作。','参加公共事业部的需求调研会跟进记录','系统管理员','2026-03-12 00:00:00.000','2026-03-12 00:00:00.000','未开始','否',NULL,NULL,'2026-03-12 12:21:19.225','2026-03-12 12:21:19.225','4.2.1',NULL,'[]',NULL,4002001),('6fbfe245-d5e7-435a-a53e-534ad6651b47','058ca7fd-3fc8-4b42-bddc-02c33a4edbed','执行','页面改造','完成是宣传图片的页面化动态交互化的改造','先用 AI 测试 EAP 心理咨询的页面化动态交互化的改造','页面','徐聪','2026-02-26 00:00:00.000','2026-02-26 00:00:00.000','未开始','否',NULL,NULL,'2026-02-26 06:10:00.252','2026-02-26 10:14:01.013',NULL,NULL,NULL,NULL,NULL),('828af583-8193-4c9a-acfc-39df050312d2','4ccf3a07-e37e-471d-b327-5ed6470a7705','执行','后端实现','完成新增订单导出功能后端实现','完成新增订单导出功能相关接口、服务逻辑、权限或校验能力的开发与自测。','新增订单导出功能后端实现记录','系统管理员','2026-03-17 00:00:00.000','2026-03-18 00:00:00.000','未开始','是',NULL,NULL,'2026-03-12 11:31:52.536','2026-03-12 11:31:52.536','3.1.1',NULL,'[]',NULL,3001001),('8c95ce37-cd17-400f-9ad4-4ca36fc546b1','4ccf3a07-e37e-471d-b327-5ed6470a7705','执行','会前准备','准备参加公共事业部的需求调研会会议材料','收集参加公共事业部的需求调研会所需材料、问题清单和对齐事项，完成会前准备。','参加公共事业部的需求调研会会议材料','系统管理员','2026-03-12 00:00:00.000','2026-03-12 00:00:00.000','未开始','否',NULL,NULL,'2026-03-12 12:21:19.225','2026-03-12 12:21:19.225','3.3.1',NULL,'[]',NULL,3003001),('9098add6-9cc6-4d13-b014-85d44c66b6c1','058ca7fd-3fc8-4b42-bddc-02c33a4edbed','执行','需求分析','完成收集社保业务 2 个流程业务','收集门诊特效药、亡故材料收集业务流程的业务','需求材料','郭雨涵','2026-02-25 00:00:00.000','2026-02-25 00:00:00.000','延期','是',NULL,NULL,'2026-02-26 02:09:15.188','2026-02-26 10:14:01.883',NULL,NULL,NULL,NULL,NULL),('90b0e5ab-cac8-496e-ba41-a983bdae9709','4ccf3a07-e37e-471d-b327-5ed6470a7705','验收','验证上线','验证新增订单导出功能功能并上线确认','完成新增订单导出功能相关功能自测、上线检查，并记录上线后需要关注的反馈项。','新增订单导出功能验证记录','系统管理员','2026-03-15 00:00:00.000','2026-03-16 00:00:00.000','未开始','否',NULL,NULL,'2026-03-12 11:31:52.536','2026-03-12 11:31:52.536','4.1.1',NULL,'[]',NULL,4001001),('9ba2700f-1af7-4a5b-875e-678014a30eae','4ccf3a07-e37e-471d-b327-5ed6470a7705','规划','方案设计','梳理新增订单导出功能实现方案','结合现有系统结构明确新增订单导出功能的实现思路、影响范围和改动路径。','新增订单导出功能方案说明','系统管理员','2026-03-13 00:00:00.000','2026-03-14 00:00:00.000','未开始','否',NULL,NULL,'2026-03-12 11:31:52.536','2026-03-12 11:31:52.536','2.4.1',NULL,'[]',NULL,2004001),('a5ad4410-f62b-482f-a9c5-558be24acf14','4ccf3a07-e37e-471d-b327-5ed6470a7705','规划','议题确认','确认参加公共事业部的需求调研会议题与参会范围','明确参加公共事业部的需求调研会的会议目标、参会人员、待决策事项和输出要求。','参加公共事业部的需求调研会会议准备清单','系统管理员','2026-03-12 00:00:00.000','2026-03-12 00:00:00.000','未开始','是',NULL,NULL,'2026-03-12 12:21:19.225','2026-03-12 12:21:19.225','2.5.1',NULL,'[]',NULL,2005001),('ba389ffd-2e88-4aa5-8bd8-367aeb370fb5','058ca7fd-3fc8-4b42-bddc-02c33a4edbed','执行','开发实现','完成新增 AI 场景，将宣贯内容、政策内容、联系电话等形成知识库，做到用户能与 AI 对话，获取相关信息功能开发与单测','完成核心代码实现并通过关键路径单元测试','代码提交记录、单测报告','徐聪','2026-03-09 00:00:00.000','2026-03-11 00:00:00.000','未开始','是',NULL,NULL,'2026-03-03 06:18:45.801','2026-03-03 06:18:45.801','3.3.1',NULL,'[]',NULL,3003001),('bf3025c3-f071-4363-a468-2da996dc9768','4ccf3a07-e37e-471d-b327-5ed6470a7705','规划','功能梳理与整合','梳理功能模块','梳理现有功能和入口','功能清单','系统管理员','2026-02-01 00:00:00.000','2026-02-10 00:00:00.000','进行中','是','跨部门协同','总表-001','2026-03-01 08:42:30.192','2026-03-01 08:42:30.238','1.1',NULL,'[]','b02e4a7b-5638-4c9a-ab74-f572d8560498',NULL),('c01306cb-0c6c-468b-8a1f-68b44ec0965f','4ccf3a07-e37e-471d-b327-5ed6470a7705','规划','集成联调','批量任务-02','测试批量提交','记录','系统管理员','2026-03-06 00:00:00.000','2026-03-12 00:00:00.000','未开始','否',NULL,NULL,'2026-03-01 08:42:30.219','2026-03-01 08:42:30.219','1.5',NULL,'[]',NULL,NULL),('d402c71a-2edb-488e-b382-a34eeb941785','4ccf3a07-e37e-471d-b327-5ed6470a7705','规划','需求确认','确认新增订单导出功能范围与完成口径','与需求提出方确认新增订单导出功能的范围、边界、优先级和完成口径。','新增订单导出功能确认记录','系统管理员','2026-03-11 00:00:00.000','2026-03-12 00:00:00.000','未开始','是',NULL,NULL,'2026-03-12 11:31:52.536','2026-03-12 11:31:52.536','2.3.1',NULL,'[]',NULL,2003001),('e66e8a84-b7d4-4eab-a22f-415549f690c8','90b6ab92-690d-442b-b675-e60deb40a10b','规划','功能梳理与整合','梳理功能模块','梳理现有功能和入口','功能清单','系统管理员','2026-02-01 00:00:00.000','2026-02-10 00:00:00.000','进行中','是','跨部门协同','总表-001','2026-03-01 08:39:18.761','2026-03-01 08:39:18.761',NULL,NULL,'[]',NULL,NULL),('f8c94bdf-c39e-4cb4-800b-db4ccb2eb725','4ccf3a07-e37e-471d-b327-5ed6470a7705','执行','会议执行','组织参加公共事业部的需求调研会会议沟通','组织参会方围绕参加公共事业部的需求调研会开展对齐、确认和决策沟通。','参加公共事业部的需求调研会会议纪要','系统管理员','2026-03-12 00:00:00.000','2026-03-12 00:00:00.000','未开始','否',NULL,NULL,'2026-03-12 12:21:19.225','2026-03-12 12:21:19.225','3.4.1',NULL,'[]',NULL,3004001);
/*!40000 ALTER TABLE `WbsTask` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-12 20:39:06
