import { z } from "zod";

// What "Save results" asks a guest for (spec § 4). The messages are shown as
// they are.
export const SaveSchema = z.object({
  email: z.email({ error: "Enter a valid email." }),
  password: z.string().min(6, { error: "Use a password of at least 6 characters." }),
});
