import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RoleGuard from './components/auth/RoleGuard';
import './App.css';

// Public
const LandingPage     = lazy(() => import('./pages/LandingPage'));
const LoginPage       = lazy(() => import('./pages/LoginPage'));
const RegisterPage    = lazy(() => import('./pages/RegisterPage'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const PrivacyPolicy   = lazy(() => import('./pages/PrivacyPolicy'));
const CookiePolicy    = lazy(() => import('./pages/CookiePolicy'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage'));

// Layout
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));

// Owner (super_admin)
const OwnerOverview  = lazy(() => import('./pages/owner/OwnerOverview'));
const OwnerCompanies = lazy(() => import('./pages/owner/OwnerCompanies'));
const OwnerPlans     = lazy(() => import('./pages/owner/OwnerPlans'));
const OwnerInvoices  = lazy(() => import('./pages/owner/OwnerInvoices'));

// Company (manager / hr)
const CompanyOverview      = lazy(() => import('./pages/company/CompanyOverview'));
const CompanyEmployeesPage = lazy(() => import('./pages/company/employees/CompanyEmployeesPage'));
const DepartmentsPage      = lazy(() => import('./pages/company/structure/DepartmentsPage'));
const LocationsPage        = lazy(() => import('./pages/company/structure/LocationsPage'));
const ShiftsPage           = lazy(() => import('./pages/company/structure/ShiftsPage'));
const CompanyLeavesPage    = lazy(() => import('./pages/company/CompanyLeavesPage'));
const CompanyPayrollPage   = lazy(() => import('./pages/company/CompanyPayrollPage'));
const CompanyHolidaysPage  = lazy(() => import('./pages/company/CompanyHolidaysPage'));
const CompanyAnnouncementsPage = lazy(() => import('./pages/company/CompanyAnnouncementsPage'));
const CompanyBillingPage   = lazy(() => import('./pages/company/CompanyBillingPage'));
const CompanySettingsPage  = lazy(() => import('./pages/company/CompanySettingsPage'));
const CompanyDocumentsPage = lazy(() => import('./pages/company/CompanyDocumentsPage'));
const CompanyReports = lazy(() => import('./pages/company/ReportsPage'));
const ReportBuilderPage = lazy(() => import('./pages/company/ReportBuilderPage'));
const EmployeeView = lazy(() => import('./pages/company/employees/EmployeeView'));
const EmployeeEdit = lazy(() => import('./pages/company/employees/EmployeeEdit'));

// Team lead
const TeamOverviewPage = lazy(() => import('./pages/team/TeamOverviewPage'));

// Employee
const EmployeeDashboard = lazy(() => import('./pages/employee/EmployeeDashboard'));
const EmployeeLeavesPage    = lazy(() => import('./pages/employee/EmployeeLeavesPage'));
const EmployeePayslipsPage  = lazy(() => import('./pages/employee/EmployeePayslipsPage'));
const EmployeeAttendanceHistoryPage = lazy(() => import('./pages/employee/EmployeeAttendanceHistoryPage'));
const EmployeeAnnouncementsPage = lazy(() => import('./pages/employee/EmployeeAnnouncementsPage'));
const EmployeeNewsPage = lazy(() => import('./pages/employee/EmployeeNewsPage'));
const EmployeeMePage = lazy(() => import('./pages/employee/EmployeeMePage'));
const EmployeeDocumentsPage = lazy(() => import('./pages/employee/EmployeeDocumentsPage'));
const EmployeeTasksPage = lazy(() => import('./pages/employee/EmployeeTasksPage'));
const EmployeeOrgChartPage = lazy(() => import('./pages/employee/EmployeeOrgChartPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

const PageLoader = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="spinner">Loading...</div>
  </div>
);

const COMPANY_ROLES = ['manager', 'hr'];
const APPROVER_ROLES = ['manager', 'hr', 'team_lead'];
const ALL_EMPLOYEE_ROLES = ['manager', 'hr', 'team_lead', 'employee'];

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/terms"   element={<TermsConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Authenticated */}
        <Route element={<DashboardLayout />}>
          {/* Super admin */}
          <Route path="/owner/overview"  element={<RoleGuard allowed="super_admin"><OwnerOverview /></RoleGuard>} />
          <Route path="/owner/companies" element={<RoleGuard allowed="super_admin"><OwnerCompanies /></RoleGuard>} />
          <Route path="/owner/plans"     element={<RoleGuard allowed="super_admin"><OwnerPlans /></RoleGuard>} />
          <Route path="/owner/invoices"  element={<RoleGuard allowed="super_admin"><OwnerInvoices /></RoleGuard>} />

          {/* Company-level (manager + hr) */}
          <Route path="/company/overview"      element={<RoleGuard allowed={COMPANY_ROLES}><CompanyOverview /></RoleGuard>} />
          <Route path="/company/employees"     element={<RoleGuard allowed={COMPANY_ROLES}><CompanyEmployeesPage /></RoleGuard>} />
          <Route path="/employees/:id/view"    element={<RoleGuard allowed={COMPANY_ROLES}><EmployeeView /></RoleGuard>} />
          <Route path="/employees/:id/edit"    element={<RoleGuard allowed={COMPANY_ROLES}><EmployeeEdit /></RoleGuard>} />
          <Route path="/company/departments"   element={<RoleGuard allowed={COMPANY_ROLES}><DepartmentsPage /></RoleGuard>} />
          <Route path="/company/locations"     element={<RoleGuard allowed={COMPANY_ROLES}><LocationsPage /></RoleGuard>} />
          <Route path="/company/shifts"        element={<RoleGuard allowed={COMPANY_ROLES}><ShiftsPage /></RoleGuard>} />
          <Route path="/company/leaves"        element={<RoleGuard allowed={APPROVER_ROLES}><CompanyLeavesPage /></RoleGuard>} />
          <Route path="/company/payroll"       element={<RoleGuard allowed={COMPANY_ROLES}><CompanyPayrollPage /></RoleGuard>} />
          <Route path="/company/holidays"      element={<RoleGuard allowed={COMPANY_ROLES}><CompanyHolidaysPage /></RoleGuard>} />
          <Route path="/company/announcements" element={<RoleGuard allowed={COMPANY_ROLES}><CompanyAnnouncementsPage /></RoleGuard>} />
          <Route path="/company/documents"     element={<RoleGuard allowed={COMPANY_ROLES}><CompanyDocumentsPage /></RoleGuard>} />
          <Route path="/company/reports"        element={<RoleGuard allowed={COMPANY_ROLES}><CompanyReports /></RoleGuard>} />
          <Route path="/company/reports/build"  element={<RoleGuard allowed={COMPANY_ROLES}><ReportBuilderPage /></RoleGuard>} />
          <Route path="/company/billing"       element={<RoleGuard allowed="manager"><CompanyBillingPage /></RoleGuard>} />
          <Route path="/company/settings"      element={<RoleGuard allowed="manager"><CompanySettingsPage /></RoleGuard>} />

          {/* Team lead */}
          <Route path="/team/overview" element={<RoleGuard allowed="team_lead"><TeamOverviewPage /></RoleGuard>} />
          <Route path="/team/members"  element={<RoleGuard allowed="team_lead"><TeamOverviewPage /></RoleGuard>} />
          <Route path="/team/leaves"   element={<RoleGuard allowed="team_lead"><CompanyLeavesPage /></RoleGuard>} />

          {/* Employee (also valid for hr/manager/team_lead since they all have an employee profile) */}
          <Route path="/employee/overview"     element={<RoleGuard allowed={ALL_EMPLOYEE_ROLES}><EmployeeDashboard /></RoleGuard>} />
          <Route path="/employee/leaves"       element={<RoleGuard allowed={ALL_EMPLOYEE_ROLES}><EmployeeLeavesPage /></RoleGuard>} />
          <Route path="/employee/payslips"     element={<RoleGuard allowed={ALL_EMPLOYEE_ROLES}><EmployeePayslipsPage /></RoleGuard>} />
          <Route path="/employee/attendance"   element={<RoleGuard allowed={ALL_EMPLOYEE_ROLES}><EmployeeAttendanceHistoryPage /></RoleGuard>} />
          <Route path="/employee/announcements" element={<RoleGuard allowed={ALL_EMPLOYEE_ROLES}><EmployeeAnnouncementsPage /></RoleGuard>} />
          <Route path="/employee/news"       element={<RoleGuard allowed={ALL_EMPLOYEE_ROLES}><EmployeeNewsPage /></RoleGuard>} />
          <Route path="/employee/me"         element={<RoleGuard allowed={ALL_EMPLOYEE_ROLES}><EmployeeMePage /></RoleGuard>} />
          <Route path="/employee/documents"  element={<RoleGuard allowed={ALL_EMPLOYEE_ROLES}><EmployeeDocumentsPage /></RoleGuard>} />
          <Route path="/employee/tasks"      element={<RoleGuard allowed={ALL_EMPLOYEE_ROLES}><EmployeeTasksPage /></RoleGuard>} />
          <Route path="/employee/org-chart"  element={<RoleGuard allowed={ALL_EMPLOYEE_ROLES}><EmployeeOrgChartPage /></RoleGuard>} />
          <Route path="/notifications"      element={<RoleGuard allowed={ALL_EMPLOYEE_ROLES}><NotificationsPage /></RoleGuard>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
