-- Evaluador de Habilidades Blandas y Estilos de Liderazgo
-- Ejecutar completo en Supabase > SQL Editor. Es re-ejecutable (borra y recrea).

drop table if exists results, answers, attempts, questions, categories cascade;

-- ============ Tablas ============

create table categories (
  id      text primary key,               -- slug, p. ej. 'comunicacion'
  nombre  text not null,
  grupo   text not null check (grupo in ('habilidades', 'liderazgo', 'personalidad')),
  tipo    text not null default 'nivel' check (tipo in ('nivel', 'espectro')),
  orden   int  not null
);

create table questions (
  id           serial primary key,
  category_id  text not null references categories(id) on delete cascade,
  texto        text not null,
  orden        int  not null,
  unique (category_id, orden)
);

create table attempts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table answers (
  id           bigserial primary key,
  attempt_id   uuid not null references attempts(id) on delete cascade,
  question_id  int  not null references questions(id),
  valor        int  not null check (valor between 1 and 5),
  unique (attempt_id, question_id)
);

create table results (
  id           bigserial primary key,
  attempt_id   uuid not null references attempts(id) on delete cascade,
  category_id  text not null references categories(id),
  puntaje      int  not null,
  maximo       int  not null,
  porcentaje   int  not null check (porcentaje between 0 and 100),
  nivel        text check (nivel in ('Bajo', 'Medio', 'Bueno', 'Excelente')),  -- null en espectros
  unique (attempt_id, category_id)
);

create index on attempts (user_id, created_at desc);
create index on answers (attempt_id);
create index on results (attempt_id);

-- ============ RLS ============

alter table categories enable row level security;
alter table questions  enable row level security;
alter table attempts   enable row level security;
alter table answers    enable row level security;
alter table results    enable row level security;

create policy "categories: lectura autenticados" on categories
  for select to authenticated using (true);

create policy "questions: lectura autenticados" on questions
  for select to authenticated using (true);

create policy "attempts: propios" on attempts
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "answers: propias" on answers
  for all to authenticated
  using (exists (select 1 from attempts a where a.id = attempt_id and a.user_id = auth.uid()))
  with check (exists (select 1 from attempts a where a.id = attempt_id and a.user_id = auth.uid()));

create policy "results: propios" on results
  for all to authenticated
  using (exists (select 1 from attempts a where a.id = attempt_id and a.user_id = auth.uid()))
  with check (exists (select 1 from attempts a where a.id = attempt_id and a.user_id = auth.uid()));

-- ============ Permisos ============
-- Este proyecto no concede privilegios automáticamente: sin esto el rol
-- 'authenticated' recibe "permission denied". RLS sigue filtrando las filas.
-- 'anon' no recibe nada: hay que iniciar sesión para leer o escribir.

grant select on categories, questions to authenticated;
grant select, insert, update, delete on attempts, answers, results to authenticated;
grant usage, select on sequence answers_id_seq, results_id_seq to authenticated;

-- ============ Semilla: categorías (12) ============

insert into categories (id, nombre, grupo, tipo, orden) values
  ('comunicacion',        'Comunicación',            'habilidades', 'nivel',    1),
  ('empatia',             'Empatía',                 'habilidades', 'nivel',    2),
  ('trabajo_equipo',      'Trabajo en equipo',       'habilidades', 'nivel',    3),
  ('manejo_conflictos',   'Manejo de conflictos',    'habilidades', 'nivel',    4),
  ('gestion_tiempo',      'Gestión del tiempo',      'habilidades', 'nivel',    5),
  ('inteligencia_emocional','Inteligencia emocional','habilidades', 'nivel',    6),
  ('toma_decisiones',     'Toma de decisiones',      'habilidades', 'nivel',    7),
  ('lider_directivo',     'Liderazgo Directivo',     'liderazgo',   'nivel',    8),
  ('lider_estrategico',   'Liderazgo Estratégico',   'liderazgo',   'nivel',    9),
  ('lider_colaborativo',  'Liderazgo Colaborativo',  'liderazgo',   'nivel',   10),
  ('lider_adaptativo',    'Liderazgo Adaptativo',    'liderazgo',   'nivel',   11),
  ('extroversion',        'Introvertido / Extrovertido', 'personalidad', 'espectro', 12);

-- ============ Semilla: preguntas (60, 5 por categoría) ============
-- Escala: 1 Nunca, 2 Rara vez, 3 A veces, 4 Frecuentemente, 5 Siempre.
-- Todas redactadas en positivo. En 'extroversion', 100 % = polo extrovertido.

insert into questions (category_id, orden, texto) values
  -- Comunicación
  ('comunicacion', 1, 'Expreso mis ideas de forma clara y ordenada.'),
  ('comunicacion', 2, 'Escucho con atención, sin interrumpir, a quien me habla.'),
  ('comunicacion', 3, 'Adapto mi forma de hablar según la persona con la que converso.'),
  ('comunicacion', 4, 'Confirmo que me entendieron cuando explico algo importante.'),
  ('comunicacion', 5, 'Doy retroalimentación de manera respetuosa y directa.'),

  -- Empatía
  ('empatia', 1, 'Noto cuando alguien a mi alrededor está pasando por un mal momento.'),
  ('empatia', 2, 'Trato de entender el punto de vista de los demás antes de opinar.'),
  ('empatia', 3, 'Muestro interés genuino por lo que preocupa a mis compañeros.'),
  ('empatia', 4, 'Mantengo el respeto aunque no esté de acuerdo con alguien.'),
  ('empatia', 5, 'Las personas se sienten cómodas contándome sus problemas.'),

  -- Trabajo en equipo
  ('trabajo_equipo', 1, 'Cumplo con mi parte para que el equipo alcance sus metas.'),
  ('trabajo_equipo', 2, 'Comparto información y recursos con mis compañeros.'),
  ('trabajo_equipo', 3, 'Ofrezco ayuda, sin que me la pidan, cuando alguien está sobrecargado.'),
  ('trabajo_equipo', 4, 'Acepto las decisiones del grupo aunque no fueran mi primera opción.'),
  ('trabajo_equipo', 5, 'Reconozco públicamente los aportes de los demás.'),

  -- Manejo de conflictos
  ('manejo_conflictos', 1, 'Abordo los desacuerdos de forma directa en lugar de evitarlos.'),
  ('manejo_conflictos', 2, 'Mantengo la calma en discusiones tensas.'),
  ('manejo_conflictos', 3, 'Busco soluciones en las que ambas partes ganen.'),
  ('manejo_conflictos', 4, 'Me enfoco en el problema y no en culpar a las personas.'),
  ('manejo_conflictos', 5, 'Pido disculpas cuando reconozco que me equivoqué.'),

  -- Gestión del tiempo
  ('gestion_tiempo', 1, 'Planifico mis tareas antes de comenzar la jornada o la semana.'),
  ('gestion_tiempo', 2, 'Distingo lo urgente de lo importante al priorizar.'),
  ('gestion_tiempo', 3, 'Entrego mis trabajos dentro de los plazos acordados.'),
  ('gestion_tiempo', 4, 'Evito posponer las tareas difíciles.'),
  ('gestion_tiempo', 5, 'Aviso con anticipación cuando no voy a llegar a una fecha de entrega.'),

  -- Inteligencia emocional
  ('inteligencia_emocional', 1, 'Identifico lo que siento en el momento en que lo siento.'),
  ('inteligencia_emocional', 2, 'Controlo mis reacciones cuando estoy bajo presión.'),
  ('inteligencia_emocional', 3, 'Me recupero rápido después de un error o una crítica.'),
  ('inteligencia_emocional', 4, 'Reconozco cómo mis emociones influyen en mis decisiones.'),
  ('inteligencia_emocional', 5, 'Mantengo la motivación aun cuando las cosas no salen como esperaba.'),

  -- Toma de decisiones
  ('toma_decisiones', 1, 'Reúno la información necesaria antes de decidir.'),
  ('toma_decisiones', 2, 'Evalúo las consecuencias de cada opción antes de elegir.'),
  ('toma_decisiones', 3, 'Decido a tiempo, sin dejar que la duda me paralice.'),
  ('toma_decisiones', 4, 'Asumo la responsabilidad de mis decisiones, incluso cuando salen mal.'),
  ('toma_decisiones', 5, 'Aprendo de decisiones pasadas para mejorar las siguientes.'),

  -- Liderazgo Directivo
  ('lider_directivo', 1, 'Doy instrucciones claras y espero que se cumplan.'),
  ('lider_directivo', 2, 'Tomo el control con rapidez cuando hay una situación crítica.'),
  ('lider_directivo', 3, 'Establezco metas concretas y les hago seguimiento cercano.'),
  ('lider_directivo', 4, 'Corrijo de inmediato cuando algo no cumple el estándar esperado.'),
  ('lider_directivo', 5, 'Prefiero decidir yo mismo para no perder tiempo en consensos largos.'),

  -- Liderazgo Estratégico
  ('lider_estrategico', 1, 'Defino una visión a largo plazo para mi equipo o proyecto.'),
  ('lider_estrategico', 2, 'Anticipo escenarios y riesgos antes de que ocurran.'),
  ('lider_estrategico', 3, 'Alineo las tareas del día a día con objetivos mayores.'),
  ('lider_estrategico', 4, 'Analizo el entorno (mercado, tendencias, competencia) para orientar mis decisiones.'),
  ('lider_estrategico', 5, 'Priorizo iniciativas según su impacto a largo plazo.'),

  -- Liderazgo Colaborativo
  ('lider_colaborativo', 1, 'Consulto al equipo antes de tomar decisiones que le afectan.'),
  ('lider_colaborativo', 2, 'Fomento que cada persona aporte sus ideas.'),
  ('lider_colaborativo', 3, 'Delego responsabilidades y confío en que se cumplirán.'),
  ('lider_colaborativo', 4, 'Construyo consensos en lugar de imponer mi criterio.'),
  ('lider_colaborativo', 5, 'Celebro los logros del equipo por encima de los personales.'),

  -- Liderazgo Adaptativo
  ('lider_adaptativo', 1, 'Cambio mi estilo de liderazgo según la persona y la situación.'),
  ('lider_adaptativo', 2, 'Ajusto el plan con rapidez cuando cambian las circunstancias.'),
  ('lider_adaptativo', 3, 'Me siento cómodo trabajando con incertidumbre.'),
  ('lider_adaptativo', 4, 'Pido y acepto retroalimentación para modificar mi enfoque.'),
  ('lider_adaptativo', 5, 'Aprendo nuevas herramientas o métodos con facilidad.'),

  -- Introvertido / Extrovertido (100 % = extrovertido)
  ('extroversion', 1, 'Me da energía estar rodeado de gente.'),
  ('extroversion', 2, 'Inicio conversaciones con personas que no conozco.'),
  ('extroversion', 3, 'Prefiero pensar en voz alta con otros que reflexionar a solas.'),
  ('extroversion', 4, 'Me siento cómodo hablando frente a un grupo.'),
  ('extroversion', 5, 'Busco activamente reuniones sociales o actividades en grupo.');
