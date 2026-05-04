import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '../api/client';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (data.success) navigate('/login');
      else setError(data.message);
    } catch {
      setError('Cannot reach server. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="v6-auth-page">
      <div className="v6-auth-left">
        <div className="v6-auth-box">
          <div className="v6-auth-header">
            <img src="/logo.png" alt="SHNOOR" style={{ height: '60px', marginBottom: '30px' }} />
            <h1>Join SHNOOR</h1>
            <p>Empowering the workforce of tomorrow. Please create your account.</p>
          </div>

          {error && <div className="v6-auth-error">{error}</div>}

          <form className="v6-auth-form" onSubmit={handleSubmit}>
            <div className="v6-input-group">
              <label>Full Name</label>
              <input type="text" placeholder="e.g. John Doe" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="v6-input-group">
              <label>Professional Email</label>
              <input type="email" placeholder="name@shnoor.com" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="v6-input-group">
              <label>Security Password</label>
              <input type="password" placeholder="••••••••" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="v6-input-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="••••••••" required value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
            </div>
            <button className="v6-btn-primary" disabled={loading}>{loading ? 'Processing...' : 'Create Account'}</button>
          </form>

          <div className="v6-auth-footer">
            Already a member? <Link to="/login">Log In</Link>
          </div>
        </div>
      </div>
      <div className="v6-auth-right">
        <div className="v6-brand-overlay">
          <h2>SHNOOR <br/>International</h2>
          <div className="v6-brand-line"></div>
          <p>Excellence in Global Enterprise Management</p>
        </div>
      </div>

      <style>{`
        .v6-auth-page { display: flex; height: 100vh; font-family: 'Inter', sans-serif; background: #fff; overflow: hidden; }
        .v6-auth-left { flex: 1; display: flex; align-items: center; justify-content: center; padding: 60px; }
        .v6-auth-box { width: 100%; max-width: 400px; }
        .v6-auth-header { margin-bottom: 40px; }
        .v6-auth-header h1 { font-size: 28px; font-weight: 900; color: #1a365d; margin-bottom: 10px; }
        .v6-auth-header p { font-size: 15px; color: #718096; line-height: 1.5; }
        .v6-auth-error { background: #fff5f5; color: #c53030; padding: 12px; border-radius: 8px; font-size: 14px; margin-bottom: 25px; border: 1px solid #fed7d7; }
        .v6-auth-form { display: flex; flex-direction: column; gap: 20px; }
        .v6-input-group { display: flex; flex-direction: column; gap: 8px; }
        .v6-input-group label { font-size: 13px; font-weight: 700; color: #2d3748; }
        .v6-input-group input { padding: 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px; transition: 0.2s; background: #f8fafc; }
        .v6-input-group input:focus { outline: none; border-color: #3174ad; box-shadow: 0 0 0 3px rgba(49, 116, 173, 0.1); background: #fff; }
        .v6-btn-primary { background: #3174ad; color: white; border: none; padding: 16px; border-radius: 8px; font-size: 16px; font-weight: 700; cursor: pointer; transition: 0.2s; margin-top: 10px; }
        .v6-btn-primary:hover { background: #2b6cb0; transform: translateY(-1px); }
        .v6-auth-footer { text-align: center; margin-top: 30px; font-size: 15px; color: #718096; }
        .v6-auth-footer a { color: #3174ad; font-weight: 800; text-decoration: none; }
        .v6-auth-right { flex: 1.2; background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%); display: flex; align-items: center; justify-content: center; position: relative; }
        .v6-brand-overlay { text-align: left; padding: 80px; color: white; }
        .v6-brand-overlay h2 { font-size: 64px; font-weight: 900; line-height: 1; margin-bottom: 30px; }
        .v6-brand-line { width: 80px; height: 6px; background: #f3a633; margin-bottom: 30px; border-radius: 3px; }
        .v6-brand-overlay p { font-size: 20px; color: #a0aec0; max-width: 400px; }
        @media (max-width: 900px) { .v6-auth-right { display: none; } }
      `}</style>
    </div>
  );
};

export default RegisterPage;
