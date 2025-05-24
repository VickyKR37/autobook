// use server'

/**
 * @fileOverview Implements an AI flow that suggests potential failure points for a car based on its repair history and common issues found online.
 *
 * - suggestFailurePoints - A function that suggests potential failure points.
 * - SuggestFailurePointsInput - The input type for the suggestFailurePoints function.
 * - SuggestFailurePointsOutput - The output type for the suggestFailurePoints function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFailurePointsInputSchema = z.object({
  vehicleMake: z.string().describe('The make of the vehicle.'),
  vehicleModel: z.string().describe('The model of the vehicle.'),
  vehicleYear: z.number().describe('The year of the vehicle.'),
  repairHistory: z.string().describe('The repair history of the vehicle.'),
});
export type SuggestFailurePointsInput = z.infer<typeof SuggestFailurePointsInputSchema>;

const SuggestFailurePointsOutputSchema = z.object({
  suggestedFailurePoints: z
    .string()
    .describe(
      'A list of potential failure points to inspect, based on repair history and common issues.'
    ),
});
export type SuggestFailurePointsOutput = z.infer<typeof SuggestFailurePointsOutputSchema>;

export async function suggestFailurePoints(
  input: SuggestFailurePointsInput
): Promise<SuggestFailurePointsOutput> {
  return suggestFailurePointsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFailurePointsPrompt',
  input: {schema: SuggestFailurePointsInputSchema},
  output: {schema: SuggestFailurePointsOutputSchema},
  prompt: `You are an expert mechanic specializing in diagnosing vehicle issues.

  Based on the vehicle's make, model, year, and repair history, suggest potential failure points to inspect.
  Also incorporate common issues found online for this vehicle.

  Vehicle Make: {{{vehicleMake}}}
  Vehicle Model: {{{vehicleModel}}}
  Vehicle Year: {{{vehicleYear}}}
  Repair History: {{{repairHistory}}}

  Suggest potential failure points to inspect:
  `,
});

const suggestFailurePointsFlow = ai.defineFlow(
  {
    name: 'suggestFailurePointsFlow',
    inputSchema: SuggestFailurePointsInputSchema,
    outputSchema: SuggestFailurePointsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
