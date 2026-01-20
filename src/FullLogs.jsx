import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function FullLogs({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [logs, setLogs] = useState([]);
  const API_URL = "/api";

  useEffect(() => {
    fetchItemData();
    fetchLogs();
  }, [id]);

  const fetchItemData = async () => {
    const token = await user.getIdToken();
    const res = await fetch(`${API_URL}/items/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setItem(data);
    }
  };

  const fetchLogs = async () => {
    const token = await user.getIdToken();
    const res = await fetch(`${API_URL}/items/${id}/logs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setLogs(data);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return format(date, "PPP p", { locale: es });
  };

  if (!item) return <div className="p-4 text-center">Cargando historial...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-md mx-auto">
        
        {/* HEADER */}
        <header className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(`/item/${id}`)} 
            className="bg-white p-2.5 rounded-xl shadow-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            ← Volver
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Historial Completo</h1>
            <p className="text-xs text-gray-400 font-medium italic">{item.title}</p>
          </div>
        </header>

        {/* LISTA COMPLETA */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
            {logs.length === 0 ? (
                <div className="p-10 text-center text-gray-400">No hay registros aún.</div>
            ) : (
                <ul className="divide-y divide-gray-50">
                    {logs.map((log) => (
                        <li key={log.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col">
                                <span className="text-gray-700 font-bold text-sm">{formatDate(log.timestamp)}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-0.5">Entrada registrada</span>
                            </div>
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-xl text-xs font-black">+1</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        <div className="mt-8 p-6 text-center">
            <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">Fin del historial</p>
            <p className="text-[10px] text-gray-200 mt-1 uppercase italic">Mostrando {logs.length} registros en total</p>
        </div>

      </div>
    </div>
  );
}
