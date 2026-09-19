import LoginForm from "./LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  const errorInicial =
    error === "enlace" ? "El enlace no es válido o ya venció. Pide uno nuevo." : undefined;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Evaluador de habilidades blandas</h1>
        <p className="mt-2 text-zinc-600">
          Ingresa tu correo autorizado y te enviaremos un enlace para entrar.
        </p>
      </div>
      <LoginForm errorInicial={errorInicial} />
    </main>
  );
}
