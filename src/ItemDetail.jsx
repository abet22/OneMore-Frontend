import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ItemDetail({ user }) {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const API_URL = "/api";

  useEffect(() => {
    fetchItemData();
    fetchLogs();
  }, [id]);

  // Obtener datos del Item
  const fetchItemData = async () => {
    const token = await user.getIdToken();
    const res = await fetch(`${API_URL}/items/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setItem(data);
      setEditTitle(data.title);
      setEditDesc(data.description || "");
    } else {
      navigate("/");
    }
  };

  // Obtener Historial
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

  // Guardar cambio de nombre y descripción
  const handleSave = async () => {
    const token = await user.getIdToken();
    const res = await fetch(`${API_URL}/items/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ 
        title: editTitle,
        description: editDesc
      }),
    });
    
    if (res.ok) {
        setItem({ ...item, title: editTitle, description: editDesc });
        setIsEditing(false);
    }
  };

  // Formatear fecha
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  if (!item) return <div className="p-4">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-md mx-auto">
        
        {/* HEADER CON BOTÓN VOLVER */}
        <header className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate("/")} className="bg-white p-2 rounded-xl shadow-sm text-gray-600 hover:text-blue-600">
            ← Volver
          </button>
          <h1 className="text-xl font-bold text-gray-400">Detalles</h1>
        </header>

        {/* TARJETA PRINCIPAL (EDITAR NOMBRE Y DESCRIPCIÓN) */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-bold flex items-center gap-1">
              {item.is_hidden && <span title="Encriptado">🔒</span>}
              Nombre y Descripción
            </span>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-xs text-blue-500 font-bold">EDITAR</button>
            )}
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-3">
              <input 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-2xl font-bold border-b-2 border-blue-500 outline-none pb-1"
                placeholder="Título"
                autoFocus
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full text-gray-600 border border-gray-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción o secreto..."
                rows="3"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-500 text-sm font-bold">CANCELAR</button>
                <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm">GUARDAR</button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-800">{item.title}</h2>
              {item.description && (
                <p className="mt-2 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 whitespace-pre-wrap">{item.description}</p>
              )}
            </>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
             <span className="text-gray-500">Contador actual</span>
             <span className="text-2xl font-bold text-blue-600">{item.count}</span>
          </div>
        </div>

        {/* LISTA DE HISTORIAL */}
        <h3 className="text-lg font-bold text-gray-800 mb-3 px-2">Historial de registros</h3>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {logs.length === 0 ? (
                <div className="p-6 text-center text-gray-400">No hay registros aún.</div>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {logs.map((log) => (
                        <li key={log.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                            <span className="text-gray-600 font-medium">{formatDate(log.timestamp)}</span>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">+1</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        {/* ESPACIO PARA FUTURA GRÁFICA */}
        <div className="mt-6 p-6 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400">
            Próximamente: Gráfica de progreso 📈
        </div>

      </div>
    </div>
  );
}