import React from "react";

function MetricaCard({ titulo, valor, subtexto, emoji, bgColor, textColorClass, subtextColorClass, notaMes, notaColorClass }) {
    return (
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between h-32 relative overflow-hidden transition-all hover:border-slate-200 text-left">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">{titulo}</span>
                    {notaMes && (
                        <span className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${notaColorClass}`}>
                            {notaMes}
                        </span>
                    )}
                </div>
                <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center text-sm shadow-2xs shrink-0`}>
                    {emoji}
                </div>
            </div>
            
            <div className="space-y-0.5">
                <h4 className={`text-2xl font-black tracking-tight ${textColorClass}`}>
                    {valor}
                </h4>
                {subtexto ? (
                    <p className={`text-[11px] font-semibold ${subtextColorClass}`}>{subtexto}</p>
                ) : (
                    <p className="text-[11px] font-semibold text-transparent select-none">Sufijo vacío</p>
                )}
            </div>
        </div>
    );
}

export default function SummaryCards({ 
    nombreMesAnterior, 
    nombreMesActual,
    salarioBase = 1750905,
    auxilioTransporte = 249095,
    // 📊 Recibimos los datos ya masticados del motor de NomiData
    horasNocturnas = 0,
    dineroNocturnas = 0,
    horasDominicalesDiurnas = 0,
    dineroDominicalesDiurnas = 0,
    horasDominicalesNocturnas = 0,
    dineroDominicalesNocturnas = 0,
    totalDineroRecargos = 0
}) {

    const formatCOP = (val) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(val);
    };

    const mesPasado = nombreMesAnterior || "marzo";
    const mesEnCurso = nombreMesActual || "abril";

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <MetricaCard 
                titulo="Sueldo base" 
                valor={formatCOP(salarioBase)} 
                subtexto={`Pago fijo de ${mesEnCurso}`}
                emoji="💼" 
                bgColor="bg-emerald-50 text-emerald-500" 
                textColorClass="text-emerald-600 font-black" 
                subtextColorClass="text-emerald-600 font-bold" 
                notaMes={`Mes actual: ${mesEnCurso}`}
                notaColorClass="text-emerald-600" 
            />

            <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between min-h-32 sm:col-span-2 lg:col-span-2 relative overflow-hidden transition-all hover:border-slate-200 text-left">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Bolsa de Recargos Trabajados</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5 text-indigo-500">
                            Recargos de: {mesPasado} ({formatCOP(totalDineroRecargos)})
                        </span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center text-sm shadow-2xs shrink-0">
                        ⏱️
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-3 border-t border-slate-50 pt-2.5">
                    
                    <div className="bg-slate-50/60 p-2 rounded-xl border border-slate-100 flex md:flex-col justify-between md:justify-center items-center md:items-start">
                        <span className="text-[10px] font-bold text-slate-500 tracking-tight">Ord. Nocturna (35%)</span>
                        <div className="text-right md:text-left">
                            <span className="text-[9px] block text-slate-400 font-medium">{horasNocturnas.toFixed(1)} h de {mesPasado}</span>
                            <span className="text-xs font-extrabold text-indigo-600">{formatCOP(dineroNocturnas)}</span>
                        </div>
                    </div>

                    <div className="bg-slate-50/60 p-2 rounded-xl border border-slate-100 flex md:flex-col justify-between md:justify-center items-center md:items-start">
                        <span className="text-[10px] font-bold text-slate-500 tracking-tight">Dom/Fest Diur. (80%)</span>
                        <div className="text-right md:text-left">
                            <span className="text-[9px] block text-slate-400 font-medium">{horasDominicalesDiurnas.toFixed(1)} h de {mesPasado}</span>
                            <span className="text-xs font-extrabold text-indigo-600">{formatCOP(dineroDominicalesDiurnas)}</span>
                        </div>
                    </div>

                    <div className="bg-slate-50/60 p-2 rounded-xl border border-slate-100 flex md:flex-col justify-between md:justify-center items-center md:items-start">
                        <span className="text-[10px] font-bold text-slate-500 tracking-tight">Dom/Fest Noct. (110%)</span>
                        <div className="text-right md:text-left">
                            <span className="text-[9px] block text-slate-400 font-medium">{horasDominicalesNocturnas.toFixed(1)} h de {mesPasado}</span>
                            <span className="text-xs font-extrabold text-indigo-600">{formatCOP(dineroDominicalesNocturnas)}</span>
                        </div>
                    </div>

                </div>
            </div>

            <MetricaCard 
                titulo="Auxilio transporte" 
                valor={formatCOP(auxilioTransporte)} 
                subtexto={`Subsidio de ${mesEnCurso}`}
                emoji="💵" 
                bgColor="bg-emerald-50 text-emerald-500" 
                textColorClass="text-emerald-600 font-black" 
                subtextColorClass="text-emerald-600 font-bold" 
                notaMes={`Mes actual: ${mesEnCurso}`}
                notaColorClass="text-emerald-600" 
            />
        </div>
    );
}