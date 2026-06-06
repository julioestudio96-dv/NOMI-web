import { useState, useEffect } from "react";
import { supabase } from "../libs/supabaseClient"; 

// =========================================================================
// 🇨🇴 1. MOTOR DE FESTIVOS AUTOMÁTICO - LEY EMILIANI
// =========================================================================
/**
 * Sirve para determinar de forma automática si una fecha específica es un día festivo
 * en Colombia, aplicando correctamente la Ley Emiliani (traslado de ciertos festivos al lunes).
 * * @param {number} año - Año a evaluar (ej. 2026)
 * @param {number} mes - Mes en formato JavaScript (0 = Enero, 4 = Mayo, etc.)
 * @param {number} dia - Día del mes (1 al 31)
 * @returns {boolean} - true si es festivo, false si es día ordinario
 */
const esFestivoColombia = (año, mes, dia) => {
    // Algoritmo de Gauss para calcular el Domingo de Pascua (Semana Santa)
    const a = año % 19;
    const b = año % 4;
    const c = año % 7;
    const d = (19 * a + 24) % 30;
    const e = (2 * b + 4 * c + 6 * d + 5) % 7;
    let diasPascua = 22 + d + e;
    let mesPascua = 2; // Marzo en JS

    if (diasPascua > 31) {
        diasPascua -= 31;
        mesPascua = 3; // Abril en JS
    }
    const domingoPascua = new Date(año, mesPascua, diasPascua);

    // Helper para mover días con respecto al Domingo de Pascua
    const obtenerFechaPascua = (diasDiferencia) => {
        const copia = new Date(domingoPascua.getTime());
        copia.setDate(copia.getDate() + diasDiferencia);
        return copia;
    };

    // Aplica la Ley Emiliani: si no cae domingo o lunes, se traslada al siguiente lunes
    const leyEmiliani = (m, d) => {
        const fechaOriginal = new Date(año, m, d);
        const diaSemana = fechaOriginal.getDay(); // 0 = Domingo, 1 = Lunes
        if (diaSemana === 0 || diaSemana === 1) return fechaOriginal;
        const diasParaLunes = (8 - diaSemana) % 7;
        fechaOriginal.setDate(fechaOriginal.getDate() + diasParaLunes);
        return fechaOriginal;
    };

    // Fechas civiles fijas en Colombia (No se trasladan por Ley Emiliani)
    const festivosFijos = [
        new Date(año, 0, 1),   // Año Nuevo
        new Date(año, 4, 1),   // Día del Trabajo
        new Date(año, 6, 20),  // Independencia
        new Date(año, 7, 7),   // Batalla de Boyacá
        new Date(año, 11, 8),  // Inmaculada Concepción
        new Date(año, 11, 25), // Navidad
    ];

    // Festivos de fecha fija que la Ley Emiliani traslada al siguiente lunes
    const festivosEmiliani = [
        leyEmiliani(0, 6),   // Reyes Magos
        leyEmiliani(2, 19),  // San José
        leyEmiliani(5, 29),  // San Pedro y San Pablo
        leyEmiliani(7, 15),  // Asunción de la Virgen
        leyEmiliani(9, 12),  // Día de la Raza
        leyEmiliani(10, 1),  // Todos los Santos
        leyEmiliani(10, 11), // Independencia de Cartagena
    ];

    // Festivos religiosos móviles que dependen de la fecha de Semana Santa
    const festivosVariablesPascua = [
        obtenerFechaPascua(-3), // Jueves Santo
        obtenerFechaPascua(-2), // Viernes Santo
        leyEmiliani(domingoPascua.getMonth(), domingoPascua.getDate() + 43), // Ascensión del Señor
        leyEmiliani(domingoPascua.getMonth(), domingoPascua.getDate() + 64), // Corpus Christi
        leyEmiliani(domingoPascua.getMonth(), domingoPascua.getDate() + 71), // Sagrado Corazón
    ];

    const todosLosFestivos = [...festivosFijos, ...festivosEmiliani, ...festivosVariablesPascua];

    // Compara si la fecha ingresada coincide con alguno de los festivos calculados
    return todosLosFestivos.some(f => f.getMonth() === mes && f.getDate() === dia);
};

// =========================================================================
// 🇨🇴 2. DETECTOR AUTOMÁTICO DE PARÁMETROS LEGALES (Fiel a image_f07c24.png)
// =========================================================================
/**
 * Sirve para detectar dinámicamente el límite semanal de horas, el divisor mensual
 * y los recargos aplicables según la fecha del turno, automatizando las transiciones
 * de la reforma laboral en Colombia (Ley 2101 de 2021).
 * * @param {string|Date} fechaTurno - Fecha del turno a evaluar
 * @returns {Object} - Factores multiplicadores y topes legales para liquidar
 */
export const obtenerParametrosLegales = (fechaTurno) => {
    const fecha = new Date(fechaTurno);
    
    // Hitos cronológicos de cambio de ley según la tabla de la imagen
    const corteJulio2026 = new Date("2026-07-15T00:00:00");
    const corteEnero2027 = new Date("2027-01-01T00:00:00");
    const corteJulio2027 = new Date("2027-07-01T00:00:00");

    // Configuración Base Inicial: Tramo 2026 (Ene - 14 Jul) -> Aplica a Mayo 2026
    let limiteSemanal = 44; 
    let divisor = 220;     
    let recargoDominical = 0.80; // 80% fiel a la tabla image_f07c24.png

    // Transición de la tabla: 2026 (15 Jul - Dic)
    if (fecha >= corteJulio2026 && fecha < corteEnero2027) {
        limiteSemanal = 42;
        divisor = 210;
        recargoDominical = 0.90; // Sube al 90%
    }
    // Transición de la tabla: 2027 (Ene - 30 Jun)
    else if (fecha >= corteEnero2027 && fecha < corteJulio2027) {
        limiteSemanal = 42;
        divisor = 210;
        recargoDominical = 0.90; // Mantiene 90%
    }
    // Transición de la tabla: 2027 (Desde 1 Jul)
    else if (fecha >= corteJulio2027) {
        limiteSemanal = 42;
        divisor = 210;
        recargoDominical = 1.00; // Sube al 100%
    }

    return {
        divisor,
        limiteSemanal,
        
        // RECARGOS (Dinero adicional ganado dentro de las primeras 44 horas de la semana)
        factorOrdD: 0.00,                     // Diurno Ordinario: reporta tiempo pero suma $0 (ya cubierto por sueldo básico)
        factorOrdN: 0.35,                     // Recargo Nocturno Ordinario (+35%)
        factorFestD: recargoDominical,         // Recargo Dominical Diurno (+80% en Mayo 2026)
        factorFestN: 0.35 + recargoDominical, // Recargo Dominical Nocturno (+115% en Mayo 2026)

        // HORAS EXTRAS (Hora física 100% + recargo por exceder el límite semanal)
        factorHED: 1.25,                             // Extra Diurna Ordinaria (100% + 25% recargo = 1.25)
        factorHEN: 1.75,                             // Extra Nocturna Ordinaria (100% + 75% recargo = 1.75)
        factorHEDD: 1.00 + recargoDominical + 0.25, // Extra Diurna Dominical (100% + 80% + 25% = 2.05)
        factorHEND: 1.00 + recargoDominical + 0.75  // Extra Nocturna Dominical (100% + 80% + 75% = 2.55)
    };
};

// =========================================================================
// 🧠 3. MOTOR CENTRALIZADO DE LIQUIDACIÓN Y DETECTOR DE HORAS EXTRAS
// =========================================================================
/**
 * Sirve como el algoritmo matemático principal. Agrupa los turnos en semanas de
 * Domingo a Sábado, calcula las horas físicas acumuladas una por una, detecta de forma
 * automática el momento exacto en que se supera la jornada máxima (44h) para liquidar
 * las horas extras y entrega un desglose detallado tanto mensual como semanal.
 * * @param {Array} turnos - Lista de turnos obtenidos de la base de datos
 * @param {number} salarioBase - Sueldo asignado al usuario
 * @returns {Object} - Consolidado mensual de horas, dinero devengado y reportes semanales
 */
export const liquidarPeriodoCompleto = (turnos, salarioBase = 1750905) => {
    if (!turnos || turnos.length === 0) {
        return { totalHorasMes: 0, ordD: 0, ordN: 0, festD: 0, festN: 0, hed: 0, hen: 0, hedd: 0, hend: 0, totalRecargosYExtras: 0, desgloseSemanas: {} };
    }

    const turnosPorSemana = {};
    
    // Paso A: Organizar la bolsa de horas agrupando los turnos en semanas de Domingo a Sábado
    turnos.forEach(turno => {
        const fechaInicio = new Date(turno.start_time);
        if (isNaN(fechaInicio)) return;

        // Calcula el domingo de la semana correspondiente a este turno
        const dDomingo = new Date(fechaInicio);
        dDomingo.setDate(fechaInicio.getDate() - fechaInicio.getDay());
        dDomingo.setHours(0, 0, 0, 0);
        const semanaId = dDomingo.toISOString().split("T")[0];

        if (!turnosPorSemana[semanaId]) {
            turnosPorSemana[semanaId] = [];
        }
        turnosPorSemana[semanaId].push(turno);
    });

    // Acumuladores consolidados para todo el mes audited
    let globalHorasMes = 0;
    let gOrdD = 0; let gOrdN = 0; let gFestD = 0; let gFestN = 0;
    let gHed = 0; let gHen = 0; let gHedd = 0; let gHend = 0;
    let globalRecargosYExtras = 0;
    const desgloseSemanas = {};

    // Paso B: Evaluar cada bloque semanal de forma independiente y cronológica
    Object.keys(turnosPorSemana).forEach(semanaId => {
        const turnosSemana = turnosPorSemana[semanaId].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        
        const parametros = obtenerParametrosLegales(turnosSemana[0].start_time);
        const valorHoraBase = salarioBase / parametros.divisor;

        let horasFisicasSemanales = 0;
        let sOrdD = 0; let sOrdN = 0; let sFestD = 0; let sFestN = 0;
        let sHed = 0; let sHen = 0; let sHedd = 0; let sHend = 0;
        let dineroSemana = 0;

        turnosSemana.forEach(turno => {
            const inicio = new Date(turno.start_time);
            const fin = new Date(turno.end_time);
            let tiempoActual = new Date(inicio.getTime());

            // Recorre el rango de tiempo del turno hora por hora física
            while (tiempoActual < fin) {
                const hora = tiempoActual.getHours();
                const diaSemana = tiempoActual.getDay();
                const esDiaFestivo = (diaSemana === 0) || esFestivoColombia(tiempoActual.getFullYear(), tiempoActual.getMonth(), tiempoActual.getDate());
                const esNocturno = (hora >= 19 || hora < 6); // Jornada nocturna legal de 7PM a 6AM

                horasFisicasSemanales += 1;
                globalHorasMes += 1;

                // 🚨 CONTROL ANTI-FRAUDE: Si supera el límite semanal (44 horas), conmuta inmediatamente a Horas Extras
                if (horasFisicasSemanales > parametros.limiteSemanal) {
                    if (esDiaFestivo) {
                        if (esNocturno) {
                            sHend += 1; gHend += 1;
                            dineroSemana += valorHoraBase * parametros.factorHEND;
                        } else {
                            sHedd += 1; gHedd += 1;
                            dineroSemana += valorHoraBase * parametros.factorHEDD;
                        }
                    } else {
                        if (esNocturno) {
                            sHen += 1; gHen += 1;
                            dineroSemana += valorHoraBase * parametros.factorHEN;
                        } else {
                            sHed += 1; gHed += 1;
                            dineroSemana += valorHoraBase * parametros.factorHED;
                        }
                    }
                } else {
                    // Si está dentro de las 44 horas físicas permisibles, computa únicamente Recargos Ordinarios
                    if (esDiaFestivo) {
                        if (esNocturno) {
                            sFestN += 1; gFestN += 1;
                            dineroSemana += valorHoraBase * parametros.factorFestN;
                        } else {
                            sFestD += 1; gFestD += 1;
                            dineroSemana += valorHoraBase * parametros.factorFestD;
                        }
                    } else {
                        if (esNocturno) {
                            sOrdN += 1; gOrdN += 1;
                            dineroSemana += valorHoraBase * parametros.factorOrdN;
                        } else {
                            sOrdD += 1; gOrdD += 1;
                            dineroSemana += valorHoraBase * parametros.factorOrdD; // Suma cero
                        }
                    }
                }

                tiempoActual.setHours(tiempoActual.getHours() + 1);
            }
        });

        globalRecargosYExtras += dineroSemana;

        // Guarda el reporte analítico individualizado de la semana procesada
        desgloseSemanas[semanaId] = {
            horasTrabajadas: horasFisicasSemanales,
            limiteSemanalLegal: parametros.limiteSemanal,
            extrasCausadas: horasFisicasSemanales > parametros.limiteSemanal ? horasFisicasSemanales - parametros.limiteSemanal : 0,
            dineroRecargosYExtras: dineroSemana,
            conteo: { ordD: sOrdD, ordN: sOrdN, festD: sFestD, festN: sFestN, hed: sHed, hen: sHen, hedd: sHedd, hend: sHend }
        };
    });

    return {
        totalHorasMes: globalHorasMes,
        ordD: gOrdD, ordN: gOrdN, festD: gFestD, festN: gFestN,
        hed: gHed, hen: gHen, hedd: gHedd, hend: gHend,
        totalRecargosYExtras: globalRecargosYExtras,
        desgloseSemanas
    };
};

// =========================================================================
// 🔄 4. HOOK PERSONALIZADO PRINCIPAL (useNomiData)
// =========================================================================
/**
 * Custom Hook encargado de centralizar el estado global del mes seleccionado,
 * gestionar las peticiones asíncronas hacia Supabase expandiendo el rango de búsqueda
 * para evitar pérdidas de horas por meses partidos y proveer los datos calculados.
 */
const useNomiData = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // Mayo de 2026 por defecto
    const [allShifts, setAllShifts] = useState([]);
    const [allNovelties, setAllNovelties] = useState([]);
    const [payrollSettings, setPayrollSettings] = useState({ base_salary: 1750905, transport_allowance: 249095 });
    const [auditResult, setAuditResult] = useState(null); // Guarda la liquidación masticada de horas extras y recargos
    const [cargando, setCargando] = useState(true);

    // Funciones de navegación de meses para los botones visuales
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    /**
     * Descarga de forma síncrona los parámetros de nómina, turnos y novedades de Supabase,
     * y ejecuta inmediatamente el motor matemático para poblar el objeto auditResult.
     */
    const cargarInformacionDeSupabase = async () => {
        try {
            setCargando(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Cargar salarios configurados por el usuario
            const { data: settings } = await supabase.from("payroll_settings").select("*").eq("user_id", user.id).maybeSingle();
            let salarioActual = 1750905;
            let auxilioTransporteActual = 249095;

            if (settings) {
                salarioActual = Number(settings.base_salary) || 1750905;
                auxilioTransporteActual = Number(settings.transport_allowance) || 249095;
                setPayrollSettings({
                    base_salary: salarioActual,
                    transport_allowance: auxilioTransporteActual
                });
            }

            // 2. Controlar rangos extendidos: descarga desde el mes anterior para no cortar la bolsa semanal de 44h
            const inicioMesAnterior = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString();
            const finMesActual = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

            // 3. Ejecutar consultas hacia las tablas de Supabase
            const { data: turnos } = await supabase.from("shifts").select("*").eq("user_id", user.id).gte("start_time", inicioMesAnterior).lte("start_time", finMesActual);
            const { data: novedades } = await supabase.from("novelties").select("*").eq("user_id", user.id).gte("start_date", inicioMesAnterior.split("T")[0]).lte("start_date", finMesActual.split("T")[0]);

            if (turnos) setAllShifts(turnos);
            if (novedades) setAllNovelties(novedades);

            // 4. Inyectar automáticamente la bolsa de turnos al procesador de horas extras
            if (turnos) {
                const calculoMasticado = liquidarPeriodoCompleto(turnos, salarioActual);
                setAuditResult(calculoMasticado);
            }

        } catch (error) {
            console.error("Error en useNomiData:", error);
        } finally { setCargando(false); }
    };

    // Recargar datos automáticamente si el usuario cambia de mes en la app
    useEffect(() => { cargarInformacionDeSupabase(); }, [currentDate]);

    return { 
        currentDate, 
        prevMonth, 
        nextMonth, 
        allShifts, 
        allNovelties, 
        payrollSettings, 
        auditResult, // El objeto analizado listo para desestructurar en Audit.jsx u otras pantallas
        cargando, 
        refresh: cargarInformacionDeSupabase 
    };
};

export default useNomiData;