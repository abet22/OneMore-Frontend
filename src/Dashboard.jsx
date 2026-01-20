import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom"; // <--- Importamos navegación

export default function Dashboard({ user }) {
  const [items, setItems] = useState([]);
  const [newItemTitle, setNewItemTitle] = useState("");
  const API_URL = "/api";
  const navigate = useNavigate(); // <--- Hook para navegar

  useEffect(() => {
    fetchItems();
  }, []);

  // --- LÓGICA DRAG & DROP ---
  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    setItems(newItems);

    const orderedIds = newItems.map((item) => item.id);
    try {
      const token = await user.getIdToken();
      await fetch(`${API_URL}/items/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(orderedIds),
      });
    } catch (error) { console.error(error); }
  };

  // --- FUNCIONES API ---
  const fetchItems = async () => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/items`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) { console.error(error); }
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    const token = await user.getIdToken();
    const response = await fetch(`${API_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: newItemTitle }),
    });
    if (response.ok) {
      setNewItemTitle("");
      fetchItems();
    }
  };

  const incrementItem = async (e, id) => {
    e.stopPropagation(); // Evita que al pulsar el botón entremos en detalles
    setItems(items.map(i => i.id === id ? { ...i, count: i.count + 1 } : i));
    const token = await user.getIdToken();
    await fetch(`${API_URL}/items/${id}/increment`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  };

  const decrementItem = async (e, id) => {
    e.stopPropagation(); // Evita navegar
    setItems(items.map(i => i.id === id ? { ...i, count: i.count - 1 } : i));
    const token = await user.getIdToken();
    await fetch(`${API_URL}/items/${id}/decrement`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  };

  const handleLogout = () => signOut(auth);

  return (
    <div className="min-h-screen bg-gray-50 p-4 relative font-sans">
      <div className="max-w-md mx-auto">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <img src="/bar_logo.png" alt="Logo" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800 leading-none">OneMore</h1>
              <p className="text-xs text-gray-500">Hola, {user.displayName}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-sm text-red-500 border border-red-100 px-3 py-1 rounded-lg hover:bg-red-50 transition">Salir</button>
        </header>

        {/* INPUT AÑADIR */}
        <form onSubmit={addItem} className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="¿Qué quieres contar?"
            className="flex-1 p-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white p-3 rounded-xl font-bold shadow-sm hover:bg-blue-700 transition w-12 flex items-center justify-center text-xl">+</button>
        </form>

        {/* LISTA */}
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="items-list">
            {(provided) => (
              <div className="space-y-3 pb-20" {...provided.droppableProps} ref={provided.innerRef}>
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{ ...provided.draggableProps.style }}
                        // EVENTO DE NAVEGACIÓN: Al hacer click en la tarjeta, vamos a detalles
                        onClick={() => navigate(`/item/${item.id}`)}
                        className={`bg-white p-4 rounded-xl shadow-sm flex justify-between items-center transition-all cursor-pointer hover:bg-gray-50 active:scale-[0.98] ${
                            snapshot.isDragging ? "shadow-lg ring-2 ring-blue-100 z-50" : ""
                        }`}
                      >
                        
                        <div className="flex items-center gap-3 flex-1">
                            {/* MANIJA (evitamos que navegar al arrastrar) */}
                            <div 
                              {...provided.dragHandleProps} 
                              onClick={(e) => e.stopPropagation()} 
                              className="text-gray-300 cursor-grab active:cursor-grabbing p-1 -ml-2 hover:text-gray-500"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
                            </div>
                            {/* TÍTULO LIMPIO */}
                            <span className="font-medium text-gray-700 text-lg truncate pr-2">{item.title}</span>
                        </div>
                        
                        {/* BOTONES (con stopPropagation para no navegar) */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => decrementItem(e, item.id)}
                            disabled={item.count <= 0}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl pb-1 transition-colors ${
                              item.count <= 0 ? "bg-gray-100 text-gray-300" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >-</button>

                          <span className="text-2xl font-bold text-blue-600 w-8 text-center select-none">{item.count}</span>
                          
                          <button
                            onClick={(e) => incrementItem(e, item.id)}
                            className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl hover:bg-blue-200 transition-colors"
                          >+</button>
                        </div>

                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}