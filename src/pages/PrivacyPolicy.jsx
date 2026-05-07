import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <div className="logo-section">
            <span className="logo-dot"></span>
            <span className="logo-text">SHNOOR HR</span>
          </div>
          <h1>Privacy Policy</h1>
          <p>Last Updated: May 2026</p>
        </header>

        <div className="legal-content">
          <section>
            <h2>1. Information We Collect</h2>
            <p>
              We collect several types of information to provide and improve our service:
            </p>
            <ul>
              <li><strong>Personal Information:</strong> Name, work email, professional credentials, and contact details provided during registration.</li>
              <li><strong>Usage Data:</strong> Information on how you access and use the portal, including login times, attendance records, and feature interactions.</li>
              <li><strong>Organizational Data:</strong> Company name, address, sector, and employee management data input by administrators.</li>
            </ul>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>
              SHNOOR HR uses the collected data for various purposes:
            </p>
            <ul>
              <li>To provide and maintain the portal's core HR functionality.</li>
              <li>To notify you about changes to our service or your account.</li>
              <li>To provide customer support and troubleshooting.</li>
              <li>To gather analysis or valuable information so that we can improve our platform.</li>
              <li>To monitor the usage of the service for security and performance auditing.</li>
            </ul>
          </section>

          <section>
            <h2>3. Data Sharing & Disclosure</h2>
            <p>
              We do not sell your personal data. We may disclose information in the following circumstances:
            </p>
            <ul>
              <li><strong>Legal Requirements:</strong> If required to do so by law or in response to valid requests by public authorities.</li>
              <li><strong>Service Providers:</strong> To third-party companies that facilitate our service (e.g., database hosting, security monitoring) who are obligated not to disclose or use it for any other purpose.</li>
              <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or acquisition of all or a portion of our business.</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Retention</h2>
            <p>
              We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. 
              We will retain and use your information to the extent necessary to comply with our legal obligations and resolve disputes.
            </p>
          </section>

          <section>
            <h2>5. Your Data Rights</h2>
            <p>
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul>
              <li>The right to access, update, or delete the information we have on you.</li>
              <li>The right of rectification (to have your information corrected).</li>
              <li>The right to object to our processing of your personal data.</li>
              <li>The right of data portability.</li>
            </ul>
            <p>Please contact your organization's HR administrator to exercise these rights within the platform.</p>
          </section>

          <section>
            <h2>6. International Data Transfers</h2>
            <p>
              Your information may be transferred to and maintained on computers located outside of your state, province, or country 
              where the data protection laws may differ. Your consent to this Privacy Policy followed by your submission of such information 
              represents your agreement to that transfer.
            </p>
          </section>

          <section>
            <h2>7. Security Measures</h2>
            <p>
              The security of your data is important to us. We implement industry-standard encryption and security protocols (HTTPS, TLS, password hashing) 
              to protect your data. However, remember that no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2>8. Contact Information</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p><strong>Email:</strong> privacy@shnoor.com</p>
            <p><strong>Address:</strong> Mumbai HQ, Maharashtra, India</p>
          </section>
        </div>

        <footer className="legal-footer">
          <button onClick={() => window.history.back()} className="back-arrow-btn">
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </button>
        </footer>
      </div>

      <style>{`
        .legal-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 60px 20px;
          font-family: 'Inter', sans-serif;
          color: #334155;
          line-height: 1.7;
        }
        .legal-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 60px;
          border-radius: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e2e8f0;
        }
        .legal-header {
          text-align: center;
          margin-bottom: 48px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 32px;
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
        .legal-header h1 {
          font-size: 32px;
          color: #0f172a;
          margin-bottom: 8px;
        }
        .legal-header p {
          color: #64748b;
          font-size: 14px;
        }
        .legal-content section {
          margin-bottom: 40px;
        }
        .legal-content h2 {
          font-size: 20px;
          color: #1e293b;
          margin-bottom: 16px;
          font-weight: 700;
        }
        .legal-content p {
          font-size: 16px;
          color: #475569;
        }
        .legal-content ul {
          margin-top: 12px;
          padding-left: 20px;
        }
        .legal-content li {
          margin-bottom: 8px;
          color: #475569;
        }
        .legal-footer {
          margin-top: 48px;
          padding-top: 32px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: flex-start;
        }
        .back-arrow-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          color: #64748b;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          padding: 8px 0;
        }
        .back-arrow-btn:hover {
          color: #3b82f6;
          transform: translateX(-5px);
        }
        @media (max-width: 640px) {
          .legal-container { padding: 32px 24px; }
          .legal-header h1 { font-size: 24px; }
          .legal-footer { flex-direction: column; }
          .back-btn { text-align: center; }
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;
