import { z } from 'zod';

export const emailPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export const signUpSchema = emailPasswordSchema.extend({
  confirmPassword: z.string().min(6, { message: "Password confirmation is required." })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"], // Path of error to display next to confirmPassword field
});

export type EmailPasswordFormValues = z.infer<typeof emailPasswordSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
