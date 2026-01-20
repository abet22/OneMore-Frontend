import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HiddenItems({ user }) {
  const [items, setItems] = useState([]);
  const API_URL = "/api";
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/items`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        // Filtramos solo los ocultos
        setItems(data.filter(i => i.is_hidden));
      }
    } catch (error) { console.error(error); }
  };

  const incrementItem = async (e, id) => {
    e.stopPropagation();
    setItems(items.map(i => i.id === id ? { ...i, count: i.count + 1 } : i));
    const token = await user.getIdToken();
    await fetch(`${API_URL}/items/${id}/increment`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  };

  const decrementItem = async (e, id) => {
    e.stopPropagation();
    setItems(items.map(i => i.id === id ? { ...i, count: i.count - 1 } : i));
    const token = await user.getIdToken();
    await fetch(`${API_URL}/items/${id}/decrement`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-md mx-auto">
        
        {/* HEADER */}
        <header className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate("/")} 
            className="bg-white p-2.5 rounded-xl shadow-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            ← Volver
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>🔒</span> Bóveda Privada
            </h1>
            <p className="text-xs text-gray-400 font-medium">Items encriptados y ocultos</p>
          </div>
        </header>

        {/* LISTA DE ITEMS PRIVADOS */}
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-dashed border-gray-200 text-center">
                <span className="text-4xl block mb-4">👻</span>
                <p className="text-gray-400 font-bold">No tienes nada oculto...</p>
                <p className="text-xs text-gray-300 mt-1">Todavía.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/item/${item.id}`)}
                className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center transition-all cursor-pointer hover:shadow-md active:scale-[0.98]"
              >
                <div className="truncate pr-2">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-900 text-lg truncate">{item.title}</span>
                    </div>
                    {item.description && (
                        <p className="text-xs text-gray-400 font-medium truncate mt-0.5 italic">{item.description}</p>
                    )}
                </div>

                {/* BOTONES CONTADOR */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={(e) => decrementItem(e, item.id)}
                    disabled={item.count <= 0}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xl pb-1 transition-colors ${
                      item.count <= 0 ? "bg-gray-50 text-gray-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >-</button>

                  <span className="text-xl font-bold text-blue-600 w-6 text-center select-none">{item.count}</span>
                  
                  <button
                    onClick={(e) => incrementItem(e, item.id)}
                    className="bg-blue-100 text-blue-600 w-9 h-9 rounded-full flex items-center justify-center font-bold text-xl hover:bg-blue-200 transition-colors"
                  >+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-10 p-6 bg-blue-600/5 rounded-3xl border border-blue-100 text-center">
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Zona de alta seguridad</p>
            <p className="text-[9px] text-blue-300 mt-1 uppercase">Tus datos están encriptados con AES-256 en el servidor</p>
        </div>

      </div>
    </div>
  );
}
