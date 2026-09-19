"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calcularCategoria, type Tipo } from "@/lib/scoring";
import { respuestasSchema } from "@/lib/validation";

type Resultado = { error: string };

/**
 * Valida las respuestas, calcula los puntajes en el servidor (no se confía en
 * porcentajes enviados por el navegador) y guarda intento, respuestas y resultados.
 */
export async function guardarIntento(entrada: unknown): Promise<Resultado> {
  const parsed = respuestasSchema.safeParse(entrada);
  if (!parsed.success) return { error: "Las respuestas no son válidas." };
  const respuestas = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión venció. Vuelve a iniciar sesión." };

  const [{ data: categorias }, { data: preguntas }] = await Promise.all([
    supabase.from("categories").select("id, tipo"),
    supabase.from("questions").select("id, category_id"),
  ]);
  if (!categorias || !preguntas) return { error: "No pudimos cargar las preguntas." };

  // Deben venir exactamente todas las preguntas, una sola vez cada una.
  const valorPorPregunta = new Map(respuestas.map((r) => [r.questionId, r.valor]));
  const completas =
    respuestas.length === preguntas.length &&
    valorPorPregunta.size === preguntas.length &&
    preguntas.every((p) => valorPorPregunta.has(p.id));
  if (!completas) return { error: "Faltan preguntas por responder." };

  const resultados = categorias.map((c) => {
    const valores = preguntas
      .filter((p) => p.category_id === c.id)
      .map((p) => valorPorPregunta.get(p.id)!);
    const r = calcularCategoria(valores, c.tipo as Tipo);
    return {
      category_id: c.id,
      puntaje: r.puntaje,
      maximo: r.maximo,
      porcentaje: r.porcentaje,
      nivel: r.nivel,
    };
  });

  const { data: intento, error: errIntento } = await supabase
    .from("attempts")
    .insert({})
    .select("id")
    .single();
  if (errIntento || !intento) return { error: "No pudimos guardar tu evaluación." };

  const [{ error: errRespuestas }, { error: errResultados }] = await Promise.all([
    supabase.from("answers").insert(
      respuestas.map((r) => ({ attempt_id: intento.id, question_id: r.questionId, valor: r.valor })),
    ),
    supabase.from("results").insert(resultados.map((r) => ({ attempt_id: intento.id, ...r }))),
  ]);

  if (errRespuestas || errResultados) {
    // Borrar el intento elimina en cascada lo que sí se alcanzó a guardar.
    await supabase.from("attempts").delete().eq("id", intento.id);
    return { error: "No pudimos guardar tu evaluación. Inténtalo de nuevo." };
  }

  redirect(`/resultados/${intento.id}`);
}
