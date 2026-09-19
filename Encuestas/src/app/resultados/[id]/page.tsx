import Link from "next/link";
import { notFound } from "next/navigation";
import RadarPerfil from "@/components/RadarPerfil";
import TarjetaCategoria from "@/components/TarjetaCategoria";
import { describirEspectro, recomendaciones } from "@/data/recomendaciones";
import { construirPerfil, type Grupo, type Nivel, type ResultadoCategoria, type Tipo } from "@/lib/scoring";
import { createClient } from "@/lib/supabase/server";

interface Fila {
  puntaje: number;
  maximo: number;
  porcentaje: number;
  nivel: Nivel | null;
  categories: { id: string; nombre: string; grupo: Grupo; tipo: Tipo; orden: number };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ResultadosPage({ params }: PageProps<"/resultados/[id]">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  // El RLS garantiza que solo se ven intentos propios: si no es tuyo, no hay filas.
  const { data } = await supabase
    .from("results")
    .select("puntaje, maximo, porcentaje, nivel, categories(id, nombre, grupo, tipo, orden)")
    .eq("attempt_id", id);

  const filas = (data ?? []) as unknown as Fila[];
  if (filas.length === 0) notFound();

  const resultados: ResultadoCategoria[] = filas
    .sort((a, b) => a.categories.orden - b.categories.orden)
    .map((f) => ({
      id: f.categories.id,
      nombre: f.categories.nombre,
      grupo: f.categories.grupo,
      tipo: f.categories.tipo,
      puntaje: f.puntaje,
      maximo: f.maximo,
      porcentaje: f.porcentaje,
      nivel: f.nivel,
    }));

  const perfil = construirPerfil(resultados);
  const conNivel = resultados.filter((r) => r.nivel !== null);
  const habilidades = conNivel.filter((r) => r.grupo === "habilidades");
  const liderazgo = conNivel.filter((r) => r.grupo === "liderazgo");
  const espectro = perfil.espectro ? describirEspectro(perfil.espectro.porcentaje) : null;

  const tarjeta = (r: ResultadoCategoria) => (
    <TarjetaCategoria
      key={r.id}
      nombre={r.nombre}
      porcentaje={r.porcentaje}
      nivel={r.nivel!}
      recomendacion={recomendaciones[r.id]?.[r.nivel!]}
    />
  );

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tus resultados</h1>
          <p className="mt-1 text-zinc-600">Perfil de habilidades blandas y estilo de liderazgo.</p>
        </div>
        <Link href="/test" className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm">
          Repetir evaluación
        </Link>
      </header>

      <section className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-green-50 p-4">
          <h2 className="text-sm font-semibold text-green-900">Fortalezas</h2>
          <ul className="mt-2 space-y-1 text-sm text-green-900">
            {perfil.fortalezas.map((r) => (
              <li key={r.id}>
                {r.nombre} <span className="tabular-nums">({r.porcentaje}%)</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-amber-50 p-4">
          <h2 className="text-sm font-semibold text-amber-900">Áreas de mejora</h2>
          <ul className="mt-2 space-y-1 text-sm text-amber-900">
            {perfil.mejoras.map((r) => (
              <li key={r.id}>
                {r.nombre} <span className="tabular-nums">({r.porcentaje}%)</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-indigo-50 p-4">
          <h2 className="text-sm font-semibold text-indigo-900">Estilo de liderazgo dominante</h2>
          <p className="mt-2 text-sm text-indigo-900">
            {perfil.estiloDominante
              ? `${perfil.estiloDominante.nombre.replace("Liderazgo ", "")} (${perfil.estiloDominante.porcentaje}%)`
              : "—"}
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-2 text-lg font-semibold">Vista general</h2>
        <RadarPerfil
          datos={conNivel.map((r) => ({
            nombre: r.nombre.replace("Liderazgo ", "Lid. "),
            porcentaje: r.porcentaje,
          }))}
        />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">Habilidades blandas</h2>
        <div className="grid gap-4 sm:grid-cols-2">{habilidades.map(tarjeta)}</div>
      </section>

      <section className="mb-10">
        <h2 className="mb-1 text-lg font-semibold">Estilos de liderazgo</h2>
        <p className="mb-3 text-sm text-zinc-600">
          Indican qué tanto usas cada estilo. No hay uno mejor que otro: depende de la situación.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">{liderazgo.map(tarjeta)}</div>
      </section>

      {perfil.espectro && espectro && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Introvertido / Extrovertido</h2>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="mb-1 flex justify-between text-xs text-zinc-500">
              <span>Introvertido</span>
              <span>Extrovertido</span>
            </div>
            <div className="relative h-2 rounded-full bg-gradient-to-r from-sky-200 to-orange-200">
              <div
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-indigo-600 shadow"
                style={{ left: `${perfil.espectro.porcentaje}%` }}
              />
            </div>
            <p className="mt-4 font-medium">
              {espectro.titulo} <span className="text-zinc-500">({perfil.espectro.porcentaje}%)</span>
            </p>
            <p className="mt-1 text-sm text-zinc-600">{espectro.texto}</p>
          </div>
        </section>
      )}
    </main>
  );
}
