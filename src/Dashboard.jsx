import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ user }) {
  const [items, setItems] = useState([]);
  
  // --- ESTADOS DEL FORMULARIO ---
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDesc, setNewItemDesc] = useState(""); // NUEVO: Descripción
  const [isHidden, setIsHidden] = useState(false);    // NUEVO: Checkbox
  const [isFormOpen, setIsFormOpen] = useState(false); // Estado para el formulario desplegable
  
  const API_URL = "/api";
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  // --- LÓGICA DRAG & DROP (Intacta) ---
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
      // ENVIAMOS LOS NUEVOS DATOS AL BACKEND
      body: JSON.stringify({ 
          title: newItemTitle,
          description: newItemDesc,
          is_hidden: isHidden
      }),
    });

    if (response.ok) {
      // Limpiamos todo el formulario y lo cerramos
      setNewItemTitle("");
      setNewItemDesc("");
      setIsHidden(false);
      setIsFormOpen(false);
      fetchItems();
    }
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

        {/* --- BOTÓN PARA DESPLEGAR FORMULARIO --- */}
        {!isFormOpen ? (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="w-full mb-6 py-4 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 text-gray-400 font-bold hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span> Añadir algo nuevo
          </button>
        ) : (
          /* --- FORMULARIO AÑADIR (MODERNIZADO) --- */
          <form onSubmit={addItem} className="mb-8 bg-white p-5 rounded-2xl shadow-md border border-gray-50 transition-all focus-within:shadow-lg focus-within:ring-1 focus-within:ring-blue-100 relative">
            <button 
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 text-xl font-bold"
            >
              ×
            </button>
            
            <div className="flex flex-col gap-3">
              {/* Título */}
              <input
                type="text"
                placeholder="¿Qué quieres contar?"
                className="w-full text-xl font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none border-none p-0 pr-8"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                autoFocus
              />

              {/* Descripción */}
              <textarea
                placeholder="Añade una descripción o secreto..."
                className="w-full text-sm text-gray-500 placeholder:text-gray-300 focus:outline-none border-none p-0 resize-none min-h-[40px]"
                rows="2"
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
              />

              <div className="h-px bg-gray-100 my-1"></div>

              {/* Pie del formulario: Selector de Privacidad + Botón */}
              <div className="flex justify-between items-center gap-4">
                 {/* Selector de Privacidad (Estilo Segmentado) */}
                 <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                    <button
                      type="button"
                      onClick={() => setIsHidden(false)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!isHidden ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      <span>🔓</span> Público
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsHidden(true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isHidden ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      <span>🔒</span> Privado
                    </button>
                 </div>

                 <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:translate-y-[-1px] active:translate-y-[1px] transition-all">
                    Añadir
                 </button>
              </div>
            </div>
          </form>
        )}

        {/* LISTA DE ITEMS (FILTRADOS: SOLO PÚBLICOS) */}
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="items-list">
            {(provided) => (
              <div className="space-y-3 pb-4" {...provided.droppableProps} ref={provided.innerRef}>
                {items.filter(i => !i.is_hidden).map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{ ...provided.draggableProps.style }}
                        onClick={() => navigate(`/item/${item.id}`)}
                        className={`bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center transition-all cursor-pointer hover:shadow-md active:scale-[0.98] border-l-4 ${
                            item.is_hidden ? "border-blue-500 bg-blue-50/10" : "border-transparent"
                        } ${
                            snapshot.isDragging ? "shadow-xl ring-2 ring-blue-100 z-50 opacity-90 scale-105" : ""
                        }`}
                      >
                        
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* MANIJA DRAG */}
                            <div 
                              {...provided.dragHandleProps} 
                              onClick={(e) => e.stopPropagation()} 
                              className="text-gray-200 cursor-grab active:cursor-grabbing p-1 -ml-1 hover:text-gray-400 flex-shrink-0"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
                            </div>
                            
                            {/* CONTENIDO ITEM */}
                            <div className="truncate pr-2">
                                <div className="flex items-center gap-2">
                                    <span className={`font-bold text-gray-800 text-lg truncate ${item.is_hidden ? "text-blue-900" : ""}`}>{item.title}</span>
                                    {/* BADGE SI ES PRIVADO */}
                                    {item.is_hidden && (
                                      <span className="bg-blue-100 text-blue-600 text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                        🔒 SECRETO
                                      </span>
                                    )}
                                </div>
                                {/* Mostrar un trocito de la descripción si existe */}
                                {item.description && (
                                    <p className="text-xs text-gray-400 font-medium truncate mt-0.5 italic">{item.description}</p>
                                )}
                            </div>
                        </div>
                        
                        {/* BOTONES CONTADOR */}
                        <div className="flex items-center gap-3 flex-shrink-0">
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

        {/* --- BOTÓN PARA IR A LA LISTA PRIVADA --- */}
        <div className="mt-8 mb-20 text-center">
            <button 
                onClick={() => navigate("/hidden")}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-500 font-bold text-sm transition-colors"
            >
                <span>🔒 Ver mis items privados</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded-md text-[10px] text-gray-500">
                    {items.filter(i => i.is_hidden).length}
                </span>
            </button>
        </div>
      </div>
    </div>
  );
}