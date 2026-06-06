import React, { useState } from "react";

const obtenerFestivosColombia = (ano) => {
    const festivos = [];
    const emiliani = (mes, dia) => {
        const fecha = new Date(ano, mes - 1, dia);
        const diaSemana = fecha.getDay();
        if (diaSemana === 1) {
            festivos.push(`${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`);
        } else {
            const diasFaltantes = diaSemana === 0 ? 1 : 8 - diaSemana;
            const fechaTrasladada = new Date(ano, mes - 1, dia + diasFaltantes);
            festivos.push(`${String(fechaTrasladada.getMonth() + 1).padStart(2, "0")}-${String(fechaTrasladada.getDate()).padStart(2, "0")}`);
        }
    };

    const fijos = [
        { m: 1, d: 1 }, { m: 5, d: 1 }, { m: 7, d: 20 },
        { m: 8, d: 7 }, { m: 12, d: 8 }, { m: 12, d: 25 }
    ];
    fijos.forEach(f => festivos.push(`${String(f.m).padStart(2, "0")}-${String(f.d).padStart(2, "0")}`));

    emiliani(1, 6); emiliani(3, 19); emiliani(6, 29);
    emiliani(8, 15); emiliani(10, 12); emiliani(11, 1); emiliani(11, 11);

    const a = ano % 19; const b = ano % 4; const c = ano % 7;
    const d = (19 * a + 24) % 30; const e = (2 * b + 4 * c + 6 * d + 5) % 7;
    let diasM = 22 + d + e; let mesPas = 3;
    if (diasM > 31) { diasM = d + e - 9; mesPas = 4; }
    if (mesPas === 4 && diasM === 26) diasM = 19;
    if (mesPas === 4 && diasM === 25 && d === 28 && e === 6 && a > 10) diasM = 18;

    const domingoPascua = new Date(ano, mesPas - 1, diasM);

    const agregarRelativo = (diasDiferencia, aplicarEmiliani = false) => {
        const fechaRelativa = new Date(domingoPascua.getTime());
        fechaRelativa.setDate(domingoPascua.getDate() + diasDiferencia);
        if (aplicarEmiliani) {
            emiliani(fechaRelativa.getMonth() + 1, fechaRelativa.getDate());
        } else {
            festivos.push(`${String(fechaRelativa.getMonth() + 1).padStart(2, "0")}-${String(fechaRelativa.getDate()).padStart(2, "0")}`);
        }
    };

    agregarRelativo(-3); agregarRelativo(-2);
    agregarRelativo(43, true); agregarRelativo(64, true); agregarRelativo(71, true);

    return festivos;
};

export default function HeatmapCalendar({ currentDate, shifts = [], novelties = [], onAddNovelty }) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const diasSemana = ["D", "L", "M", "X", "J", "V", "S"];

    const primerDiaMes = new Date(year, month, 1);
    const ultimoDiaMes = new Date(year, month + 1, 0);
    const totalDias = ultimoDiaMes.getDate();
    const offsetDias = primerDiaMes.getDay(); 

    const celdasVacias = Array(offsetDias).fill(null);
    const celdasDias = Array.from({ length: totalDias }, (_, index) => index + 1);
    const calendarioCompleto = [...celdasVacias, ...celdasDias];

    const festivosDelAñoActual = obtenerFestivosColombia(year);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [diaSeleccionado, setDiaSeleccionado] = useState(null);
    const [tipoNovedad, setTipoNovedad] = useState("Incapacidad");
    const [descripcion, setDescripcion] = useState("");
    const [guardando, setGuardando] = useState(false);

    const gestionarClickDia = (dia) => {
        if (!dia) return;
        setDiaSeleccionado(dia);
        setTipoNovedad("Incapacidad");
        setDescripcion("");
        setModalAbierto(true);
    };

    const handleGuardarNovedad = async (e) => {
        e.preventDefault();
        if (!onAddNovelty || !diaSeleccionado) return;

        setGuardando(true);
        const fechaFormateada = `${year}-${String(month + 1).padStart(2, "0")}-${String(diaSeleccionado).padStart(2, "0")}`;
        
        await onAddNovelty({
            date: fechaFormateada,
            type: tipoNovedad,
            description: descripcion
        });

        setGuardando(false);
        setModalAbierto(false);
    };

    return (
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-xs text-left relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                <div>
                    <h3 className="font-black text-[#2A3447] text-base tracking-tight">Calendario de turnos y novedades</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Visualización en tiempo real de coberturas, dominicales e incidencias.</p>
                </div>
                <span className="text-slate-400 text-xs font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    💡 Haz clic en un día para reportar novedades
                </span>
            </div>

            <div className="w-full">
                <div className="grid grid-cols-7 gap-1.5 md:gap-2 text-center mb-2">
                    {diasSemana.map((d, index) => (
                        <span key={index} className={`text-xs font-bold py-1 select-none ${index === 0 ? "text-rose-500 font-extrabold bg-rose-50/50 rounded-lg" : "text-slate-400"}`}>
                            {d}
                        </span>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                    {calendarioCompleto.map((dia, index) => {
                        if (!dia) {
                            return <div key={`vacio-${index}`} className="bg-slate-50/20 min-h-24 rounded-xl border border-transparent opacity-40" />;
                        }

                        const fechaCelda = new Date(year, month, dia);
                        const esDomingo = fechaCelda.getDay() === 0;
                        const stringMes = String(month + 1).padStart(2, "0");
                        const stringDia = String(dia).padStart(2, "0");
                        
                        // Formato YYYY-MM-DD idéntico al de Supabase para comparar strings limpios
                        const fechaStringTarget = `${year}-${stringMes}-${stringDia}`;
                        const esFestivo = festivosDelAñoActual.includes(`${stringMes}-${stringDia}`);

                        const turnosDelDia = shifts.filter((s) => {
                            if (!s.start_time) return false;
                            return s.start_time.startsWith(fechaStringTarget);
                        });

                        const novedadesDelDia = novelties.filter((n) => {
                            const propFecha = n.start_date || n.date;
                            if (!propFecha) return false;
                            return propFecha.startsWith(fechaStringTarget);
                        });

                        let estilosCelda = "bg-slate-50/60 border-slate-100 hover:bg-slate-100/80";
                        if (esDomingo) estilosCelda = "bg-rose-50/50 border-rose-100/60 hover:bg-rose-100/40";
                        if (esFestivo) estilosCelda = "bg-amber-50/70 border-amber-200/70 hover:bg-amber-100/50 shadow-xs";
                        if (novedadesDelDia.length > 0) estilosCelda = "bg-purple-50/80 border-purple-200/80 hover:bg-purple-100/60 shadow-2xs";

                        return (
                            <button
                                key={`dia-${dia}`}
                                type="button"
                                onClick={() => gestionarClickDia(dia)}
                                className={`min-h-24 p-2 rounded-xl flex flex-col justify-between text-xs font-bold border transition-all text-left group cursor-pointer ${estilosCelda}`}
                            >
                                <div className="flex justify-between items-center w-full">
                                    <span className={esFestivo ? "text-amber-700 font-extrabold" : esDomingo ? "text-rose-600" : "text-slate-600"}>
                                        {dia}
                                    </span>
                                    <div className="flex gap-1">
                                        {esFestivo && <span className="text-[8px] bg-amber-200 text-amber-800 px-1 rounded font-black">FEST</span>}
                                        {esDomingo && !esFestivo && <span className="text-[8px] bg-rose-200 text-rose-800 px-1 rounded font-black">DOM</span>}
                                    </div>
                                </div>

                                <div className="w-full space-y-1 mt-1.5 overflow-y-auto max-h-16">
                                    {turnosDelDia.map((turno) => {
                                        const horaInicio = new Date(turno.start_time).getHours();
                                        const horaFin = new Date(turno.end_time).getHours();
                                        return (
                                            <div key={turno.id} className="text-[9px] bg-[#BD6B6B] text-white p-1 rounded-md font-bold truncate tracking-tight shadow-2xs block w-full text-center" title={turno.notes || "Turno Laborado"}>
                                                ⏱️ {horaInicio}:00-{horaFin}:00
                                            </div>
                                        );
                                    })}

                                    {novedadesDelDia.map((nov) => {
                                        const nombreMostrar = nov.category || nov.type || "Novedad";
                                        const detalleMostrar = nov.subtype || nov.description || "";
                                        return (
                                            <div key={nov.id} className="text-[9px] bg-purple-600 text-white p-1 rounded-md font-bold truncate tracking-tight shadow-2xs block w-full text-center" title={`${nombreMostrar}: ${detalleMostrar}`}>
                                                🚨 {nombreMostrar}
                                            </div>
                                        );
                                    })}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {modalAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-100 transform">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                            <h4 className="font-black text-[#2A3447] text-base">
                                Reportar Novedad: {diaSeleccionado} de {currentDate.toLocaleDateString("es-CO", { month: "long" })}
                            </h4>
                            <button type="button" onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1">✕</button>
                        </div>

                        <form onSubmit={handleGuardarNovedad} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Tipo de Ausencia / Incidencia</label>
                                <select value={tipoNovedad} onChange={(e) => setTipoNovedad(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-purple-400 focus:bg-white">
                                    <option value="Incapacidad">Incapacidad Médica</option>
                                    <option value="Vacaciones">Vacaciones</option>
                                    <option value="Licencia">Licencia Remunerada</option>
                                    <option value="Compensatorio">Día Compensatorio</option>
                                    <option value="Día de la Familia">Día de la Familia</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Descripción / Justificación</label>
                                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej. Radicado de EPS, solicitud de día de la familia semestral..." rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-purple-400 focus:bg-white resize-none" required />
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200">Cancelar</button>
                                <button type="submit" disabled={guardando} className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 disabled:opacity-50">{guardando ? "Guardando..." : "Guardar Novedad"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}