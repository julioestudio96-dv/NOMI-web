import React, { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import useNomiData, { obtenerParametrosLegales } from "../hooks/useNomiData";

export default function SettingsPage() {
    // Extraemos las variables reales del hook central
    const { currentDate, payrollSettings, cargando, refresh } = useNomiData();
    const [saving, setSaving] = useState(false);
    
    // Control local de edición manual
    const [edicionManual, setEdicionManual] = useState(false);

    // Estado del formulario mapeado uno a uno con useNomiData
    const [config, setConfig] = useState({
        sueldoBase: "",
        jornadaSemanal: "",
        smmlv: "",
        auxilioTransporte: "",
    });

    // 🎯 Sincronización estricta con el estado actual de useNomiData
    useEffect(() => {
        if (!cargando) {
            // Obtenemos los parámetros legales dinámicos que calcula tu hook
            const leyVigente = obtenerParametrosLegales ? obtenerParametrosLegales(currentDate) : { limiteSemanal: 44 };

            // Si el usuario activó la edición manual, respetamos lo guardado en BD.
            // Si está apagada, reflejamos en pantalla exactamente la verdad de useNomiData.
            if (edicionManual) {
                setConfig({
                    sueldoBase: payrollSettings?.base_salary || 1750905,
                    jornadaSemanal: payrollSettings?.weekly_hours || leyVigente.limiteSemanal,
                    smmlv: payrollSettings?.smmlv || 1750905,
                    auxilioTransporte: payrollSettings?.transport_allowance || 0,
                });
            } else {
                // 💎 LA VERDAD DE USENOMIDATA: Lo que el motor usa por defecto
                setConfig({
                    sueldoBase: payrollSettings?.base_salary || 1750905, 
                    jornadaSemanal: leyVigente.limiteSemanal || 44, 
                    smmlv: payrollSettings?.smmlv || 1750905, 
                    auxilioTransporte: payrollSettings?.transport_allowance || 0, 
                });
            }
        }
    }, [cargando, currentDate, payrollSettings, edicionManual]);

    const handleChange = (field, value) => {
        const soloNumeros = value.replace(/\D/g, "");
        setConfig((prev) => ({
            ...prev,
            [field]: soloNumeros === "" ? "" : Number(soloNumeros),
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const { supabase } = await import("../libs/supabaseClient");
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Guardamos directamente los valores configurados en la tabla payroll_settings
            const { error } = await supabase.from("payroll_settings").upsert({
                user_id: user.id,
                base_salary: config.sueldoBase,
                weekly_hours: config.jornadaSemanal,
                smmlv: config.smmlv,
                transport_allowance: config.auxilioTransporte,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

            if (error) throw error;

            alert("¡Parámetros actualizados con éxito!");
            
            // Apagamos el modo edición para congelar e informar al usuario
            setEdicionManual(false);

            // Refrescamos el hook global para recalcular toda la auditoría
            if (refresh) refresh();
        } catch (error) {
            alert("Error al guardar: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (cargando) {
        return (
            <AppLayout>
                <div className="p-8 text-xs font-bold text-slate-400 animate-pulse">
                    Consultando variables de entorno en useNomiData...
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto space-y-4 pt-2 text-left">
                
                {/* Banner de Estado */}
                {edicionManual ? (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3">
                        <span className="text-xl">⚠️</span>
                        <div>
                            <h4 className="text-xs font-bold text-amber-800">Modo de Edición Manual Habilitado</h4>
                            <p className="text-[11px] text-amber-600 mt-0.5">Los campos están desbloqueados. Puedes alterar las variables para simular nuevos escenarios.</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                        <span className="text-xl">🛡️</span>
                        <div>
                            <h4 className="text-xs font-bold text-emerald-800">Visualizando Valores Activos de useNomiData</h4>
                            <p className="text-[11px] text-emerald-600 mt-0.5">Los campos están protegidos en modo lectura para garantizar que coincidan con tus cálculos actuales.</p>
                        </div>
                    </div>
                )}

                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
                    
                    {/* Switch de control */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-xl font-black text-[#2A3447] tracking-tight">Parámetros de Cálculo</h2>
                            <p className="text-slate-400 text-xs mt-0.5">Controla las variables fundamentales de tu nómina.</p>
                        </div>
                        
                        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 self-start sm:self-auto">
                            <span className="text-xs font-bold text-slate-500 pl-1">Modificar valores</span>
                            <button 
                                type="button"
                                onClick={() => setEdicionManual(!edicionManual)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 cursor-pointer focus:outline-none ${edicionManual ? "bg-pink-400" : "bg-slate-300"}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${edicionManual ? "translate-x-6" : "translate-x-0"}`} />
                            </button>
                        </div>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            
                            {/* Sueldo Base */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-[#2A3447]">Sueldo base mensual</label>
                                <input
                                    type="text"
                                    disabled={!edicionManual}
                                    value={config.sueldoBase}
                                    onChange={(e) => handleChange("sueldoBase", e.target.value)}
                                    className={`w-full h-11 border rounded-xl px-4 text-xs font-bold transition-all focus:outline-none ${edicionManual ? "bg-white border-slate-200 text-slate-700 focus:border-pink-300" : "bg-slate-50 text-slate-500 border-slate-100 cursor-not-allowed"}`}
                                />
                            </div>

                            {/* Jornada Semanal */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-[#2A3447]">Jornada semanal (horas)</label>
                                <input
                                    type="text"
                                    disabled={!edicionManual}
                                    value={config.jornadaSemanal}
                                    onChange={(e) => handleChange("jornadaSemanal", e.target.value)}
                                    className={`w-full h-11 border rounded-xl px-4 text-xs font-bold transition-all focus:outline-none ${edicionManual ? "bg-white border-slate-200 text-slate-700 focus:border-pink-300" : "bg-slate-50 text-slate-500 border-slate-100 cursor-not-allowed"}`}
                                />
                            </div>

                            {/* SMMLV */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-[#2A3447]">SMMLV</label>
                                <input
                                    type="text"
                                    disabled={!edicionManual}
                                    value={config.smmlv}
                                    onChange={(e) => handleChange("smmlv", e.target.value)}
                                    className={`w-full h-11 border rounded-xl px-4 text-xs font-bold transition-all focus:outline-none ${edicionManual ? "bg-white border-slate-200 text-slate-700 focus:border-pink-300" : "bg-slate-50 text-slate-500 border-slate-100 cursor-not-allowed"}`}
                                />
                            </div>

                            {/* Auxilio de Transporte */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-[#2A3447]">Auxilio de transporte</label>
                                <input
                                    type="text"
                                    disabled={!edicionManual}
                                    value={config.auxilioTransporte}
                                    onChange={(e) => handleChange("auxilioTransporte", e.target.value)}
                                    className={`w-full h-11 border rounded-xl px-4 text-xs font-bold transition-all focus:outline-none ${edicionManual ? "bg-white border-slate-200 text-slate-700 focus:border-pink-300" : "bg-slate-50 text-slate-500 border-slate-100 cursor-not-allowed"}`}
                                />
                            </div>
                        </div>

                        {/* Botón Guardar - Aparece solo en modo edición */}
                        {edicionManual && (
                            <div className="pt-2 flex justify-start animate-in slide-in-from-bottom-2 duration-200">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-[#FCD3D7] text-[#BD6B6B] hover:bg-[#FBC1C7] font-bold text-xs px-6 h-10 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                                >
                                    {saving ? "Guardando..." : "Guardar Cambios"}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}