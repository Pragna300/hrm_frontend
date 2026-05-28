import {
  LayoutDashboard,
  Users,
  Building2,
  MapPin,
  Clock,
  Calendar,
  CreditCard,
  Megaphone,
  MessageSquare,
  CalendarDays,
  Settings,
  Receipt,
  Package,
  TrendingUp,
  CheckSquare,
  Briefcase,
  FileText,
  UserCog,
  Newspaper,
  User,
  FileStack,
  Network,
} from 'lucide-react';

const icon = (Component) => <Component size={18} />;

/** Employee self-service (everyone with an employee profile, including manager/HR). */
export const EMPLOYEE_SELF_NAV = [
  { label: 'Dashboard',   icon: icon(LayoutDashboard), path: '/employee/overview',    badgeKey: null },
  { label: 'News',         icon: icon(Newspaper),       path: '/employee/news',        badgeKey: null },
  { label: 'Me',           icon: icon(User),           path: '/employee/me',            badgeKey: null },
  { label: 'Documents',    icon: icon(FileStack),     path: '/employee/documents',     badgeKey: 'documents', badgeTone: 'info' },
  { label: 'Tasks',        icon: icon(CheckSquare),    path: '/employee/tasks',         badgeKey: 'tasksOverdue', badgeTone: 'danger' },
  { label: 'Org Chart',    icon: icon(Network),       path: '/employee/org-chart',     badgeKey: null },
  { label: 'My Leaves',    icon: icon(Calendar),      path: '/employee/leaves',         badgeKey: null },
  { label: 'Payslips',     icon: icon(FileText),      path: '/employee/payslips',       badgeKey: null },
  { label: 'Attendance',   icon: icon(Clock),         path: '/employee/attendance',     badgeKey: null },
  { label: 'Announcements', icon: icon(Megaphone),  path: '/employee/announcements',  badgeKey: null },
];

export const COMPANY_NAV_MANAGER = [
  { label: 'Overview',      icon: icon(LayoutDashboard), path: '/company/overview' },
  { label: 'Employees',     icon: icon(Users),           path: '/company/employees' },
  { label: 'Departments',   icon: icon(Briefcase),     path: '/company/departments' },
  { label: 'Locations',     icon: icon(MapPin),        path: '/company/locations' },
  { label: 'Shifts',        icon: icon(Clock),         path: '/company/shifts' },
  { label: 'Leaves',        icon: icon(Calendar),     path: '/company/leaves' },
  { label: 'Payroll',       icon: icon(CreditCard),   path: '/company/payroll' },
  { label: 'Holidays',      icon: icon(CalendarDays), path: '/company/holidays' },
  { label: 'Documents',     icon: icon(FileStack),    path: '/company/documents' },
  { label: 'Announcements', icon: icon(Megaphone),    path: '/company/announcements' },
  { label: 'Reports',       icon: icon(FileText),     path: '/company/reports' },
  { label: 'Billing',       icon: icon(Receipt),      path: '/company/billing' },
  { label: 'Settings',      icon: icon(Settings),     path: '/company/settings' },
];

export const COMPANY_NAV_HR = [
  { label: 'Overview',      icon: icon(LayoutDashboard), path: '/company/overview' },
  { label: 'Employees',     icon: icon(Users),           path: '/company/employees' },
  { label: 'Departments',   icon: icon(Briefcase),     path: '/company/departments' },
  { label: 'Locations',     icon: icon(MapPin),        path: '/company/locations' },
  { label: 'Shifts',        icon: icon(Clock),         path: '/company/shifts' },
  { label: 'Leaves',        icon: icon(Calendar),     path: '/company/leaves' },
  { label: 'Payroll',       icon: icon(CreditCard),   path: '/company/payroll' },
  { label: 'Holidays',      icon: icon(CalendarDays), path: '/company/holidays' },
  { label: 'Documents',     icon: icon(FileStack),    path: '/company/documents' },
  { label: 'Announcements', icon: icon(Megaphone),    path: '/company/announcements' },
  { label: 'Reports',       icon: icon(FileText),     path: '/company/reports' },
];

export const TEAM_NAV = [
  { label: 'Overview',  icon: icon(LayoutDashboard), path: '/team/overview' },
  { label: 'My Team',   icon: icon(UserCog),        path: '/team/members' },
  { label: 'Approvals', icon: icon(CheckSquare),    path: '/team/leaves' },
];

export const NAV_BY_ROLE = {
  super_admin: [
    { label: 'Overview',  icon: icon(TrendingUp), path: '/owner/overview' },
    { label: 'Companies', icon: icon(Building2), path: '/owner/companies' },
    { label: 'Plans',     icon: icon(Package),   path: '/owner/plans' },
    { label: 'Invoices',  icon: icon(Receipt),   path: '/owner/invoices' },
    { label: 'Contact Inquiries', icon: icon(MessageSquare), path: '/owner/contact-inquiries' },
    { label: 'Registration Reports', icon: icon(FileText), path: '/owner/reports' },
  ],
};



const WORKSPACE_KEY = 'hr_workspace';

export function getStoredWorkspace() {
  try {
    const v = localStorage.getItem(WORKSPACE_KEY);
    if (v === 'self' || v === 'company' || v === 'team') return v;
  } catch { /* ignore */ }
  return null;
}

export function persistWorkspace(mode) {
  try {
    localStorage.setItem(WORKSPACE_KEY, mode);
  } catch { /* ignore */ }
}

/**
 * Resolves sidebar items for the current user + workspace tab.
 */
export function getSidebarNav(user, workspace, badgeCounts = {}) {
  const role = user?.role || 'employee';
  if (role === 'super_admin') return NAV_BY_ROLE.super_admin;

  if (role === 'manager' || role === 'hr') {
    const ws = workspace || getStoredWorkspace() || 'company';
    if (ws === 'self') {
      return EMPLOYEE_SELF_NAV.map((item) => ({
        ...item,
        badge: item.badgeKey ? badgeCounts[item.badgeKey] ?? 0 : null,
        badgeTone: item.badgeTone || null,
      }));
    }
    return role === 'manager' ? COMPANY_NAV_MANAGER : COMPANY_NAV_HR;
  }

  if (role === 'team_lead') {
    const ws = workspace || getStoredWorkspace() || 'team';
    if (ws === 'self') {
      return EMPLOYEE_SELF_NAV.map((item) => ({
        ...item,
        badge: item.badgeKey ? badgeCounts[item.badgeKey] ?? 0 : null,
        badgeTone: item.badgeTone || null,
      }));
    }
    return TEAM_NAV;
  }

  return EMPLOYEE_SELF_NAV.map((item) => ({
    ...item,
    badge: item.badgeKey ? badgeCounts[item.badgeKey] ?? 0 : null,
    badgeTone: item.badgeTone || null,
  }));
}

export function defaultWorkspaceForRole(role) {
  if (role === 'manager' || role === 'hr') return 'company';
  if (role === 'team_lead') return 'team';
  return 'self';
}

export function defaultPathForRole(role) {
  switch (role) {
    case 'super_admin': return '/owner/overview';
    case 'manager':
    case 'hr':         return '/company/overview';
    case 'team_lead':  return '/team/overview';
    default:           return '/employee/overview';
  }
}

export function selfHomePath() {
  return '/employee/overview';
}
