# Plan MVP: Evaluador de Habilidades Blandas y Estilos de Liderazgo

Plan para desarrollar el MVP **en local (tu PC)** y luego subirlo a GitHub + Vercel + Supabase para que tu compañera lo pruebe.

---

## 1. Alcance del MVP

Solo lo del plan **gratuito** del requerimiento:

1. Login (solo correos autorizados).
2. Test tipo Likert (1 a 5).
3. Cálculo de puntaje por categoría (% y nivel).
4. Pantalla de resultados básicos: perfil, fortalezas, áreas de mejora y recomendaciones cortas.

**Fuera del MVP (fase 2):** reporte completo en PDF, plan personalizado, seguimiento, planes empresariales, pagos.

---

## 2. Qué instalar en tu PC

| Herramienta | Para qué | Versión sugerida |
|---|---|---|
| **Node.js (LTS)** | Ejecutar y compilar la app | 20 o 22 LTS |
| **npm** (viene con Node) | Instalar dependencias | 10+ |
| **Git** | Control de versiones y subir a GitHub | Última |
| **VS Code** | Editor | Última |
| **Cuenta de GitHub** | Repositorio privado | - |
| **Cuenta de Supabase** | Base de datos y login (nube, plan gratis) | - |
| **Cuenta de Vercel** | Publicar la app (después) | - |

Extensiones útiles de VS Code: ESLint, Prettier, Tailwind CSS IntelliSense.

**Opcional (no necesario para el MVP):** Docker Desktop + Supabase CLI para correr Supabase 100 % local. Para lo menos complicado, usa directamente un proyecto de Supabase en la nube exclusivo para pruebas.

Verificar instalación:

```bash
node -v
npm -v
git --version
```

---

## 3. Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Estilos:** Tailwind CSS
- **Backend/BD/Auth:** Supabase (PostgreSQL + magic link)
- **Gráficas:** Recharts (radar de categorías)
- **Validación:** Zod
- **Pruebas de la lógica de calificación:** Vitest

---

## 4. Dependencias

Crear el proyecto:

```bash
npx create-next-app@latest encuestas-mvp --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd encuestas-mvp
```

Dependencias de la app:

```bash
npm install @supabase/supabase-js @supabase/ssr zod recharts
```

Dependencias de desarrollo:

```bash
npm install -D vitest prettier
```

| Paquete | Uso |
|---|---|
| `next`, `react`, `react-dom` | Base de la app (los instala `create-next-app`) |
| `typescript`, `@types/*` | Tipado |
| `tailwindcss` | Estilos |
| `@supabase/supabase-js` | Cliente de Supabase |
| `@supabase/ssr` | Manejo de sesión en Next.js |
| `zod` | Validar respuestas (valores 1 a 5, preguntas completas) |
| `recharts` | Gráfica radar de resultados |
| `vitest` | Pruebas unitarias de la función de puntaje |
| `eslint`, `prettier` | Calidad y formato de código |

**Fase 2 (no instalar aún):** `@react-pdf/renderer` (reporte PDF), Stripe (pagos), Resend (correos).

---

## 5. Variables de entorno

Archivo `.env.local` en la raíz (**nunca** se sube a GitHub; confirma que `.env*.local` esté en `.gitignore`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

- Solo la llave `anon` va en la app. La `service_role` **no** se usa en el MVP.
- En Vercel se cargan las mismas variables desde su panel.

---

## 6. Estructura de carpetas

```
encuestas-mvp/
├── src/
│   ├── app/
│   │   ├── login/page.tsx          # magic link
│   │   ├── test/page.tsx           # cuestionario
│   │   ├── resultados/[id]/page.tsx
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── scoring.ts              # lógica de calificación
│   │   └── scoring.test.ts
│   ├── data/
│   │   └── recomendaciones.ts      # textos por categoría y nivel
│   └── components/
│       ├── Pregunta.tsx
│       ├── RadarPerfil.tsx
│       └── TarjetaCategoria.tsx
├── supabase/
│   └── schema.sql                  # tablas + RLS + preguntas semilla
├── .env.local
└── README.md
```

---

## 7. Modelo de datos (Supabase)

| Tabla | Campos clave |
|---|---|
| `categories` | id, nombre, grupo (habilidades / liderazgo / decisiones…) |
| `questions` | id, category_id, texto, orden |
| `attempts` | id, user_id, created_at |
| `answers` | id, attempt_id, question_id, valor (1 a 5) |
| `results` | id, attempt_id, category_id, puntaje, maximo, porcentaje, nivel |

**Seguridad (RLS):**
- `categories` y `questions`: lectura para usuarios autenticados.
- `attempts`, `answers`, `results`: cada usuario solo ve y crea lo suyo (`user_id = auth.uid()`).
- Limitar el acceso a correos autorizados: desactivar registro abierto en Supabase Auth e invitar solo a tu compañera y a ti.

---

## 8. Lógica de calificación (del requerimiento)

Escala Likert: 1 Nunca, 2 Rara vez, 3 A veces, 4 Frecuentemente, 5 Siempre.

```
maximo      = (número de preguntas de la categoría) × 5
porcentaje  = puntaje_obtenido / maximo × 100
```

Ejemplo del documento: 20 / 30 × 100 = 66 %, nivel Medio.

| Porcentaje | Nivel |
|---|---|
| 0 – 40 % | 🔴 Bajo |
| 41 – 70 % | 🟡 Medio |
| 71 – 85 % | 🟢 Bueno |
| 86 – 100 % | 🌟 Excelente |

Esqueleto de `scoring.ts`:

```ts
export type Nivel = "Bajo" | "Medio" | "Bueno" | "Excelente";

export function calcularNivel(pct: number): Nivel {
  if (pct <= 40) return "Bajo";
  if (pct <= 70) return "Medio";
  if (pct <= 85) return "Bueno";
  return "Excelente";
}

export function calcularCategoria(valores: number[]) {
  const puntaje = valores.reduce((a, b) => a + b, 0);
  const maximo = valores.length * 5;
  const porcentaje = Math.round((puntaje / maximo) * 100);
  return { puntaje, maximo, porcentaje, nivel: calcularNivel(porcentaje) };
}
```

**Salida del perfil:**
- **Fortalezas:** las 3 categorías con mayor %.
- **Áreas de mejora:** las 3 con menor %.
- **Estilo de liderazgo dominante:** el de mayor % entre Directivo, Estratégico, Colaborativo y Adaptativo.
- **Recomendaciones:** texto predefinido por categoría y nivel (`recomendaciones.ts`).

### Puntos a definir del requerimiento
1. **Introvertido/Extrovertido** no encaja en niveles Bajo/Medio/Bueno: es una dimensión con dos polos. Propuesta: mostrarlo como un espectro (p. ej. 0 % = introvertido, 100 % = extrovertido) sin nivel de calidad.
2. **Rango mínimo:** con escala 1 a 5, el mínimo posible es 20 %, así que el rango 0-40 % en la práctica empieza en 20 %.
3. **Redondeo:** el ejemplo trunca 66,67 % a 66 %. Propongo redondear al entero más cercano y clasificar con ese valor.
4. **Preguntas:** el documento define categorías pero no las preguntas. Hay que redactarlas (sugiero 5 o 6 por subcategoría). Puedo generarte un banco inicial.

---

## 9. Pasos de desarrollo local

1. Instalar herramientas (sección 2).
2. Crear proyecto y dependencias (sección 4).
3. Crear proyecto en Supabase y correr `supabase/schema.sql` en su SQL Editor.
4. Configurar `.env.local`.
5. Construir login con magic link.
6. Cargar preguntas semilla y construir la pantalla del test.
7. Implementar `scoring.ts` con pruebas (`npx vitest`).
8. Construir pantalla de resultados (tarjetas + radar + recomendaciones).
9. Probar todo en local: `npm run dev` → http://localhost:3000.

## 10. Pasos para subirlo (después)

1. `git init`, commit y repo **privado** en GitHub.
2. Importar el repo en Vercel y cargar las variables de entorno.
3. En Supabase Auth, agregar la URL de Vercel a las *Redirect URLs*.
4. Invitar a tu compañera por correo y compartir la URL.

---

## 11. Checklist de seguridad del MVP

- [ ] Repo privado
- [ ] `.env.local` en `.gitignore`
- [ ] RLS activado en todas las tablas
- [ ] Solo llave `anon` en el frontend
- [ ] Registro abierto desactivado; solo correos invitados
- [ ] Proyecto de Supabase exclusivo de pruebas, sin datos reales
