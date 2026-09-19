import { z } from "zod";

export const respuestaSchema = z.object({
  questionId: z.number().int().positive(),
  valor: z.number().int().min(1).max(5),
});

export const respuestasSchema = z.array(respuestaSchema).min(1);

export type Respuesta = z.infer<typeof respuestaSchema>;
