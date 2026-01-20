import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  format, subDays, startOfDay, isSameDay, eachDayOfInterval, 
  subMonths, startOfMonth, isSameMonth, eachMonthOfInterval 
} from 'date-fns';
import { es } from 'date-fns/locale';

export default function ItemDetail({ user }) {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editIsHidden, setEditIsHidden] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [period, setPeriod] = useState("week"); // week, month, year

  const API_URL = "/api";

  // Procesar datos para la gráfica
  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    const now = new Date();
    let data = [];

    if (period === "week" || period === "month") {
      const days = period === "week" ? 6 : 29;
      const interval = eachDayOfInterval({
        start: subDays(now, days),
        end: now,
      });

      data = interval.map((date) => {
        const count = logs.filter((log) => isSameDay(new Date(log.timestamp), date)).length;
        return {
          label: format(date, period === "week" ? "EEE" : "dd", { locale: es }),
          fullDate: format(date, "PPP", { locale: es }),
          count: count,
        };
      });
    } else if (period === "year") {
      const interval = eachMonthOfInterval({
        start: subMonths(now, 11),
        end: now,
      });

      data = interval.map((date) => {
        const count = logs.filter((log) => isSameMonth(new Date(log.timestamp), date)).length;
        return {
          label: format(date, "MMM", { locale: es }),
          fullDate: format(date, "MMMM yyyy", { locale: es }),
          count: count,
        };
      });
    }

    return data;
  }, [logs, period]);

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
      if (data) {
        setItem(data);
        setEditTitle(data.title);
        setEditDesc(data.description || "");
        setEditIsHidden(data.is_hidden);
      }
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

  // Guardar cambios
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
        description: editDesc,
        is_hidden: editIsHidden
      }),
    });
    
    if (res.ok) {
        setItem({ ...item, title: editTitle, description: editDesc, is_hidden: editIsHidden });
        setIsEditing(false);
    }
  };

  // Eliminar item
  const handleDelete = async () => {
    const token = await user.getIdToken();
    const res = await fetch(`${API_URL}/items/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (res.ok) {
      navigate("/");
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

              {/* Selector de Privacidad en Edición */}
              <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => setEditIsHidden(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!editIsHidden ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <span>🔓</span> Público
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditIsHidden(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${editIsHidden ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <span>🔒</span> Privado
                  </button>
              </div>

              <div className="flex gap-2 justify-end mt-2">
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

        {/* SECCIÓN DE GRÁFICA */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Actividad</h3>
            
            {/* Selector de periodo */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {['week', 'month', 'year'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                    period === p ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {p === 'week' ? '7D' : p === 'month' ? '30D' : '12M'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6', radius: 8 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-900 text-white p-2 rounded-lg shadow-xl text-[10px] font-bold border border-gray-800">
                          <p className="opacity-60">{payload[0].payload.fullDate}</p>
                          <p className="text-blue-400 text-sm">{payload[0].value} registros</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6" 
                  radius={[6, 6, 6, 6]} 
                  barSize={period === 'year' ? 15 : period === 'month' ? 6 : 20}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.count > 0 ? '#3b82f6' : '#f3f4f6'} 
                      className="transition-all duration-500"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span>Inicio del periodo</span>
            <span>Hoy</span>
          </div>
        </div>

        {/* LISTA DE HISTORIAL (RESUMEN) */}
        <div className="flex justify-between items-center mb-3 px-2">
            <h3 className="text-lg font-bold text-gray-800">Últimos registros</h3>
            {logs.length > 5 && (
                <button 
                    onClick={() => navigate(`/item/${id}/full-logs`)}
                    className="text-blue-600 text-xs font-black uppercase tracking-widest hover:text-blue-700 transition-colors"
                >
                    Ver más
                </button>
            )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 border border-gray-50">
            {logs.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm font-medium">No hay registros aún.</div>
            ) : (
                <>
                    <ul className="divide-y divide-gray-50">
                        {logs.slice(0, 5).map((log) => (
                            <li key={log.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <span className="text-gray-600 font-bold text-sm">{formatDate(log.timestamp)}</span>
                                <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-[10px] font-black">+1</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>

        {/* SECCIÓN DE PELIGRO: ELIMINAR ITEM */}
        <div className="mt-12 pt-6 border-t border-red-100 flex flex-col items-center gap-4">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Zona Peligrosa</p>
            {!showDeleteConfirm ? (
                <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-400 hover:text-red-600 text-sm font-bold border border-red-100 px-4 py-2 rounded-xl transition-all hover:bg-red-50"
                >
                    Eliminar este item
                </button>
            ) : (
                <div className="bg-red-50 p-6 rounded-2xl border border-red-200 w-full text-center animate-in fade-in zoom-in duration-200">
                    <p className="text-red-700 font-bold mb-1">¿Estás completamente seguro?</p>
                    <p className="text-red-600/60 text-xs mb-4">Esta acción no se puede deshacer y borrará todos los registros.</p>
                    <div className="flex gap-3 justify-center">
                        <button 
                            onClick={() => setShowDeleteConfirm(false)}
                            className="bg-white text-gray-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-red-200"
                        >
                            Sí, eliminar para siempre
                        </button>
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}