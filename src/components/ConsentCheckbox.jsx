import { Link } from 'react-router-dom';

const ConsentCheckbox = ({ checked, onChange, error }) => {
  return (
    <div className="consent-wrapper">
      <label className="consent-checkbox">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)} 
        />
        <span className="checkbox-custom"></span>
        <span className="consent-text">
          I agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms & Conditions</Link>, <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link> and <Link to="/cookies" target="_blank" rel="noopener noreferrer">Cookie Policy</Link>
        </span>
      </label>
      {error && <p className="consent-error">{error}</p>}

      <style>{`
        .consent-wrapper {
          margin: 10px 0;
        }
        .consent-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          user-select: none;
        }
        .consent-checkbox input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }
        .checkbox-custom {
          flex-shrink: 0;
          height: 20px;
          width: 20px;
          background-color: #fcfdfe;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          transition: all 0.2s;
          position: relative;
          margin-top: 2px;
        }
        .consent-checkbox:hover input ~ .checkbox-custom {
          border-color: #3b82f6;
          background-color: #f8fafc;
        }
        .consent-checkbox input:checked ~ .checkbox-custom {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        .checkbox-custom:after {
          content: "";
          position: absolute;
          display: none;
          left: 6px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        .consent-checkbox input:checked ~ .checkbox-custom:after {
          display: block;
        }
        .consent-text {
          font-size: 14px;
          color: #64748b;
          line-height: 1.5;
        }
        .consent-text a {
          color: #3b82f6;
          font-weight: 600;
          text-decoration: none;
        }
        .consent-text a:hover {
          text-decoration: underline;
        }
        .consent-error {
          color: #ef4444;
          font-size: 12px;
          margin-top: 6px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default ConsentCheckbox;
