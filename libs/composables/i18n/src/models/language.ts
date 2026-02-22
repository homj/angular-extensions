import { z } from 'zod';

export const LanguageSchema = z.string().brand('Language');
export type Language = z.infer<typeof LanguageSchema>;
