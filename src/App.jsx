import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // <--- IMPORTANTE
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Dashboard from "./Dashboard";
import ItemDetail from "./ItemDetail"; // <--- Tu nueva página
import HiddenItems from "./HiddenItems"; // <--- Página de items ocultos
import Login from "./Login";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        currentUser.getIdToken().then((token) => {
          fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: token }),
          }).catch((err) => console.error("Sync error:", err));
        });
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // --- SISTEMA DE RUTAS ---
  return (
    <BrowserRouter>
      <Routes>
        {/* Si no hay usuario, mandamos al Login */}
        {!user && <Route path="*" element={<Login />} />}

        {/* Si hay usuario, habilitamos las rutas privadas */}
        {user && (
          <>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/item/:id" element={<ItemDetail user={user} />} />
            <Route path="/hidden" element={<HiddenItems user={user} />} />
            {/* Cualquier otra ruta redirige al Dashboard */}
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}