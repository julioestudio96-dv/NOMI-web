import React, { useState } from "react";

// 🧼 Función para formatear el dinero a pesos colombianos
const formatearMonedaLocal = (valor) => {
    const valorSeguro = isNaN(valor) || valor === undefined ? 0 : valor;
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(valorSeguro);
};

export const ShiftList = ({ shifts = [], onChanged: dispararActualizacion }) => {
    // 🗓️ Control del mes en el historial (Mayo 2026)
    const [fechaHistorial, setFechaHistorial] = useState(new Date(2026, 4, 1));

    const mesAnterior = () => {
        setFechaHistorial(new Date(fechaHistorial.getFullYear(), fechaHistorial.getMonth() - 1, 1));
    };

    const mesSiguiente = () => {
        setFechaHistorial(new Date(fechaHistorial.getFullYear(), fechaHistorial.getMonth() + 1, 1));
    };

    // 1. Filtrar turnos pertenecientes al mes seleccionado
    const turnosFiltradosDelMes = shifts.filter((turno) => {
        const fechaString = turno.start_time;
        if (!fechaString) return false;
        const fechaTurno = new Date(fechaString);
        return (
            fechaTurno.getMonth() === fechaHistorial.getMonth() &&
            fechaTurno.getFullYear() === fechaHistorial.getFullYear()
        );
    });

    // =========================================================================
    // 📊 ACUMULADORES GLOBALES: CONSUMO DE LOS VALORES REALES DEL TURNO
    // =========================================================================
    let acumuladoOrdDiurnas = 0;
    let acumuladoOrdNocturnas = 0;
    let acumuladoFestDiurnas = 0;
    let acumuladoFestNocturnas = 0;

    // Recorremos los turnos mapeando las propiedades reales que vienen del objeto
    turnosFiltradosDelMes.forEach((turno) => {
        acumuladoOrdDiurnas += Number(turno.ordD || turno.diurnasOrdinarias || 0);
        acumuladoOrdNocturnas += Number(turno.ordN || turno.nocturnasOrdinarias || 0);
        acumuladoFestDiurnas += Number(turno.festD || turno.diurnasFestivas || 0);
        acumuladoFestNocturnas += Number(turno.festN || turno.nocturnasFestivas || 0);
    });

    const nombreMesFiltro = fechaHistorial.toLocaleDateString("es-CO", { month: "long", year: "numeric" });

    const ejecutarBorradoLocal = (idTurno) => {
        if (!idTurno) return;
        if (confirm("¿Estás seguro de eliminar este turno del registro de auditoría?")) {
            dispararActualizacion(idTurno);
        }
    };

    return (
        <div className="space-y-4 text-left">
            
            {/* 🗺️ CONTENEDOR DE CONTROL E INFORMACIÓN DEL MES */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2 mb-4 bg-slate-50/40 p-3 rounded-2xl border border-slate-100">
                
                {/* 📊 CUADRO CONSOLIDADO DE HORAS DEL MES */}
                {turnosFiltradosDelMes.length > 0 ? (
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Total Mes:</span>
                        
                        <div className="bg-emerald-50 text-emerald-700 text-[11px] px-2.5 py-1 rounded-xl border border-emerald-100 font-bold">
                            ⏱️ {acumuladoOrdDiurnas.toFixed(1)}h Ord. Diurnas
                        </div>

                        <div className="bg-indigo-50 text-indigo-700 text-[11px] px-2.5 py-1 rounded-xl border border-indigo-100 font-bold">
                            🌙 {acumuladoOrdNocturnas.toFixed(1)}h Ord. Nocturnas
                        </div>

                        <div className="bg-amber-50 text-amber-700 text-[11px] px-2.5 py-1 rounded-xl border border-amber-100 font-bold">
                            ☀️ {acumuladoFestDiurnas.toFixed(1)}h Dom/Fest Diurnas
                        </div>

                        <div className="bg-rose-50 text-rose-700 text-[11px] px-2.5 py-1 rounded-xl border border-rose-100 font-bold">
                            🚨 {acumuladoFestNocturnas.toFixed(1)}h Dom/Fest Nocturnas
                        </div>
                    </div>
                ) : (
                    <div className="text-xs font-semibold text-slate-400 italic">
                        Sin horas registradas en este periodo
                    </div>
                )}

                {/* 🗓️ BOTONES DE NAVEGACIÓN PARA EL HISTORIAL */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-3xs self-end sm:self-auto">
                    <button type="button" onClick={mesAnterior} className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs cursor-pointer select-none transition-colors">‹</button>
                    <span className="text-xs font-bold text-slate-700 capitalize min-w-27.5 text-center">
                        {nombreMesFiltro}
                    </span>
                    <button type="button" onClick={mesSiguiente} className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs cursor-pointer select-none transition-colors">›</button>
                </div>
            </div>

            {/* 📜 LISTA FILTRADA DE TURNOS */}
            {turnosFiltradosDelMes.length === 0 ? (
                <div className="p-8 text-center text-slate-400 border-dashed border-2 border-slate-200 bg-white rounded-3xl font-medium text-sm">
                    No hay turnos anexados en <span className="capitalize font-bold text-slate-500">{nombreMesFiltro}</span>.
                </div>
            ) : (
                <div className="divide-y divide-slate-100 shadow-xs bg-white rounded-3xl border border-slate-100 overflow-hidden">
                    {turnosFiltradosDelMes.map((turno) => {
                        const fechaInicia = new Date(turno.start_time);
                        const fechaTermina = new Date(turno.end_time);
                        const horasTotales = (fechaTermina - fechaInicia) / (1000 * 60 * 60);

                        // Extracción directa de las propiedades reales que inyecta tu hook de Nomi
                        const hFN = Number(turno.festN || turno.nocturnasFestivas || 0);
                        const hON = Number(turno.ordN || turno.nocturnasOrdinarias || 0);
                        const hFD = Number(turno.festD || turno.diurnasFestivas || 0);
                        const hOD = Number(turno.ordD || turno.diurnasOrdinarias || 0);

                        // Extracción directa del dinero liquidado real de useDataNomi
                        const dineroFinal = turno.total_amount || turno.totalAmount || turno.totalTurnoCompleto || 0;

                        return (
                            <div key={turno.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="text-sm font-bold text-slate-700 capitalize">
                                            {fechaInicia.toLocaleDateString("es-CO", { weekday: "short", day: "2-digit", month: "short" })}
                                        </div>
                                        {turno.notes && (
                                            <span className="inline-flex items-center text-[11px] bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded-md font-medium max-w-xs truncate" title={turno.notes}>
                                                📌 {turno.notes}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="text-xs text-slate-400 mt-0.5 font-medium">
                                        {fechaInicia.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false })} → {fechaTermina.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false })} · <span className="font-bold text-slate-500">{horasTotales.toFixed(1)} h totales</span>
                                    </div>

                                    {/* 🏷️ DESGLOSE DE BADGES POR TURNO INDIVIDUAL */}
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {hFN > 0 && <span className="bg-rose-50 text-rose-700 text-[10px] px-2.5 py-0.5 rounded-full border border-rose-100 font-bold">🚨 {hFN.toFixed(1)}h Nocturnas Dominical / Festivas</span>}
                                        {hON > 0 && <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2.5 py-0.5 rounded-full border border-indigo-100 font-bold">🌙 {hON.toFixed(1)}h Nocturnas Ordinarias</span>}
                                        {hFD > 0 && <span className="bg-amber-50 text-amber-700 text-[10px] px-2.5 py-0.5 rounded-full border border-amber-100 font-bold">☀️ {hFD.toFixed(1)}h Diurnas Dominical / Festivas</span>}
                                        {hOD > 0 && <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-100 font-bold">⏱️ {hOD.toFixed(1)}h Diurnas Ordinarias</span>}
                                    </div>
                                </div>

                                {/* 💵 VALOR EN DINERO REAL Y BOTÓN DE BORRAR ALINEADO ABAJO */}
                                <div className="text-right flex flex-col items-end gap-2 shrink-0 justify-between min-h-16.25">
                                    {dineroFinal > 0 && (
                                        <div className="font-black text-slate-700 text-base tracking-tight">
                                            {formatearMonedaLocal(dineroFinal)}
                                        </div>
                                    )}
                                    
                                    <button 
                                        onClick={() => ejecutarBorradoLocal(turno.id)} 
                                        className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors flex items-center justify-center cursor-pointer border border-transparent hover:border-rose-100" 
                                        title="Eliminar turno"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ShiftList;