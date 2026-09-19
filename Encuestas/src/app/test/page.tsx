import Link from "next/link";
import Cuestionario, { type CategoriaTest } from "@/components/Cuestionario";
import { createClient } from "@/lib/supabase/server";

export default async function TestPage() {
  const supabase = await createClient();

  const [{ data: categorias }, { data: preguntas }, { data: ultimo }] = await Promise.all([
    supabase.from("categories").select("id, nombre, orden").order("orden"),
    supabase.from("questions").select("id, category_id, texto, orden").order("orden"),
    supabase
      .from("attempts")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const secciones: CategoriaTest[] = (categorias ?? [])
    .map((c) => ({
      id: c.id,
      nombre: c.nombre,
      preguntas: (preguntas ?? [])
        .filter((p) => p.category_id === c.id)
        .map((p) => ({ id: p.id, texto: p.texto })),
    }))
    .filter((c) => c.preguntas.length > 0);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Evaluación de habilidades y liderazgo</h1>
          <p className="mt-2 text-zinc-600">
            Indica con qué frecuencia te describe cada afirmación. No hay respuestas correctas o
            incorrectas: responde con sinceridad.
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className="text-sm text-zinc-500 underline">
            Salir
          </button>
        </form>
      </header>

      {ultimo && (
        <p className="mb-6 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900">
          Ya hiciste esta evaluación.{" "}
          <Link href={`/resultados/${ultimo.id}`} className="font-medium underline">
            Ver mi último resultado
          </Link>
          . Puedes repetirla abajo.
        </p>
      )}

      {secciones.length === 0 ? (
        <p className="text-red-600">No se pudieron cargar las preguntas.</p>
      ) : (
        <Cuestionario categorias={secciones} />
      )}
    </main>
  );
}
