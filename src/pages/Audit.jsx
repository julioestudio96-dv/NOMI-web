import React, { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import useNomiData, { obtenerParametrosLegales } from "../hooks/useNomiData";

// Formateador estándar de pesos colombianos (COP)
const formatCOP = (value) => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value || 0);
};

// Motor de desglose de horas físicas basado en tus turnos
const procesarHorasTurno = (startStr, endStr) => {
    const inicio = new Date(startStr);
    const fin = new Date(endStr);
    
    let ordinariasDiurnas = 0;
    let ordinariasNocturnas = 0;
    let dominicalesDiurnas = 0;
    let dominicalesNocturnas = 0;

    if (isNaN(inicio) || !endStr) return { ordD: 0, ordN: 0, domD: 0, domN: 0 };

    let tiempoActual = new Date(inicio.getTime());
    
    while (tiempoActual < fin) {
        const hora = tiempoActual.getHours();
        const diaSemana = tiempoActual.getDay(); 
        
        // 0 = Domingo. Simplificado para recargos dominicales ordinarios
        const esDominical = (diaSemana === 0);
        const esNocturno = (hora >= 19 || hora < 6);

        if (esDominical) {
            if (esNocturno) dominicalesNocturnas += 1; else dominicalesDiurnas += 1;
        } else {
            if (esNocturno) ordinariasNocturnas += 1; else ordinariasDiurnas += 1;
        }
        
        tiempoActual.setHours(tiempoActual.getHours() + 1);
    }

    return {
        ordD: ordinariasDiurnas,
        ordN: ordinariasNocturnas,
        domD: dominicalesDiurnas,
        domN: dominicalesNocturnas
    };
};

export default function Audit() {
    const { 
        currentDate, 
        prevMonth, 
        nextMonth, 
        allShifts, 
        allNovelties, 
        payrollSettings, 
        cargando 
    } = useNomiData();

    const [guardando, setGuardando] = useState(false);

    // Cantidades automáticas calculadas por NOMI
    const [nomiCantidades, setNomiCantidades] = useState({
        diasSueldoBasico: 30,
        horasDiurnoOrdinario: 0,
        horasNocturnoOrdinario: 0,
        horasDominicalDiurno: 0,
        horasDominicalNocturno: 0,
        diasAuxilioTransporte: 30,
        diasIncapacidad: 0
    });

    // Inputs dinámicos para capturar lo digitado por el usuario ("Tu Colilla")
    const [empresaPago, setEmpresaPago] = useState({
        valSueldoBasico: "",
        valDiurnoOrdinario: "",
        valNocturnoOrdinario: "",
        valDominicalDiurno: "",
        valDominicalNocturno: "",
        valIncapacidad: "",
        valAuxilioTransporte: "",
        valSalud: "",
        valPension: ""
    });

    // Limpiar inputs al cambiar de mes bajo análisis
    useEffect(() => {
        setEmpresaPago({
            valSueldoBasico: "", valDiurnoOrdinario: "", valNocturnoOrdinario: "",
            valDominicalDiurno: "", valDominicalNocturno: "", valIncapacidad: "",
            valAuxilioTransporte: "", valSalud: "", valPension: ""
        });
    }, [currentDate]);

    const fechaMesAnterior = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const nombreMesActual = currentDate.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
    const nombreMesAnterior = fechaMesAnterior.toLocaleDateString("es-CO", { month: "long", year: "numeric" });

    // =================================================================
    // PROCESAMIENTO AUTOMÁTICO DE TURNOS Y NOVEDADES DEL MES
    // =================================================================
    useEffect(() => {
        if (cargando) return;

        // Rango del mes anterior para turnos/recargos acumulados (ej: Abril si liquidas Mayo)
        const inicioMesAnterior = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const finMesAnterior = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59);

        // Rango del mes actual para novedades de afectación directa (ej: Mayo)
        const inicioMesActualStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split("T")[0];
        const finMesActualStr = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split("T")[0];

        // Filtrar turnos válidos
        const turnosMesAnterior = allShifts.filter(turno => {
            const tDate = new Date(turno.start_time);
            return tDate >= inicioMesAnterior && tDate <= finMesAnterior;
        });

        // Filtrar novedades válidas
        const novedadesFiltradas = allNovelties.filter(n => {
            const fechaNov = n.start_date || n.date;
            return fechaNov >= inicioMesActualStr && fechaNov <= finMesActualStr;
        });

        // Contabilizar días de afectación legal (Incapacidades comunes)
        let conteoDiasIncapacidad = 0;
        novedadesFiltradas.forEach(n => {
            if (n.category?.trim().toLowerCase() === "incapacidad") {
                conteoDiasIncapacidad += 1;
            }
        });

        // Acumulación de horas de turnos trabajados
        let ordD = 0, ordN = 0, domD = 0, domN = 0;
        turnosMesAnterior.forEach(turno => {
            const desglose = procesarHorasTurno(turno.start_time, turno.end_time);
            ordD += desglose.ordD;
            ordN += desglose.ordN;
            domD += desglose.domD;
            domN += desglose.domN;
        });

        // Aplicar regla base 30 comercial para Colombia
        setNomiCantidades({
            diasSueldoBasico: Math.max(0, 30 - conteoDiasIncapacidad),
            horasDiurnoOrdinario: ordD,
            horasNocturnoOrdinario: ordN,
            horasDominicalDiurno: domD,
            horasDominicalNocturno: domN,
            diasAuxilioTransporte: Math.max(0, 30 - conteoDiasIncapacidad),
            diasIncapacidad: conteoDiasIncapacidad
        });

    }, [currentDate, allShifts, allNovelties, cargando]);

    // =================================================================
    // LIQUIDACIÓN AUTOMÁTICA ESPEJO (VALORES NOMI CALCULA)
    // =================================================================
    const parametrosLegales = obtenerParametrosLegales(fechaMesAnterior);
    const valorHoraOrdinaria = payrollSettings.base_salary / parametrosLegales.divisor;
    const valorDiaOrdinario = payrollSettings.base_salary / 30;

    // Factores y porcentajes limpios sin comas flotantes infinitas (Math.round)
    const pctNocturno = 35;
    const pctDominicalDiurno = 75; // Ajustado al 75% legal en Colombia
    const pctDominicalNocturno = 115; // 75% dominical + 40% recargo nocturno dominical

    const nomiCalcula = {
        sueldoBasico: nomiCantidades.diasSueldoBasico * valorDiaOrdinario,
        diurnoOrdinario: 0, // REGLA: $0 pesos. El tiempo ordinario diurno ya está pago en el Sueldo Básico.
        nocturnoOrdinario: nomiCantidades.horasNocturnoOrdinario * valorHoraOrdinaria * (pctNocturno / 100),
        dominicalDiurno: nomiCantidades.horasDominicalDiurno * valorHoraOrdinaria * (pctDominicalDiurno / 100),
        dominicalNocturno: nomiCantidades.horasDominicalNocturno * valorHoraOrdinaria * (pctDominicalNocturno / 100),
        incapacidad: nomiCantidades.diasIncapacidad * valorDiaOrdinario * 0.6667, // Liquidación al 66.67%
        auxilioTransporte: nomiCantidades.diasAuxilioTransporte > 0 ? (payrollSettings.transport_allowance / 30) * nomiCantidades.diasAuxilioTransporte : 0
    };

    // Sumatoria total automática devengada por NOMI
    const totalDevengadoNomi = 
        nomiCalcula.sueldoBasico + 
        nomiCalcula.diurnoOrdinario + 
        nomiCalcula.nocturnoOrdinario + 
        nomiCalcula.dominicalDiurno + 
        nomiCalcula.dominicalNocturno + 
        nomiCalcula.incapacidad + 
        nomiCalcula.auxilioTransporte;

    // Base de Cotización (IBC) para aportes (Devengado menos auxilio de transporte)
    const ibcNomi = Math.max(payrollSettings.base_salary, totalDevengadoNomi - nomiCalcula.auxilioTransporte);
    
    const deduccionesNomi = {
        salud: ibcNomi * 0.04,
        pension: ibcNomi * 0.04
    };
    const totalDeduccionesNomi = deduccionesNomi.salud + deduccionesNomi.pension;
    const netoNomi = totalDevengadoNomi - totalDeduccionesNomi;

    // =================================================================
    // PROCESAMIENTO DE LO DIGITADO POR EL USUARIO ("TU COLILLA")
    // =================================================================
    const handleInputChange = (field, value) => {
        const cleanNum = value.replace(/\D/g, ""); // Permitir solo entradas numéricas puras
        setEmpresaPago((prev) => ({
            ...prev,
            [field]: cleanNum === "" ? "" : Number(cleanNum),
        }));
    };

    const totalDevengadoEmpresa = 
        Number(empresaPago.valSueldoBasico || 0) +
        Number(empresaPago.valDiurnoOrdinario || 0) +
        Number(empresaPago.valNocturnoOrdinario || 0) +
        Number(empresaPago.valDominicalDiurno || 0) +
        Number(empresaPago.valDominicalNocturno || 0) +
        Number(empresaPago.valIncapacidad || 0) +
        Number(empresaPago.valAuxilioTransporte || 0);

    const totalDeduccionesEmpresa = 
        Number(empresaPago.valSalud || 0) + 
        Number(empresaPago.valPension || 0);

    const netoEmpresa = totalDevengadoEmpresa - totalDeduccionesEmpresa;

    // =================================================================
    // CÁLCULO INDIVIDUAL DE LAS DIFERENCIAS (COLUMNA 4)
    // =================================================================
    const calcularDiferencia = (nomiVal, empresaVal) => {
        const emp = Number(empresaVal || 0);
        return emp - nomiVal; // Da negativo si la empresa pagó de menos, positivo si pagó de más.
    };

    const renderDiferenciaLabel = (diferencia) => {
        if (diferencia === 0) return <span className="text-slate-400 font-bold">—</span>;
        if (diferencia < 0) return <span className="text-red-500 font-black">{formatCOP(diferencia)}</span>;
        return <span className="text-emerald-600 font-black">+{formatCOP(diferencia)}</span>;
    };

    return (
        <AppLayout>
            <div className="space-y-6 pt-2 text-left">
                
                {/* PERIODO SELECCIONADO */}
                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-xs">
                    <button onClick={prevMonth} className="text-xs font-bold text-slate-500 hover:text-[#2A3447] bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl transition-all cursor-pointer">
                        ← Mes Anterior
                    </button>
                    <div className="text-center">
                        <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Periodo Auditado</span>
                        <h1 className="text-base font-black text-[#2A3447] capitalize">{nombreMesActual}</h1>
                    </div>
                    <button onClick={nextMonth} className="text-xs font-bold text-slate-500 hover:text-[#2A3447] bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl transition-all cursor-pointer">
                        Siguiente Mes →
                    </button>
                </div>

                {cargando ? (
                    <div className="text-center py-24 text-slate-400 font-bold text-xs animate-pulse">
                        Calculando registros espejo...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                        
                        {/* BLOQUE IZQUIERDO: DEVENGADOS */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                            <div>
                                <h2 className="text-sm font-black text-[#2A3447]">Devengados (Con corte desde las 7PM)</h2>
                                <p className="text-[11px] text-slate-400 mt-0.5">Analizando horas de {nombreMesAnterior}. Jornada Diurna de 6:00 AM a 7:00 PM.</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-xs font-medium text-[#2A3447]">
                                    <thead>
                                        <tr className="text-slate-400 font-bold text-left border-b border-slate-50">
                                            <th className="pb-2">Concepto</th>
                                            <th className="pb-2 text-center">Cantidad</th>
                                            <th className="pb-2 text-right">Nomi Calcula</th>
                                            <th className="pb-2 text-center pl-2">Tu Colilla</th>
                                            <th className="pb-2 text-right">Diferencia</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50/60">
                                        
                                        {/* 1. Sueldo Básico */}
                                        <tr>
                                            <td className="py-3 font-bold text-slate-700">Sueldo Básico</td>
                                            <td className="py-3 text-center text-slate-500 font-bold">{nomiCantidades.diasSueldoBasico} d</td>
                                            <td className="py-3 text-right text-slate-500 font-bold">{formatCOP(nomiCalcula.sueldoBasico)}</td>
                                            <td className="py-3 text-center pl-2">
                                                <input type="text" placeholder="$ 0" value={empresaPago.valSueldoBasico} onChange={(e) => handleInputChange("valSueldoBasico", e.target.value)} className="w-24 text-right border border-slate-200 rounded-lg py-0.5 px-2 text-xs font-bold text-slate-700 focus:outline-hidden" />
                                            </td>
                                            <td className="py-3 text-right">{renderDiferenciaLabel(calcularDiferencia(nomiCalcula.sueldoBasico, empresaPago.valSueldoBasico))}</td>
                                        </tr>

                                        {/* 2. Diurno Ordinario */}
                                        <tr>
                                            <td className="py-3 font-bold text-slate-700">Diurno Ordinario</td>
                                            <td className="py-3 text-center text-slate-500 font-bold">{nomiCantidades.horasDiurnoOrdinario} h</td>
                                            <td className="py-3 text-right text-slate-500 font-bold">{formatCOP(nomiCalcula.diurnoOrdinario)}</td>
                                            <td className="py-3 text-center pl-2">
                                                <input type="text" placeholder="$ 0" value={empresaPago.valDiurnoOrdinario} onChange={(e) => handleInputChange("valDiurnoOrdinario", e.target.value)} className="w-24 text-right border border-slate-200 rounded-lg py-0.5 px-2 text-xs font-bold text-slate-700 focus:outline-hidden" />
                                            </td>
                                            <td className="py-3 text-right">{renderDiferenciaLabel(calcularDiferencia(nomiCalcula.diurnoOrdinario, empresaPago.valDiurnoOrdinario))}</td>
                                        </tr>

                                        {/* 3. Nocturno Ordinario */}
                                        <tr>
                                            <td className="py-3 font-bold text-slate-700">Nocturno Ordinario ({pctNocturno}%)</td>
                                            <td className="py-3 text-center text-slate-500 font-bold">{nomiCantidades.horasNocturnoOrdinario} h</td>
                                            <td className="py-3 text-right text-slate-500 font-bold">{formatCOP(nomiCalcula.nocturnoOrdinario)}</td>
                                            <td className="py-3 text-center pl-2">
                                                <input type="text" placeholder="$ 0" value={empresaPago.valNocturnoOrdinario} onChange={(e) => handleInputChange("valNocturnoOrdinario", e.target.value)} className="w-24 text-right border border-slate-200 rounded-lg py-0.5 px-2 text-xs font-bold text-slate-700 focus:outline-hidden" />
                                            </td>
                                            <td className="py-3 text-right">{renderDiferenciaLabel(calcularDiferencia(nomiCalcula.nocturnoOrdinario, empresaPago.valNocturnoOrdinario))}</td>
                                        </tr>

                                        {/* 4. Dominical Diurno */}
                                        <tr>
                                            <td className="py-3 font-bold text-slate-700">Dominical Diurno ({pctDominicalDiurno}%)</td>
                                            <td className="py-3 text-center text-slate-500 font-bold">{nomiCantidades.horasDominicalDiurno} h</td>
                                            <td className="py-3 text-right text-slate-500 font-bold">{formatCOP(nomiCalcula.dominicalDiurno)}</td>
                                            <td className="py-3 text-center pl-2">
                                                <input type="text" placeholder="$ 0" value={empresaPago.valDominicalDiurno} onChange={(e) => handleInputChange("valDominicalDiurno", e.target.value)} className="w-24 text-right border border-slate-200 rounded-lg py-0.5 px-2 text-xs font-bold text-slate-700 focus:outline-hidden" />
                                            </td>
                                            <td className="py-3 text-right">{renderDiferenciaLabel(calcularDiferencia(nomiCalcula.dominicalDiurno, empresaPago.valDominicalDiurno))}</td>
                                        </tr>

                                        {/* 5. Dominical Nocturno */}
                                        <tr>
                                            <td className="py-3 font-bold text-slate-700">Dominical Nocturno ({pctDominicalNocturno}%)</td>
                                            <td className="py-3 text-center text-slate-500 font-bold">{nomiCantidades.horasDominicalNocturno} h</td>
                                            <td className="py-3 text-right text-slate-500 font-bold">{formatCOP(nomiCalcula.dominicalNocturno)}</td>
                                            <td className="py-3 text-center pl-2">
                                                <input type="text" placeholder="$ 0" value={empresaPago.valDominicalNocturno} onChange={(e) => handleInputChange("valDominicalNocturno", e.target.value)} className="w-24 text-right border border-slate-200 rounded-lg py-0.5 px-2 text-xs font-bold text-slate-700 focus:outline-hidden" />
                                            </td>
                                            <td className="py-3 text-right">{renderDiferenciaLabel(calcularDiferencia(nomiCalcula.dominicalNocturno, empresaPago.valDominicalNocturno))}</td>
                                        </tr>


                                        {/* 7. Auxilio de Transporte */}
                                        <tr>
                                            <td className="py-3 font-bold text-slate-700">Auxilio Transporte</td>
                                            <td className="py-3 text-center text-slate-500 font-bold">{nomiCantidades.diasAuxilioTransporte} d</td>
                                            <td className="py-3 text-right text-slate-500 font-bold">{formatCOP(nomiCalcula.auxilioTransporte)}</td>
                                            <td className="py-3 text-center pl-2">
                                                <input type="text" placeholder="$ 0" value={empresaPago.valAuxilioTransporte} onChange={(e) => handleInputChange("valAuxilioTransporte", e.target.value)} className="w-24 text-right border border-slate-200 rounded-lg py-0.5 px-2 text-xs font-bold text-slate-700 focus:outline-hidden" />
                                            </td>
                                            <td className="py-3 text-right">{renderDiferenciaLabel(calcularDiferencia(nomiCalcula.auxilioTransporte, empresaPago.valAuxilioTransporte))}</td>
                                        </tr>
                                        {/* 6. Casilla Condicional: Incapacidades */}
                                        {nomiCantidades.diasIncapacidad > 0 && (
                                            <tr className="bg-purple-50/50">
                                                <td className="py-3 font-bold text-purple-700">⚠️ Incapacidades (66.67%)</td>
                                                <td className="py-3 text-center text-purple-600 font-bold">{nomiCantidades.diasIncapacidad} d</td>
                                                <td className="py-3 text-right text-purple-600 font-bold">{formatCOP(nomiCalcula.incapacidad)}</td>
                                                <td className="py-3 text-center pl-2">
                                                    <input type="text" placeholder="$ 0" value={empresaPago.valIncapacidad} onChange={(e) => handleInputChange("valIncapacidad", e.target.value)} className="w-24 text-right border border-purple-300 rounded-lg py-0.5 px-2 text-xs font-bold text-slate-700 focus:outline-hidden bg-white" />
                                                </td>
                                                <td className="py-3 text-right">{renderDiferenciaLabel(calcularDiferencia(nomiCalcula.incapacidad, empresaPago.valIncapacidad))}</td>
                                            </tr>
                                        )}

                                        {/* Fila de Totales de Devengados */}
                                        <tr className="bg-slate-50 font-black text-xs">
                                            <td className="py-3">Total Devengado</td>
                                            <td className="py-3"></td>
                                            <td className="py-3 text-right text-slate-600">{formatCOP(totalDevengadoNomi)}</td>
                                            <td className="py-3 text-right pr-4 text-slate-800">{formatCOP(totalDevengadoEmpresa)}</td>
                                            <td className="py-3 text-right">{renderDiferenciaLabel(totalDevengadoEmpresa - totalDevengadoNomi)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* BLOQUE DERECHO: DEDUCCIONES Y ACCIÓN */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
                            <div className="space-y-4">
                                <h2 className="text-sm font-black text-[#2A3447]">Deducciones de Ley</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs font-medium text-[#2A3447]">
                                        <thead>
                                            <tr className="text-slate-400 font-bold text-left border-b border-slate-50">
                                                <th className="pb-2">Concepto</th>
                                                <th className="pb-2 text-right">Nomi calcula</th>
                                                <th className="pb-2 text-center pl-2">Tu Colilla</th>
                                                <th className="pb-2 text-right">Diferencia</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50/60">
                                            {/* Salud */}
                                            <tr>
                                                <td className="py-3 font-bold text-slate-700">Salud (4%)</td>
                                                <td className="py-3 text-right text-slate-400">{formatCOP(deduccionesNomi.salud)}</td>
                                                <td className="py-3 text-center pl-2">
                                                    <input type="text" placeholder="$ 0" value={empresaPago.valSalud} onChange={(e) => handleInputChange("valSalud", e.target.value)} className="w-24 text-right border border-slate-200 rounded-lg py-0.5 px-2 text-xs font-bold text-slate-700 focus:outline-hidden" />
                                                </td>
                                                <td className="py-3 text-right">{renderDiferenciaLabel(calcularDiferencia(deduccionesNomi.salud, empresaPago.valSalud))}</td>
                                            </tr>
                                            {/* Pensión */}
                                            <tr>
                                                <td className="py-3 font-bold text-slate-700">Pensión (4%)</td>
                                                <td className="py-3 text-right text-slate-400">{formatCOP(deduccionesNomi.pension)}</td>
                                                <td className="py-3 text-center pl-2">
                                                    <input type="text" placeholder="$ 0" value={empresaPago.valPension} onChange={(e) => handleInputChange("valPension", e.target.value)} className="w-24 text-right border border-slate-200 rounded-lg py-0.5 px-2 text-xs font-bold text-slate-700 focus:outline-hidden" />
                                                </td>
                                                <td className="py-3 text-right">{renderDiferenciaLabel(calcularDiferencia(deduccionesNomi.pension, empresaPago.valPension))}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* COMPARATIVA DE NETOS FINALES */}
                            <div className="pt-4 border-t border-slate-100 space-y-3 font-bold text-xs text-[#2A3447]">
                                <div className="flex justify-between text-slate-500 text-sm border-b border-dashed pb-2">
                                    <span>Neto Esperado (NOMI):</span>
                                    <span className="text-emerald-600 font-black">{formatCOP(netoNomi)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Neto Real de tu Colilla:</span>
                                    <span className="text-slate-800 font-black">{formatCOP(netoEmpresa)}</span>
                                </div>
                            </div>

                            {/* ACCIÓN DE GUARDADO */}
                            <div className="pt-2 flex justify-end">
                                <button
                                    disabled={guardando}
                                    className="bg-[#FCD3D7] text-[#BD6B6B] hover:bg-[#FBC1C7] disabled:opacity-50 font-black text-xs px-6 h-11 rounded-2xl transition-all cursor-pointer shadow-xs"
                                >
                                    {guardando ? "Procesando..." : "Guardar colilla auditada"}
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </AppLayout>
    );
}