import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminEmployeesPage = lazy(() => import('./pages/admin/AdminEmployeesPage'));
const EmployeeDashboard = lazy(() => import('./pages/employee/EmployeeDashboard'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));

// Simple placeholder for "Under Construction" modules
const PlaceholderPage = () => (
  <div style={{ 
    padding: '40px', 
    textAlign: 'center', 
    color: '#a0aec0', 
    background: '#fff', 
    borderRadius: '12px',
    border: '1px solid #eef2f6',
    marginTop: '20px'
  }}>
    <h2 style={{ color: '#1a365d', marginBottom: '10px' }}>Module Under Development</h2>
    <p>This feature is part of the next implementation phase.</p>
  </div>
);

const PageLoader = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="spinner">Loading...</div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/cookies" element={<CookiePolicy />} />

        {/* Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/admin/overview" element={<AdminDashboard />} />
          <Route path="/employee/overview" element={<EmployeeDashboard />} />
          
          {/* Catch-all for other sidebar links so they don't redirect */}
          <Route path="/news" element={<PlaceholderPage />} />
          <Route path="/me" element={<PlaceholderPage />} />
          <Route path="/docs" element={<PlaceholderPage />} />
          <Route path="/thanks" element={<PlaceholderPage />} />
          <Route path="/planner" element={<PlaceholderPage />} />
          <Route path="/tasks" element={<PlaceholderPage />} />
          <Route path="/auths" element={<PlaceholderPage />} />
          <Route path="/reports" element={<PlaceholderPage />} />
          <Route path="/notifications" element={<PlaceholderPage />} />
          <Route path="/org-chart" element={<PlaceholderPage />} />
          
          {/* Admin extra links */}
          <Route path="/admin/employees" element={<AdminEmployeesPage />} />
          <Route path="/admin/leave-settings" element={<PlaceholderPage />} />
          <Route path="/admin/payroll" element={<PlaceholderPage />} />
          <Route path="/admin/settings" element={<PlaceholderPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
