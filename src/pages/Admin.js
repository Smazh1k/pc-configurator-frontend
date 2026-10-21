import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import client from '../api/client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Admin = () => {
  // --- Состояния для управления базой деталей ---
  const [loading, setLoading] = useState(false);
  const [parts, setParts] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [editingPart, setEditingPart] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- Состояния для статистики ---
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  // --- Загрузка данных ---
  const fetchParts = async () => {
    try {
      const res = await client.get('/admin/parts');
      setParts(res.data.parts || []);
    } catch (err) {
      toast.error('Nie udało się pobrać danych z bazy.');
    } finally {
      setIsFetching(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await client.get('/builds/admin/stats');
      if (res.data.success) {
        const chartData = res.data.data.usageStats.map(stat => ({
          name: stat._id.replace('Konfiguracja AI - ', ''),
          value: stat.count
        }));
        setStats({ ...res.data.data, chartData });
      }
    } catch (err) {
      toast.error('Błąd pobierania statystyk.');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
    fetchStats();
  }, []);

  // --- Функции управления базой ---
  const handleClearDB = async () => {
    if (!window.confirm('Czy na pewno chcesz usunąć wszystkie podzespoły z bazy?')) return;
    
    setLoading(true);
    try {
      await client.post('/admin/seed', { parts: [] }); 
      toast.success('Baza danych została wyczyszczona!');
      fetchParts();
    } catch (err) {
      toast.error('Błąd podczas czyszczenia bazy.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditingPart({ ...editingPart, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await client.put(`/admin/parts/${editingPart._id}`, editingPart);
      toast.success('Pomyślnie zaktualizowano podzespół!');
      setEditingPart(null);
      fetchParts();
    } catch (err) {
      toast.error('Wystąpił błąd podczas zapisywania.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 fade-in pb-20 relative px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-dark">⚙️ Panel Administratora</h2>
      </div>

      {/* --- СЕКЦИЯ: АНАЛИТИКА --- */}
      {statsLoading ? (
        <div className="text-center py-10 text-slate-400 font-medium">Wczytywanie statystyk...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Wygenerowane PC</p>
                <h3 className="text-4xl font-black text-dark mt-2">{stats?.totalBuilds || 0}</h3>
              </div>
              <div className="text-5xl">🖥️</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Wartość wszystkich zestawów</p>
                <h3 className="text-4xl font-black text-emerald-600 mt-2">${stats?.totalRevenue?.toLocaleString() || 0}</h3>
              </div>
              <div className="text-5xl">💸</div>
            </div>
          </div>

          {stats?.chartData && stats.chartData.length > 0 && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-12">
              <h3 className="text-xl font-bold text-dark mb-6">Popularność konfiguracji</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* --- СЕКЦИЯ: УПРАВЛЕНИЕ БАЗОЙ ДЕТАЛЕЙ --- */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-xl font-bold text-dark mb-2">Baza wygenerowana przez AI</h3>
          <p className="text-slate-500">
            Obecnie system "nauczył się" i zapisał <span className="font-bold text-primary">{parts.length}</span> podzespołów.
          </p>
        </div>
        
        <button 
          onClick={handleClearDB}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl transition shadow-md disabled:opacity-70 whitespace-nowrap"
        >
          {loading ? 'Przetwarzanie...' : '🗑️ Wyczyść bazę'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isFetching ? (
          <div className="p-8 text-center text-slate-400 font-medium">Wczytywanie danych...</div>
        ) : parts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-medium">Baza jest pusta. Wygeneruj PC w konfiguratorze, a AI automatycznie doda tu nowe części!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Kategoria</th>
                  <th className="p-4 font-semibold">Nazwa modelu</th>
                  <th className="p-4 font-semibold">Cena ($)</th>
                  <th className="p-4 font-semibold hidden md:table-cell">Opis (od AI)</th>
                  <th className="p-4 font-semibold text-center">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parts.map((part) => (
                  <tr key={part._id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full uppercase">
                        {part.category}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-dark">{part.name}</td>
                    <td className="p-4 font-bold text-emerald-600">${part.price}</td>
                    <td className="p-4 text-sm text-slate-500 hidden md:table-cell">{part.description}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setEditingPart(part)}
                        className="text-primary hover:text-primaryHover font-semibold bg-primary/10 px-3 py-1.5 rounded-lg transition"
                      >
                        Edytuj
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative">
            <button onClick={() => setEditingPart(null)} className="absolute top-4 right-5 text-slate-400 hover:text-red-500 text-3xl font-light transition">&times;</button>
            <h2 className="text-2xl font-bold text-dark mb-6">Edytuj podzespół</h2>
            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Nazwa modelu</label>
                <input name="name" value={editingPart.name} onChange={handleEditChange} required className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-primary transition" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Kategoria</label>
                  <input name="category" value={editingPart.category} onChange={handleEditChange} required className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-primary transition uppercase" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Cena ($)</label>
                  <input name="price" type="number" value={editingPart.price} onChange={handleEditChange} required className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-primary transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Krótki opis</label>
                <input name="description" value={editingPart.description} onChange={handleEditChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-primary transition" />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setEditingPart(null)} className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition font-medium">Anuluj</button>
                <button type="submit" disabled={isSaving} className="bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-lg transition font-bold shadow-md">{isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;