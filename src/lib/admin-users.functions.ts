import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequestHeader } from "@tanstack/react-start/server";

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  full_name: z.string().optional().default(""),
  role: z.enum(["admin", "moderator", "user"]).default("user"),
});

export const adminCreateUser = createServerFn({ method: "POST" })
  .validator((data: unknown) => CreateUserSchema.parse(data))
  .handler(async ({ data }) => {
    const { createUserAsAdmin } = await import("./admin-users.server");
    return createUserAsAdmin(getRequestHeader("authorization") ?? null, data);
  });
