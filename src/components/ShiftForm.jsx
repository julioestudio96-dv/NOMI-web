import React, { useState } from "react";

export const ShiftForm = ({ onCreated: avisarAlPadre }) => {
const [fechaTurno, setFechaTurno] = useState(new Date().toISOString().slice(0, 10));
const [horaEntrada, setHoraEntrada] = useState("21:00"); 
const [horaSalida, setHoraSalida] = useState("06:00");
const [notasAdicionales, setNotasAdicionales] = useState("");
const [enviando, setEnviando] = useState(false);

const enviarFormulario = async (evento) => {
    evento.preventDefault();
    setEnviando(true);

    const [año, mes, dia] = fechaTurno.split("-").map(Number);
    const [horaInicia, minInicia] = horaEntrada.split(":").map(Number);
    const [horaTermina, minTermina] = horaSalida.split(":").map(Number);

    const fechaCompletaInicio = new Date(año, mes - 1, dia, horaInicia, minInicia);
    let fechaCompletaFin = new Date(año, mes - 1, dia, horaTermina, minTermina);

    if (fechaCompletaFin.getTime() <= fechaCompletaInicio.getTime()) {
        fechaCompletaFin = new Date(fechaCompletaFin.getTime() + 24 * 3600000);
    }

    const nuevoTurnoEstructurado = {
        start_time: fechaCompletaInicio.toISOString(),
        end_time: fechaCompletaFin.toISOString(),
        notes: notasAdicionales || null,
    };

    await avisarAlPadre(nuevoTurnoEstructurado);
    
    setEnviando(false);
    setNotasAdicionales(""); 
};

return (
    <form onSubmit={enviarFormulario} className="nomi-card p-6 space-y-4 shadow-xs border border-slate-100 bg-white rounded-3xl">
        <h3 className="text-left font-bold text-slate-700 text-lg">Registrar nuevo turno</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="space-y-1.5">
                <label htmlFor="date" className="text-xs font-semibold text-slate-500">Fecha de inicio</label>
                <input id="date" type="date" value={fechaTurno} onChange={(e) => setFechaTurno(e.target.value)} className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-pink-300 transition-all" />
            </div>
            <div className="space-y-1.5">
                <label htmlFor="start" className="text-xs font-semibold text-slate-500">Hora entrada</label>
                <input id="start" type="time" value={horaEntrada} onChange={(e) => setHoraEntrada(e.target.value)} className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-pink-300 transition-all" />
            </div>
            <div className="space-y-1.5">
                <label htmlFor="end" className="text-xs font-semibold text-slate-500">Hora salida</label>
                <input id="end" type="time" value={horaSalida} onChange={(e) => setHoraSalida(e.target.value)} className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-pink-300 transition-all" />
            </div>
        </div>

        <div className="space-y-1.5 text-left">
            <label htmlFor="notes" className="text-xs font-semibold text-slate-500">Notas u observaciones (opcional)</label>
            <input id="notes" type="text" value={notasAdicionales} onChange={(e) => setNotasAdicionales(e.target.value)} placeholder="Ej: Cambio de turno con apoyo en urgencias" className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-pink-300 transition-all" />
        </div>

        <div className="pt-2 flex justify-start">
            <button type="submit" disabled={enviando} className="w-full md:w-auto bg-[#BD6B6B] text-white hover:bg-[#A85A5A] rounded-2xl h-11 px-8 font-bold shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                <span>➕</span>
                {enviando ? "Guardando en Supabase..." : "Guardar turno"}
            </button>
        </div>
    </form>
);
};