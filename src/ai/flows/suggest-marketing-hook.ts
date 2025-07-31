'use server';

/**
 * @fileOverview An AI agent that suggests a relevant marketing hook or call to action based on the URL.
 *
 * - suggestMarketingHook - A function that suggests a marketing hook for a given URL.
 * - SuggestMarketingHookInput - The input type for the suggestMarketingHook function.
 * - SuggestMarketingHookOutput - The return type for the suggestMarketingHook function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMarketingHookInputSchema = z.object({
  url: z.string().url().describe('The URL to generate a marketing hook for.'),
});
export type SuggestMarketingHookInput = z.infer<typeof SuggestMarketingHookInputSchema>;

const SuggestMarketingHookOutputSchema = z.object({
  hook: z.string().describe('A relevant marketing hook or call to action for the given URL.'),
});
export type SuggestMarketingHookOutput = z.infer<typeof SuggestMarketingHookOutputSchema>;

export async function suggestMarketingHook(input: SuggestMarketingHookInput): Promise<SuggestMarketingHookOutput> {
  return suggestMarketingHookFlow(input);
}

const suggestMarketingHookPrompt = ai.definePrompt({
  name: 'suggestMarketingHookPrompt',
  input: {schema: SuggestMarketingHookInputSchema},
  output: {schema: SuggestMarketingHookOutputSchema},
  prompt: `You are an expert marketing copywriter. Your job is to generate a short, compelling marketing hook or call to action for a given URL.

Given the following URL:

{{url}}

Suggest a marketing hook.`,
});

const suggestMarketingHookFlow = ai.defineFlow(
  {
    name: 'suggestMarketingHookFlow',
    inputSchema: SuggestMarketingHookInputSchema,
    outputSchema: SuggestMarketingHookOutputSchema,
  },
  async input => {
    const {output} = await suggestMarketingHookPrompt(input);
    return output!;
  }
);
