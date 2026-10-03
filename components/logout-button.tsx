"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    // Layouts don't re-render on navigation, so redraw the header.
    router.refresh();
  };

  return (
    <Button size="sm" variant="outline" onClick={logout}>
      Sign out
    </Button>
  );
}
