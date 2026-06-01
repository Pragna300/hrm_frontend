import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Users, Clock, BarChart3, Globe, Cpu,
  Mail, MapPin, Phone, Check,
} from 'lucide-react';
import { api } from '../api/client';
import { formatInr } from '../lib/formatMoney';
import ContactUsSection from '../components/landing/ContactUsSection';

const LandingPage = () => {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    api.get('/public/plans')
      .then((res) => setPlans(res.data || []))
      .catch(() => setPlans([]));
  }, []);

  return (
    <div className="hr-landing">
      <nav className="nav">
        <div className="container nav-row">
          <Link to="/" className="brand">
            <span className="brand-dot" /> HR Portal
          </Link>
          <div className="nav-actions">
            <a href="#contact" className="btn-link">Contact</a>
            <Link to="/login" className="btn-link">Login</Link>
            <Link to="/register" className="btn-primary">Start free</Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container hero-grid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-content"
          >
            <div className="badge">SaaS HR for modern teams</div>
            <h1>Run HR for every company, <span className="gold">on one platform</span>.</h1>
            <p>
              Onboard your company in minutes. Manage employees, attendance, leaves and payroll
              with role-based access for managers, HR, team leads and staff — all in one place.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-cta">Register your company</Link>
              <Link to="/login"    className="btn-secondary">Sign in</Link>
            </div>
            <div className="trust-row">
              <Check size={14} /> 14-day free trial · no credit card required
            </div>
          </motion.div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-card-row blue">
                <Users size={20} /> Manage employees & roles
              </div>
              <div className="hero-card-row green">
                <Clock size={20} /> Tap-in / tap-out attendance
              </div>
              <div className="hero-card-row amber">
                <BarChart3 size={20} /> Leaves & payroll workflows
              </div>
              <div className="hero-card-row navy">
                <ShieldCheck size={20} /> Tenant-isolated security
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="solutions">
        <div className="container">
          <div className="section-head">
            <h2>One portal, three perspectives</h2>
            <div className="underline" />
            <p>Built so the platform owner, every company manager and every employee see exactly what they need.</p>
          </div>
          <div className="solution-grid">
            <SolutionCard
              icon={<Globe size={22} />}
              title="Platform owner"
              desc="See every customer company, MRR, paid invoices, and seat usage. Manage plans and prices from one dashboard."
            />
            <SolutionCard
              icon={<Cpu size={22} />}
              title="Company manager"
              desc="Hire & manage staff, approve leaves, run payroll, post announcements, and track real-time attendance."
            />
            <SolutionCard
              icon={<Users size={22} />}
              title="Employees & team leads"
              desc="Self-service tap in/out, leave balances and requests, payslips, attendance history and announcements."
            />
          </div>
        </div>
      </section>

      {plans.length > 0 && (
        <section className="pricing">
          <div className="container">
            <div className="section-head">
              <h2>Simple, transparent pricing</h2>
              <div className="underline" />
              <p>Start free, upgrade as you grow. Cancel any time.</p>
            </div>
            <div className="plans-grid">
              {plans.map((p) => (
                <div key={p.id} className={`plan-card ${p.isDefault ? 'featured' : ''}`}>
                  {p.isDefault && <div className="plan-pill">Most popular</div>}
                  <h3>{p.name}</h3>
                  <div className="plan-price">
                    <span className="amount">{formatInr(Number(p.monthlyPrice))}</span>
                    <span className="cycle">/ month</span>
                  </div>
                  <p className="plan-desc">{p.description}</p>
                  <ul>
                    <li><Check size={14} /> Up to {p.seatLimit.toLocaleString()} seats</li>
                    {(p.features || '').split(',').filter(Boolean).map((f) => (
                      <li key={f}><Check size={14} /> {f.trim()}</li>
                    ))}
                  </ul>
                  <Link to={`/owner/subscription?priceId=${p.id}`} className="plan-cta">Choose {p.name}</Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <ContactUsSection />

      <footer className="footer">
        <div className="container footer-row">
          <div className="footer-brand">
            <span className="brand-dot" /> HR Portal
            <p>One platform. Every company.</p>
          </div>
          <div className="footer-contact">
            <div><MapPin size={14} /> Hyderabad · Mumbai · Remote</div>
            <div><Mail size={14} /> hello@hrportal.app</div>
            <div><Phone size={14} /> +91 22 4000 8000</div>
          </div>
        </div>
        <div className="footer-bottom container">
          <p>© {new Date().getFullYear()} HR Portal. All rights reserved.</p>
          <div className="legal">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/cookies">Cookies</Link>
          </div>
        </div>
      </footer>

      <style>{`
        .hr-landing { font-family: 'Inter', sans-serif; color: #0f172a; background: #fff; }
        .container { max-width: 1180px; margin: 0 auto; padding: 0 24px; }
        .nav { height: 72px; display: flex; align-items: center; border-bottom: 1px solid #f1f5f9; background: #fff; position: sticky; top: 0; z-index: 10; }
        .nav-row { display: flex; justify-content: space-between; align-items: center; }
        .brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: #0f172a; font-weight: 800; font-size: 18px; }
        .brand-dot { width: 12px; height: 12px; border-radius: 50%; background: linear-gradient(135deg, #1e3a5f, #f59e0b); }
        .nav-actions { display: flex; gap: 12px; align-items: center; }
        .btn-link { color: #1e3a5f; font-weight: 700; text-decoration: none; padding: 8px 14px; }
        .btn-primary { background: #0f172a; color: white; padding: 10px 18px; border-radius: 8px; font-weight: 700; text-decoration: none; }
        .btn-primary:hover { background: #1e293b; }

        .hero { padding: 80px 0; background: linear-gradient(180deg, #f8faff, #fff); }
        .hero-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 48px; align-items: center; }
        .badge { display: inline-block; padding: 6px 12px; background: #ebf4ff; color: #1e3a5f; font-size: 12px; font-weight: 800; border-radius: 999px; margin-bottom: 20px; letter-spacing: 0.5px; }
        .hero-content h1 { font-size: 54px; line-height: 1.05; font-weight: 900; color: #0f172a; margin-bottom: 18px; }
        .hero-content .gold { color: #f59e0b; }
        .hero-content p { font-size: 18px; color: #475569; line-height: 1.6; margin-bottom: 28px; }
        .hero-actions { display: flex; gap: 12px; margin-bottom: 14px; }
        .btn-cta { background: #0f172a; color: white; padding: 14px 28px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 16px; box-shadow: 0 10px 25px rgba(15,23,42,0.2); }
        .btn-cta:hover { background: #1e293b; }
        .btn-secondary { padding: 14px 22px; border-radius: 10px; font-weight: 700; color: #1e3a5f; border: 1px solid #cbd5e1; text-decoration: none; }
        .trust-row { display: inline-flex; align-items: center; gap: 6px; color: #64748b; font-size: 13px; }

        .hero-visual { display: flex; justify-content: center; }
        .hero-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px; width: 100%; max-width: 420px; box-shadow: 0 25px 60px -25px rgba(15,23,42,0.25); display: flex; flex-direction: column; gap: 14px; }
        .hero-card-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 10px; font-weight: 700; }
        .hero-card-row.blue  { background: #eff6ff; color: #1e40af; }
        .hero-card-row.green { background: #ecfdf5; color: #065f46; }
        .hero-card-row.amber { background: #fffbeb; color: #92400e; }
        .hero-card-row.navy  { background: #0f172a; color: #f8fafc; }

        .solutions { padding: 90px 0; }
        .section-head { text-align: center; max-width: 700px; margin: 0 auto 50px; }
        .section-head h2 { font-size: 34px; font-weight: 900; color: #0f172a; margin-bottom: 12px; }
        .underline { width: 60px; height: 4px; background: #f59e0b; margin: 0 auto 18px; border-radius: 2px; }
        .section-head p { font-size: 17px; color: #475569; }
        .solution-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .sol-card { padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; background: #f8fafc; transition: 0.2s; }
        .sol-card:hover { background: white; border-color: #1e3a5f; box-shadow: 0 20px 40px rgba(15,23,42,0.08); transform: translateY(-2px); }
        .sol-icon { width: 48px; height: 48px; background: white; color: #1e3a5f; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .sol-card h4 { font-size: 18px; font-weight: 800; margin-bottom: 10px; color: #0f172a; }
        .sol-card p { color: #475569; font-size: 14px; line-height: 1.6; }

        .pricing { padding: 90px 0; background: #f8fafc; }
        .plans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; }
        .plan-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px 24px; position: relative; display: flex; flex-direction: column; }
        .plan-card.featured { border-color: #1e3a5f; box-shadow: 0 20px 40px rgba(15,23,42,0.1); }
        .plan-pill { position: absolute; top: -10px; left: 24px; background: #1e3a5f; color: white; font-size: 11px; padding: 4px 10px; border-radius: 999px; font-weight: 800; }
        .plan-card h3 { font-size: 20px; font-weight: 900; color: #0f172a; }
        .plan-price { margin: 14px 0; }
        .plan-price .amount { font-size: 32px; font-weight: 900; color: #0f172a; }
        .plan-price .cycle  { font-size: 13px; color: #64748b; margin-left: 4px; }
        .plan-desc { font-size: 13px; color: #64748b; margin-bottom: 18px; min-height: 36px; }
        .plan-card ul { list-style: none; padding: 0; margin: 0 0 24px; flex: 1; }
        .plan-card ul li { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #334155; padding: 4px 0; }
        .plan-cta { display: block; text-align: center; padding: 12px; border-radius: 10px; background: #0f172a; color: white; text-decoration: none; font-weight: 700; }
        .plan-card.featured .plan-cta { background: #1e3a5f; }

        .footer { background: #0f172a; color: #cbd5e1; padding: 60px 0 24px; }
        .footer-row { display: flex; justify-content: space-between; gap: 30px; padding-bottom: 36px; border-bottom: 1px solid #1e293b; }
        .footer-brand p { color: #64748b; font-size: 14px; margin-top: 8px; }
        .footer-contact div { display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 4px 0; }
        .footer-bottom { display: flex; justify-content: space-between; padding-top: 24px; font-size: 13px; }
        .legal { display: flex; gap: 16px; }
        .legal a { color: #64748b; text-decoration: none; }
        .legal a:hover { color: #f59e0b; }

        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; }
          .hero-content h1 { font-size: 38px; }
          .solution-grid { grid-template-columns: 1fr; }
          .footer-row { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

const SolutionCard = ({ icon, title, desc }) => (
  <div className="sol-card">
    <div className="sol-icon">{icon}</div>
    <h4>{title}</h4>
    <p>{desc}</p>
  </div>
);

export default LandingPage;
