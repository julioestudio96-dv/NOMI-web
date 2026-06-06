import React from 'react'
import './App.css'
import { Routes, Route, Navigate } from "react-router-dom"; // 🧼 Quitamos BrowserRouter de aquí

// Importación de las vistas principales del proyecto
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Shifts from "./pages/Shifts";
import CalendarPage from "./pages/CalendarPage";
import Audit from "./pages/Audit";
import SettingsPage from "./pages/SettingsPage";
import PayrollInfo from "./pages/PayrollInfo";

function App() {
  return (
    <Routes>
        {/* Ruta pública inicial: Pantalla de Login */}
        <Route path="/" element={<LoginPage />} />

        {/* Rutas privadas de la aplicación */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/shifts" element={<Shifts />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path='/payrollinfo' element={<PayrollInfo />} />

        {/* Redirección automática si escriben cualquier ruta inválida */}
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App;