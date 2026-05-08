import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsConditions = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <div className="logo-section">
            <span className="logo-dot"></span>
            <span className="logo-text">SHNOOR HR</span>
          </div>
          <h1>Terms & Conditions</h1>
          <p>Last Updated: May 2026</p>
        </header>

        <div className="legal-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              Welcome to the SHNOOR HR Portal. These Terms & Conditions govern your use of our platform and services. 
              By accessing the portal, you agree to be bound by these terms. If you do not agree, please refrain from using the service.
            </p>
          </section>

          <section>
            <h2>2. User Accounts & Security</h2>
            <p>
              To access most features of the portal, you must have an account provided by your organization. 
              You are responsible for:
            </p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials.</li>
              <li>All activities that occur under your account.</li>
              <li>Notifying HR immediately of any unauthorized use or security breach.</li>
            </ul>
          </section>

          <section>
            <h2>3. Organization Responsibilities</h2>
            <p>
              Organizations registered on the SHNOOR HR Portal are responsible for the accuracy of the data they input 
              and for ensuring their use of the platform complies with local labor laws and regulations. 
              SHNOOR HR provides the tools, but the organization manages the data.
            </p>
          </section>

          <section>
            <h2>4. Intellectual Property</h2>
            <p>
              The SHNOOR HR Portal, including its software, design, and content, is the property of SHNOOR International LLC 
              and is protected by intellectual property laws. You may not reproduce, modify, or distribute any part of the platform 
              without explicit written consent.
            </p>
          </section>

          <section>
            <h2>5. Acceptable Use Policy</h2>
            <p>
              Users must not use the platform to:
            </p>
            <ul>
              <li>Upload or transmit any malicious software or harmful content.</li>
              <li>Interfere with or disrupt the integrity or performance of the portal.</li>
              <li>Attempt to gain unauthorized access to other users' data or systems.</li>
              <li>Harass or infringe upon the rights of other employees or administrators.</li>
            </ul>
          </section>

          <section>
            <h2>6. Third-Party Services</h2>
            <p>
              The portal may integrate with third-party services (e.g., cloud hosting, authentication providers). 
              Your use of such services is subject to their respective terms and policies. 
              SHNOOR HR is not responsible for the performance or security of these third-party services.
            </p>
          </section>

          <section>
            <h2>7. Limitation of Liability</h2>
            <p>
              SHNOOR HR is provided "as is" without any warranties. 
              To the maximum extent permitted by law, SHNOOR International LLC shall not be liable for any indirect, 
              incidental, or consequential damages arising out of your use or inability to use the platform.
            </p>
          </section>

          <section>
            <h2>8. Termination of Access</h2>
            <p>
              We reserve the right to suspend or terminate your access to the portal at any time for violations of these terms 
               or if your organization's subscription ends.
            </p>
          </section>

          <section>
            <h2>9. Governing Law</h2>
            <p>
              These Terms & Conditions are governed by and construed in accordance with the laws of India. 
              Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai.
            </p>
          </section>

          <section>
            <h2>10. Updates to Terms</h2>
            <p>
              We may update these terms from time to time. Your continued use of the portal after any changes constitutes acceptance of the new terms.
            </p>
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

export default TermsConditions;
