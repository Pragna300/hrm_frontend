import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '../api/client';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    sector: '',
    adminName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
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
        body: JSON.stringify({
          companyName: formData.companyName,
          companyAddress: formData.companyAddress,
          sector: formData.sector,
          adminName: formData.adminName,
          email: formData.email,
          password: formData.password
        }),
      });
      const data = await res.json();
      if (data.success) {
        navigate('/login', { state: { message: 'Registration successful! Please login as Admin.' } });
      } else {
        setError(data.message);
      }
    } catch {
      setError('Cannot reach server. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <div className="logo-section">
              <span className="logo-dot"></span>
              <span className="logo-text">SHNOOR HR</span>
            </div>
            <h1>Create Admin Account</h1>
            <p>Register your organization to start managing your workforce effectively.</p>
          </div>

          {error && <div className="error-alert">{error}</div>}

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="input-group full-width">
                <label>Company Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Global Tech Solutions" 
                  required 
                  value={formData.companyName} 
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label>Sector / Industry</label>
                <select 
                  required 
                  value={formData.sector} 
                  onChange={(e) => setFormData({...formData, sector: e.target.value})}
                >
                  <option value="">Select Sector</option>
                  <option value="IT">IT & Software</option>
                  <option value="Finance">Finance</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="input-group">
                <label>Admin Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe" 
                  required 
                  value={formData.adminName} 
                  onChange={(e) => setFormData({...formData, adminName: e.target.value})} 
                />
              </div>

              <div className="input-group full-width">
                <label>Company Address</label>
                <textarea 
                  placeholder="Full office address" 
                  value={formData.companyAddress} 
                  onChange={(e) => setFormData({...formData, companyAddress: e.target.value})}
                />
              </div>

              <div className="input-group full-width">
                <label>Work Email (Admin Login)</label>
                <input 
                  type="email" 
                  placeholder="admin@company.com" 
                  required 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={formData.confirmPassword} 
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                />
              </div>
            </div>

            <button className="submit-btn" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Register Organization'}
            </button>
          </form>

          <div className="signup-footer">
            Already registered? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>

      <style>{`
        .admin-signup-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          background-image: radial-gradient(#cbd5e1 0.5px, transparent 0.5px);
          background-size: 24px 24px;
          padding: 40px 20px;
          font-family: 'Inter', sans-serif;
        }
        .signup-container {
          width: 100%;
          max-width: 700px;
        }
        .signup-card {
          background: white;
          padding: 48px;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }
        .signup-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .logo-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 24px;
        }
        .logo-dot {
          width: 12px;
          height: 12px;
          background: #3b82f6;
          border-radius: 50%;
        }
        .logo-text {
          font-weight: 800;
          font-size: 20px;
          color: #1e293b;
          letter-spacing: -0.5px;
        }
        .signup-header h1 {
          font-size: 32px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 12px;
        }
        .signup-header p {
          color: #64748b;
          font-size: 16px;
        }
        .error-alert {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #b91c1c;
          padding: 14px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 24px;
          text-align: center;
        }
        .signup-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .full-width {
          grid-column: span 2;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-group label {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
        }
        .input-group input, 
        .input-group select, 
        .input-group textarea {
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          background: #fcfdfe;
          transition: all 0.2s;
        }
        .input-group textarea {
          height: 80px;
          resize: none;
        }
        .input-group input:focus, 
        .input-group select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          background: white;
        }
        .submit-btn {
          background: #1e293b;
          color: white;
          padding: 16px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .submit-btn:hover {
          background: #0f172a;
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .signup-footer {
          text-align: center;
          margin-top: 32px;
          color: #64748b;
          font-size: 15px;
        }
        .signup-footer a {
          color: #3b82f6;
          font-weight: 700;
          text-decoration: none;
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .form-grid { grid-template-columns: 1fr; }
          .full-width { grid-column: span 1; }
          .signup-card { padding: 32px 24px; }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
