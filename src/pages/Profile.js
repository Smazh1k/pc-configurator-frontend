import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js'; // Не забудь установить пакет: npm install html2pdf.js

const Profile = ({ user }) => {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Состояния для раскрывающихся карточек (Аккордеон)
  const [expandedBuilds, setExpandedBuilds] = useState({});

  // Состояния для окна управления
  const [manageModal, setManageModal] = useState({ isOpen: false, build: null });
  const [newName, setNewName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchMyBuilds = async () => {
    if (!user) return;
    const userId = user._id || user.id;
    try {
      const res = await client.get(`/builds/user/${userId}`);
      if (res.data.success) {
        setBuilds(res.data.data);
      }
    } catch (err) {
      toast.error('Błąd podczas pobierania zapisanych konfiguracji.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBuilds();
  }, [user]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('pl-PL', options);
  };

  // --- Управление модальным окном ---
  const openManageModal = (build) => {
    setManageModal({ isOpen: true, build });
    setNewName(build.name || '');
  };

  const closeManageModal = () => {
    setManageModal({ isOpen: false, build: null });
    setNewName('');
  };

  // --- Действия со сборкой ---
  const handleRename = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return toast.error('Nazwa nie może być pusta');
    
    setIsProcessing(true);
    try {
      await client.put(`/builds/${manageModal.build._id}`, { name: newName });
      toast.success('Pomyślnie zmieniono nazwę!');
      fetchMyBuilds();
      closeManageModal();
    } catch (err) {
      toast.error('Błąd podczas zmiany nazwy.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę konfigurację? Tej akcji nie można cofnąć.')) return;
    
    setIsProcessing(true);
    try {
      await client.delete(`/builds/${manageModal.build._id}`);
      toast.success('Konfiguracja została usunięta.');
      fetchMyBuilds(); 
      closeManageModal();
    } catch (err) {
      toast.error('Błąd podczas usuwania.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditInConfigurator = () => {
    localStorage.setItem('buildToEdit', JSON.stringify(manageModal.build));
    window.location.href = '/'; 
  };

  // --- Управление аккордеоном ---
  const toggleExpand = (id) => {
    setExpandedBuilds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // --- НОВЫЕ ФУНКЦИИ: PDF и Поделиться ---
 const downloadPDF = (build) => {
    // 1. Принудительно открываем список деталей перед печатью
    setExpandedBuilds(prev => ({ ...prev, [build._id]: true }));

    toast.info('Przygotowywanie dokumentu...');

    // 2. Даем браузеру 300 миллисекунд на отрисовку списка в интерфейсе
    setTimeout(async () => {
      const element = document.getElementById(`build-card-${build._id}`);
      if (!element) return;

      // 3. Прячем интерфейсные кнопки (чтобы их не было в PDF)
      const buttons = element.querySelectorAll('button');
      buttons.forEach(btn => btn.style.display = 'none');

      // 4. Убираем обрезку длинных названий
      const truncates = element.querySelectorAll('.truncate');
      truncates.forEach(el => {
        el.classList.remove('truncate');
        el.style.whiteSpace = 'normal';
        el.style.paddingBottom = '4px';
      });

      const opt = {
        margin: 0.5,
        filename: `${(build.name || 'Konfiguracja').replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0, letterRendering: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      // 5. Генерируем PDF
      await html2pdf().set(opt).from(element).save();

      // 6. Возвращаем стили обратно на сайт
      buttons.forEach(btn => btn.style.display = '');
      truncates.forEach(el => {
        el.classList.add('truncate');
        el.style.whiteSpace = '';
        el.style.paddingBottom = '';
      });

      toast.success('📄 PDF pobrany pomyślnie!');
    }, 300); // 300мс задержки гарантируют, что React успеет обновить DOM
  };
  
  const copyShareLink = (buildId) => {
    // Ссылка на страницу просмотра (роут нужно будет создать на фронтенде в будущем)
    const link = `${window.location.origin}/shared/${buildId}`; 
    navigator.clipboard.writeText(link);
    toast.info('🔗 Link skopiowany do schowka!');
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 pb-20 fade-in px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-dark mb-2">👤 Mój Profil</h2>
          <p className="text-slate-500">Witaj, <span className="font-bold text-primary">{user?.username || 'Użytkowniku'}</span>! Oto historia Twoich zapisanych PC.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-medium text-lg">Ładowanie historii...</div>
      ) : builds.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 text-center">
          <span className="text-4xl mb-4 block">📭</span>
          <h3 className="text-xl font-bold text-dark mb-2">Brak zapisanych konfiguracji</h3>
          <p className="text-slate-500">Przejdź do konfiguratora, aby złożyć swój pierwszy komputer!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {builds.map((build) => {
            const isExpanded = expandedBuilds[build._id];

            return (
              <div key={build._id} id={`build-card-${build._id}`} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition duration-300 flex flex-col">
                
                {/* Шапка карточки */}
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-dark truncate max-w-[200px] xl:max-w-[250px]">{build.name || 'Konfiguracja AI'}</h3>
                      {build.parentBuildId && (
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">Rozbudowa</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">Zapisano: {formatDate(build.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-2xl font-black text-emerald-600">${build.totalPrice}</span>
                  </div>
                </div>

                {/* Основная часть карточки */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  
                  {/* Кнопка "Развернуть" */}
                  <button 
                    onClick={() => toggleExpand(build._id)}
                    className="w-full flex justify-between items-center bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold py-3 px-4 rounded-xl transition mb-4"
                  >
                    <span>{isExpanded ? 'Ukryj podzespoły' : 'Pokaż podzespoły'}</span>
                    <span className="text-xl leading-none">{isExpanded ? '↑' : '↓'}</span>
                  </button>

                  {/* Скрытый список деталей (Аккордеон) */}
                  {isExpanded && (
                    <div className="grid grid-cols-1 gap-y-3 mb-6 animate-fade-in">
                      {build.components && Object.entries(build.components).map(([category, part]) => {
                        if (!part || !part.name || part.name === 'Brak') return null;
                        return (
                          <div key={category} className="flex justify-between items-center border-b border-slate-50 pb-2">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{category}</span>
                              <span className="font-semibold text-dark text-sm truncate max-w-[220px]" title={part.name}>{part.name}</span>
                            </div>
                            <span className="font-bold text-slate-600 text-sm ml-2">${part.price}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Нижняя панель с новыми кнопками (PDF, Share, Zarządzaj) */}
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => downloadPDF(build)}
                        className="text-sm font-semibold text-slate-500 hover:text-dark transition flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg"
                      >
                        📄 PDF
                      </button>
                      <button 
                        onClick={() => copyShareLink(build._id)}
                        className="text-sm font-semibold text-slate-500 hover:text-dark transition flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg"
                      >
                        🔗 Udostępnij
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => openManageModal(build)}
                      className="text-sm font-semibold text-primary hover:text-primaryHover transition flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-lg"
                    >
                      ⚙️ Zarządzaj
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Модальное окно управления */}
      {manageModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
            <button onClick={closeManageModal} className="absolute top-4 right-5 text-slate-400 hover:text-red-500 text-3xl font-light transition">&times;</button>
            
            <h2 className="text-2xl font-bold text-dark mb-6">⚙️ Zarządzaj konfiguracją</h2>
            
            <form onSubmit={handleRename} className="mb-6">
              <label className="block text-sm font-semibold text-slate-600 mb-2">Zmień nazwę zestawu</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-primary transition"
                  placeholder="Np. Mój Gamingowy Potwór"
                  required
                />
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="bg-primary hover:bg-primaryHover text-white px-4 py-2.5 rounded-lg transition font-bold shadow-md disabled:opacity-70"
                >
                  Zapisz
                </button>
              </div>
            </form>

            <div className="mb-6 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Rozbudowa / Modyfikacja</h3>
              <button 
                onClick={handleEditInConfigurator}
                className="w-full bg-slate-100 hover:bg-slate-200 text-dark font-bold py-3 px-4 rounded-xl transition flex justify-center items-center gap-2"
              >
                🛠️ Otwórz w konfiguratorze
              </button>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-semibold text-red-500 mb-2">Strefa niebezpieczna</h3>
              <button 
                onClick={handleDelete}
                disabled={isProcessing}
                className="w-full bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 font-bold py-3 px-4 rounded-xl transition disabled:opacity-70 flex justify-center items-center gap-2"
              >
                🗑️ Usuń tę konfigurację
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;