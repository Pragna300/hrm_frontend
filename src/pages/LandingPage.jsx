
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  BarChart3, 
  Globe, 
  Cpu,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="shnoor-v6-landing">
      {/* Navigation */}
      <nav className="v6-nav">
        <div className="v6-container">
          <Link to="/">
            <img src="/logo.png" alt="SHNOOR" style={{ height: '50px' }} />
          </Link>
          <div className="v6-nav-actions">
            <Link to="/login" className="v6-btn-login-nav">Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="v6-hero">
        <div className="v6-container v6-hero-grid">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="v6-hero-content"
          >
            <div className="v6-badge">SHNOOR INTERNAL ECOSYSTEM</div>
            <h1>The Unified Gateway for <br/><span className="gold">Global Talent</span></h1>
            <p>Empowering SHNOOR International's workforce with a high-performance HR management portal. Precision, security, and transparency across every department.</p>
            <div className="v6-hero-actions">
              <Link to="/login" className="v6-btn-hero">Access Portal</Link>
            </div>
          </motion.div>
          <div className="v6-hero-visual">
            <div className="v6-illustration-box">
              <img src="/logo.png" alt="Corporate" style={{ width: '100%', maxWidth: '300px', opacity: 0.9 }} />
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="v6-solutions">
        <div className="v6-container">
          <div className="v6-section-header">
            <h2>Our Core Solutions</h2>
            <div className="v6-underline"></div>
            <p>A comprehensive suite of tools designed to optimize operational efficiency and employee well-being.</p>
          </div>
          <div className="v6-solution-grid">
            <SolutionCard 
              icon={<Clock size={24} />} 
              title="Attendance & Shifts" 
              desc="Real-time tap in/out tracking with automated shift calculation and location verification."
            />
            <SolutionCard 
              icon={<BarChart3 size={24} />} 
              title="Insightful Analytics" 
              desc="Data-driven reports on workforce health, on-time arrivals, and organizational performance."
            />
            <SolutionCard 
              icon={<ShieldCheck size={24} />} 
              title="Secure Authorizations" 
              desc="Streamlined leave requests and document approvals with enterprise-grade encryption."
            />
            <SolutionCard 
              icon={<Users size={24} />} 
              title="Employee Central" 
              desc="A self-service portal for personal data, documents, and peer recognition."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="v6-stats">
        <div className="v6-container">
          <div className="v6-stats-grid">
            <StatItem val="1200+" lbl="Active Workforce" />
            <StatItem val="12" lbl="Global Offices" />
            <StatItem val="98%" lbl="System Uptime" />
            <StatItem val="24/7" lbl="Portal Availability" />
          </div>
        </div>
      </section>

      {/* Corporate Values */}
      <section className="v6-values">
        <div className="v6-container">
          <div className="v6-values-grid">
            <div className="v6-value-item">
              <Globe className="v6-v-icon" />
              <h3>Global Presence</h3>
              <p>Connecting Shnoor's diverse teams across multiple time zones and locations.</p>
            </div>
            <div className="v6-value-item">
              <Cpu className="v6-v-icon" />
              <h3>Digital Innovation</h3>
              <p>Leveraging cutting-edge technology to automate complex HR workflows.</p>
            </div>
            <div className="v6-value-item">
              <ShieldCheck className="v6-v-icon" />
              <h3>Trust & Security</h3>
              <p>Ensuring your personal and professional data is protected by the highest standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="v6-footer">
        <div className="v6-container">
          <div className="v6-footer-top">
            <div className="v6-f-brand">
              <img src="/logo.png" alt="SHNOOR" style={{ height: '60px' }} />
            </div>
            <div className="v6-f-contact">
              <div className="v6-f-c-item"><MapPin size={16}/> <span>Mumbai HQ, Maharashtra, India</span></div>
              <div className="v6-f-c-item"><Mail size={16}/> <span>hr@shnoor.com</span></div>
              <div className="v6-f-c-item"><Phone size={16}/> <span>+91 22 4000 8000</span></div>
            </div>
          </div>
          <div className="v6-footer-bottom">
            <p>© 2026 SHNOOR International LLC. Designed for Excellence.</p>
            <div className="v6-footer-legal">
              <Link to="/privacy">Privacy Policy</Link>
              <span className="v6-f-sep">|</span>
              <Link to="/terms">Terms & Conditions</Link>
              <span className="v6-f-sep">|</span>
              <Link to="/cookies">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .shnoor-v6-landing { background: #fff; color: #333; font-family: 'Inter', sans-serif; overflow-x: hidden; }
        .v6-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .v6-nav { height: 90px; display: flex; align-items: center; background: white; border-bottom: 1px solid #f1f3f5; }
        .v6-nav .v6-container { display: flex; justify-content: space-between; align-items: center; width: 100%; }
        .v6-btn-login-nav { font-size: 15px; font-weight: 700; color: #3174ad; text-decoration: none; padding: 10px 24px; border: 2px solid #3174ad; border-radius: 6px; transition: 0.2s; }
        .v6-btn-login-nav:hover { background: #3174ad; color: white; }
        .v6-hero { padding: 100px 0; background: linear-gradient(135deg, #f8faff 0%, #fff 100%); }
        .v6-hero-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 60px; align-items: center; }
        .v6-hero-content h1 { font-size: 58px; font-weight: 900; color: #1a365d; line-height: 1.1; margin-bottom: 25px; }
        .v6-hero-content .gold { color: #f3a633; }
        .v6-hero-content p { font-size: 20px; color: #4a5568; line-height: 1.6; margin-bottom: 45px; }
        .v6-badge { display: inline-block; padding: 6px 14px; background: #ebf4ff; color: #3174ad; font-size: 13px; font-weight: 800; border-radius: 4px; margin-bottom: 25px; letter-spacing: 1px; }
        .v6-btn-hero { display: inline-block; padding: 18px 45px; background: #2d3748; color: white; border-radius: 8px; font-size: 18px; font-weight: 700; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 25px rgba(45, 55, 72, 0.2); }
        .v6-btn-hero:hover { background: #1a202c; transform: translateY(-2px); box-shadow: 0 15px 35px rgba(45, 55, 72, 0.3); }
        .v6-illustration-box { width: 100%; max-width: 500px; display: flex; justify-content: center; }
        .v6-solutions { padding: 100px 0; }
        .v6-section-header { text-align: center; max-width: 700px; margin: 0 auto 70px; }
        .v6-section-header h2 { font-size: 36px; font-weight: 900; color: #1a365d; margin-bottom: 15px; }
        .v6-underline { width: 60px; height: 4px; background: #f3a633; margin: 0 auto 20px; border-radius: 2px; }
        .v6-section-header p { font-size: 18px; color: #718096; }
        .v6-solution-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
        .v6-sol-card { padding: 40px; background: #f8faff; border-radius: 16px; border: 1px solid #ebf4ff; transition: 0.3s; }
        .v6-sol-card:hover { background: white; box-shadow: 0 20px 40px rgba(0,0,0,0.05); transform: translateY(-5px); border-color: #3174ad; }
        .v6-sol-icon { width: 54px; height: 54px; background: white; color: #3174ad; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
        .v6-sol-card h4 { font-size: 20px; font-weight: 800; color: #1a365d; margin-bottom: 15px; }
        .v6-sol-card p { font-size: 15px; color: #4a5568; line-height: 1.6; }
        .v6-stats { padding: 80px 0; background: #1a365d; color: white; }
        .v6-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; text-align: center; }
        .v6-stat-val { display: block; font-size: 42px; font-weight: 900; color: #f3a633; margin-bottom: 5px; }
        .v6-stat-lbl { font-size: 14px; font-weight: 600; color: #a0aec0; text-transform: uppercase; letter-spacing: 1px; }
        .v6-values { padding: 100px 0; background: #f8f9fa; }
        .v6-values-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 50px; }
        .v6-value-item { text-align: center; }
        .v6-v-icon { color: #f3a633; margin-bottom: 25px; width: 40px; height: 40px; }
        .v6-value-item h3 { font-size: 22px; font-weight: 800; color: #1a365d; margin-bottom: 15px; }
        .v6-value-item p { font-size: 16px; color: #4a5568; line-height: 1.6; }
        .v6-footer { background: #000; color: #fff; padding: 80px 0 40px; }
        .v6-footer-top { display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 50px; margin-bottom: 40px; }
        .v6-f-contact { display: flex; flex-direction: column; gap: 15px; }
        .v6-f-c-item { display: flex; align-items: center; gap: 12px; font-size: 14px; color: #a0aec0; }
        .v6-footer-bottom { text-align: center; font-size: 13px; color: #718096; }
        .v6-footer-legal { margin-top: 15px; display: flex; justify-content: center; gap: 10px; }
        .v6-footer-legal a { color: #718096; text-decoration: none; transition: 0.2s; }
        .v6-footer-legal a:hover { color: #f3a633; }
        .v6-f-sep { opacity: 0.3; }
        @media (max-width: 900px) {
          .v6-hero-grid { grid-template-columns: 1fr; text-align: center; }
          .v6-hero-visual { display: none; }
          .v6-hero-actions { justify-content: center; }
          .v6-solution-grid { grid-template-columns: 1fr; }
          .v6-values-grid { grid-template-columns: 1fr; }
          .v6-stats-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
};

const SolutionCard = ({ icon, title, desc }) => (
  <div className="v6-sol-card">
    <div className="v6-sol-icon">{icon}</div>
    <h4>{title}</h4>
    <p>{desc}</p>
  </div>
);

const StatItem = ({ val, lbl }) => (
  <div className="v6-stat-item">
    <span className="v6-stat-val">{val}</span>
    <span className="v6-stat-lbl">{lbl}</span>
  </div>
);

export default LandingPage;
