import type { Nivel } from "@/lib/scoring";

const ESTILO_NIVEL: Record<Nivel, { icono: string; barra: string; etiqueta: string }> = {
  Bajo: { icono: "🔴", barra: "bg-red-500", etiqueta: "bg-red-50 text-red-800" },
  Medio: { icono: "🟡", barra: "bg-amber-500", etiqueta: "bg-amber-50 text-amber-800" },
  Bueno: { icono: "🟢", barra: "bg-green-500", etiqueta: "bg-green-50 text-green-800" },
  Excelente: { icono: "🌟", barra: "bg-emerald-600", etiqueta: "bg-emerald-50 text-emerald-800" },
};

interface Props {
  nombre: string;
  porcentaje: number;
  nivel: Nivel;
  recomendacion?: string;
}

export default function TarjetaCategoria({ nombre, porcentaje, nivel, recomendacion }: Props) {
  const estilo = ESTILO_NIVEL[nivel];
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">{nombre}</h3>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${estilo.etiqueta}`}>
          {estilo.icono} {nivel}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-200">
          <div className={`h-full ${estilo.barra}`} style={{ width: `${porcentaje}%` }} />
        </div>
        <span className="w-10 text-right text-sm font-medium tabular-nums">{porcentaje}%</span>
      </div>
      {recomendacion && <p className="mt-3 text-sm text-zinc-600">{recomendacion}</p>}
    </article>
  );
}
