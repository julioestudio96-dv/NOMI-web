import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NomiLogo from "./NomiLogo";
import { supabase } from "../libs/supabaseClient"; // ¡FALTABA ESTO! Importar tu cliente de Supabase

/**
 * Layout global que envuelve las páginas de la aplicación.
 * Controla el menú horizontal activo dinámicamente con JavaScript.
 */
export default function AppLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Mapeo estricto solicitado para los enlaces de navegación del sistema
    const menuItems = [
        { name: "Inicio", path: "/dashboard" },
        { name: "Turnos", path: "/shifts" },
        { name: "Calendario", path: "/calendar" },
        { name: "Auditoría", path: "/audit" },
        { name: "Ajustes", path: "/settings" },
        { name: "Información", path: "/payrollinfo" }
    ];

    const [user, setUser] = useState(null); // Limpiado a useState directo
    const [perfil, setPerfil] = useState(null); // Estado para la foto y nombre de la tabla profiles

    useEffect(() => { 
        async function obtenerUsuario() {
            try {
                // 1. Obtener el usuario autenticado desde Supabase
                const { data: { user } } = await supabase.auth.getUser(); 
                setUser(user); 

                // 2. Si hay un usuario, ir a la tabla 'profiles' a traer su avatar_url
                if (user) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('full_name, avatar_url')
                        .eq('id', user.id)
                        .single(); 

                    if (!error && data) {
                        console.log("¡Imagen encontrada con éxito!", data.avatar_url);
                        setPerfil(data); // Guardamos la info en el estado
                    } else {
                        console.error("Error al obtener el perfil de la tabla:", error);
                    }
                }
            } catch (err) {
                console.error("Error crítico en el flujo de usuario:", err);
            }
        }
        obtenerUsuario(); 
    }, []);

return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased">
    
    {/* BARRA SUPERIOR (HEADER) */}
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50 px-4 md:px-6 h-16 flex items-center justify-between shadow-xs">
        
        {/* Lado Izquierdo: Logotipo responsivo */}
        <NomiLogo />

        {/* Lado Central: Navegación horizontal en cápsula (Scrollable en celulares) */}
        <nav className="flex items-center gap-0.5 bg-slate-50 p-1 rounded-xl border border-slate-200/60 overflow-x-auto max-w-full no-scrollbar">
        {menuItems.map((item) => {
            // Evaluamos si el path actual coincide con el botón para prender los colores
            const isActivo = location.pathname === item.path;
            
            return (
            <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 md:px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                isActivo
                    ? "bg-white text-[#2A3447] shadow-xs border border-slate-100"
                    : "text-slate-400 hover:text-slate-600"
                }`}
            >
                {item.name}
            </button>
            );
        })}
        </nav>

        {/* Lado Derecho: Avatar de Usuario y Desconexión */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {perfil && perfil.avatar_url ? (
        <img 
        src={perfil.avatar_url} 
        alt="Avatar de Google"
        referrerPolicy="no-referrer" 
        className="w-8 h-8 rounded-full object-cover shadow-xs border border-slate-100 select-none"
        />
    ) : (
        <div className="w-8 h-8 rounded-full bg-[#5C4033] text-white text-xs font-bold flex items-center justify-center shadow-xs select-none">
        {perfil?.full_name ? perfil.full_name.charAt(0).toUpperCase() : "X"}
        </div>
    )}
        <button 
            onClick={() => navigate("/")} // Acción de salida para volver a la pantalla de login
            className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
            title="Cerrar Sesión"
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
        </button>
        </div>
    </header>

    {/* ÁREA CENTRAL DE CONTENIDO DINÁMICO */}
    <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {children}
    </main>
    </div>
);
}