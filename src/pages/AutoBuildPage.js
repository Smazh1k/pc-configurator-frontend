import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AutoBuildPage.css";

const AutoBuildPage = () => {
  const [loading, setLoading] = useState(true);
  const [build, setBuild] = useState(null);
  const [error, setError] = useState("");

  const fetchBuild = async () => {
    try {
      setLoading(true);
      setError("");

      // получаем сохранённые ответы анкеты
      const usage = localStorage.getItem("usage");
      const budget = localStorage.getItem("budget");
      const caseSize = localStorage.getItem("caseSize");

      if (!usage || !budget || !caseSize) {
        setError("Brak zapisanych danych ankiety.");
        setLoading(false);
        return;
      }

      const res = await axios.post("http://localhost:5000/api/autobuild", {
        usage,
        budget,
        caseSize,
      });

      setBuild(res.data.data);
      setLoading(false);

    } catch (err) {
      console.error(err);
      setError("Wystąpił błąd podczas generowania konfiguracji.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuild();
  }, []);

  return (
    <div className="autobuild-container">

      <h1>🔧 Proponowana konfiguracja</h1>

      {loading && <div className="loader">Generowanie konfiguracji...</div>}

      {error && <div className="error-box">{error}</div>}

      {build && (
        <>
          <div className="build-card">
            <h2>📦 Wybrane komponenty</h2>

            {Object.entries(build.chosen).map(([key, item]) => (
              <div key={key} className="component-row">
                <span className="component-name">{key.toUpperCase()}</span>
                <span className="component-value">{item?.name || "---"}</span>
                <span className="component-price">{build.prices[key]} zł</span>
              </div>
            ))}

            <hr />

            <div className="total-price">
              Razem: <strong>{build.totalPrice} zł</strong>  
              <br />
              Budżet: <strong>{build.budget} zł</strong>
            </div>
          </div>

          <div className="compatibility-card">
            <h2>⚠ Kompatybilność</h2>

            {build.compatibility.notes.length === 0 ? (
              <p className="ok">Wszystko wygląda dobrze ✔</p>
            ) : (
              <ul>
                {build.compatibility.notes.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            )}
          </div>

          <button className="regen-btn" onClick={fetchBuild}>
            🔁 Wygeneruj ponownie
          </button>
        </>
      )}
    </div>
  );
};

export default AutoBuildPage;
