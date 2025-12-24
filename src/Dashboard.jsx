import { useState, useEffect } from "react";
import { auth } from "./firebase";

export default function Dashboard({ user }) {
  const [items, setItems] = useState([]);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const API_URL = "http://192.168.1.115:8000";

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      if (!auth.currentUser) return;
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${API_URL}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setItems(await response.json());
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${API_URL}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newItemTitle }),
      });
      if (response.ok) {
        setItems([...items, await response.json()]);
        setNewItemTitle("");
      }
    } catch (error) { console.error(error); }
  };

  // --- FUNCIÓN NUEVA: ACTUALIZAR CONTADOR ---
  const updateCount = async (id, currentCount, change) => {
    const newCount = currentCount + change;
    if (newCount < 0) return; // No permitir negativos

    // 1. Actualización Optimista (Visualmente instantáneo)
    const oldItems = [...items];
    setItems(items.map(item => 
      item.id === id ? { ...item, count: newCount } : item
    ));

    try {
      const token = await auth.currentUser.getIdToken();
      await fetch(`${API_URL}/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ count: newCount }),
      });
    } catch (error) {
      // Si falla, revertimos el cambio
      setItems(oldItems);
      console.error("Error actualizando", error);
    }
  };

  // --- FUNCIÓN NUEVA: BORRAR ---
  const deleteItem = async (id) => {
    if(!confirm("¿Borrar este contador?")) return;
    try {
        const token = await auth.currentUser.getIdToken();
        await fetch(`${API_URL}/items/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        setItems(items.filter(item => item.id !== id));
    } catch (error) { console.error(error); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">OneMore 🍺</h1>
          <div className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-full">{user.email.split('@')[0]}</div>
        </div>

        <form onSubmit={handleAddItem} className="mb-8 flex gap-2">
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            placeholder="¿Qué quieres contar?"
            className="flex-1 p-4 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 rounded-xl font-bold text-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">+</button>
        </form>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center transition hover:shadow-md">
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                <button onClick={() => deleteItem(item.id)} className="text-xs text-red-300 hover:text-red-500 mt-1">Borrar</button>
              </div>
              
              <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-xl">
                <button 
                    onClick={() => updateCount(item.id, item.count, -1)}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 font-bold hover:bg-gray-100 active:scale-95 transition"
                >-</button>
                
                <span className="w-8 text-center font-bold text-xl text-blue-600">{item.count}</span>
                
                <button 
                    onClick={() => updateCount(item.id, item.count, 1)}
                    className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-lg shadow-sm text-white font-bold hover:bg-blue-700 active:scale-95 transition"
                >+</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}