import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');

  return (
    <div className="home-page">
      <div className="overlay">
        <h1>Twój własny zestaw komputerowy</h1>
        <p className="description">Skonfiguruj komputer dostosowany do Twoich potrzeb...</p>
        <Link to="/start">
          <button className="start-button">Rozpocznij konfigurację</button>
        </Link>
      </div>
      

      <div className="features">
        <FeatureBox
          icon="⚙️"
          title="Inteligentne dopasowanie"
          text="Dopasujemy części pod Twój budżet i potrzeby."
        />
        <FeatureBox
          icon="🧠"
          title="Bez wiedzy technicznej"
          text="Nie musisz znać się na sprzęcie – pomożemy Ci."
        />
        <FeatureBox
          icon="💾"
          title="Zapis konfiguracji"
          text="Zaloguj się, by zapisywać i wracać do swoich zestawów."
        />
      </div>
    </div>
  );
};

const FeatureBox = ({ icon, title, text }) => (
  <div className="feature-box">
    <div className="icon">{icon}</div>
    <h3>{title}</h3>
    <p>{text}</p>
  </div>
);

export default HomePage;
