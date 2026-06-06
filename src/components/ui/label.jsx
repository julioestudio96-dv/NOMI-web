import React from "react";

/**
 * Componente Label para estandarizar la tipografía secundaria de los formularios.
 */
export function Label({ children, htmlFor, className = "" }) {
return (
    <label
    htmlFor={htmlFor}
    className={`text-xs font-semibold text-slate-500 block ${className}`}
    >
    {children}
    </label>
);
}