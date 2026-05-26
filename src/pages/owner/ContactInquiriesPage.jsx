import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Mail, MessageSquare, Search, Filter, Calendar, User, Eye, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INQUIRY_TYPES = [
  'GENERAL', 'DEMO_REQUEST', 'TECHNICAL_SUPPORT', 'EMPLOYEE_ISSUE',
  'PAYROLL_ISSUE', 'ATTENDANCE_ISSUE', 'FEATURE_REQUEST', 'BUG_REPORT', 'PARTNERSHIP'
];
const STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const ContactInquiriesPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;

      const res = await api.get('/admin/contact-inquiries', { params });
      setInquiries(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [page, search, filterType, filterStatus, filterPriority]);

  const updateInquiry = async (id, data) => {
    try {
      await api.patch(`/admin/contact-inquiries/${id}`, data);
      fetchInquiries();
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, ...data });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteInquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resolved inquiry? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/contact-inquiries/${id}`);
      fetchInquiries();
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
    } catch (err) {
      alert(err?.body?.error || 'Failed to delete inquiry');
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800';
      case 'CLOSED': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800';
      case 'LOW': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Support Inquiries</h1>
          <p className="text-slate-500 mt-1">Manage contact and support requests from the landing page</p>
        </div>
        <div className="flex bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-2 border-r border-slate-200 bg-slate-50 text-slate-600 font-medium text-sm flex items-center">
            Total
          </div>
          <div className="px-4 py-2 font-bold text-slate-900">{total}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search name, email, subject..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select 
            value={filterType} 
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 min-w-[150px]"
          >
            <option value="">All Types</option>
            {INQUIRY_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
          <select 
            value={filterStatus} 
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 min-w-[150px]"
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            value={filterPriority} 
            onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 min-w-[150px]"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Type & Subject</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Priority</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading inquiries...</td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No inquiries found.</td>
                </tr>
              ) : (
                inquiries.map((iq) => (
                  <tr key={iq.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{iq.name}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {iq.email}</div>
                      {iq.organizationName && <div className="text-xs text-slate-400 mt-0.5">{iq.organizationName}</div>}
                    </td>
                    <td className="px-6 py-4 max-w-[250px]">
                      <div className="text-xs font-semibold text-blue-600 mb-1">{iq.inquiryType.replace(/_/g, ' ')}</div>
                      <div className="text-sm text-slate-800 truncate" title={iq.subject}>{iq.subject || 'No subject'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={iq.status} 
                        onChange={(e) => updateInquiry(iq.id, { status: e.target.value })}
                        className={`text-xs font-bold px-2 py-1 rounded-full border-none focus:ring-2 cursor-pointer ${getStatusColor(iq.status)}`}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={iq.priority} 
                        onChange={(e) => updateInquiry(iq.id, { priority: e.target.value })}
                        className={`text-xs font-bold px-2 py-1 rounded-full border-none focus:ring-2 cursor-pointer ${getPriorityColor(iq.priority)}`}
                      >
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(iq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setSelectedInquiry(iq)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {iq.status === 'CLOSED' && (
                          <button 
                            onClick={() => deleteInquiry(iq.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete (Resolved only)"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {total > limit && (
          <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
            <span className="text-sm text-slate-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 border border-slate-300 rounded bg-white text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                disabled={page * limit >= total}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border border-slate-300 rounded bg-white text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      <AnimatePresence>
        {selectedInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Inquiry #{selectedInquiry.id}</h3>
                  <div className="text-sm text-slate-500 mt-1 flex items-center gap-4">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(selectedInquiry.status)}`}>{selectedInquiry.status}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getPriorityColor(selectedInquiry.priority)}`}>{selectedInquiry.priority}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedInquiry(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sender Info</h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-slate-400" />
                        <span className="font-semibold text-slate-900">{selectedInquiry.name}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="w-5 h-5 text-slate-400" />
                        <a href={`mailto:${selectedInquiry.email}`} className="text-blue-600 hover:underline">{selectedInquiry.email}</a>
                      </div>
                      {selectedInquiry.organizationName && (
                        <div className="text-sm text-slate-600 ml-8">Org: {selectedInquiry.organizationName}</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Request Type</h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 h-full">
                      <span className="text-blue-700 font-semibold bg-blue-100 px-3 py-1 rounded-full text-sm inline-block mb-3">
                        {selectedInquiry.inquiryType.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message</h4>
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h5 className="font-bold text-slate-900 mb-3 pb-3 border-b border-slate-100">{selectedInquiry.subject || 'No Subject'}</h5>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedInquiry.message}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Notes (Internal)</h4>
                  <textarea 
                    className="w-full border border-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    rows="3" 
                    placeholder="Add internal notes about this inquiry..."
                    defaultValue={selectedInquiry.adminNotes || ''}
                    onBlur={(e) => {
                      if (e.target.value !== selectedInquiry.adminNotes) {
                        updateInquiry(selectedInquiry.id, { adminNotes: e.target.value });
                      }
                    }}
                  />
                  <p className="text-xs text-slate-400 mt-2">Notes save automatically when you click away.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactInquiriesPage;
