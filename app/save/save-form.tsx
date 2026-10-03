"use client";

import { useActionState } from "react";
import { saveResults } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SaveForm() {
  const [state, action, pending] = useActionState(saveResults, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button size="lg" className="h-12 w-full text-base" disabled={pending}>
        Save results
      </Button>
    </form>
  );
}
