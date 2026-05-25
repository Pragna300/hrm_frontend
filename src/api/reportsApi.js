import { api as client } from './client';

export async function fetchEmployees(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await client.get(`/reports/employees?${qs}`).catch(() => client.get(`/employees?${qs}`));
  if (Array.isArray(res.data)) {
    return { rows: res.data, total: res.data.length };
  }
  return res.data;
}

export async function fetchOrganizationAttendance(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await client.get(`/reports/attendance?${qs}`);
  return res.data;
}

export async function fetchDepartmentsReport() {
  const res = await client.get('/reports/departments');
  return res.data;
}

export async function fetchDepartmentEmployees(departmentId, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await client.get(`/reports/departments/${departmentId}?${qs}`);
  return res.data;
}

export async function generateAttendanceReport(payload) {
  const res = await client.post('/reports/attendance', payload);
  return res.data;
}

export async function exportAttendanceReport(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const API_BASE = (typeof window !== 'undefined' ? `${window.location.origin}/api` : '');
  const token = localStorage.getItem('shnoor_token');
  const res = await fetch(`${API_BASE}/reports/attendance/export?${qs}`, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
  const blob = await res.blob();
  return { data: blob };
}

export async function fetchDayWiseSummary(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await client.get(`/reports/day-summary?${qs}`);
  const days = Array.isArray(res.data) ? res.data : [];
  return {
    days,
    summary: res.summary ?? null,
    orgRegistrationDate: res.orgRegistrationDate ?? null,
  };
}

