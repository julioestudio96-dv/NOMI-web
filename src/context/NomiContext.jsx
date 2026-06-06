// src/context/NomiContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const NomiContext = createContext();

export const NomiProvider = ({ children }) => {
    // Estado inicial: puedes cargar esto desde localStorage para persistir el salario
    const [userSalary, setUserSalary] = useState(() => {
        const saved = localStorage.getItem('nomi_userSalary');
        return saved ? parseFloat(saved) : 1750905;
    });

    // Guardar automáticamente en localStorage cuando el salario cambie
    useEffect(() => {
        localStorage.setItem('nomi_userSalary', userSalary);
    }, [userSalary]);

    // Función para actualizar salario desde SettingsPage
    const updateSalary = (newSalary) => {
        setUserSalary(parseFloat(newSalary));
    };

    return (
        <NomiContext.Provider value={{ userSalary, updateSalary }}>
            {children}
        </NomiContext.Provider>
    );
};

// Hook personalizado para usar el contexto fácilmente en cualquier componente
export const useNomi = () => {
    const context = useContext(NomiContext);
    if (!context) {
        throw new Error('useNomi debe ser usado dentro de un NomiProvider');
    }
    return context;
};