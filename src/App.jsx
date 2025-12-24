import { useState } from "react";
import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Dashboard from "./Dashboard"; // <--- Importamos el nuevo componente

export default function App() {
  const [user, setUser] = useState(null);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      // Enviamos el token al backend para registrar/login
      const response = await fetch("http://192.168.1.115:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error("Error login:", error);
    }
  };

  // Si hay usuario, mostramos el Dashboard. Si no, el Login.
  if (user) {
    return <Dashboard user={user} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm w-full">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">OneMore 🍺</h1>
        <p className="text-gray-500 mb-6">Tu contador de vida</p>

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
