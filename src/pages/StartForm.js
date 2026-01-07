import React, { useState, useRef, useEffect } from 'react';
import './StartForm.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';




const StartForm = () => {
  const [usage, setUsage] = useState('');
  const [budget, setBudget] = useState('');
  const [caseSize, setCaseSize] = useState('');
  const tooltipRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();
const handleSubmit = async (e) => {
  e.preventDefault();

  localStorage.setItem('pc-usage', usage);
  localStorage.setItem('pc-budget', budget);
  localStorage.setItem('pc-caseSize', caseSize);

  toast.success('Odpowiedzi zapisane!');
  navigate('/configurator');
};
  return (
    <form onSubmit={handleSubmit} className="start-form">
  <h2>Konfigurator – ankieta wstępna</h2>

  <label>Zastosowanie:</label>
  <select value={usage} onChange={(e) => setUsage(e.target.value)} required>
    <option value="">-- wybierz --</option>
    <option value="gaming">Gry</option>
    <option value="office">Praca biurowa</option>
    <option value="editing">Grafika / wideo</option>
    <option value="general">Codzienne użytkowanie</option>
  </select>

  <label>Budżet:</label>
  <div className="budget-input">
    <input
      type="number"
      placeholder="np. 4000"
      value={budget}
      onChange={(e) => setBudget(e.target.value)}
      min="100"        
      step="100"       
      required   
    />
    <span>zł</span>
  </div>
  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    Rozmiar obudowy:
    <span
      style={{
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        backgroundColor: '#007bff',
        color: 'white',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '12px',
        cursor: 'pointer',
        position: 'relative'
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      ref={tooltipRef}
    >
      ?
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            top: '120%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#fff',
            padding: '0.75rem',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            width: '260px',
            zIndex: 10,
            fontSize: '0.85rem',
            color: '#333'
          }}
       >
          Rozmiar obudowy to fizyczny wymiar komputera.  
         <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
            <li><strong>Mini Tower</strong> – mały i kompaktowy</li>
            <li><strong>Mid Tower</strong> – najczęściej wybierany</li>
            <li><strong>Full Tower</strong> – dla mocnych zestawów</li>
          </ul>
        </div>
      )}
    </span>
  </label>

  <select
    value={caseSize}
    onChange={(e) => setCaseSize(e.target.value)}
    required
  >
    <option value="">-- wybierz --</option>
    <option value="mini">Mini Tower</option>
    <option value="mid">Mid Tower</option>
    <option value="full">Full Tower</option>
  </select>

    <button onClick={() => navigate("/autobuild")}>
  🔧 Generuj konfigurację
</button>
  </form>
    );
  };

export default StartForm;
