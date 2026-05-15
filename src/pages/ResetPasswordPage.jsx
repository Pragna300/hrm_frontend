import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE } from '../api/client';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: formData.password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          navigate('/login', { state: { message: 'Password reset successfully. Please log in.' } });
        }, 2000);
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
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-section">
              <span className="logo-dot"></span>
              <span className="logo-text">HR Portal</span>
            </div>
            <h1>Set new password</h1>
            <p>Please enter your new password below.</p>
          </div>

          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}

          {!success && (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  disabled={!token}
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
              </div>
              <div className="input-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  disabled={!token}
                  value={formData.confirmPassword} 
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                />
              </div>
              <button className="submit-btn" disabled={loading || !token}>
                {loading ? <span className="spinner"></span> : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="login-footer">
            <p>Back to <Link to="/login">Sign In</Link></p>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          background-image: radial-gradient(#cbd5e1 0.5px, transparent 0.5px);
          background-size: 24px 24px;
          font-family: 'Inter', sans-serif;
        }
        .login-container {
          width: 100%;
          max-width: 450px;
          padding: 20px;
        }
        .login-card {
          background: white;
          padding: 48px;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }
        .login-header {
          text-align: center;
          margin-bottom: 32px;
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
        }
        .login-header h1 {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 10px;
        }
        .login-header p {
          color: #64748b;
          font-size: 15px;
          line-height: 1.5;
        }
        .alert {
          padding: 14px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 24px;
          text-align: center;
        }
        .alert.error { background: #fef2f2; border: 1px solid #fee2e2; color: #b91c1c; }
        .alert.success { background: #f0fdf4; border: 1px solid #dcfce7; color: #166534; }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
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
        .input-group input {
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          background: #fcfdfe;
          transition: all 0.2s;
        }
        .input-group input:focus {
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
        }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .login-footer {
          text-align: center;
          margin-top: 32px;
          color: #64748b;
          font-size: 14px;
        }
        .login-footer a {
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
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ResetPasswordPage;
