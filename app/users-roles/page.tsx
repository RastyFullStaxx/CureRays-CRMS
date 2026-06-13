export const dynamic = 'force-dynamic';

import {
  UsersRolesCommandClient,
  type PermissionAdminRow,
  type RoleAdminRow,
  type UserAdminRow,
} from '@/components/users/users-roles-command-client';
import { adminRoles, adminUsers, permissionRoles, permissionRows } from '@/lib/services/operational-page-service';

export default async function UsersRolesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const active = params?.tab === 'roles' ? 1 : params?.tab === 'permissions' ? 2 : 0;
  const userRows: UserAdminRow[] = adminUsers.map((user) => ({
    id: user.email,
    name: user.name,
    email: user.email,
    role: user.role,
    location: user.location,
    status: user.status,
    lastLogin: user.lastLogin,
    mfa: user.mfa,
  }));
  const roleRows: RoleAdminRow[] = adminRoles.map((role) => ({
    id: role.name,
    name: role.name,
    description: role.description,
    users: role.users,
    status: role.status,
    updated: role.updated,
  }));
  const permissionTableRows: PermissionAdminRow[] = permissionRows.map((row) => ({
    id: row.module,
    module: row.module,
    description: row.description,
    accessLevels: row.levels,
    ...Object.fromEntries(permissionRoles.map((role, index) => [role, row.levels[index]])),
  }));

  return (
    <UsersRolesCommandClient
      active={active}
      userRows={userRows}
      roleRows={roleRows}
      permissionRows={permissionTableRows}
      permissionRoles={permissionRoles}
    />
  );
}
