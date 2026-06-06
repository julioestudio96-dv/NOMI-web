import React from "react";
import AppLayout from "../components/AppLayout";

export default function PayrollInfo() {
    return (
        <AppLayout>
            {/* mx-auto centra perfectamente el contenedor en la pantalla */}
            <div className="max-w-3xl mx-auto space-y-6 pt-2 text-left">
                
                {/* Encabezado Principal */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-black text-[#2A3447] tracking-tight">
                                Sustento Legal y Herramientas de Defensa
                            </h2>
                            <p className="text-slate-400 text-xs mt-0.5">
                                Conoce las leyes vigentes en Colombia que regulan tu jornada laboral, recargos y horas extras.
                            </p>
                        </div>
                        <span className="text-[10px] font-bold tracking-wide bg-[#FCD3D7]/60 text-[#BD6B6B] px-3 py-1.5 rounded-xl border border-[#FBC1C7]/30 self-start sm:self-auto">
                            ⚖️ Marco Normativo 2026 - 2027
                        </span>
                    </div>
                </div>

                {/* Sección 1: Las Dos Grandes Leyes Reguladoras */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                    <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase pl-1">
                        Leyes Fundamentales de tu Nómina
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-2">
                            <h4 className="text-xs font-bold text-amber-900">1. Reducción de Jornada (Ley 2101 de 2021)</h4>
                            <p className="text-slate-600 text-[11px] leading-relaxed">
                                Esta ley regula la reducción gradual de la jornada máxima legal en Colombia sin disminuir el salario del trabajador. Determina el tope de horas semanales permitidas y obliga a recalcular el <strong>Divisor Mensual</strong> para que el valor de cada hora de trabajo aumente proporcionalmente a medida que la jornada se reduce.
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-2">
                            <h4 className="text-xs font-bold text-rose-900">2. Incremento Dominical (Ley 2466 de 2025)</h4>
                            <p className="text-slate-600 text-[11px] leading-relaxed">
                                Correspondiente a la Reforma Laboral, esta ley modificó directamente el <strong>Artículo 179 del Código Sustantivo del Trabajo</strong>. Dictamina un incremento progresivo del recargo por laborar en días domingos y festivos, escalando paulatinamente desde el histórico 75% hasta alcanzar el pago del 100% del recargo ordinario.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sección 2: Cronología de Transición Extendida */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                    <div>
                        <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase pl-1">
                            Tabla Cronológica de Transición
                        </h3>
                        <p className="text-slate-400 text-[11px] mt-0.5 pl-1">
                            Verifica los límites obligatorios y porcentajes según la fecha exacta del ciclo que estás auditando:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Tramo 1 */}
                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                            <span className="font-bold text-slate-700 block text-[11px]">🗓️ 2026 (Ene - 14 Jul)</span>
                            <ul className="space-y-1 text-slate-500 text-[11px] list-disc pl-4">
                                <li>Jornada Semanal: <strong>44 horas</strong></li>
                                <li>Divisor Mensual: <strong>220 horas</strong></li>
                                <li>Recargo Dominical/Festivo: <strong className="text-rose-600">80%</strong></li>
                            </ul>
                        </div>

                        {/* Tramo 2 */}
                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                            <span className="font-bold text-slate-700 block text-[11px]">🗓️ 2026 (15 Jul - Dic)</span>
                            <ul className="space-y-1 text-slate-500 text-[11px] list-disc pl-4">
                                <li>Jornada Semanal: <strong>42 horas</strong></li>
                                <li>Divisor Mensual: <strong>210 horas</strong></li>
                                <li>Recargo Dominical/Festivo: <strong className="text-rose-600">90%</strong></li>
                            </ul>
                        </div>

                        {/* Tramo 3 */}
                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                            <span className="font-bold text-slate-700 block text-[11px]">🗓️ 2027 (Ene - 30 Jun)</span>
                            <ul className="space-y-1 text-slate-500 text-[11px] list-disc pl-4">
                                <li>Jornada Semanal: <strong>42 horas</strong></li>
                                <li>Divisor Mensual: <strong>210 horas</strong></li>
                                <li>Recargo Dominical/Festivo: <strong className="text-rose-600">90%</strong></li>
                            </ul>
                        </div>

                        {/* Tramo 4 */}
                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                            <span className="font-bold text-slate-700 block text-[11px]">🗓️ 2027 (Desde 1 Jul)</span>
                            <ul className="space-y-1 text-slate-500 text-[11px] list-disc pl-4">
                                <li>Jornada Semanal: <strong>42 horas</strong></li>
                                <li>Divisor Mensual: <strong>210 horas</strong></li>
                                <li>Recargo Dominical/Festivo: <strong className="text-rose-600">100%</strong></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Sección 3: Glosario Técnico de Conceptos de Auditoría */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
                    <div>
                        <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase pl-1">
                            Cómo Defenderte: Glosario de Conceptos y Factores
                        </h3>
                        <p className="text-slate-400 text-[11px] mt-0.5 pl-1">
                            Revisa los conceptos divididos por su naturaleza para verificar que cada hora física se haya liquidado en la categoría correcta.
                        </p>
                    </div>

                    <div className="space-y-6">
                        
                        {/* BLOQUE A: RECARGOS ORDINARIOS */}
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide pl-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                1. Recargos Ordinarios (Dentro de la Jornada Semanal)
                            </h4>
                            <p className="text-slate-400 text-[10px] pl-1 italic">
                                *No son horas extras. Aplican sobre las horas normales de tu turno cuando coinciden con horarios nocturnos, domingos o festivos.
                            </p>

                            <div className="grid grid-cols-1 gap-3">
                                {/* Recargo Nocturno Ordinario */}
                                <div className="p-4 rounded-2xl bg-slate-50/30 border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-xs font-bold text-[#2A3447]">Recargo Nocturno Ordinario</h5>
                                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">Factor 0.35 (+35%)</span>
                                    </div>
                                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                                        Si tu turno programado normal se ejecuta en el bloque nocturno legal (7:00 p.m. a 6:00 a.m.), cada una de esas horas debe recibir un 35% de recargo adicional sobre el valor básico de tu hora por el sobreesfuerzo de la nocturnidad.
                                    </p>
                                </div>

                                {/* Recargo Dominical / Festivo Diurno */}
                                <div className="p-4 rounded-2xl bg-slate-50/30 border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-xs font-bold text-[#2A3447]">Recargo Dominical / Festivo Diurno</h5>
                                        <span className="text-[10px] font-black bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md">Progresivo (Factor 0.80 a 1.00)</span>
                                    </div>
                                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                                        Aplica cuando trabajas un domingo o festivo oficial en horario de 6:00 a.m. a 7:00 p.m. De acuerdo con la Ley 2466 de 2025, el recargo es del <strong>80% (Factor 0.80)</strong> a inicios de 2026, y subirá progresivamente al 90% y luego al 100% en julio de 2027.
                                    </p>
                                </div>

                                {/* Recargo Dominical / Festivo Nocturno */}
                                <div className="p-4 rounded-2xl bg-slate-50/30 border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-xs font-bold text-[#2A3447]">Recargo Dominical / Festivo Nocturno</h5>
                                        <span className="text-[10px] font-black bg-violet-50 text-violet-700 px-2 py-0.5 rounded-md">Compuesto (Factor 1.15 a 1.35)</span>
                                    </div>
                                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                                        Se causa cuando tu turno ordinario coincide con un domingo o festivo y además entra en el horario de la noche (7:00 p.m. a 6:00 a.m.). Suma de forma compuesta el recargo dominical vigente (80% inicial en 2026) más el recargo nocturno ordinario (+35%), dando un recargo total del <strong>115% (Factor 1.15)</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* BLOQUE B: HORAS EXTRAS */}
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide pl-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                2. Horas Extras (Por exceder el Límite Semanal Legal)
                            </h4>
                            <p className="text-slate-400 text-[10px] pl-1 italic">
                                *Se activan de forma automática e inmediata en el momento exacto en que acumulas más del tope máximo permitido en la semana (44 o 42 horas).
                            </p>

                            <div className="grid grid-cols-1 gap-3">
                                {/* HED */}
                                <div className="p-4 rounded-2xl bg-slate-50/30 border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-xs font-bold text-[#2A3447]">Hora Extra Diurna (HED)</h5>
                                        <span className="text-[10px] font-black bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md">Factor 1.25 (+25%)</span>
                                    </div>
                                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                                        Es toda hora física que trabajas por fuera del límite semanal permitido, siempre que ocurra en el horario del día (6:00 a.m. a 7:00 p.m.). Te deben pagar el 100% de la hora más un recargo del 25%.
                                    </p>
                                </div>

                                {/* HEN */}
                                <div className="p-4 rounded-2xl bg-slate-50/30 border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-xs font-bold text-[#2A3447]">Hora Extra Nocturna (HEN)</h5>
                                        <span className="text-[10px] font-black bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md">Factor 1.75 (+75%)</span>
                                    </div>
                                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                                        Se genera cuando excedes la jornada semanal máxima y el trabajo se realiza durante la noche (7:00 p.m. a 6:00 a.m.). Equivale al valor completo de tu hora más un recargo del 75%.
                                    </p>
                                </div>

                                {/* HEDD */}
                                <div className="p-4 rounded-2xl bg-slate-50/30 border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-xs font-bold text-[#2A3447]">Hora Extra Dominical / Festiva Diurna (HEDD)</h5>
                                        <span className="text-[10px] font-black bg-red-50 text-red-700 px-2 py-0.5 rounded-md">Factor Combinado (2.05 a 2.25)</span>
                                    </div>
                                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                                        Ocurre al trabajar horas extras en un día domingo o festivo oficial durante el horario diurno. Suma la hora física base (1.00) + el recargo dominical vigente del ciclo (0.80 inicial en 2026) + el recargo extra (+0.25), resultando en un factor inicial de <strong>2.05</strong>.
                                    </p>
                                </div>

                                {/* HEND */}
                                <div className="p-4 rounded-2xl bg-slate-50/30 border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-xs font-bold text-[#2A3447]">Hora Extra Dominical / Festiva Nocturna (HEND)</h5>
                                        <span className="text-[10px] font-black bg-red-100 text-red-800 px-2 py-0.5 rounded-md">Factor Combinado Máximo (2.55 a 2.75)</span>
                                    </div>
                                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                                        Es el recargo legal más alto del sistema laboral colombiano. Se genera al acumular horas extras de noche en un domingo o festivo. Reúne la hora base (1.00) + el recargo dominical (0.80 inicial) + el recargo extra nocturno (+0.75), entregándote un factor total inicial de <strong>2.55</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                {/* Nota de Defensa al Consumidor */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-start gap-3">
                    <span className="text-lg">📢</span>
                    <div className="text-[11px] text-slate-500 space-y-1">
                        <h4 className="font-bold text-slate-700">Consejo de Auditoría para el Trabajador:</h4>
                        <p>
                            Si al contrastar tus reportes de turnos semanales en la sección de Auditoría notas que las horas acumuladas superan el <strong>Tope Legal Semanal Semanal Vigente (44 o 42 horas)</strong> y la empresa las liquidó erróneamente como ordinarias, cuentas con el sustento legal de las Leyes 2101 y 2466 expuestas en esta pestaña para presentar tu reclamación formal de haberes.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}