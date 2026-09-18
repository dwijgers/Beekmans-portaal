import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { next } = await searchParams;
  if (user) redirect(next || "/dashboard");

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="glass flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold">
            B
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Beekmans Portaal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Meldingen, vloot en facturatie — voor al onze klanten op één plek.
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="mb-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            Log in om verder te gaan
          </p>
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
