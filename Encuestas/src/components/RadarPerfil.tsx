"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

export interface PuntoRadar {
  nombre: string;
  porcentaje: number;
}

export default function RadarPerfil({ datos }: { datos: PuntoRadar[] }) {
  return (
    <div className="h-80 w-full sm:h-96" role="img" aria-label="Gráfica radar con el porcentaje por categoría">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={datos} outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis dataKey="nombre" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={{ fontSize: 10 }} />
          <Radar
            dataKey="porcentaje"
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.35}
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
