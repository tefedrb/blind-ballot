"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// Copies the share line (lib/share.ts). It gets only the finished line, never a
// card or a round.
export function ShareButton({ line }: { line: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      variant="outline"
      size="lg"
      className="h-12 w-full text-base"
      onClick={() => navigator.clipboard.writeText(line).then(() => setCopied(true))}
    >
      {copied ? "Copied" : "Share"}
    </Button>
  );
}
