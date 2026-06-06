import React, { useState } from "react";
// Importamos tu detector de parámetros legales oficial para mantener la coherencia de NOMI
import { obtenerParametrosLegales } from "../hooks/useNomiData"; 

// 🧼 Función para formatear el dinero a pesos colombianos
const formatearMonedaLocal = (valor) => {
    const valorSeguro = isNaN(valor) || valor === undefined ? 0 : valor;
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(valorSeguro);
};

const getSemanaISO = (fecha) => {
    const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// 🗓️ Algoritmo de Gauss y Ley Emiliani para validar festivos en vivo por fila
const verificarFestivoLocal = (año, mes, dia) => {
    const a = año % 19;
    const b = año % 4;
    const c = año % 7;
    const d = (19 * a + 24) % 30;
    const e = (2 * b + 4 * c + 6 * d + 5) % 7;
    let diasPascua = 22 + d + e;
    let mesPascua = 2;

    if (diasPascua > 31) {
        diasPascua -= 31;
        mesPascua = 3;
    }
    const domingoPascua = new Date(año, mesPascua, diasPascua);

    const obtenerFechaPascua = (diasDiferencia) => {
        const copia = new Date(domingoPascua.getTime());
        copia.setDate(copia.getDate() + diasDiferencia);
        return copia;
    };

    const leyEmiliani = (m, d) => {
        const fechaOriginal = new Date(año, m, d);
        const diaSemana = fechaOriginal.getDay();
        if (diaSemana === 0 || diaSemana === 1) return fechaOriginal;
        const diasParaLunes = (8 - diaSemana) % 7;
        fechaOriginal.setDate(fechaOriginal.getDate() + diasParaLunes);
        return fechaOriginal;
    };

    const festivosFijos = [
        new Date(año, 0, 1), new Date(año, 4, 1), new Date(año, 6, 20),
        new Date(año, 7, 7), new Date(año, 11, 8), new Date(año, 11, 25),
    ];

    const festivosEmiliani = [
        leyEmiliani(0, 6), leyEmiliani(2, 19), leyEmiliani(5, 29),
        leyEmiliani(7, 15), leyEmiliani(9, 12), leyEmiliani(10, 1), leyEmiliani(10, 11),
    ];

    const festivosVariablesPascua = [
        obtenerFechaPascua(-3), obtenerFechaPascua(-2),
        leyEmiliani(domingoPascua.getMonth(), domingoPascua.getDate() + 43),
        leyEmiliani(domingoPascua.getMonth(), domingoPascua.getDate() + 64),
        leyEmiliani(domingoPascua.getMonth(), domingoPascua.getDate() + 71),
    ];

    const todosLosFestivos = [...festivosFijos, ...festivosEmiliani, ...festivosVariablesPascua];
    return todosLosFestivos.some(f => f.getMonth() === mes && f.getDate() === dia);
};

export const ShiftList = ({ shifts = [], onChanged: dispararActualizacion }) => {
    const [fechaHistorial, setFechaHistorial] = useState(new Date(2026, 4, 1));
    const salarioBaseFijo = 1750905;

    const mesAnterior = () => setFechaHistorial(new Date(fechaHistorial.getFullYear(), fechaHistorial.getMonth() - 1, 1));
    const mesSiguiente = () => setFechaHistorial(new Date(fechaHistorial.getFullYear(), fechaHistorial.getMonth() + 1, 1));

    const turnosFiltradosDelMes = shifts.filter((turno) => {
        if (!turno.start_time) return false;
        const fechaTurno = new Date(turno.start_time);
        return fechaTurno.getMonth() === fechaHistorial.getMonth() && fechaTurno.getFullYear() === fechaHistorial.getFullYear();
    });

    let acumuladoOrdDiurnas = 0;
    let acumuladoOrdNocturnas = 0;
    let acumuladoFestDiurnas = 0;
    let acumuladoFestNocturnas = 0;
    let dineroTotalAcumuladoMes = 0;

    const turnosProcesadosConDesglose = turnosFiltradosDelMes.map((turno) => {
        const inicio = new Date(turno.start_time);
        const fin = new Date(turno.end_time);
        let hOD = 0; let hON = 0; let hFD = 0; let hFN = 0;
        let valorCalculadoTurno = 0;

        const parametros = obtenerParametrosLegales(turno.start_time);
        const divisorLegal = parametros?.divisor || 220;
        const valorHoraBase = salarioBaseFijo / divisorLegal;

        let tiempoActualMs = inicio.getTime();
        const finMs = fin.getTime();

        while (tiempoActualMs < finMs) {
            const momentoEvaluado = new Date(tiempoActualMs);
            const hora = momentoEvaluado.getHours();
            const diaSemana = momentoEvaluado.getDay();
            
            const esDiaFestivo = (diaSemana === 0) || verificarFestivoLocal(momentoEvaluado.getFullYear(), momentoEvaluado.getMonth(), momentoEvaluado.getDate());
            const esNocturno = (hora >= 19 || hora < 6);

            if (esDiaFestivo) {
                if (esNocturno) {
                    hFN += 1;
                    const factorCompletoFN = parametros ? (1.00 + parametros.factorFestN) : 2.15;
                    valorCalculadoTurno += valorHoraBase * factorCompletoFN;
                } else {
                    hFD += 1;
                    const factorCompletoFD = parametros ? (1.00 + parametros.factorFestD) : 1.80;
                    valorCalculadoTurno += valorHoraBase * factorCompletoFD;
                }
            } else {
                if (esNocturno) {
                    hON += 1;
                    const factorCompletoON = parametros ? (1.00 + parametros.factorOrdN) : 1.35;
                    valorCalculadoTurno += valorHoraBase * factorCompletoON;
                } else {
                    hOD += 1;
                    const factorCompletoOD = parametros ? (1.00 + parametros.factorOrdD) : 1.00;
                    valorCalculadoTurno += valorHoraBase * factorCompletoOD;
                }
            }
            tiempoActualMs += 3600000;
        }

        acumuladoOrdDiurnas += hOD;
        acumuladoOrdNocturnas += hON;
        acumuladoFestDiurnas += hFD;
        acumuladoFestNocturnas += hFN;
        dineroTotalAcumuladoMes += valorCalculadoTurno;

        return { ...turno, hOD, hON, hFD, hFN, dineroFinal: valorCalculadoTurno };
    });

    const nombreMesFiltro = fechaHistorial.toLocaleDateString("es-CO", { month: "long", year: "numeric" });

    // 📊 RESUMEN SEMANAL CORREGIDO Y CONSOLIDADO
    const semanasOrdenadas = [...new Set(turnosProcesadosConDesglose.map(t => getSemanaISO(new Date(t.start_time))))].sort((a, b) => a - b);
    const resumenSemanal = semanasOrdenadas.reduce((acc, semana) => {
        const turnosDeEstaSemana = turnosProcesadosConDesglose.filter(t => getSemanaISO(new Date(t.start_time)) === semana);
        const hTotal = turnosDeEstaSemana.reduce((sum, t) => sum + (new Date(t.end_time) - new Date(t.start_time)) / (1000 * 60 * 60), 0);
        const parametros = obtenerParametrosLegales(turnosDeEstaSemana[0].start_time);
        
        acc[semana] = { 
            horas: hTotal, 
            limite: parametros?.jornadaMaxima || 44 
        };
        return acc;
    }, {});

    const ejecutarBorradoLocal = (idTurno) => {
        if (idTurno && confirm("¿Estás seguro de eliminar este turno del registro de auditoría?")) {
            dispararActualizacion(idTurno);
        }
    };

    return (
        <div className="space-y-4 text-left">
            {turnosProcesadosConDesglose.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider self-center mr-2">Semanas:</span>
                    {Object.entries(resumenSemanal).map(([semana, data], index) => (
                        <div key={semana} className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${data.horas > data.limite ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                            <span>Sem {semana} <span className="font-normal opacity-50 ml-1">(Sem {index + 1})</span></span>
                            <span className="opacity-70">|</span>
                            <span>{data.horas.toFixed(1)}h</span>
                            <span className="text-[9px] font-normal opacity-50">/ {data.limite}h</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2 mb-4 bg-slate-50/40 p-3 rounded-2xl border border-slate-100">
                {turnosProcesadosConDesglose.length > 0 ? (
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Total Mes:</span>
                        <div className="bg-emerald-50 text-emerald-700 text-[11px] px-2.5 py-1 rounded-xl border border-emerald-100 font-bold">⏱️ {acumuladoOrdDiurnas.toFixed(1)}h Ord. Diurnas</div>
                        <div className="bg-indigo-50 text-indigo-700 text-[11px] px-2.5 py-1 rounded-xl border border-indigo-100 font-bold">🌙 {acumuladoOrdNocturnas.toFixed(1)}h Ord. Nocturnas</div>
                        <div className="bg-amber-50 text-amber-700 text-[11px] px-2.5 py-1 rounded-xl border border-amber-100 font-bold">☀️ {acumuladoFestDiurnas.toFixed(1)}h Dom/Fest Diurnas</div>
                        <div className="bg-rose-50 text-rose-700 text-[11px] px-2.5 py-1 rounded-xl border border-rose-100 font-bold">🚨 {acumuladoFestNocturnas.toFixed(1)}h Dom/Fest Nocturnas</div>
                    </div>
                ) : (
                    <div className="text-xs font-semibold text-slate-400 italic">Sin horas registradas en este periodo</div>
                )}

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-3xs self-end sm:self-auto">
                    <button type="button" onClick={mesAnterior} className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs cursor-pointer select-none transition-colors">‹</button>
                    <span className="text-xs font-bold text-slate-700 capitalize min-w-27.5 text-center">{nombreMesFiltro}</span>
                    <button type="button" onClick={mesSiguiente} className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs cursor-pointer select-none transition-colors">›</button>
                </div>
            </div>

            {turnosProcesadosConDesglose.length === 0 ? (
                <div className="p-8 text-center text-slate-400 border-dashed border-2 border-slate-200 bg-white rounded-3xl font-medium text-sm">
                    No hay turnos anexados en <span className="capitalize font-bold text-slate-500">{nombreMesFiltro}</span>.
                </div>
            ) : (
                <div className="divide-y divide-slate-100 shadow-xs bg-white rounded-3xl border border-slate-100 overflow-hidden">
                    {turnosProcesadosConDesglose.map((turno) => {
                        const fechaInicia = new Date(turno.start_time);
                        const fechaTermina = new Date(turno.end_time);
                        const horasTotales = (fechaTermina - fechaInicia) / (1000 * 60 * 60);

                        return (
                            <div key={turno.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="text-sm font-bold text-slate-700 capitalize">{fechaInicia.toLocaleDateString("es-CO", { weekday: "short", day: "2-digit", month: "short" })}</div>
                                        {turno.notes && <span className="inline-flex items-center text-[11px] bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded-md font-medium max-w-xs truncate" title={turno.notes}>📌 {turno.notes}</span>}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-400 mt-1 font-medium">
                                        <div>{fechaInicia.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false })} → {fechaTermina.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false })} · <span className="font-bold text-slate-500">{horasTotales.toFixed(1)} h totales</span></div>
                                        <div className="flex flex-wrap gap-1.5 items-center">
                                            {turno.hOD > 0 && <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-md border border-emerald-100 font-bold">⏱️ {turno.hOD.toFixed(1)}h Ord. Diurnas</span>}
                                            {turno.hON > 0 && <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-md border border-indigo-100 font-bold">🌙 {turno.hON.toFixed(1)}h Ord. Nocturnas</span>}
                                            {turno.hFD > 0 && <span className="bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded-md border border-amber-100 font-bold">☀️ {turno.hFD.toFixed(1)}h Dom/Fest Diurnas</span>}
                                            {turno.hFN > 0 && <span className="bg-rose-50 text-rose-700 text-[10px] px-2 py-0.5 rounded-md border border-rose-100 font-bold">🚨 {turno.hFN.toFixed(1)}h Dom/Fest Nocturnas</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-row sm:flex-col justify-between items-center sm:items-end gap-2 shrink-0 sm:min-h-15.5 border-t border-slate-50 pt-2 sm:pt-0 sm:border-0">
                                    <button onClick={() => ejecutarBorradoLocal(turno.id)} className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors flex items-center justify-center cursor-pointer border border-transparent hover:border-rose-100" title="Eliminar turno">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                    <div className="font-black text-slate-700 text-base tracking-tight">
                                        {turno.dineroFinal >= 0 && (turno.hOD > 0 || turno.hON > 0 || turno.hFD > 0 || turno.hFN > 0) ? formatearMonedaLocal(turno.dineroFinal) : "—"}
                                    </div>
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