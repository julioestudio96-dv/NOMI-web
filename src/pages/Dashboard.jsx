import React from "react";
import AppLayout from "../components/AppLayout";
import SummaryCards from "../components/SummaryCards";
import HeatmapCalendar from "../components/HeatmapCalendar";
import useNomiData from "../hooks/useNomiData"; // 🧼 Limpiamos la importación rota de calcularTotalesTurno

const formatCOP = (val) => {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(val);
};

export default function Dashboard() {
    // 🧠 Extraemos auditResult que contiene toda la matemática precargada
    const { currentDate, prevMonth, nextMonth, allShifts, allNovelties, payrollSettings, auditResult, cargando } = useNomiData();

    const nombreMesActual = currentDate.toLocaleDateString("es-CO", { month: "long" });
    const fechaMesAnterior = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const nombreMesAnterior = fechaMesAnterior.toLocaleDateString("es-CO", { month: "long" });

    // =========================================================================
    // 🔍 FILTRADO Y MAPEO SEGURO
    // =========================================================================
    const anoActualStr = currentDate.getFullYear();
    const mesActualStr = String(currentDate.getMonth() + 1).padStart(2, "0");
    const prefijoMesTarget = `${anoActualStr}-${mesActualStr}`;

    const novedadesMesActualMapeadas = allNovelties
        .filter((n) => {
            const fechaString = n.start_date;
            if (!fechaString) return false;
            return fechaString.startsWith(prefijoMesTarget);
        })
        .map((n) => ({
            ...n,
            date: n.start_date,
            type: n.category,
            description: n.subtype
        }));

    const shiftsMesActual = allShifts.filter((s) => {
        if (!s.start_time) return false;
        return s.start_time.startsWith(prefijoMesTarget);
    });

    const sueldoBaseContrato = payrollSettings.base_salary;
    const auxilioTransporte = payrollSettings.transport_allowance;

    let descuentoIncapacidades = 0;
    
    allNovelties.forEach((n) => {
        const fechaString = n.start_date;
        if (fechaString && fechaString.startsWith(prefijoMesTarget)) {
            if (n.category === "Incapacidad" || n.category === "Ausencia") {
                const porcentaje = n.percentage_paid !== undefined ? n.percentage_paid : 100;
                if (porcentaje < 100) {
                    const proporcionDescuento = (100 - porcentaje) / 100;
                    descuentoIncapacidades += (sueldoBaseContrato / 30) * proporcionDescuento;
                }
            }
        }
    });

    // =========================================================================
    // ⚖️ CONSUMO DIRECTO DESDE EL MOTOR CENTRAL (useNomiData)
    // =========================================================================
    const valorHoraBase = sueldoBaseContrato / (auditResult?.divisor || 220);
    
    // Extraemos valores seguros calculados por el motor anti-fraude
    const hrsN = auditResult?.ordN || 0;
    const hrsFD = auditResult?.festD || 0;
    const hrsFN = auditResult?.festN || 0;

    const dineroOrdNocturnas35 = hrsN * valorHoraBase * 0.35;
    const dineroDomDiurnas80 = hrsFD * valorHoraBase * 0.80;
    const dineroDomNocturnas110 = hrsFN * valorHoraBase * 1.10;

    // Sumatoria de recargos + el dinero que se cause de horas extras semanales (si existen)
    const totalRecargosVencidos = dineroOrdNocturnas35 + dineroDomDiurnas80 + dineroDomNocturnas110 + (auditResult?.totalRecargosYExtras || 0);

    // Liquidación final ajustada
    const totalDevengadoMixto = (sueldoBaseContrato - descuentoIncapacidades) + auxilioTransporte + totalRecargosVencidos;
    const saludDeduccion = (sueldoBaseContrato - descuentoIncapacidades) * 0.04;
    const pensionDeduccion = (sueldoBaseContrato - descuentoIncapacidades) * 0.04;
    const netoFinalARecibir = totalDevengadoMixto - saludDeduccion - pensionDeduccion;

    if (cargando) {
        return (
            <AppLayout>
                <div className="text-center py-24 text-slate-400 font-bold text-xs animate-pulse">
                    Sincronizando flujos...
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-transparent pt-2">
                    <div className="flex items-center gap-2">
                        <button onClick={prevMonth} className="w-7 h-7 bg-white rounded-full border border-slate-200/60 shadow-xs flex items-center justify-center text-slate-500 hover:bg-slate-50 text-xs font-bold cursor-pointer">‹</button>
                        <h2 className="text-lg font-black text-[#2A3447] tracking-tight capitalize">Periodo de {currentDate.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}</h2>
                        <button onClick={nextMonth} className="w-7 h-7 bg-white rounded-full border border-slate-200/60 shadow-xs flex items-center justify-center text-slate-500 hover:bg-slate-50 text-xs font-bold cursor-pointer">›</button>
                    </div>
                    <span className="text-xs font-semibold tracking-wide bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-100 shadow-3xs">
                        ⏱️ Recargos de <span className="font-black text-indigo-600 uppercase">{nombreMesAnterior}</span> liquidados en este pago de <span className="font-black text-emerald-600 uppercase">{nombreMesActual}</span>
                    </span>
                </div>

                {/* Pasamos los cálculos limpios procesados por useNomiData a las tarjetas */}
                <SummaryCards 
                    nombreMesAnterior={nombreMesAnterior} 
                    nombreMesActual={nombreMesActual} 
                    salarioBase={sueldoBaseContrato} 
                    auxilioTransporte={auxilioTransporte}
                    horasNocturnas={hrsN}
                    dineroNocturnas={dineroOrdNocturnas35}
                    horasDominicalesDiurnas={hrsFD}
                    dineroDominicalesDiurnas={dineroDomDiurnas80}
                    horasDominicalesNocturnas={hrsFN}
                    dineroDominicalesNocturnas={dineroDomNocturnas110}
                    totalDineroRecargos={totalRecargosVencidos}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between h-36">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Total devengado ajustado</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">Liquidación de {nombreMesActual}</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-black text-[#2A3447] tracking-tight">{formatCOP(totalDevengadoMixto)}</h3>
                            <p className="text-xs font-semibold text-slate-400">Salud <span className="text-rose-400">-{formatCOP(saludDeduccion)}</span> · Pensión <span className="text-rose-400">-{formatCOP(pensionDeduccion)}</span></p>
                        </div>
                    </div>

                    <div className="bg-[#FCD3D7]/60 p-6 rounded-3xl border border-[#FBC1C7]/30 shadow-xs flex flex-col justify-between h-36 relative overflow-hidden">
                        <div className="flex justify-between items-center z-10">
                            <span className="text-xs font-bold text-[#BD6B6B] tracking-wide uppercase">Neto real a recibir</span>
                            <span className="text-[10px] bg-white/80 text-slate-600 px-2 py-0.5 rounded-full font-bold italic shadow-2xs">Consignación del 30 de {nombreMesActual}</span>
                        </div>
                        <div className="space-y-1 z-10">
                            <h3 className="text-3xl font-black text-[#2A3447] tracking-tight">{formatCOP(netoFinalARecibir)}</h3>
                            <p className="text-xs font-bold text-[#BD6B6B]/80">Sueldo base fijo ({nombreMesActual}) + recargos acumulados en color azul ({nombreMesAnterior})</p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                    </div>
                </div>

                <HeatmapCalendar currentDate={currentDate} shifts={shiftsMesActual} novelties={novedadesMesActualMapeadas} />
            </div>
        </AppLayout>
    );
}