import type { Nivel } from "@/lib/scoring";

type PorNivel = Record<Nivel, string>;

/** Textos por categoría (id de la tabla `categories`) y nivel. */
export const recomendaciones: Record<string, PorNivel> = {
  comunicacion: {
    Bajo: "Practica la escucha activa: deja terminar al otro, parafrasea lo que entendiste y prepara tus ideas clave antes de hablar.",
    Medio:
      "En general te haces entender. Trabaja en confirmar que el mensaje llegó y en adaptar tu tono a cada interlocutor.",
    Bueno:
      "Comunicas bien. Refina la retroalimentación: sé específico y equilibra lo que funciona con lo que se puede mejorar.",
    Excelente:
      "Es una de tus grandes fortalezas. Úsala para mentorear a otros y facilitar conversaciones difíciles.",
  },
  empatia: {
    Bajo: "Antes de responder, pregunta cómo se siente la otra persona y escucha sin juzgar. Empieza con una conversación así por semana.",
    Medio:
      "Percibes a los demás a veces. Practica ponerte en su lugar antes de opinar, sobre todo cuando no compartes su punto de vista.",
    Bueno:
      "Conectas bien con las personas. Cuida no cargar con los problemas ajenos: empatía, pero con límites.",
    Excelente:
      "Generas confianza con facilidad. Aprovéchala para mediar y crear equipos donde todos se sientan escuchados.",
  },
  trabajo_equipo: {
    Bajo: "Define con el equipo quién hace qué y comparte tus avances a tiempo. Empieza ofreciendo ayuda en una tarea pequeña.",
    Medio:
      "Cumples con tu parte. Da el siguiente paso compartiendo información de forma proactiva y reconociendo los aportes de otros.",
    Bueno:
      "Eres un buen compañero de equipo. Ayuda a que otros colaboren mejor promoviendo acuerdos claros de trabajo.",
    Excelente:
      "Elevas el nivel del equipo. Considera asumir un rol de coordinación o acompañar a personas nuevas.",
  },
  manejo_conflictos: {
    Bajo: "Evitar el conflicto suele agrandarlo. Practica plantear el desacuerdo con hechos y en primera persona («yo veo…»).",
    Medio:
      "Manejas los desacuerdos según el día. Arma una rutina: respira, escucha primero y propón una salida donde ambos ganen.",
    Bueno:
      "Gestionas bien las tensiones. Trabaja en detectarlas antes de que escalen y en conversarlas temprano.",
    Excelente:
      "Conviertes los conflictos en acuerdos. Puedes actuar como mediador dentro de tu equipo.",
  },
  gestion_tiempo: {
    Bajo: "Empieza cada día anotando tus 3 prioridades y reserva tiempo para la tarea más difícil primero.",
    Medio:
      "Tienes una base. Distingue lo urgente de lo importante y avisa con anticipación cuando un plazo esté en riesgo.",
    Bueno:
      "Organizas bien tu tiempo. Protege espacios sin interrupciones y aprende a decir no a lo que no aporta.",
    Excelente:
      "Tu gestión del tiempo es muy sólida. Comparte tus métodos con el equipo.",
  },
  inteligencia_emocional: {
    Bajo: "Ponle nombre a lo que sientes antes de reaccionar. Una pausa de unos segundos en momentos de tensión ayuda mucho.",
    Medio:
      "Reconoces tus emociones parte del tiempo. Anota qué situaciones te alteran y cómo respondes.",
    Bueno:
      "Manejas bien tus emociones. Afina tu recuperación tras las críticas convirtiéndolas en aprendizajes concretos.",
    Excelente:
      "Tienes gran autorregulación, lo que te permite sostener a otros en momentos de presión.",
  },
  toma_decisiones: {
    Bajo: "Usa un método simple: define el problema, lista 2 o 3 opciones con pros y contras y fija una fecha límite para decidir.",
    Medio:
      "Decides de forma razonable. Mejora fijando criterios antes de elegir y revisando después qué resultó.",
    Bueno:
      "Decides con criterio. Documenta tus decisiones importantes y aprende de sus resultados.",
    Excelente:
      "Decides con información, a tiempo y asumiendo responsabilidad. Puedes guiar procesos de decisión del grupo.",
  },
  lider_directivo: {
    Bajo: "Usas poco este estilo. Cuando la situación exige rapidez, practica dar instrucciones concretas y hacer seguimiento.",
    Medio:
      "Lo usas cuando la situación lo pide. Explica siempre el porqué de tus indicaciones.",
    Bueno:
      "Es un estilo frecuente en ti. Equilíbralo con escucha para no frenar la iniciativa del equipo.",
    Excelente:
      "Es un estilo muy marcado en ti y muy útil en crisis. Cuida no imponerte cuando la situación pide participación.",
  },
  lider_estrategico: {
    Bajo: "Dedicas poco tiempo al largo plazo. Reserva un espacio al mes para definir objetivos y anticipar riesgos.",
    Medio:
      "Piensas en el futuro de forma ocasional. Conecta tus tareas del día con objetivos mayores.",
    Bueno:
      "Tienes visión. Comunícala al equipo para que todos sepan hacia dónde van.",
    Excelente:
      "Tu visión es muy marcada. Cuida traducirla en pasos concretos y en resultados a corto plazo.",
  },
  lider_colaborativo: {
    Bajo: "Tiendes a decidir solo. Consulta al equipo las decisiones que le afectan y delega una responsabilidad nueva.",
    Medio:
      "Colaboras según la situación. Amplía la participación pidiendo la opinión de quienes suelen callar.",
    Bueno:
      "Fomentas la participación. Cuida que la búsqueda de consenso no retrase decisiones urgentes.",
    Excelente:
      "Es un estilo muy marcado: tu equipo se siente escuchado. Define cuándo una decisión te corresponde a ti.",
  },
  lider_adaptativo: {
    Bajo: "Tiendes a mantener siempre el mismo enfoque. Observa qué necesita cada persona y cada situación antes de actuar.",
    Medio:
      "Te adaptas con cierto esfuerzo. Pide retroalimentación con frecuencia para ajustar tu enfoque.",
    Bueno:
      "Te adaptas bien al cambio. Sigue ampliando tu repertorio de estilos.",
    Excelente:
      "Cambias de estilo con soltura según el contexto, una señal clara de liderazgo maduro.",
  },
};

/** Descripción del espectro introvertido / extrovertido (0 % a 100 %). */
export function describirEspectro(porcentaje: number): { titulo: string; texto: string } {
  if (porcentaje <= 33) {
    return {
      titulo: "Tendencia introvertida",
      texto:
        "Recuperas energía en la calma y rindes bien con reflexión previa. Aprovecha las conversaciones uno a uno y prepara tus intervenciones en grupo.",
    };
  }
  if (porcentaje <= 66) {
    return {
      titulo: "Perfil equilibrado (ambivertido)",
      texto:
        "Te mueves con comodidad tanto en espacios sociales como a solas. Elige según lo que la tarea requiera.",
    };
  }
  return {
    titulo: "Tendencia extrovertida",
    texto:
      "Te energiza el contacto con otras personas y te expresas con facilidad. Deja espacio para que las voces más calladas también participen.",
  };
}
