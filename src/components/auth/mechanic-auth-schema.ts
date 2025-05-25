
import { z } from 'zod';

export const mechanicLoginFormSchema = z.object({
  ownerEmail: z.string().email({ message: "Invalid owner email address." }),
  accessCode: z.string().min(1, { message: "Access code is required." }),
});

export type MechanicLoginFormValues = z.infer<typeof mechanicLoginFormSchema>;
