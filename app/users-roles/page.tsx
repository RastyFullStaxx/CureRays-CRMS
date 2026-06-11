'use client';
import Link from 'next/link';
import { Children, type ReactNode } from 'react';
import { Plus, UserCog, ShieldCheck, UsersRound } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminRoles, adminUsers, permissionRoles, permissionRows } from '@/lib/global-page-data';

function AccessIcon({ level }: { level: string }) {
  if (level === 'full') return <Badge variant="success">Full</Badge>;
  if (level === 'edit') return <Badge variant="info">Edit</Badge>;
  if (level === 'view') return <Badge variant="default">View</Badge>;
  if (level === 'none') return <Badge variant="error">None</Badge>;
  return <span style={{ color: 'var(--color-text-muted)' }}>-</span>;
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

export default function UsersRolesPage({ searchParams }: { searchParams?: { tab?: string } }) {
  const active = searchParams?.tab === 'roles' ? 1 : searchParams?.tab === 'permissions' ? 2 : 0;
  const userRows = adminUsers.map((user) => ({
    id: user.email,
    name: user.name,
    email: user.email,
    role: user.role,
    location: user.location,
    status: user.status,
    lastLogin: user.lastLogin,
    mfa: user.mfa,
  }));
  const roleRows = adminRoles.map((role) => ({
    id: role.name,
    name: role.name,
    description: role.description,
    users: role.users,
    status: role.status,
    updated: role.updated,
  }));
  const accessLevels = ['full', 'edit', 'view', 'none', 'na'];
  const permissionTableRows = permissionRows.map((row) => ({
    id: row.module,
    module: row.module,
    description: row.description,
    accessLevels: row.levels,
    ...Object.fromEntries(permissionRoles.map((role, i) => [role, row.levels[i]])),
  }));
  const tabItems = [
    { key: 'users', label: 'Users', href: '/users-roles', count: adminUsers.length },
    { key: 'roles', label: 'Roles', href: '/users-roles?tab=roles', count: adminRoles.length },
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
            boxShadow: active === index ? '0 1px 2px rgba(15, 23, 42, 0.08)' : 'none',
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
    <PageStack>
      <PageHeader
        title="Users & Roles"
        subtitle="Manage system users, role assignments, and permission matrices"
        actions={<Button><Plus className="h-4 w-4" /> Invite User</Button>}
      />

      {active === 0 && (
        <>
          <StableStatGrid>
            <StatCard icon={UsersRound} label="Total Users" value={32} tone="primary" />
            <StatCard icon={UsersRound} label="Active" value={26} sub="81%" tone="success" />
            <StatCard icon={ShieldCheck} label="Roles" value={adminRoles.length} tone="warning" />
            <StatCard icon={UserCog} label="Locations" value={2} />
          </StableStatGrid>
          <DataTable
            keyField="email"
            columns={[
              { key: 'name', label: 'User', render: (row) => (
                <div className="flex flex-col">
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{row.name}</span>
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
            <StatCard icon={ShieldCheck} label="Total Roles" value={adminRoles.length} tone="primary" />
            <StatCard icon={ShieldCheck} label="Active Roles" value={adminRoles.filter((r) => r.status === 'Active').length} tone="success" />
          </StableStatGrid>
          <DataTable
            keyField="name"
            columns={[
              { key: 'name', label: 'Role Name', render: (row) => <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{row.name}</span> },
              { key: 'description', label: 'Description' },
              { key: 'users', label: 'Users' },
              { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'warning'}>{row.status}</Badge> },
              { key: 'updated', label: 'Last Updated' },
            ]}
            rows={roleRows}
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
          <DataTable
            keyField="module"
            columns={[
              { key: 'module', label: 'Module / Feature', render: (row) => <span className="font-bold" style={{ color: 'var(--color-text)' }}>{row.module}</span> },
              { key: 'description', label: 'Description' },
              ...permissionRoles.map((role) => ({ key: role, label: role, render: (row: Record<string, any>) => <AccessIcon level={row[role]} /> })),
            ]}
            rows={permissionTableRows}
            toolbarPrefix={toolbarTabs}
            search={{ placeholder: 'Search modules or permissions...', keys: ['module', 'description', ...permissionRoles] }}
            filters={[
              { id: 'module', label: 'Module' },
              { id: 'accessLevel', label: 'Access Level', options: accessLevels.map((level) => ({ label: level === 'na' ? 'N/A' : level[0].toUpperCase() + level.slice(1), value: level })), getValue: (row) => row.accessLevels },
            ]}
          />
        </>
      )}
    </PageStack>
  );
}
