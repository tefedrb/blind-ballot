import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SaveForm } from "./save-form";

// Every player sees their own state, so this page reads the session and renders
// per request instead of prerendering (Cache Components).
export const instant = false;

export default async function SavePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  // Guests only: an email account is already saved. The proxy has already sent
  // visitors without a session to the landing page.
  if (data?.claims.is_anonymous !== true) redirect("/");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Save your results</h1>
        <p className="text-sm text-muted-foreground">
          As a guest, your rounds live in this browser only. Add an email and a password to keep
          them and sign in anywhere. We don&apos;t send any email.
        </p>
      </div>
      <SaveForm />
    </main>
  );
}
