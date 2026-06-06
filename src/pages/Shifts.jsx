import React, { useState, useEffect } from 'react';
import AppLayout from "../components/AppLayout";
import { ShiftForm } from "../components/ShiftForm";
import { ShiftList } from "../components/ShiftList";
import { supabase } from "../libs/supabaseClient"; // Tu cliente unificado

export default function Shifts() {
    // Iniciamos la lista completamente VACÍA
    const [listaDeTurnos, setListaDeTurnos] = useState([]);
    const [cargando, setCargando] = useState(true);

    // EFECTO: Carga los turnos reales del usuario desde Supabase al entrar a la página
    useEffect(() => {
        async function cargarTurnos() {
            try {
                setCargando(true);
                const { data: { user } } = await supabase.auth.getUser();
                
                if (user) {
                    const { data, error } = await supabase
                        .from("shifts")
                        .select("*")
                        .eq("user_id", user.id)
                        .order("start_time", { ascending: false }); // Los más nuevos arriba

                    if (!error && data) {
                        setListaDeTurnos(data);
                    }
                }
            } catch (error) {
                console.error("Error cargando historial de turnos:", error);
            } finally {
                setCargando(false);
            }
        }
        cargarTurnos();
    }, []);

    // CRUD: Insertar turno real en Supabase
    const controladorAgregarTurno = async (datosTurno) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("⚠️ Error: No se detectó un usuario autenticado activo.");
                return;
            }

            // Validamos preventivamente qué está llegando desde el componente ShiftForm
            if (!datosTurno || !datosTurno.start_time || !datosTurno.end_time) {
                alert(
                    "❌ Error de comunicación interna:\n" +
                    "El formulario no está enviando 'start_time' o 'end_time' correctamente.\n" +
                    `Datos recibidos: ${JSON.stringify(datosTurno)}`
                );
                return;
            }

            // Extraemos la fecha corta (YYYY-MM-DD) para la columna 'shift_date' de tu tabla
            const fechaFormateada = datosTurno.shift_date || datosTurno.start_time.split("T")[0];

            // Creamos el payload limpio estructurado exactamente como tu captura image_81d64e.png
            const nuevoTurno = {
                user_id: user.id,
                shift_date: fechaFormateada,
                start_time: datosTurno.start_time,
                end_time: datosTurno.end_time,
                notes: datosTurno.notes || null
            };

            const { data, error } = await supabase
                .from("shifts")
                .insert([nuevoTurno])
                .select(); // 👈 Ojo: Clave para que Supabase nos regrese el objeto completo con su ID real

            if (!error && data && data.length > 0) {
                // ✅ 1. WINDOW ALERT SOLICITADO PARA NOTIFICAR AL USUARIO
                alert(`🎉 ¡Turno Guardado con Éxito!\nFecha: ${fechaFormateada}`);

                // ✅ 2. ACTUALIZACIÓN INMEDIATA DEL FRONT EN EL HISTORIAL
                setListaDeTurnos((prevTurnos) => [data[0], ...prevTurnos]);

            } else {
                // Si Supabase responde pero con un error de RLS, tipo de datos, etc.
                throw new Error(error ? error.message : "La base de datos no retornó el turno guardado.");
            }

        } catch (error) {
            console.error("Error al guardar el turno:", error);
            // ✅ ALERT EN CASO DE ERROR DE INSERCIÓN
            alert(`❌ Error al guardar en Supabase:\n${error.message}`);
        }
    };

    // CRUD: Eliminar turno real en Supabase
    const controladorEliminarTurno = async (idTarget) => {
        try {
            const { error } = await supabase
                .from("shifts")
                .delete()
                .eq("id", idTarget);

            if (!error) {
                alert("🗑️ Turno eliminado correctamente.");
                // Si la base de datos lo borró, lo removemos de la UI
                setListaDeTurnos(listaDeTurnos.filter(t => t.id !== idTarget));
            } else {
                throw new Error(error.message);
            }
        } catch (error) {
            console.error("Error al eliminar el turno:", error);
            alert(`❌ No se pudo eliminar el turno: ${error.message}`);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 max-w-5xl mx-auto">
                
                {/* Encabezado Principal */}
                <div className="text-left space-y-0.5">
                    <h2 className="text-2xl font-black text-[#2A3447] tracking-tight">Registrar Turnos</h2>
                    <p className="text-xs md:text-sm text-slate-400 font-medium">
                        Ingresa tus horas de entrada y salida para calcular tus recargos bajo la normativa de Colombia.
                    </p>
                </div>

                {/* Formulario Renderizado */}
                <ShiftForm onCreated={controladorAgregarTurno} />

                {/* Encabezado Historial */}
                <div className="text-left pt-2 space-y-0.5">
                    <h3 className="text-lg font-black text-[#2A3447] tracking-tight">Historial del Periodo</h3>
                    <p className="text-xs text-slate-400 font-medium">Desglose detallado de cada jornada laborada.</p>
                </div>

                {/* Tabla Detallada Renderizada */}
                {cargando ? (
                    <div className="text-center py-8 text-xs font-bold text-slate-400 animate-pulse">
                        Cargando tu historial seguro...
                    </div>
                ) : (
                    <ShiftList shifts={listaDeTurnos} onChanged={controladorEliminarTurno} />
                )}
                
            </div>
        </AppLayout>
    );
}