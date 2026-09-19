import { redirect } from "next/navigation";

// El proxy ya envía a /login a quien no tiene sesión.
export default function Home() {
  redirect("/test");
}
