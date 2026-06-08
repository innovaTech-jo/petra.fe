import { Injectable } from '@angular/core';
import { PageResult, RoleDto, SearchParameters, UserRoleDto, UsersDto } from '../../core/models';
import { PrivilegeDto } from '../../core/models';
import { buildMenuPrivilegeSeed } from '../shared/menu-privilege-seed';
import { RoleSeedIds, buildDefaultRoles } from '../shared/role-seed';

const USERS_KEY = 'petraInternalLocalUsers';
const ROLES_KEY = 'petraInternalLocalRoles';

interface LocalUserRecord {
  user: UsersDto;
  roleIds: number[];
}

interface LocalRoleRecord {
  role: RoleDto;
  privilegeIds: number[];
}

@Injectable({ providedIn: 'root' })
export class InternalLocalStoreService {
  searchUsers(params: SearchParameters): PageResult<UsersDto> {
    let list = this.readUsers().map((r) => ({ ...r.user }));
    const kw = (params.keyword ?? '').trim().toLowerCase();
    if (kw) {
      list = list.filter(
        (u) =>
          (u.fullName ?? '').toLowerCase().includes(kw) ||
          (u.userName ?? '').toLowerCase().includes(kw) ||
          (u.email ?? '').toLowerCase().includes(kw)
      );
    }
    const count = list.length;
    const page = params.pagingParameters?.pageNumber ?? 1;
    const size = params.pagingParameters?.pageSize ?? 10;
    const start = Math.max(0, (page - 1) * size);
    return { collections: list.slice(start, start + size), count };
  }

  findUser(id: number | string): { user: UsersDto; roleIds: number[] } | undefined {
    const key = Number(id);
    const rec = this.readUsers().find((r) => r.user.id === key);
    if (!rec) return undefined;
    return { user: { ...rec.user }, roleIds: [...rec.roleIds] };
  }

  saveUser(user: UsersDto, roleIds: number[]): void {
    const safe: UsersDto = { ...user };
    delete safe.password;
    delete safe.newPassword;
    const all = this.readUsers();
    const i = all.findIndex((r) => r.user.id === user.id);
    const row: LocalUserRecord = {
      user: {
        ...safe,
        userRoles: roleIds.map(
          (roleId) =>
            ({
              id: 0,
              createdBy: 0,
              createdDate: new Date().toISOString(),
              roleId,
              userId: user.id
            }) as UserRoleDto
        )
      },
      roleIds: [...roleIds]
    };
    if (i >= 0) all[i] = row;
    else all.push(row);
    this.writeUsers(all);
  }

  createUser(user: UsersDto, roleIds: number[]): UsersDto {
    const id = this.nextUserId();
    const withId: UsersDto = { ...user, id };
    this.saveUser(withId, roleIds);
    return withId;
  }

  searchRoles(params: SearchParameters): PageResult<RoleDto> {
    this.ensureRoleSeed();
    let list = this.readRoles().map((r) => ({ ...r.role }));
    const kw = (params.keyword ?? '').trim().toLowerCase();
    if (kw) {
      list = list.filter(
        (role) =>
          (role.nameAr ?? '').toLowerCase().includes(kw) ||
          (role.nameOt ?? '').toLowerCase().includes(kw)
      );
    }
    const count = list.length;
    const page = params.pagingParameters?.pageNumber ?? 1;
    const size = params.pagingParameters?.pageSize ?? 10;
    const start = Math.max(0, (page - 1) * size);
    return { collections: list.slice(start, start + size), count };
  }

  getRoleById(id: number | string): RoleDto | undefined {
    this.ensureRoleSeed();
    const key = Number(id);
    const rec = this.readRoles().find((r) => r.role.id === key);
    if (!rec) return undefined;
    return {
      ...rec.role,
      rolePrivileges: rec.privilegeIds.map((privilegeId) => ({
        id: 0,
        createdBy: 0,
        createdDate: new Date().toISOString(),
        roleId: key,
        privilegeId
      }))
    };
  }

  saveRole(role: RoleDto, privilegeIds?: number[]): number {
    this.ensureRoleSeed();
    const id = role.id && role.id > 0 ? role.id : this.nextRoleId();
    const all = this.readRoles();
    const i = all.findIndex((r) => r.role.id === id);
    const mergedPriv = privilegeIds ?? (i >= 0 ? [...all[i].privilegeIds] : []);
    const safe: RoleDto = { ...role, id };
    delete safe.rolePrivileges;
    const row: LocalRoleRecord = {
      role: {
        ...safe,
        rolePrivileges: mergedPriv.map((privilegeId) => ({
          id: 0,
          createdBy: 0,
          createdDate: new Date().toISOString(),
          roleId: id,
          privilegeId
        }))
      },
      privilegeIds: mergedPriv
    };
    if (i >= 0) all[i] = row;
    else all.push(row);
    this.writeRoles(all);
    return id;
  }

  getAllPrivileges(): PrivilegeDto[] {
    return buildMenuPrivilegeSeed();
  }

  getAllUsers(): UsersDto[] {
    return this.readUsers().map((r) => ({ ...r.user }));
  }

  getAllRoles(): RoleDto[] {
    this.ensureRoleSeed();
    return this.readRoles().map((r) => ({ ...r.role }));
  }

  ensureSessionUserListed(session: UsersDto): void {
    const id = session.id;
    if (!id) return;
    if (this.readUsers().some((r) => r.user.id === id)) return;
    this.saveUser(
      {
        ...session,
        email: session.email ?? 'admin@petra.local',
        active: 1
      },
      [RoleSeedIds.admin]
    );
  }

  private ensureRoleSeed(): void {
    if (this.readRoles().length) return;
    const defaults = buildDefaultRoles();
    this.writeRoles(
      defaults.map((role) => ({
        role,
        privilegeIds: buildMenuPrivilegeSeed().map((p) => p.id).filter((x) => x > 0)
      }))
    );
  }

  private readUsers(): LocalUserRecord[] {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeUsers(records: LocalUserRecord[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(records));
  }

  private readRoles(): LocalRoleRecord[] {
    try {
      const raw = localStorage.getItem(ROLES_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeRoles(records: LocalRoleRecord[]): void {
    localStorage.setItem(ROLES_KEY, JSON.stringify(records));
  }

  private nextUserId(): number {
    const ids = this.readUsers().map((r) => r.user.id).filter((x) => x > 0);
    return ids.length ? Math.max(...ids) + 1 : 1;
  }

  private nextRoleId(): number {
    const ids = this.readRoles().map((r) => r.role.id).filter((x) => x > 0);
    return ids.length ? Math.max(...ids) + 1 : 100;
  }
}
