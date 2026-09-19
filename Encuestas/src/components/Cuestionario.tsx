"use client";

import { useState, useTransition } from "react";
import Pregunta from "./Pregunta";
import { guardarIntento } from "@/app/test/actions";

export interface CategoriaTest {
  id: string;
  nombre: string;
  preguntas: { id: number; texto: string }[];
}

export default function Cuestionario({ categorias }: { categorias: CategoriaTest[] }) {
  const [paso, setPaso] = useState(0);
  const [valores, setValores] = useState<Record<number, number>>({});
  const [error, setError] = useState("");
  const [enviando, startTransition] = useTransition();

  const categoria = categorias[paso];
  const total = categorias.reduce((n, c) => n + c.preguntas.length, 0);
  const respondidas = Object.keys(valores).length;
  const pasoCompleto = categoria.preguntas.every((p) => valores[p.id] !== undefined);
  const esUltimo = paso === categorias.length - 1;

  // Numeración continua a lo largo de todo el test.
  const inicio = categorias.slice(0, paso).reduce((n, c) => n + c.preguntas.length, 0);

  function irA(nuevo: number) {
    setError("");
    setPaso(nuevo);
    window.scrollTo({ top: 0 });
  }

  function finalizar() {
    setError("");
    const respuestas = Object.entries(valores).map(([id, valor]) => ({
      questionId: Number(id),
      valor,
    }));
    startTransition(async () => {
      // Si todo sale bien, la acción redirige y no regresa.
      const res = await guardarIntento(respuestas);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-1 flex justify-between text-sm text-zinc-600">
          <span>
            Sección {paso + 1} de {categorias.length}
          </span>
          <span>
            {respondidas} de {total} respondidas
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-zinc-200"
          role="progressbar"
          aria-valuenow={respondidas}
          aria-valuemin={0}
          aria-valuemax={total}
        >
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${(respondidas / total) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold">{categoria.nombre}</h2>

      <div className="flex flex-col gap-4">
        {categoria.preguntas.map((p, i) => (
          <Pregunta
            key={p.id}
            id={p.id}
            numero={inicio + i + 1}
            texto={p.texto}
            valor={valores[p.id]}
            onChange={(v) => setValores((prev) => ({ ...prev, [p.id]: v }))}
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={() => irA(paso - 1)}
          disabled={paso === 0 || enviando}
          className="rounded-lg border border-zinc-300 px-4 py-2 font-medium disabled:opacity-40"
        >
          Anterior
        </button>
        {esUltimo ? (
          <button
            type="button"
            onClick={finalizar}
            disabled={!pasoCompleto || enviando}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            {enviando ? "Calculando…" : "Ver mis resultados"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => irA(paso + 1)}
            disabled={!pasoCompleto}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            Siguiente
          </button>
        )}
      </div>
      {!pasoCompleto && (
        <p className="-mt-3 text-right text-xs text-zinc-500">
          Responde todas las preguntas de la sección para continuar.
        </p>
      )}
    </div>
  );
}
