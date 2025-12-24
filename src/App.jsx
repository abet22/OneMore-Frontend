import { useState } from "react";
import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function App() {
  const [user, setUser] = useState(null);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // 1. Login con Google
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      console.log("Token:", token.substring(0, 10) + "...");

      // 2. Enviar a Raspberry Pi (Backend)
      const response = await fetch("http://192.168.1.115:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        console.error("Error backend");
      }

    } catch (error) {
      console.error("Error login:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm w-full">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">OneMore 🍺</h1>
        <p className="text-gray-500 mb-6">Tu contador anual</p>

        {!user ? (
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md"
          >
            Iniciar con Google
          </button>
        ) : (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
            <p className="font-bold">¡Hola, {user.display_name}!</p>
            <p className="text-sm mt-1">Tu ID de usuario es: {user.id}</p>
          </div>
        )}
      </div>
    </div>
  );
}
