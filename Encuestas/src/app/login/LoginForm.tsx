"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Estado = "inicial" | "enviando" | "enviado";

export default function LoginForm({ errorInicial }: { errorInicial?: string }) {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<Estado>("inicial");
  const [error, setError] = useState(errorInicial ?? "");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setEstado("enviando");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        // Solo correos ya invitados: no se crean usuarios nuevos.
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setEstado("inicial");
      setError(
        "No pudimos enviar el enlace. Verifica que tu correo esté autorizado e inténtalo de nuevo.",
      );
      return;
    }
    setEstado("enviado");
  }

  if (estado === "enviado") {
    return (
      <p className="rounded-lg bg-green-50 p-4 text-green-800">
        Te enviamos un enlace a <strong>{email}</strong>. Ábrelo desde este mismo navegador para
        entrar.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Correo electrónico
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-base font-normal"
          placeholder="tu@correo.com"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={estado === "enviando"}
        className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {estado === "enviando" ? "Enviando…" : "Enviarme el enlace de acceso"}
      </button>
    </form>
  );
}
