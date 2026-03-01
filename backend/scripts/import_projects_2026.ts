import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ProjectInput = {
  projectName: string;
  projectType: string;
  year: number;
  leadDepartment: string;
  projectOwner: string;
  participants: string;
  background?: string;
  goal?: string;
  scope?: string;
  expectedOutcome?: string;
};

const projects: ProjectInput[] = [
  {
    projectName: "党建思维导图功能提升",
    projectType: "视同收入",
    year: 2026,
    leadDepartment: "党委组织部",
    projectOwner: "徐聪",
    participants: "徐聪、郭雨涵、郭琳",
    scope:
      "新增意见反馈回复闭环；优化内容更新管理；增强督办提醒和倒计时；优化统计分析；优化PC与移动端协同体验。",
    expectedOutcome: "形成闭环管理，提升处理效率和督办可视化能力。"
  },
  {
    projectName: "中原油田党委巡察工作信息系统提升项目",
    projectType: "视同收入",
    year: 2026,
    leadDepartment: "党委巡察办公室",
    projectOwner: "郭雨涵",
    participants: "郭雨涵",
    scope:
      "建设巡察工具、归档资料、整改督改、综合管理、工作动态等模块，覆盖资料归档、整改闭环、统计分析与信息发布。",
    expectedOutcome: "构建统一在线学习与巡察工作协同平台。"
  },
  {
    projectName: "中心财务预算系统功能提升",
    projectType: "视同收入",
    year: 2026,
    leadDepartment: "经营财务室",
    projectOwner: "丁秀鹏",
    participants: "丁秀鹏、郭琳",
    scope:
      "新增中心绩效考核管理、指标分解配置、预算编制审批、统计分析与查询、权限控制和数据安全机制。",
    expectedOutcome: "实现绩效与预算闭环管理，提升审批效率与数据治理能力。"
  },
  {
    projectName: "中原油田宣传成果共享平台",
    projectType: "视同收入",
    year: 2026,
    leadDepartment: "党委宣传部",
    projectOwner: "李士翰",
    participants: "李士翰、林程思源",
    scope: "建设宣传成果沉淀、共享与传播平台能力。",
    expectedOutcome: "统一宣传成果管理口径，提升复用和传播效率。"
  },
  {
    projectName: "环境保护税功能优化升级",
    projectType: "视同收入",
    year: 2026,
    leadDepartment: "财务资产部",
    projectOwner: "郭琳",
    participants: "郭琳、丁秀鹏",
    scope:
      "优化报表样式和分类汇总、异常值与典型任务监控、申报缴税规则、数据变更与回溯机制，并持续进行反馈优化。",
    expectedOutcome: "提高报税准确性与业务效率，形成阶段性优化成果。"
  },
  {
    projectName: "ERP及周边系统运行技术支持",
    projectType: "视同收入",
    year: 2026,
    leadDepartment: "财务资产部",
    projectOwner: "鲁欣",
    participants: "鲁欣、陈斌、郭琳、丁秀鹏、林程思源",
    scope:
      "保障ERP财务物流投资销售四模块稳定运行；覆盖权限与主数据管理、年结审计配合；支持ERS/MDG/TMS/FIRMS/AIC等周边系统；推进接口与字段梳理。",
    expectedOutcome: "保障核心系统稳定与合规运行，持续完成业务需求对接。"
  }
];

async function main() {
  let created = 0;
  let updated = 0;

  for (const item of projects) {
    const exists = await prisma.project.findFirst({
      where: { projectName: item.projectName },
      select: { id: true }
    });

    if (exists) {
      await prisma.project.update({
        where: { id: exists.id },
        data: item
      });
      updated += 1;
    } else {
      await prisma.project.create({ data: item });
      created += 1;
    }
  }

  const rows = await prisma.project.findMany({
    where: { projectName: { in: projects.map((p) => p.projectName) } },
    select: {
      id: true,
      projectName: true,
      year: true,
      leadDepartment: true,
      projectOwner: true,
      participants: true
    },
    orderBy: { projectName: "asc" }
  });

  console.log(JSON.stringify({ created, updated, total: rows.length, rows }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

