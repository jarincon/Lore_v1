"use client";

const ESCALA = [
  { valor: 1, etiqueta: "Nunca" },
  { valor: 2, etiqueta: "Rara vez" },
  { valor: 3, etiqueta: "A veces" },
  { valor: 4, etiqueta: "Frecuentemente" },
  { valor: 5, etiqueta: "Siempre" },
];

interface Props {
  id: number;
  numero: number;
  texto: string;
  valor?: number;
  onChange: (valor: number) => void;
}

export default function Pregunta({ id, numero, texto, valor, onChange }: Props) {
  return (
    <fieldset className="rounded-xl border border-zinc-200 bg-white p-4">
      <legend className="sr-only">{`Pregunta ${numero}: ${texto}`}</legend>
      <p className="mb-3 font-medium">
        <span className="mr-2 text-zinc-400">{numero}.</span>
        {texto}
      </p>
      <div className="grid grid-cols-5 gap-2">
        {ESCALA.map((op) => (
          <label key={op.valor} className="cursor-pointer">
            <input
              type="radio"
              name={`pregunta-${id}`}
              value={op.valor}
              checked={valor === op.valor}
              onChange={() => onChange(op.valor)}
              className="peer sr-only"
            />
            <span className="flex h-full flex-col items-center gap-1 rounded-lg border border-zinc-300 px-1 py-2 text-center text-xs text-zinc-600 transition peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400 hover:border-indigo-400">
              <span className="text-base font-semibold">{op.valor}</span>
              <span className="leading-tight">{op.etiqueta}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
