import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"; // <--- AÑADIDO GoogleAuthProvider
import { auth } from "./firebase"; // <--- QUITADO googleProvider (solo traemos auth)

export default function Login() {
  
  const handleGoogleLogin = async () => {
    try {
      // Creamos la instancia del proveedor aquí mismo
      const provider = new GoogleAuthProvider(); 
      await signInWithPopup(auth, provider);
      // Firebase avisará a App.jsx automáticamente
    } catch (error) {
      console.error("Error en login con Google", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        
        {/* LOGO */}
        <img 
          src="/golden_logo.png" 
          alt="OneMore Logo" 
          className="w-28 h-28 mx-auto mb-2 object-contain"
        />

        <h1 className="text-3xl font-bold text-gray-800 mb-1">OneMore</h1>
        <h2 className="text-gray-500 mb-8">Cuenta cosas, si te acuerdas de hacerlo claro ;)</h2>

        {/* BOTÓN GOOGLE */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.04-3.71 1.04-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.82z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.82c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Continuar con Google</span>
        </button>
      </div>
    </div>
  );
}