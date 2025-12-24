import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Dashboard from "./Dashboard";
import Login from "./Login";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // 1. ACTUALIZAR ESTADO VISUAL INMEDIATAMENTE
      // No esperamos al backend para mostrar la pantalla al usuario
      setUser(currentUser);
      setLoading(false);

      // 2. SINCRONIZAR CON BACKEND EN SEGUNDO PLANO
      // Si hay usuario, enviamos el token sin bloquear la UI ("Fire and forget")
      if (currentUser) {
        currentUser.getIdToken().then((token) => {
          fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: token }),
          }).catch((err) => console.error("Error silencioso sync backend:", err));
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Spinner de carga (solo aparecerá un instante)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Renderizado principal
  return (
    <>
      {user ? <Dashboard user={user} /> : <Login />}
    </>
  );
}