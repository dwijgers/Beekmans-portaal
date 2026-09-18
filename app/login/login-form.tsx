"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError("Inloggen mislukt. Controleer e-mailadres en wachtwoord.");
      return;
    }

    router.replace(next || "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
        E-mailadres
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border px-3 py-2 text-base outline-none transition-shadow focus:ring-2 focus:ring-blue-600/20"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
        Wachtwoord
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border px-3 py-2 text-base outline-none transition-shadow focus:ring-2 focus:ring-blue-600/20"
        />
      </label>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-lg btn-primary px-4 py-2.5 font-medium disabled:opacity-50"
      >
        {loading ? "Bezig..." : "Inloggen"}
      </button>
    </form>
  );
}
