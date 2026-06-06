import React, { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import HeatmapCalendar from "../components/HeatmapCalendar";
import { supabase } from "../libs/supabaseClient"; 

export default function CalendarPage() {
    // Inicializamos la vista con el mes y año real actual
    const [fechaVista, setFechaVista] = useState(new Date(2026, 4, 1)); // Mayo de 2026
    const [shifts, setShifts] = useState([]);
    const [novelties, setNovelties] = useState([]);

    // Cargar datos dinámicamente adaptados a la estructura real de Supabase
    const cargarDatosMes = async (fecha) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1).toISOString();
        const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0, 23, 59, 59).toISOString();

        // 1. Cargar turnos del rango
        const { data: turnos } = await supabase
            .from("shifts")
            .select("*")
            .eq("user_id", user.id)
            .gte("start_time", primerDia)
            .lte("start_time", ultimoDia);

        // 2. Cargar novedades usando las columnas reales: start_date y end_date (image_e47371.png)
        const { data: novs } = await supabase
            .from("novelties")
            .select("*")
            .eq("user_id", user.id)
            .gte("start_date", primerDia.split("T")[0])
            .lte("start_date", ultimoDia.split("T")[0]);

        if (turnos) setShifts(turnos);
        
        // Mapeamos temporalmente para compatibilidad del HeatmapCalendar viejo por si lee 'date' y 'type'
        if (novs) {
            const novedadesMapeadas = novs.map(n => ({
                ...n,
                date: n.start_date, // Mapeo de auxilio
                type: n.category,   // Mapeo de auxilio
                description: n.subtype // Mapeo de auxilio
            }));
            setNovelties(novedadesMapeadas);
        }
    };

    useEffect(() => {
        cargarDatosMes(fechaVista);
    }, [fechaVista]);

    const mesAnterior = () => {
        setFechaVista(new Date(fechaVista.getFullYear(), fechaVista.getMonth() - 1, 1));
    };

    const mesSiguiente = () => {
        setFechaVista(new Date(fechaVista.getFullYear(), fechaVista.getMonth() + 1, 1));
    };

    // Guardar una nueva novedad mapeando fielmente a las columnas de la BD
    const handleAgregarNovedad = async (nuevaNovedad) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Estructura idéntica a image_e47371.png
        const { error } = await supabase
            .from("novelties")
            .insert([
                {
                    user_id: user.id,
                    start_date: nuevaNovedad.date,  // Guarda en start_date
                    end_date: nuevaNovedad.date,    // Al ser un solo día, coincide
                    category: nuevaNovedad.type,    // Mapeado a category (Incapacidad, Ausencia, etc)
                    subtype: nuevaNovedad.description || "Día de la Familia / Compensatorio", // Mapeado a subtype
                    percentage_paid: nuevaNovedad.type === "Incapacidad" ? 100 : 0 // Parámetro opcional por defecto
                }
            ]);

        if (!error) {
            cargarDatosMes(fechaVista); // Recarga automática instantánea
        } else {
            console.error("Error guardando novedad en Supabase:", error);
        }
    };

    const nombreMesAño = fechaVista.toLocaleDateString("es-CO", {
        month: "long",
        year: "numeric"
    });

    return (
        <AppLayout>
            <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* BARRA DE NAVEGACIÓN DEL MES */}
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
                    <button
                        type="button"
                        onClick={mesAnterior}
                        className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer select-none"
                    >
                        ◀ Mes Anterior
                    </button>
                    
                    <h2 className="text-sm font-black text-slate-700 capitalize tracking-wider select-none">
                        {nombreMesAño}
                    </h2>

                    <button
                        type="button"
                        onClick={mesSiguiente}
                        className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer select-none"
                    >
                        Mes Siguiente ▶
                    </button>
                </div>

                {/* CALENDARIO INTERACTIVO */}
                <HeatmapCalendar 
                    currentDate={fechaVista} 
                    shifts={shifts} 
                    novelties={novelties} // Envía los datos con el fallback de mapeo integrado
                    onAddNovelty={handleAgregarNovedad}
                />
                
                {/* Leyenda aclaratoria */}
                <div className="px-2 text-left">
                    <p className="text-xs text-slate-400 italic">
                        * Los domingos se resaltan en rosa, los festivos colombianos en amarillo y los días con incidencias/novedades médicas o días compensatorios/familia se reflejarán visualmente.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}