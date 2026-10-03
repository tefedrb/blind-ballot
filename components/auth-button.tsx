import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

// The header's account corner (spec § 4). Visitors without a session and
// guests see "Sign in". Guests get no "Sign out", because signing out would
// lose their rounds. Email accounts see their email and "Sign out".
export async function AuthButton() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims || claims.is_anonymous) {
    return (
      <Button asChild size="sm" variant="outline">
        <Link href="/auth/login">Sign in</Link>
      </Button>
    );
  }
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="truncate text-muted-foreground">{claims.email}</span>
      <LogoutButton />
    </div>
  );
}
