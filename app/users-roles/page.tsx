'use client';
import Link from 'next/link';
import { Plus, UserCog, ShieldCheck, UsersRound } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { FilterStrip } from '@/components/shared/filter-strip';
import { FilterField } from '@/components/shared/filter-strip';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { adminRoles, adminUsers, permissionRoles, permissionRows } from '@/lib/global-page-data';

function AccessIcon({ level }: { level: string }) {
  if (level === 'full') return <Badge variant="success">Full</Badge>;
  if (level === 'edit') return <Badge variant="info">Edit</Badge>;
  if (level === 'view') return <Badge variant="default">View</Badge>;
  if (level === 'none') return <Badge variant="error">None</Badge>;
  return <span style={{ color: 'var(--color-text-muted)' }}>-</span>;
}

export default function UsersRolesPage({ searchParams }: { searchParams?: { tab?: string } }) {
  const active = searchParams?.tab === 'roles' ? 1 : searchParams?.tab === 'permissions' ? 2 : 0;

  return (
    <PageStack>
      <PageHeader
        title="Users & Roles"
        subtitle="Manage system users, role assignments, and permission matrices"
        actions={<Button><Plus className="h-4 w-4" /> Invite User</Button>}
      />

      <div
        className="flex items-center"
        style={{
          background: 'var(--color-card)',
          border: 'var(--border-container)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {['users', 'roles', 'permissions'].map((tab, index) => (
          <Link
            key={tab}
            href={`/users-roles${tab === 'users' ? '' : `?tab=${tab}`}`}
            className="border-b-2 px-6 py-4 text-sm font-bold transition"
            style={{
              borderColor: active === index ? 'var(--color-primary)' : 'transparent',
              color: active === index ? 'var(--color-primary)' : 'var(--color-text)',
            }}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </Link>
        ))}
      </div>

      {active === 0 && (
        <>
          <StatGrid>
            <StatCard icon={UsersRound} label="Total Users" value={32} tone="primary" />
            <StatCard icon={UsersRound} label="Active" value={26} sub="81%" tone="success" />
            <StatCard icon={ShieldCheck} label="Roles" value={adminRoles.length} tone="warning" />
            <StatCard icon={UserCog} label="Locations" value={2} />
          </StatGrid>
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
            rows={adminUsers.map((user) => ({
              id: user.email,
              name: user.name,
              email: user.email,
              role: user.role,
              location: user.location,
              status: user.status,
              lastLogin: user.lastLogin,
              mfa: user.mfa,
            }))}
            toolbar={
              <FilterStrip>
                <FilterField grow>
                  <Input placeholder="Search users by name, email, or role..." />
                </FilterField>
                <FilterField><Input placeholder="Role" /></FilterField>
                <FilterField><Input placeholder="Status" /></FilterField>
              </FilterStrip>
            }
          />
        </>
      )}

      {active === 1 && (
        <>
          <StatGrid>
            <StatCard icon={ShieldCheck} label="Total Roles" value={adminRoles.length} tone="primary" />
            <StatCard icon={ShieldCheck} label="Active Roles" value={adminRoles.filter((r) => r.status === 'Active').length} tone="success" />
          </StatGrid>
          <DataTable
            keyField="name"
            columns={[
              { key: 'name', label: 'Role Name', render: (row) => <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{row.name}</span> },
              { key: 'description', label: 'Description' },
              { key: 'users', label: 'Users' },
              { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'warning'}>{row.status}</Badge> },
              { key: 'updated', label: 'Last Updated' },
            ]}
            rows={adminRoles.map((role) => ({
              id: role.name,
              name: role.name,
              description: role.description,
              users: role.users,
              status: role.status,
              updated: role.updated,
            }))}
            toolbar={
              <FilterStrip>
                <FilterField grow>
                  <Input placeholder="Search roles..." />
                </FilterField>
              </FilterStrip>
            }
          />
        </>
      )}

      {active === 2 && (
        <>
          <StatGrid>
            <StatCard icon={ShieldCheck} label="Permission Modules" value={permissionRows.length} tone="primary" />
            <StatCard icon={UserCog} label="Role Columns" value={permissionRoles.length} tone="info" />
          </StatGrid>
          <DataTable
            keyField="module"
            columns={[
              { key: 'module', label: 'Module / Feature', render: (row) => <span className="font-bold" style={{ color: 'var(--color-text)' }}>{row.module}</span> },
              { key: 'description', label: 'Description' },
              ...permissionRoles.map((role) => ({ key: role, label: role, render: (row: Record<string, any>) => <AccessIcon level={row[role]} /> })),
            ]}
            rows={permissionRows.map((row) => ({
              id: row.module,
              module: row.module,
              description: row.description,
              ...Object.fromEntries(permissionRoles.map((role, i) => [role, row.levels[i]])),
            }))}
            toolbar={
              <FilterStrip>
                <FilterField grow>
                  <Input placeholder="Search modules or permissions..." />
                </FilterField>
                <FilterField><Input placeholder="Module" /></FilterField>
                <FilterField><Input placeholder="Access Level" /></FilterField>
              </FilterStrip>
            }
          />
        </>
      )}
    </PageStack>
  );
}
