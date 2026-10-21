import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';

const SharedBuild = () => {
  const { id } = useParams(); // Достаем ID из ссылки
  const [build, setBuild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedBuild = async () => {
      try {
        const res = await client.get(`/builds/shared/${id}`);
        if (res.data.success) {
          setBuild(res.data.data);
        }
      } catch (err) {
        setError('Nie znaleziono tej konfiguracji lub link jest nieaktywny.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedBuild();
  }, [id]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('pl-PL', options);
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400 font-medium text-lg fade-in">Ładowanie konfiguracji...</div>;
  }

  if (error || !build) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center fade-in px-4">
        <span className="text-6xl mb-4 block">🔍</span>
        <h2 className="text-2xl font-bold text-dark mb-4">{error}</h2>
        <Link to="/" className="text-primary font-bold hover:underline">
          Wróć do strony głównej
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 pb-20 fade-in px-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-dark mb-2">Udostępniona konfiguracja</h2>
        <p className="text-slate-500">Ktoś podzielił się z Tobą tym zestawem PC.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Шапка карточки */}
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-dark">{build.name || 'Konfiguracja AI'}</h3>
            <p className="text-sm text-slate-500 mt-1">Utworzono: {formatDate(build.createdAt)}</p>
          </div>
          <div className="bg-white px-5 py-2 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-sm text-slate-500 font-semibold mr-2">Wartość:</span>
            <span className="text-2xl font-black text-emerald-600">${build.totalPrice}</span>
          </div>
        </div>

        {/* Список деталей */}
        <div className="p-8">
          <div className="grid grid-cols-1 gap-y-4 mb-8">
            {build.components && Object.entries(build.components).map(([category, part]) => {
              if (!part || !part.name || part.name === 'Brak') return null;
              return (
                <div key={category} className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{category}</span>
                    <span className="font-semibold text-dark text-base">{part.name}</span>
                  </div>
                  <span className="font-bold text-slate-600">${part.price}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-slate-100 text-center">
            <Link to="/" className="inline-block bg-primary hover:bg-primaryHover text-white font-bold py-3 px-8 rounded-xl transition shadow-md">
              Zbuduj swój własny PC
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedBuild;