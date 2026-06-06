import React from "react";
import { supabase } from "../libs/supabaseClient"; // Ruta unificada

function IconosDecorativosLogo() {
return (
    <div className="grid grid-cols-2 gap-1.5 shrink-0 bg-white/40 p-1.5 rounded-xl border border-pink-100/50 shadow-sm">
    <div className="w-4 h-4 rounded-md bg-sky-100 flex items-center justify-center text-[9px]">📅</div>
    <div className="w-4 h-4 rounded-md bg-amber-100 flex items-center justify-center text-[9px]">🕒</div>
    <div className="w-4 h-4 rounded-md bg-emerald-100 flex items-center justify-center text-[9px]">➕</div>
    <div className="w-4 h-4 rounded-md bg-purple-100 flex items-center justify-center text-[9px]">💳</div>
    </div>
);
}

function IconoGoogle() {
return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
    <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84Z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"/>
    </svg>
);
}

export default function LoginPage() {

// Integración auténtica de Google Authentication mediante Supabase
const handleGoogleLogin = async () => {
    try {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
        // Cambiará automáticamente el flujo tras la verificación de Google
        redirectTo: window.location.origin + "/dashboard", 
        },
    });
    if (error) throw error;
    } catch (error) {
    console.error("Error al iniciar sesión con Google:", error.message);
    alert("No se pudo iniciar sesión: " + error.message);
    }
};

return (
    <div className="min-h-screen bg-linear-to-tr from-[#FFF0F2] via-[#FDF8F8] to-[#FFF5F6] flex items-center justify-center p-6 md:p-12 lg:p-16 selection:bg-pink-100">
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        <div className="lg:col-span-7 space-y-8 text-left max-w-2xl mx-auto lg:mx-0">
        {/* Logo unificado con la marca en MAYÚSCULAS */}
        <div className="flex items-center gap-4">
            <IconosDecorativosLogo />
            <div className="flex items-center gap-2">
            <span className="text-4xl font-black text-[#2D3748] tracking-tight flex items-center uppercase">
                N
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FCD3D7] text-[#BD6B6B] mx-0.5 text-lg font-black shadow-inner normal-case">
                ✓
                </span>
                MI
            </span>
            </div>
            <div className="h-8 w-px bg-pink-200/60 hidden sm:block"></div>
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase hidden sm:block pt-1">
            Tu Auditor Digital de Nómina
            </span>
        </div>
        
        <div className="space-y-5">
            <h1 className="text-4xl md:text-5xl lg:text-[3.2rem] font-black text-[#1E293B] leading-[1.15] tracking-tight">
            Audita tu nómina <br />
            sin <span className="text-[#BD6B6B] relative inline-block">dolores de cabeza<span className="absolute bottom-1 left-0 w-full h-2 bg-pink-100 -z-10 rounded"></span></span>.
            </h1>
            
            <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
            NOMI calcula automáticamente tus recargos nocturnos, dominicales y extras 
            para trabajadores de turnos rotativos en Colombia. Tu aliado para reclamar lo que es tuyo.
            </p>
        </div>

        <ul className="space-y-4 pt-2 font-medium text-slate-600 max-w-md">
            <li className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-[#FFE5E5] flex items-center justify-center text-xs text-[#BD6B6B] shrink-0 shadow-sm">✨</div>
            <span className="text-sm md:text-baseline">Cálculo transversal de turnos noche/día</span>
            </li>
            <li className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-sky-50 flex items-center justify-center text-xs text-sky-500 shrink-0 shadow-sm">🛡️</div>
            <span className="text-sm md:text-baseline">Auditoría espejo contra tu colilla</span>
            </li>
            <li className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-xs text-emerald-500 shrink-0 shadow-sm">📄</div>
            <span className="text-sm md:text-baseline">Reporte PDF con anexo técnico día por día</span>
            </li>
        </ul>
        </div>

        <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
        <div className="bg-white p-8 md:p-10 rounded-4xl shadow-[0_15px_40px_rgba(255,182,193,0.15)] w-full max-w-105 border border-white/80">
            <div className="space-y-6 text-center">
            <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-extrabold text-[#1E293B] flex items-center justify-center gap-1.5 uppercase">
                Bienvenido a NOMI 🌸
                </h2>
                <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed px-2">
                Entra con tu cuenta de Google. Tus datos son privados, solo tú los verás.
                </p>
            </div>

            <button
                onClick={handleGoogleLogin}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-sm rounded-xl h-12 md:h-13 text-sm font-bold transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
            >
                <IconoGoogle />
                <span>Continuar con Google</span>
            </button>

            <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-relaxed pt-2 px-4">
                Al continuar aceptas el uso responsable de tus datos laborales.
            </p>
            </div>
        </div>
        </div>
        
    </div>
    </div>
);
}