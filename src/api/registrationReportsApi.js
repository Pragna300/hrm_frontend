import { api as client } from './client';

export async function fetchRegistrationOverview(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await client.get(`/reports/registrations/overview?${qs}`);
  return res.data;
}

export async function fetchRegistrationCharts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await client.get(`/reports/registrations/charts?${qs}`);
  return res.data;
}

export async function fetchRegistrationTable(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await client.get(`/reports/registrations/table?${qs}`);
  return res.data;
}

export async function fetchRegistrationFinancials(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await client.get(`/reports/registrations/financials?${qs}`);
  return res.data;
}

export async function exportRegistrationReport(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const API_BASE = typeof window !== 'undefined' ? `${window.location.origin}/api` : '';
  const token = localStorage.getItem('shnoor_token');
  const res = await fetch(`${API_BASE}/reports/registrations/export?${qs}`, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  });
  const blob = await res.blob();
  return { data: blob };
}
