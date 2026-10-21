import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import client from '../api/client';

const Home = ({ user }) => {
  // 1. Стандартные состояния (сбросятся при F5)
  const [isStarted, setIsStarted] = useState(false);
  const [budget, setBudget] = useState(3000);
  const [usage, setUsage] = useState('gaming');
  const [buildResult, setBuildResult] = useState(null);
  const [parentBuildId, setParentBuildId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [swapModal, setSwapModal] = useState({ isOpen: false, category: null, label: '', items: [], isLoading: false });

  // 2. Перехват сборки из Профиля (для редактирования / апгрейда)
  useEffect(() => {
    const savedBuild = localStorage.getItem('buildToEdit');
    if (savedBuild) {
      const parsedBuild = JSON.parse(savedBuild);
      
      setBuildResult({
        chosen: parsedBuild.components,
        totalPrice: parsedBuild.totalPrice,
        ai_comment: "Wczytano zapisaną konfigurację. Możesz użyć przycisku 'Zmień', aby wymienić podzespoły.",
        warnings: [] // Очищаем старые предупреждения przy загрузке
      });
      setParentBuildId(parsedBuild._id);
      setIsStarted(true);
      
      localStorage.removeItem('buildToEdit'); 
    }
  }, []);

  // --- Функции ---

  const handleAIBuild = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBuildResult(null);
    setParentBuildId(null); // Сбрасываем связь, так как это новая генерация
    try {
      const res = await client.post('/ai/smart-build', { budget, usage });
      if (res.data.success) {
        setBuildResult(res.data.data);
        toast.success('AI pomyślnie złożyło Twój zestaw!');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      toast.error(`Błąd: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const openSwapModal = async (category, label) => {
    setSwapModal({ isOpen: true, category, label, items: [], isLoading: true });
    try {
      const res = await client.get('/admin/parts');
      const filteredParts = res.data.parts.filter(p => p.category.toLowerCase() === category.toLowerCase());
      setSwapModal({ isOpen: true, category, label, items: filteredParts, isLoading: false });
    } catch (err) {
      toast.error('Nie udało się pobrać zamienników.');
      setSwapModal({ isOpen: false, category: null, label: '', items: [], isLoading: false });
    }
  };

  const confirmSwap = (newPart) => {
    const updatedBuild = { ...buildResult };
    
    updatedBuild.chosen[swapModal.category] = {
      name: newPart.name,
      price: newPart.price,
      description: newPart.description
    };

    let newTotal = 0;
    Object.values(updatedBuild.chosen).forEach(part => {
      if (part && typeof part.price === 'number') {
        newTotal += part.price;
      }
    });
    
    updatedBuild.totalPrice = newTotal;
    
    // Очищаем предупреждения, так как пользователь мог исправить проблему вручную
    updatedBuild.warnings = []; 
    
    setBuildResult(updatedBuild);
    setSwapModal({ ...swapModal, isOpen: false });
    toast.info(`Zmieniono ${swapModal.label} na ${newPart.name}`);
  };

  const handleSaveBuild = async () => {
    setIsSaving(true);
    try {
      const buildData = {
        userId: user?._id || user?.id || 'guest',
        name: parentBuildId ? "Upgrade PC" : `Konfiguracja AI - ${usage.toUpperCase()}`,
        components: buildResult.chosen,
        totalPrice: buildResult.totalPrice,
        parentBuildId: parentBuildId
      };

      await client.post('/builds/save', buildData);
      toast.success('💾 Konfiguracja została zapisana w Twoim profilu!');
      setParentBuildId(null); 
    } catch (err) {
      toast.error('Błąd podczas zapisywania.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Рендер ---

  if (!isStarted) {
    return (
      <div className="max-w-4xl mx-auto text-center mt-20 fade-in px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-dark mb-6 tracking-tight">
          Zbuduj swój wymarzony PC <br/> w <span className="text-primary">10 sekund</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10">
          Sztuczna inteligencja dobierze idealne podzespoły do Twojego budżetu.
        </p>
        <button onClick={() => setIsStarted(true)} className="bg-primary hover:bg-primaryHover text-white text-xl font-bold py-4 px-10 rounded-xl shadow-lg shadow-primary/30 transition transform hover:-translate-y-1">
          🧠 Rozpocznij konfigurację
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 pb-20 relative px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <h2 className="text-2xl font-bold text-dark mb-6">Parametry zestawu</h2>
        <form onSubmit={handleAIBuild} className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-slate-600 mb-2">Budżet ($)</label>
            <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} min="500" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary transition text-lg font-medium" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-slate-600 mb-2">Przeznaczenie</label>
            <select value={usage} onChange={(e) => setUsage(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary transition text-lg font-medium bg-white">
              <option value="gaming">🎮 Gaming</option>
              <option value="office">🏢 Biuro / Nauka</option>
              <option value="editing">🎬 Montaż / Render</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full md:w-auto bg-primary hover:bg-primaryHover text-white font-bold py-3 px-8 rounded-xl transition shadow-md disabled:opacity-70">
            {loading ? '🧠 AI myśli...' : 'Generuj'}
          </button>
        </form>
      </div>

      {buildResult && buildResult.chosen && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 fade-in">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <h3 className="text-2xl font-bold text-dark">✅ Twój optymalny zestaw</h3>
            <span className="text-2xl font-black text-primary">${buildResult.totalPrice}</span>
          </div>
          
          <div className="flex flex-col gap-4">
            {[
              { key: 'cpu', label: 'Procesor', icon: '⚡' },
              { key: 'gpu', label: 'Karta graficzna', icon: '🎮' },
              { key: 'motherboard', label: 'Płyta główna', icon: '🎛️' },
              { key: 'ram', label: 'Pamięć RAM', icon: '📼' },
              { key: 'ssd', label: 'Dysk SSD', icon: '💾' },
              { key: 'psu', label: 'Zasilacz', icon: '🔌' },
              { key: 'case', label: 'Obudowa', icon: '🖥️' },
              { key: 'cooler', label: 'Chłodzenie', icon: '❄️' }
            ].map((part) => (
              <div key={part.key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{part.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{part.label}</div>
                    <div className="font-semibold text-dark">{buildResult.chosen[part.key]?.name || 'Brak'}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <span className="font-bold text-emerald-600">${buildResult.chosen[part.key]?.price || 0}</span>
                  <button 
                    onClick={() => openSwapModal(part.key, part.label)}
                    className="text-sm font-semibold text-slate-500 hover:text-primary transition bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm whitespace-nowrap"
                  >
                    🔄 Zmień
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Блок валидатора совместимости */}
          {buildResult.warnings && buildResult.warnings.length > 0 && (
            <div className="mt-6 p-5 bg-red-50 border border-red-200 rounded-xl">
              <h4 className="text-red-600 font-bold mb-2 flex items-center gap-2">
                <span>🛑</span> Wykryto potencjalne problemy z kompatybilnością:
              </h4>
              <ul className="list-disc pl-5 text-sm text-red-500 font-medium space-y-1">
                {buildResult.warnings.map((warn, idx) => (
                  <li key={idx}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Комментарий AI */}
          {buildResult.ai_comment && (
            <div className="mt-6 p-4 bg-primary/10 rounded-xl text-primary font-medium italic text-center">
              " {buildResult.ai_comment} "
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSaveBuild}
              disabled={isSaving}
              className="bg-dark hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition shadow-md disabled:opacity-70"
            >
              {isSaving ? 'Zapisywanie...' : '💾 Zapisz konfigurację'}
            </button>
          </div>
        </div>
      )}

      {/* Окно замены компонента */}
      {swapModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[80vh] flex flex-col">
            <button onClick={() => setSwapModal({ ...swapModal, isOpen: false })} className="absolute top-4 right-5 text-slate-400 hover:text-red-500 text-3xl font-light transition">&times;</button>
            <h2 className="text-2xl font-bold text-dark mb-2">Wybierz alternatywę</h2>
            <p className="text-slate-500 mb-6">Kategoria: <span className="font-bold uppercase text-primary">{swapModal.label}</span></p>
            
            <div className="overflow-y-auto flex-1 pr-2">
              {swapModal.isLoading ? (
                <div className="text-center text-slate-400 py-10 font-medium">Szukanie części w bazie...</div>
              ) : swapModal.items.length === 0 ? (
                <div className="text-center text-slate-400 py-10 font-medium">Brak innych podzespołów w tej kategorii.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div 
                    onClick={() => confirmSwap({ name: 'Brak', price: 0, description: '' })}
                    className="p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-red-400 hover:bg-red-50 transition flex justify-between items-center group"
                  >
                    <span className="font-semibold text-slate-600 group-hover:text-red-600">❌ Usuń ten podzespół (Brak)</span>
                    <span className="font-bold text-slate-400">$0</span>
                  </div>

                  {swapModal.items.map((item) => (
                    <div 
                      key={item._id} 
                      onClick={() => confirmSwap(item)}
                      className="p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-dark">{item.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{item.description}</div>
                      </div>
                      <div className="font-black text-emerald-600 ml-4">${item.price}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;