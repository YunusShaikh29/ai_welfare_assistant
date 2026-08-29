import { z } from "zod"

export const studentIntakeSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120),
  email: z.email("Please enter a valid email address.").max(254),
})

export type StudentIntake = z.infer<typeof studentIntakeSchema>
