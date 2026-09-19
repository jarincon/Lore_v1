import { describe, expect, it } from "vitest";
import {
  calcularCategoria,
  calcularNivel,
  construirPerfil,
  type ResultadoCategoria,
} from "./scoring";

describe("calcularNivel", () => {
  it.each([
    [20, "Bajo"],
    [40, "Bajo"],
    [41, "Medio"],
    [70, "Medio"],
    [71, "Bueno"],
    [85, "Bueno"],
    [86, "Excelente"],
    [100, "Excelente"],
  ] as const)("%i %% → %s", (pct, nivel) => {
    expect(calcularNivel(pct)).toBe(nivel);
  });
});

describe("calcularCategoria", () => {
  it("ejemplo del requerimiento: 20/30 redondea a 67 % (Medio)", () => {
    const r = calcularCategoria([3, 3, 3, 3, 4, 4]);
    expect(r).toEqual({ puntaje: 20, maximo: 30, porcentaje: 67, nivel: "Medio" });
  });

  it("el redondeo puede cambiar de nivel en el borde", () => {
    // 3.5/5 no existe; 14/20 = 70 % Medio, 15/20 = 75 % Bueno.
    expect(calcularCategoria([3, 3, 4, 4]).nivel).toBe("Medio");
    expect(calcularCategoria([4, 4, 4, 3]).nivel).toBe("Bueno");
  });

  it("todo en 1 da el mínimo posible (20 %, Bajo)", () => {
    expect(calcularCategoria([1, 1, 1, 1, 1])).toMatchObject({ porcentaje: 20, nivel: "Bajo" });
  });

  it("todo en 5 da 100 % Excelente", () => {
    expect(calcularCategoria([5, 5, 5, 5, 5])).toMatchObject({
      puntaje: 25,
      maximo: 25,
      porcentaje: 100,
      nivel: "Excelente",
    });
  });

  it("espectro: se normaliza a 0–100 y no tiene nivel", () => {
    expect(calcularCategoria([1, 1, 1, 1, 1], "espectro")).toMatchObject({
      porcentaje: 0,
      nivel: null,
    });
    expect(calcularCategoria([5, 5, 5, 5, 5], "espectro")).toMatchObject({
      porcentaje: 100,
      nivel: null,
    });
    expect(calcularCategoria([3, 3, 3, 3, 3], "espectro").porcentaje).toBe(50);
  });

  it("rechaza valores fuera de 1–5, no enteros o listas vacías", () => {
    expect(() => calcularCategoria([0, 3])).toThrow();
    expect(() => calcularCategoria([6, 3])).toThrow();
    expect(() => calcularCategoria([2.5, 3])).toThrow();
    expect(() => calcularCategoria([])).toThrow();
  });
});

function res(
  id: string,
  grupo: ResultadoCategoria["grupo"],
  porcentaje: number,
  tipo: ResultadoCategoria["tipo"] = "nivel",
): ResultadoCategoria {
  return { id, nombre: id, grupo, tipo, puntaje: 0, maximo: 0, porcentaje, nivel: null };
}

describe("construirPerfil", () => {
  const resultados = [
    res("a", "habilidades", 90),
    res("b", "habilidades", 50),
    res("c", "habilidades", 75),
    res("d", "habilidades", 30),
    res("e", "habilidades", 60),
    res("directivo", "liderazgo", 55),
    res("colaborativo", "liderazgo", 80),
    res("ext", "personalidad", 65, "espectro"),
  ];

  it("fortalezas y mejoras salen solo de las habilidades", () => {
    const p = construirPerfil(resultados);
    expect(p.fortalezas.map((r) => r.id)).toEqual(["a", "c", "e"]);
    expect(p.mejoras.map((r) => r.id)).toEqual(["d", "b", "e"]);
  });

  it("estilo dominante es el liderazgo con mayor porcentaje", () => {
    expect(construirPerfil(resultados).estiloDominante?.id).toBe("colaborativo");
  });

  it("devuelve el espectro aparte", () => {
    expect(construirPerfil(resultados).espectro?.id).toBe("ext");
  });

  it("en empate gana el primero de la lista", () => {
    const p = construirPerfil([res("x", "liderazgo", 70), res("y", "liderazgo", 70)]);
    expect(p.estiloDominante?.id).toBe("x");
  });
});
