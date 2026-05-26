import React, { useState } from 'react';
import { Mail, Check, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { motion } from 'framer-motion';

const INQUIRY_TYPES = [
  'GENERAL',
  'DEMO_REQUEST',
  'TECHNICAL_SUPPORT',
  'EMPLOYEE_ISSUE',
  'PAYROLL_ISSUE',
  'ATTENDANCE_ISSUE',
  'FEATURE_REQUEST',
  'BUG_REPORT',
  'PARTNERSHIP'
];

const ContactUsSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organizationName: '',
    inquiryType: 'GENERAL',
    subject: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: 'error', message: 'Name, email, and message are required.' });
      return;
    }
    
    setLoading(true);
    setStatus(null);
    try {
      await api.post('/contact-us', formData);
      setStatus({ type: 'success', message: 'Your support request has been submitted successfully. Our team will contact you soon.' });
      setFormData({
        name: '',
        email: '',
        organizationName: '',
        inquiryType: 'GENERAL',
        subject: '',
        message: ''
      });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to submit inquiry. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact-us py-20 bg-white" id="contact">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Contact Us & Support</h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto rounded mb-6"></div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Need help onboarding? Have a technical issue? Or just want to request a demo? Our team is here to assist you.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 bg-slate-50 rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="w-full md:w-5/12 bg-slate-900 p-10 text-white flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-6">Get in touch</h3>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Fill out the form and our support team will get back to you within 24 hours. We are dedicated to providing the best enterprise HRM experience.
            </p>
            <div className="flex items-center gap-4 mb-6 text-slate-300">
              <Mail className="text-amber-500" />
              <span>support@hrportal.app</span>
            </div>
            <div className="mt-auto pt-10">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-${600 - (i*100)} flex items-center justify-center overflow-hidden`}>
                     <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=Support${i}`} alt="Avatar" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-400 mt-3">Join HRM</p>
            </div>
          </div>

          <div className="w-full md:w-7/12 p-10">
            {status && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg mb-6 flex gap-3 items-start ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}
              >
                {status.type === 'success' ? <Check className="shrink-0" /> : <AlertCircle className="shrink-0" />}
                <p className="text-sm font-medium">{status.message}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="john@company.com" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Organization (Optional)</label>
                  <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="ABC Pvt Ltd" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Inquiry Type</label>
                  <select name="inquiryType" value={formData.inquiryType} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                    {INQUIRY_TYPES.map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="How can we help?" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Message *</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows="4" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none" placeholder="Please describe your issue or request in detail..."></textarea>
              </div>

              <button type="submit" disabled={loading} className={`w-full py-3 rounded-lg font-bold text-white transition-all ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'}`}>
                {loading ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUsSection;
