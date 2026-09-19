export type Nivel = "Bajo" | "Medio" | "Bueno" | "Excelente";
export type Grupo = "habilidades" | "liderazgo" | "personalidad";
export type Tipo = "nivel" | "espectro";

export interface ResultadoCategoria {
  id: string;
  nombre: string;
  grupo: Grupo;
  tipo: Tipo;
  puntaje: number;
  maximo: number;
  porcentaje: number;
  /** null en categorías de tipo "espectro". */
  nivel: Nivel | null;
}

const MIN_VALOR = 1;
const MAX_VALOR = 5;

/** Clasifica un porcentaje ya redondeado a entero. */
export function calcularNivel(pct: number): Nivel {
  if (pct <= 40) return "Bajo";
  if (pct <= 70) return "Medio";
  if (pct <= 85) return "Bueno";
  return "Excelente";
}

/**
 * - "nivel": porcentaje = puntaje / máximo × 100, redondeado al entero más cercano.
 * - "espectro": se normaliza a 0–100 (todas las respuestas en 1 = 0 %, todas en 5 = 100 %)
 *   y no lleva nivel, porque no es una escala de calidad.
 */
export function calcularCategoria(valores: number[], tipo: Tipo = "nivel") {
  if (valores.length === 0) throw new Error("La categoría no tiene respuestas.");
  if (valores.some((v) => !Number.isInteger(v) || v < MIN_VALOR || v > MAX_VALOR)) {
    throw new Error("Las respuestas deben ser enteros entre 1 y 5.");
  }

  const puntaje = valores.reduce((a, b) => a + b, 0);
  const maximo = valores.length * MAX_VALOR;

  if (tipo === "espectro") {
    const minimo = valores.length * MIN_VALOR;
    const porcentaje = Math.round(((puntaje - minimo) / (maximo - minimo)) * 100);
    return { puntaje, maximo, porcentaje, nivel: null };
  }

  const porcentaje = Math.round((puntaje / maximo) * 100);
  return { puntaje, maximo, porcentaje, nivel: calcularNivel(porcentaje) };
}

export interface Perfil {
  /** Las 3 habilidades con mayor porcentaje. */
  fortalezas: ResultadoCategoria[];
  /** Las 3 habilidades con menor porcentaje. */
  mejoras: ResultadoCategoria[];
  /** El estilo de liderazgo con mayor porcentaje. */
  estiloDominante: ResultadoCategoria | null;
  /** Categoría de tipo espectro (introvertido / extrovertido), si existe. */
  espectro: ResultadoCategoria | null;
}

/**
 * Fortalezas y mejoras se calculan solo entre las habilidades: los estilos de
 * liderazgo describen una preferencia, no algo que se tenga "de más" o "de menos".
 * En empate gana la categoría que aparece primero en `resultados`.
 */
export function construirPerfil(resultados: ResultadoCategoria[]): Perfil {
  const habilidades = resultados.filter((r) => r.grupo === "habilidades" && r.tipo === "nivel");
  const liderazgo = resultados.filter((r) => r.grupo === "liderazgo");

  const desc = [...habilidades].sort((a, b) => b.porcentaje - a.porcentaje);
  const asc = [...habilidades].sort((a, b) => a.porcentaje - b.porcentaje);

  const estiloDominante = liderazgo.reduce<ResultadoCategoria | null>(
    (mejor, r) => (mejor === null || r.porcentaje > mejor.porcentaje ? r : mejor),
    null,
  );

  return {
    fortalezas: desc.slice(0, 3),
    mejoras: asc.slice(0, 3),
    estiloDominante,
    espectro: resultados.find((r) => r.tipo === "espectro") ?? null,
  };
}
