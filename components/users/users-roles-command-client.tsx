'use client';

import Link from 'next/link';
import { Children, type ReactNode, useMemo, useState } from 'react';
import { CheckCircle2, History, LockKeyhole, ShieldCheck, UserCog, UsersRound } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';

export type UserAdminRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  location: string;
  status: string;
  lastLogin: string;
  mfa: string;
};

export type RoleAdminRow = {
  id: string;
  name: string;
  description: string;
  users: number;
  status: string;
  updated: string;
};

export type PermissionAdminRow = Record<string, string | string[]> & {
  id: string;
  module: string;
  description: string;
  accessLevels: string[];
};

type UsersRolesCommandClientProps = {
  active: number;
  userRows: UserAdminRow[];
  roleRows: RoleAdminRow[];
  permissionRows: PermissionAdminRow[];
  permissionRoles: string[];
};

type StagedAccessChange = {
  id: string;
  target: string;
  change: string;
  note: string;
};

function AccessIcon({ level }: { level: string }) {
  if (level === 'full') return <Badge variant="success">Full</Badge>;
  if (level === 'edit') return <Badge variant="info">Edit</Badge>;
  if (level === 'view') return <Badge variant="default">View</Badge>;
  if (level === 'none') return <Badge variant="error">None</Badge>;
  return <span style={{ color: 'var(--color-text-muted)' }}>-</span>;
}

function accessTone(level: string): 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' {
  if (level === 'full') return 'success';
  if (level === 'edit') return 'info';
  if (level === 'view') return 'default';
  if (level === 'none') return 'error';
  return 'warning';
}

function StableStatGrid({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  const placeholders = Array.from({ length: Math.max(0, 4 - items.length) });

  return (
    <StatGrid min="184px">
      {items}
      {placeholders.map((_, index) => (
        <div
          key={`stat-placeholder-${index}`}
          aria-hidden="true"
          style={{ minHeight: 68, visibility: 'hidden' }}
        />
      ))}
    </StatGrid>
  );
}

function CommandPanel({
  title,
  eyebrow,
  children,
  action,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section
      className="clinical-surface"
      style={{
        padding: 'var(--space-card)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase" style={{ color: 'var(--color-text-muted)' }}>
            {eyebrow}
          </p>
          <h2 className="mt-1 text-base font-bold" style={{ color: 'var(--color-text)' }}>
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function UsersRolesCommandClient({
  active,
  userRows,
  roleRows,
  permissionRows,
  permissionRoles,
}: UsersRolesCommandClientProps) {
  const [selectedUserId, setSelectedUserId] = useState(userRows[0]?.id ?? '');
  const [selectedRoleId, setSelectedRoleId] = useState(roleRows[0]?.id ?? '');
  const [selectedModuleId, setSelectedModuleId] = useState(permissionRows[0]?.id ?? '');
  const [targetRole, setTargetRole] = useState(permissionRoles[0] ?? '');
  const [targetAccess, setTargetAccess] = useState('view');
  const [reviewNote, setReviewNote] = useState('Demo review: access change validated against role scope.');
  const [stagedChanges, setStagedChanges] = useState<StagedAccessChange[]>([]);

  const selectedUser = useMemo(
    () => userRows.find((user) => user.id === selectedUserId) ?? userRows[0],
    [selectedUserId, userRows]
  );
  const selectedRole = useMemo(
    () => roleRows.find((role) => role.id === selectedRoleId) ?? roleRows[0],
    [selectedRoleId, roleRows]
  );
  const selectedModule = useMemo(
    () => permissionRows.find((row) => row.id === selectedModuleId) ?? permissionRows[0],
    [permissionRows, selectedModuleId]
  );

  const stageChange = (target: string, change: string) => {
    setStagedChanges((current) => [
      {
        id: `${Date.now()}-${current.length}`,
        target,
        change,
        note: reviewNote.trim() || 'No review note entered.',
      },
      ...current,
    ].slice(0, 5));
  };

  const accessLevels = ['full', 'edit', 'view', 'none', 'na'];
  const tabItems = [
    { key: 'users', label: 'Users', href: '/users-roles', count: userRows.length },
    { key: 'roles', label: 'Roles', href: '/users-roles?tab=roles', count: roleRows.length },
    { key: 'permissions', label: 'Permissions', href: '/users-roles?tab=permissions', count: permissionRows.length },
  ];
  const toolbarTabs = (
    <div
      className="flex min-w-fit items-center"
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-card)',
        padding: 3,
        gap: 2,
      }}
    >
      {tabItems.map((tab, index) => (
        <Link
          key={tab.key}
          href={tab.href}
          className="clinical-focus inline-flex h-8 items-center gap-2 rounded-[var(--radius-md)] px-3 text-xs font-bold transition"
          style={{
            background: active === index ? 'var(--color-bg-elevated)' : 'transparent',
            color: active === index ? 'var(--color-text)' : 'var(--color-text-muted)',
            boxShadow: active === index ? 'var(--shadow-card)' : 'none',
            textDecoration: 'none',
          }}
        >
          {tab.label}
          <span
            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5"
            style={{
              background: 'var(--color-card-muted)',
              color: 'var(--color-text-muted)',
              fontSize: 10,
            }}
          >
            {tab.count}
          </span>
        </Link>
      ))}
    </div>
  );

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <PageHeader
        title="Users & Roles"
        subtitle="Manage system users, role assignments, and permission matrices"
        actions={<PrototypeActionButton label="Invite User" icon="plus" kind="settings" variant="primary" description="Stage a staff invitation with role and access controls for the prototype demo." />}
      />

      {active === 0 && (
        <>
          <StableStatGrid>
            <StatCard icon={UsersRound} label="Total Users" value={32} tone="primary" />
            <StatCard icon={UsersRound} label="Active" value={26} sub="81%" tone="success" />
            <StatCard icon={ShieldCheck} label="Roles" value={roleRows.length} tone="warning" />
            <StatCard icon={UserCog} label="Locations" value={2} />
          </StableStatGrid>
          <CommandPanel
            eyebrow="Selected staff record"
            title={selectedUser ? `${selectedUser.name} access review` : 'Select a user to review access'}
            action={<Badge variant={selectedUser?.status === 'Active' ? 'success' : 'error'}>{selectedUser?.status ?? 'No user'}</Badge>}
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-bold uppercase" style={{ color: 'var(--color-text-muted)' }}>Role</p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{selectedUser?.role ?? '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase" style={{ color: 'var(--color-text-muted)' }}>Location</p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{selectedUser?.location ?? '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase" style={{ color: 'var(--color-text-muted)' }}>MFA</p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{selectedUser?.mfa ?? '-'}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => selectedUser && stageChange(selectedUser.email, 'Role assignment reviewed')}
                >
                  <CheckCircle2 size={14} />
                  Mark reviewed
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => selectedUser && stageChange(selectedUser.email, 'MFA reset staged')}
                >
                  <LockKeyhole size={14} />
                  Stage MFA reset
                </Button>
              </div>
            </div>
          </CommandPanel>
          <DataTable
            keyField="email"
            onRowClick={(row) => setSelectedUserId(row.id)}
            columns={[
              { key: 'name', label: 'User', render: (row) => (
                <div className="flex flex-col">
                  <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    {row.name}
                    {row.id === selectedUser?.id ? <Badge variant="primary">Selected</Badge> : null}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{row.email}</span>
                </div>
              )},
              { key: 'role', label: 'Role', render: (row) => <Badge variant="default">{row.role}</Badge> },
              { key: 'location', label: 'Location' },
              { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'error'}>{row.status}</Badge> },
              { key: 'lastLogin', label: 'Last Login' },
              { key: 'mfa', label: 'MFA' },
            ]}
            rows={userRows}
            empty="No users are available."
            emptyDescription="User rows will appear after identity records are configured."
            toolbarPrefix={toolbarTabs}
            search={{ placeholder: 'Search users by name, email, or role...', keys: ['name', 'email', 'role', 'location', 'status', 'mfa'] }}
            filters={[
              { id: 'role', label: 'Role' },
              { id: 'status', label: 'Status' },
              { id: 'location', label: 'Location' },
              { id: 'mfa', label: 'MFA' },
            ]}
          />
        </>
      )}

      {active === 1 && (
        <>
          <StableStatGrid>
            <StatCard icon={ShieldCheck} label="Total Roles" value={roleRows.length} tone="primary" />
            <StatCard icon={ShieldCheck} label="Active Roles" value={roleRows.filter((role) => role.status === 'Active').length} tone="success" />
          </StableStatGrid>
          <CommandPanel
            eyebrow="Role governance"
            title={selectedRole ? `${selectedRole.name} permission package` : 'Select a role package'}
            action={<Badge variant={selectedRole?.status === 'Active' ? 'success' : 'warning'}>{selectedRole?.status ?? 'No role'}</Badge>}
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                <p className="text-sm leading-6" style={{ color: 'var(--color-text-muted)' }}>
                  {selectedRole?.description ?? 'Role details will appear after selecting a row.'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="default">{selectedRole?.users ?? 0} assigned users</Badge>
                  <Badge variant="info">Updated {selectedRole?.updated ?? '-'}</Badge>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => selectedRole && stageChange(selectedRole.name, 'Role package reviewed')}
                >
                  <CheckCircle2 size={14} />
                  Review role
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => selectedRole && stageChange(selectedRole.name, 'Role activation change staged')}
                >
                  <History size={14} />
                  Stage change
                </Button>
              </div>
            </div>
          </CommandPanel>
          <DataTable
            keyField="name"
            onRowClick={(row) => setSelectedRoleId(row.id)}
            columns={[
              { key: 'name', label: 'Role Name', render: (row) => (
                <span className="flex items-center gap-2 font-bold" style={{ color: 'var(--color-primary)' }}>
                  {row.name}
                  {row.id === selectedRole?.id ? <Badge variant="primary">Selected</Badge> : null}
                </span>
              ) },
              { key: 'description', label: 'Description' },
              { key: 'users', label: 'Users' },
              { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'warning'}>{row.status}</Badge> },
              { key: 'updated', label: 'Last Updated' },
            ]}
            rows={roleRows}
            empty="No roles are available."
            emptyDescription="Role rows will appear after the RBAC matrix is configured."
            toolbarPrefix={toolbarTabs}
            search={{ placeholder: 'Search roles...', keys: ['name', 'description', 'status', 'updated'] }}
            filters={[
              { id: 'status', label: 'Status' },
            ]}
          />
        </>
      )}

      {active === 2 && (
        <>
          <StableStatGrid>
            <StatCard icon={ShieldCheck} label="Permission Modules" value={permissionRows.length} tone="primary" />
            <StatCard icon={UserCog} label="Role Columns" value={permissionRoles.length} tone="info" />
          </StableStatGrid>
          <CommandPanel
            eyebrow="Permission matrix"
            title={selectedModule ? `${selectedModule.module} access levels` : 'Select a permission module'}
            action={<Badge variant="info">{stagedChanges.length} staged</Badge>}
          >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {permissionRoles.map((role) => {
                  const level = selectedModule ? String(selectedModule[role]) : 'na';
                  return (
                    <div
                      key={role}
                      className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3"
                    >
                      <p className="text-[11px] font-bold uppercase" style={{ color: 'var(--color-text-muted)' }}>{role}</p>
                      <div className="mt-2">
                        <Badge variant={accessTone(level)}>{level === 'na' ? 'N/A' : level}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid gap-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Select value={targetRole} onChange={(event) => setTargetRole(event.target.value)} aria-label="Target role">
                    {permissionRoles.map((role) => <option key={role}>{role}</option>)}
                  </Select>
                  <Select value={targetAccess} onChange={(event) => setTargetAccess(event.target.value)} aria-label="Target access">
                    {accessLevels.map((level) => (
                      <option key={level} value={level}>{level === 'na' ? 'N/A' : level}</option>
                    ))}
                  </Select>
                </div>
                <Textarea
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  rows={3}
                  placeholder="Add a PHI-free review note."
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => selectedModule && stageChange(`${selectedModule.module} / ${targetRole}`, `Set access to ${targetAccess}`)}
                >
                  <CheckCircle2 size={14} />
                  Stage permission update
                </Button>
              </div>
            </div>
          </CommandPanel>
          <DataTable
            keyField="module"
            onRowClick={(row) => setSelectedModuleId(row.id)}
            columns={[
              { key: 'module', label: 'Module / Feature', render: (row) => (
                <span className="flex items-center gap-2 font-bold" style={{ color: 'var(--color-text)' }}>
                  {row.module}
                  {row.id === selectedModule?.id ? <Badge variant="primary">Selected</Badge> : null}
                </span>
              ) },
              { key: 'description', label: 'Description' },
              ...permissionRoles.map((role) => ({
                key: role,
                label: role,
                render: (row: PermissionAdminRow) => <AccessIcon level={String(row[role])} />,
              })),
            ]}
            rows={permissionRows}
            empty="No permission modules are available."
            emptyDescription="Permission rows will appear after the role matrix is configured."
            toolbarPrefix={toolbarTabs}
            search={{ placeholder: 'Search modules or permissions...', keys: ['module', 'description', ...permissionRoles] }}
            filters={[
              { id: 'module', label: 'Module' },
              { id: 'accessLevel', label: 'Access Level', options: accessLevels.map((level) => ({ label: level === 'na' ? 'N/A' : level[0].toUpperCase() + level.slice(1), value: level })), getValue: (row) => row.accessLevels },
            ]}
          />
        </>
      )}

      <CommandPanel
        eyebrow="Prototype access ledger"
        title="Staged admin decisions"
        action={<Badge variant={stagedChanges.length > 0 ? 'primary' : 'default'}>{stagedChanges.length} local entries</Badge>}
      >
        {stagedChanges.length > 0 ? (
          <div className="scrollbar-soft max-h-40 space-y-2 overflow-auto pr-1">
            {stagedChanges.map((change) => (
              <div
                key={change.id}
                className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{change.target}</p>
                  <Badge variant="info">{change.change}</Badge>
                </div>
                <p className="mt-1 text-xs leading-5" style={{ color: 'var(--color-text-muted)' }}>{change.note}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Select a row and stage an access review, MFA reset, role package change, or permission update.
          </p>
        )}
      </CommandPanel>
    </PageStack>
  );
}
