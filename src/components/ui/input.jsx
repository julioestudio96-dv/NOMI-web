import React from "react";

/**
 * Componente unificado de Input con los bordes y enfoques visuales de Tailwind v4.
 */
export function Input({ className = "", type = "text", ...props }) {
return (
    <input
    type={type}
    className={`w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-pink-300 focus:bg-white transition-all shadow-2xs ${className}`}
    {...props}
    />
);
}