import { DataScope, SysStatus } from "@prisma/client";
import { hashPassword } from "./auth.js";
import { prisma } from "./store.js";

const defaultRoles = [
  { roleCode: "ADMIN", roleName: "系统管理员", dataScope: DataScope.ALL, sort: 1 },
  { roleCode: "PM", roleName: "项目经理", dataScope: DataScope.CUSTOM, sort: 2 },
  { roleCode: "MEMBER", roleName: "项目成员", dataScope: DataScope.SELF, sort: 3 }
] as const;

const defaultUsers = [
  { username: "admin", displayName: "系统管理员", password: "Admin@123", roleCode: "ADMIN" },
  { username: "pm", displayName: "项目经理", password: "Pm@123456", roleCode: "PM" },
  { username: "member", displayName: "项目成员", password: "Member@123", roleCode: "MEMBER" }
] as const;

const defaultDicts = [
  { code: "projectType", name: "项目类型", options: ["视同收入", "A 类科研", "B 类科研", "C 类科研", "内部劳务", "外部劳务"] },
  { code: "year", name: "所属年度", options: ["2024", "2025", "2026", "2027", "2028", "2029", "2030"] }
] as const;

export async function ensureSystemSeedData() {
  for (const role of defaultRoles) {
    await prisma.sysRole.upsert({
      where: { roleCode: role.roleCode },
      update: {
        roleName: role.roleName,
        dataScope: role.dataScope,
        status: SysStatus.ENABLED,
        sort: role.sort
      },
      create: {
        roleCode: role.roleCode,
        roleName: role.roleName,
        dataScope: role.dataScope,
        status: SysStatus.ENABLED,
        sort: role.sort
      }
    });
  }

  const roleByCode = new Map(
    (
      await prisma.sysRole.findMany({
        where: { roleCode: { in: defaultRoles.map((item) => item.roleCode) } },
        select: { id: true, roleCode: true }
      })
    ).map((role) => [role.roleCode, role.id])
  );

  for (const user of defaultUsers) {
    const savedUser = await prisma.sysUser.upsert({
      where: { username: user.username },
      update: {
        displayName: user.displayName,
        passwordHash: hashPassword(user.password),
        status: SysStatus.ENABLED
      },
      create: {
        username: user.username,
        displayName: user.displayName,
        passwordHash: hashPassword(user.password),
        status: SysStatus.ENABLED
      }
    });

    const roleId = roleByCode.get(user.roleCode);
    if (!roleId) continue;
    await prisma.sysUserRole.upsert({
      where: { userId_roleId: { userId: savedUser.id, roleId } },
      update: {},
      create: { userId: savedUser.id, roleId }
    });
  }

  const officeCount = await prisma.sysOffice.count();
  if (officeCount === 0) {
    await prisma.sysOffice.create({
      data: {
        officeCode: "OFF-ROOT",
        officeName: "经营管理信息化研究所",
        officeType: "DEPARTMENT",
        status: SysStatus.ENABLED,
        sort: 1
      }
    });
  }

  for (const dict of defaultDicts) {
    const type = await prisma.sysDictType.upsert({
      where: { dictCode: dict.code },
      update: {
        dictName: dict.name,
        status: SysStatus.ENABLED
      },
      create: {
        dictCode: dict.code,
        dictName: dict.name,
        status: SysStatus.ENABLED
      }
    });

    for (let idx = 0; idx < dict.options.length; idx += 1) {
      const option = dict.options[idx];
      await prisma.sysDictValue.upsert({
        where: { dictTypeId_dictValue: { dictTypeId: type.id, dictValue: option } },
        update: { dictLabel: option, status: SysStatus.ENABLED, sort: idx + 1 },
        create: {
          dictTypeId: type.id,
          dictLabel: option,
          dictValue: option,
          sort: idx + 1,
          status: SysStatus.ENABLED
        }
      });
    }
  }
}
