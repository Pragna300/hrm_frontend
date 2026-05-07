import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CookiePolicy = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <div className="logo-section">
            <span className="logo-dot"></span>
            <span className="logo-text">SHNOOR HR</span>
          </div>
          <h1>Cookie Policy</h1>
          <p>Last Updated: May 2026</p>
        </header>

        <div className="legal-content">
          <section>
            <h2>1. What are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device when you visit a website. 
              They are widely used to make websites work more efficiently and provide information to the owners of the site.
            </p>
          </section>

          <section>
            <h2>2. How We Use Cookies</h2>
            <p>
              SHNOOR HR Portal uses cookies to improve your experience and ensure the security of our platform. 
              Specifically, we use cookies for:
            </p>
            <ul>
              <li><strong>Strictly Necessary Cookies:</strong> Essential for you to move around the website and use its features, such as accessing secure areas.</li>
              <li><strong>Performance Cookies:</strong> Collect information about how visitors use a website, for instance, which pages visitors go to most often.</li>
              <li><strong>Functionality Cookies:</strong> Allow the website to remember choices you make (such as your user name or language) and provide enhanced features.</li>
            </ul>
          </section>

          <section>
            <h2>3. Types of Cookies We Use</h2>
            <p>
              We use both session cookies (which expire once you close your web browser) and persistent cookies (which stay on your device for a set period of time or until you delete them).
            </p>
          </section>

          <section>
            <h2>4. Managing Cookies</h2>
            <p>
              Most web browsers allow some control of most cookies through the browser settings. 
              To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer">www.aboutcookies.org</a>.
            </p>
            <p>
              Please note that if you choose to disable cookies, some parts of the SHNOOR HR Portal may not function correctly.
            </p>
          </section>

          <section>
            <h2>5. Changes to this Policy</h2>
            <p>
              We may update our Cookie Policy from time to time. 
              We encourage you to periodically review this page for the latest information on our cookie practices.
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
        .legal-content a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
        }
        .legal-content a:hover {
          text-decoration: underline;
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

export default CookiePolicy;
