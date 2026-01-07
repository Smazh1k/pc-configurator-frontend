import React from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const ConfiguratorPage = () => {
  const usage = localStorage.getItem('pc-usage');
  const budget = localStorage.getItem('pc-budget');
  const caseSize = localStorage.getItem('pc-caseSize');
  const token = localStorage.getItem('token');

  const handleSave = async () => {
    try {
      if (!token) {
        toast.error('Zaloguj się, aby zapisać konfigurację');
        return;
      }

      await axios.post(
        'http://localhost:5000/api/builds/save',
        { usage, budget, caseSize },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Zestaw został zapisany!');
    } catch (err) {
      console.error(err);
      toast.error('Błąd podczas zapisu');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', fontFamily: 'Arial' }}>
      <h2>Konfigurator komputera</h2>

      <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h4>Twoje odpowiedzi:</h4>
        <p><strong>Zastosowanie:</strong> {usage}</p>
        <p><strong>Budżet:</strong> {budget} zł</p>
        <p><strong>Rozmiar obudowy:</strong> {caseSize}</p>
      </div>

      <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Kroki konfiguracji (na razie szkielet):</h3>
        <ul>
          <li>✅ Procesor</li>
          <li>🔲 Płyta główna</li>
          <li>🔲 RAM</li>
          <li>🔲 Karta graficzna</li>
          <li>🔲 Dysk</li>
          <li>🔲 Obudowa</li>
          <li>🔲 Zasilacz</li>
        </ul>
      </div>

      {/* Кнопка сохранения */}
      {token && (
        <button
          onClick={handleSave}
          style={{
            marginTop: '2rem',
            padding: '1rem 2rem',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          💾 Zapisz zestaw
        </button>
      )}
    </div>
  );
};

export default ConfiguratorPage;
