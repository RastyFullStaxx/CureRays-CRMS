import Link from "next/link";
import { CheckCircle2, Eye, MinusCircle, PenLine, Plus, ShieldCheck, Upload, UserCog, UsersRound } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge, DonutChart, FilterBar, ListItem, MetricGrid, MetricTile, ModuleActions, ModulePage, Pagination, PrimaryButton, QuickActions, RightRailCard, RowActions, SecondaryButton, TabBar, WorkGrid } from "@/components/module-ui";
import { adminRoles, adminUsers, permissionRoles, permissionRows } from "@/lib/global-page-data";

function AccessIcon({ level }: { level: string }) {
  if (level === "full") return <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-600" />;
  if (level === "edit") return <PenLine className="mx-auto h-4 w-4 text-[#FF6620]" />;
  if (level === "view") return <Eye className="mx-auto h-4 w-4 text-[#0033A0]" />;
  if (level === "none") return <MinusCircle className="mx-auto h-4 w-4 text-rose-600" />;
  return <span className="block text-center text-[#7DA0CA]">-</span>;
}

export default function UsersRolesPage({ searchParams }: { searchParams?: { tab?: string } }) {
  const active = searchParams?.tab === "roles" ? 1 : searchParams?.tab === "permissions" ? 2 : 0;

  return (
    <ModulePage>
      <ModuleActions>
        <PrimaryButton><Plus className="h-4 w-4" />Invite User</PrimaryButton>
      </ModuleActions>
      <div className="rounded-lg border border-[#D8E4F5] bg-white">
        <div className="flex items-center">
          {["users", "roles", "permissions"].map((tab, index) => (
            <Link key={tab} href={`/users-roles${tab === "users" ? "" : `?tab=${tab}`}`} className={`border-b-2 px-6 py-4 text-sm font-bold ${active === index ? "border-[#0033A0] text-[#0033A0]" : "border-transparent text-[#2B2F5F]"}`}>
              {tab[0].toUpperCase() + tab.slice(1)}
            </Link>
          ))}
        </div>
      </div>
      <FilterBar search={active === 2 ? "Search modules or permissions..." : "Search users by name, email, or role..."} filters={active === 2 ? ["Module", "Role", "Access Level"] : ["Role", "Status", "Location"]} actions={<SecondaryButton><Upload className="h-4 w-4" />Export</SecondaryButton>} />
      {active === 0 ? (
        <WorkGrid
          main={
            <DataTable
              compact
              minWidth="900px"
              columns={[{ header: "User" }, { header: "Role" }, { header: "Location" }, { header: "Status" }, { header: "Last Login" }, { header: "MFA" }, { header: "Actions" }]}
              footer={<Pagination label={`Showing 1 to ${adminUsers.length} of 32 users`} />}
              rows={adminUsers.map((user) => ({ id: user.email, cells: [<div key="user"><p className="font-bold">{user.name}</p><p className="text-[11px] text-[#3D5A80]">{user.email}</p></div>, <Badge key="role" tone="purple">{user.role}</Badge>, user.location, <Badge key="status" tone={user.status === "Active" ? "green" : "amber"}>{user.status}</Badge>, user.lastLogin, user.mfa, <RowActions key="actions" />] }))}
            />
          }
          rail={
            <>
              <RightRailCard title="User Summary">
                <MetricGrid columns={4}><MetricTile label="Total Users" value={32} detail="System users" icon={UsersRound} /><MetricTile label="Active" value={26} detail="81%" icon={UserCog} tone="green" /><MetricTile label="Roles" value={adminRoles.length} detail="Defined" icon={ShieldCheck} tone="orange" /><MetricTile label="Locations" value={2} detail="Sites" icon={UsersRound} /></MetricGrid>
              </RightRailCard>
              <RightRailCard title="Users by Role">
                <DonutChart total={32} label="total" segments={adminRoles.slice(0, 6).map((role, index) => ({ label: role.name, value: role.users, color: ["#7C3AED", "#2563EB", "#10B981", "#FF6620", "#F59E0B", "#3D5A80"][index] }))} />
              </RightRailCard>
              <RightRailCard title="Recent Activity"><div className="space-y-2">{adminUsers.slice(0, 4).map((user) => <ListItem key={user.email} title={`${user.name} updated`} meta={user.lastLogin} />)}</div></RightRailCard>
            </>
          }
        />
      ) : active === 1 ? (
        <WorkGrid
          main={<DataTable compact minWidth="880px" columns={[{ header: "Role Name" }, { header: "Description" }, { header: "Users" }, { header: "Status" }, { header: "Last Updated" }, { header: "Actions" }]} footer={<Pagination label={`Showing 1 to ${adminRoles.length} of ${adminRoles.length} roles`} />} rows={adminRoles.map((role) => ({ id: role.name, cells: [<span key="role" className="font-bold text-[#0033A0]">{role.name}</span>, <span key="desc" className="line-clamp-2">{role.description}</span>, role.users, <Badge key="status" tone="green">{role.status}</Badge>, role.updated, <RowActions key="actions" />] }))} />}
          rail={<><RightRailCard title="Role Details"><ListItem title={adminRoles[0].name} meta={adminRoles[0].description} badge={<Badge tone="green">Active</Badge>} /></RightRailCard><RightRailCard title="Permissions Summary"><div className="space-y-2"><ListItem title="Clinical Forms" meta="Edit access" /><ListItem title="Documents" meta="Signature route access" /><ListItem title="Audit & QA" meta="View access" /></div></RightRailCard><RightRailCard title="Quick Actions"><QuickActions actions={[{ label: "Create Role", icon: <Plus className="h-4 w-4" /> }, { label: "Copy Role", icon: <UserCog className="h-4 w-4" /> }, { label: "Compare Roles", icon: <ShieldCheck className="h-4 w-4" /> }]} /></RightRailCard></>}
        />
      ) : (
        <WorkGrid
          main={
            <DataTable
              compact
              minWidth="1120px"
              columns={[{ header: "Module / Feature" }, { header: "Description" }, ...permissionRoles.map((role) => ({ header: role }))]}
              rows={permissionRows.map((row) => ({ id: row.module, cells: [<span key="module" className="font-bold">{row.module}</span>, row.description, ...row.levels.map((level, index) => <AccessIcon key={`${row.module}-${index}`} level={level} />)] }))}
              footer={<div className="flex flex-wrap gap-4 text-xs font-bold text-[#3D5A80]"><span>Access Levels:</span><span>Full Access</span><span>Edit</span><span>View Only</span><span>No Access</span><span>Not Applicable</span></div>}
            />
          }
          rail={<><RightRailCard title="Permission Details"><ListItem title="Patient Management" meta="Access to patient demographic information and medical records" /></RightRailCard><RightRailCard title="Access Level Descriptions"><div className="space-y-2"><ListItem title="Full Access" meta="Create, read, update, delete and manage settings" /><ListItem title="Edit" meta="Create and update records" /><ListItem title="View Only" meta="Read and download information" /><ListItem title="No Access" meta="No permission" /></div></RightRailCard><RightRailCard title="Quick Actions"><QuickActions actions={[{ label: "Create New Role", icon: <Plus className="h-4 w-4" /> }, { label: "Copy Role", icon: <UserCog className="h-4 w-4" /> }, { label: "Permission Audit Log", icon: <ShieldCheck className="h-4 w-4" /> }]} /></RightRailCard></>}
        />
      )}
    </ModulePage>
  );
}
