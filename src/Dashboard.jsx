import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

export default function Dashboard({ user }) {
  const [items, setItems] = useState([]);
  const [newItemTitle, setNewItemTitle] = useState("");
  const API_URL = "/api";

  // --- ESTADOS PARA LOS MODALES ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [editTitleInput, setEditTitleInput] = useState("");

  // NUEVO: Estado para el Historial
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyItemTitle, setHistoryItemTitle] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  // --- FUNCIONES API ---

  const fetchItems = async () => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Error cargando items", error);
    }
  };

  // NUEVO: Función para pedir los logs
  const fetchLogs = async (item) => {
    const token = await user.getIdToken();
    const response = await fetch(`${API_URL}/items/${item.id}/logs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (response.ok) {
      const logs = await response.json();
      setHistoryLogs(logs);
      setHistoryItemTitle(item.title);
      setIsHistoryModalOpen(true); // Abrimos el modal
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    const token = await user.getIdToken();
    const response = await fetch(`${API_URL}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newItemTitle }),
    });

    if (response.ok) {
      setNewItemTitle("");
      fetchItems();
    }
  };

  const incrementItem = async (id) => {
    const token = await user.getIdToken();
    const response = await fetch(`${API_URL}/items/${id}/increment`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) fetchItems();
  };

  const decrementItem = async (id) => {
    const token = await user.getIdToken();
    const response = await fetch(`${API_URL}/items/${id}/decrement`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) fetchItems();
  };

  // --- MODALES (Borrar / Editar) ---
  const openDeleteModal = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const token = await user.getIdToken();
    await fetch(`${API_URL}/items/${itemToDelete}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchItems();
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const openEditModal = (item) => {
    setItemToEdit(item.id);
    setEditTitleInput(item.title);
    setIsEditModalOpen(true);
  };

  const confirmEdit = async () => {
    if (!itemToEdit || !editTitleInput.trim()) return;
    const token = await user.getIdToken();
    const response = await fetch(`${API_URL}/items/${itemToEdit}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: editTitleInput }),
    });

    if (response.ok) fetchItems();
    setIsEditModalOpen(false);
    setItemToEdit(null);
    setEditTitleInput("");
  };

  const handleLogout = () => signOut(auth);

  // Función auxiliar para formatear fecha bonita
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("es-ES", {
      day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 relative">
      <div className="max-w-md mx-auto">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">OneMore</h1>
            <p className="text-xs text-gray-500">Hola, {user.displayName}</p>
          </div>
          <button onClick={handleLogout} className="text-sm text-red-500 border border-red-100 px-3 py-1 rounded-lg hover:bg-red-50 transition">
            Salir
          </button>
        </header>

        {/* INPUT AÑADIR */}
        <form onSubmit={addItem} className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="¿Qué quieres contar?"
            className="flex-1 p-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white p-3 rounded-xl font-bold shadow-sm hover:bg-blue-700 transition">
            +
          </button>
        </form>

        {/* LISTA DE ITEMS */}
        <div className="space-y-3 pb-20">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
              
              {/* Lado Izquierdo: Info */}
              <div className="flex flex-col">
                <span className="font-medium text-gray-700 text-lg">{item.title}</span>
                <div className="flex gap-3 mt-1">
                  <button 
                    onClick={() => openEditModal(item)}
                    className="text-xs text-gray-400 hover:text-blue-500 flex items-center gap-1"
                  >
                    Editar
                  </button>
                  {/* BOTÓN HISTORIAL */}
                  <button 
                    onClick={() => fetchLogs(item)}
                    className="text-xs text-blue-400 hover:text-blue-600 flex items-center gap-1"
                  >
                    Historial
                  </button>
                </div>
              </div>
              
              {/* Lado Derecho: Botones */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => decrementItem(item.id)}
                  disabled={item.count <= 0}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl pb-1 transition-colors active:scale-95 ${
                    item.count <= 0 ? "bg-gray-100 text-gray-300" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  -
                </button>

                {/* AL HACER CLICK EN EL NÚMERO TAMBIÉN ABRE HISTORIAL */}
                <span 
                  onClick={() => fetchLogs(item)}
                  className="text-2xl font-bold text-blue-600 w-8 text-center cursor-pointer hover:scale-110 transition-transform select-none"
                >
                  {item.count}
                </span>
                
                <button
                  onClick={() => incrementItem(item.id)}
                  className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl hover:bg-blue-200 transition-colors active:scale-95"
                >
                  +
                </button>

                <button onClick={() => openDeleteModal(item.id)} className="text-gray-300 hover:text-red-500 ml-2 p-2">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL HISTORIAL (NUEVO) --- */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-0 w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden">
            
            {/* Cabecera del Modal */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Historial: {historyItemTitle}</h3>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                &times;
              </button>
            </div>

            {/* Lista Scrollable */}
            <div className="overflow-y-auto p-4 space-y-2">
              {historyLogs.length === 0 ? (
                <p className="text-center text-gray-400 py-4">Sin registros aún.</p>
              ) : (
                historyLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
                    <span className="text-gray-600 capitalize">
                      {formatDate(log.timestamp)}
                    </span>
                    <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-full">
                      +1
                    </span>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL BORRAR --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-2">¿Borrar contador?</h3>
            <p className="text-gray-500 mb-6 text-sm">Se eliminará todo el historial.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-3 px-4 bg-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-200">Borrar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDITAR --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Editar nombre</h3>
            <input type="text" autoFocus className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg" value={editTitleInput} onChange={(e) => setEditTitleInput(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl">Cancelar</button>
              <button onClick={confirmEdit} className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-200">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}