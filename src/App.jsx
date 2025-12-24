import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth"; // <--- Importamos onAuthStateChanged
import Dashboard from "./Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // <--- Nuevo estado de carga

  // 1. EFECTO: Escuchar si Firebase ya tiene sesión guardada
  useEffect(() => {
    // Esta función se ejecuta sola cuando Firebase termina de cargar la sesión del disco
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Si hay usuario guardado, obtenemos el token para el backend
        const token = await currentUser.getIdToken();
        
        // Opcional: Avisar al backend de que hemos vuelto (para actualizar datos si quieres)
        // fetch("http://localhost:8000/login"...) 
        
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false); // <--- Ya sabemos si hay usuario o no, quitamos el "Cargando"
    });

    return () => unsubscribe(); // Limpieza al cerrar
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // El onAuthStateChanged de arriba detectará esto automáticamente, 
      // así que no hace falta hacer setUser aquí manual necesariamente, 
      // pero para el primer login con backend está bien dejar la lógica de registro.
      
      const token = await result.user.getIdToken();
      
      // Enviamos el token al backend para registrar/login en nuestra DB
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token }),
      });

      if (response.ok) {
        // onAuthStateChanged se encargará de actualizar el estado visual
      }
    } catch (error) {
      console.error("Error login:", error);
    }
  };

  // 2. Si está cargando (verificando sesión), mostramos un spinner o nada
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 3. Si hay usuario, al Dashboard
  if (user) {
    return <Dashboard user={user} />;
  }

  // 4. Si no, al Login
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm w-full">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">OneMore</h1>
        <p className="text-gray-500 mb-6">Cuanta cosas, si te acuerdas de hacerlo</p>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <span className="bg-white text-blue-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">G</span>
          Iniciar con Google
        </button>
      </div>
    </div>
  );
}