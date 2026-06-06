import React from "react";

/**
 * Componente reutilizable de Botón.
 * Incorpora variantes de diseño controladas por strings mediante Tailwind CSS v4.
 */
export function Button({ children, className = "", variant = "default", disabled, ...props }) {
// Estilos transversales para el comportamiento físico del botón
const baseStyles = "inline-flex items-center justify-center font-bold tracking-tight transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

// Diccionario de variantes visuales adaptadas al diseño pastel
const variants = {
    default: "bg-[#BD6B6B] text-white hover:bg-[#A85A5A] rounded-2xl h-11 px-8 shadow-xs",
    ghost: "h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-full",
};

return (
    <button
    disabled={disabled}
    className={`${baseStyles} ${variants[variant]} ${className}`}
    {...props}
    >
    {children}
    </button>
);
}