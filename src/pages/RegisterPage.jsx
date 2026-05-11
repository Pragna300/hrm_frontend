import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { api, API_BASE } from '../api/client';
import { formatInr } from '../lib/formatMoney';
import ConsentCheckbox from '../components/ConsentCheckbox';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    sector: '',
    contactPhone: '',
    managerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    planSlug: '',
    billingCycle: 'monthly',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);

  useEffect(() => {
    api.get('/public/plans')
      .then((res) => {
        const list = res.data || [];
        setPlans(list);
        const def = list.find((p) => p.isDefault) || list[0];
        if (def) setFormData((prev) => ({ ...prev, planSlug: prev.planSlug || def.slug }));
      })
      .catch(() => setPlans([]));
  }, []);

  const update = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!consentChecked) {
      setShowConsentError(true);
      return setError('You must agree to the Terms & Conditions and Privacy Policy');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          companyAddress: formData.companyAddress,
          sector: formData.sector,
          contactPhone: formData.contactPhone,
          managerName: formData.managerName,
          email: formData.email,
          password: formData.password,
          planSlug: formData.planSlug,
          billingCycle: formData.billingCycle,
        }),
      });
      const data = await res.json();
      if (data.success) {
        navigate('/login', {
          state: { message: 'Company registered. Sign in as the manager.' },
        });
      } else {
        setError(data.message);
      }
    } catch {
      setError('Cannot reach server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-grid">
        <div className="register-card">
          <div className="register-header">
            <div className="logo-section">
              <span className="logo-dot" />
              <span className="logo-text">HR Portal</span>
            </div>
            <h1>Register your company</h1>
            <p>Create your tenant in under a minute. You'll be the company manager.</p>
          </div>

          {error && <div className="error-alert">{error}</div>}

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <Field label="Company Name" full>
                <input value={formData.companyName} onChange={(e) => update('companyName', e.target.value)} required />
              </Field>
              <Field label="Sector / Industry">
                <select value={formData.sector} onChange={(e) => update('sector', e.target.value)} required>
                  <option value="">Select sector</option>
                  <option value="IT">IT & Software</option>
                  <option value="Finance">Finance</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field label="Contact Phone">
                <input value={formData.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} />
              </Field>
              <Field label="Manager / Admin Name" full>
                <input value={formData.managerName} onChange={(e) => update('managerName', e.target.value)} required />
              </Field>
              <Field label="Company Address" full>
                <textarea value={formData.companyAddress} onChange={(e) => update('companyAddress', e.target.value)} />
              </Field>
              <Field label="Manager Email (login)" full>
                <input type="email" value={formData.email} onChange={(e) => update('email', e.target.value)} required />
              </Field>
              <Field label="Password">
                <input type="password" value={formData.password} onChange={(e) => update('password', e.target.value)} required />
              </Field>
              <Field label="Confirm Password">
                <input type="password" value={formData.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required />
              </Field>
            </div>

            <ConsentCheckbox
              checked={consentChecked}
              onChange={(val) => {
                setConsentChecked(val);
                if (val) setShowConsentError(false);
              }}
              error={showConsentError ? 'Please accept the terms to continue' : ''}
            />

            <button className="submit-btn" disabled={loading || !consentChecked}>
              {loading ? <span className="spinner" /> : 'Create company'}
            </button>
          </form>

          <div className="register-footer">
            Already registered? <Link to="/login">Sign in</Link>
          </div>
        </div>

        <aside className="plan-aside">
          <h3>Choose a plan</h3>
          <p>You can upgrade or downgrade later from the billing screen.</p>
          <div className="plan-list">
            {plans.length === 0 && <span className="muted">Loading plans…</span>}
            {plans.map((p) => {
              const active = formData.planSlug === p.slug;
              const price = formData.billingCycle === 'yearly' ? p.yearlyPrice : p.monthlyPrice;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`plan-pick ${active ? 'is-active' : ''}`}
                  onClick={() => update('planSlug', p.slug)}
                >
                  <div className="pick-head">
                    <strong>{p.name}</strong>
                    <span>{formatInr(Number(price))}/{formData.billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                  </div>
                  <div className="pick-desc">{p.description}</div>
                  <div className="pick-feature"><Check size={12} /> Up to {p.seatLimit.toLocaleString()} seats</div>
                </button>
              );
            })}
          </div>

          <div className="cycle-toggle">
            <button
              type="button"
              className={formData.billingCycle === 'monthly' ? 'is-active' : ''}
              onClick={() => update('billingCycle', 'monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={formData.billingCycle === 'yearly' ? 'is-active' : ''}
              onClick={() => update('billingCycle', 'yearly')}
            >
              Yearly
            </button>
          </div>
        </aside>
      </div>

      <style>{`
        .register-page { min-height: 100vh; padding: 30px 20px; background: #f8fafc; background-image: radial-gradient(#cbd5e1 0.5px, transparent 0.5px); background-size: 24px 24px; font-family: 'Inter', sans-serif; }
        .register-grid { max-width: 1080px; margin: 0 auto; display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; align-items: start; }
        .register-card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
        .register-header { text-align: center; margin-bottom: 28px; }
        .logo-section { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px; }
        .logo-dot { width: 12px; height: 12px; background: linear-gradient(135deg, #1e3a5f, #f59e0b); border-radius: 50%; }
        .logo-text { font-weight: 800; font-size: 18px; color: #0f172a; }
        .register-header h1 { font-size: 26px; font-weight: 900; color: #0f172a; margin-bottom: 8px; }
        .register-header p  { color: #64748b; font-size: 14px; }
        .error-alert { background: #fef2f2; border: 1px solid #fee2e2; color: #b91c1c; padding: 12px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; text-align: center; }
        .register-form { display: flex; flex-direction: column; gap: 18px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-grid .full { grid-column: span 2; }
        .form-grid label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #475569; font-weight: 600; }
        .form-grid input, .form-grid select, .form-grid textarea { padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: #fcfdfe; }
        .form-grid input:focus, .form-grid select:focus, .form-grid textarea:focus { border-color: #1e3a5f; outline: none; box-shadow: 0 0 0 3px rgba(30,58,95,0.1); background: white; }
        .form-grid textarea { min-height: 60px; resize: vertical; }
        .submit-btn { background: #0f172a; color: white; padding: 14px; border-radius: 10px; font-size: 15px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .submit-btn:hover:not(:disabled) { background: #1e293b; }
        .register-footer { text-align: center; margin-top: 24px; color: #64748b; font-size: 14px; }
        .register-footer a { color: #1e3a5f; font-weight: 700; text-decoration: none; }
        .spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .plan-aside { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; position: sticky; top: 24px; }
        .plan-aside h3 { font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
        .plan-aside p  { font-size: 13px; color: #64748b; margin-bottom: 16px; }
        .plan-list { display: flex; flex-direction: column; gap: 10px; }
        .muted { font-size: 13px; color: #94a3b8; }
        .plan-pick { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; text-align: left; cursor: pointer; transition: 0.15s; }
        .plan-pick:hover { border-color: #1e3a5f; }
        .plan-pick.is-active { border-color: #1e3a5f; background: #f0f5fb; box-shadow: 0 0 0 3px rgba(30,58,95,0.08); }
        .pick-head { display: flex; justify-content: space-between; font-size: 14px; color: #0f172a; }
        .pick-desc { font-size: 12px; color: #64748b; margin: 6px 0; }
        .pick-feature { font-size: 11px; color: #475569; display: inline-flex; align-items: center; gap: 6px; }

        .cycle-toggle { display: flex; gap: 6px; margin-top: 16px; padding: 4px; background: #f1f5f9; border-radius: 8px; }
        .cycle-toggle button { flex: 1; padding: 8px; font-size: 12px; font-weight: 700; border: none; background: transparent; border-radius: 6px; color: #64748b; cursor: pointer; }
        .cycle-toggle .is-active { background: white; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

        @media (max-width: 900px) {
          .register-grid { grid-template-columns: 1fr; }
          .form-grid     { grid-template-columns: 1fr; }
          .form-grid .full { grid-column: auto; }
        }
      `}</style>
    </div>
  );
};

const Field = ({ label, children, full }) => (
  <label className={full ? 'full' : ''}>
    <span>{label}</span>
    {children}
  </label>
);

export default RegisterPage;
