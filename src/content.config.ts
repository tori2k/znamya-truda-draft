import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const NEWS_CATEGORIES = [
  'Матчи',
  'Клуб',
  'Команда',
  'Партнёры',
  'Анонсы',
] as const;

const ROLES = ['Вратарь', 'Защитник', 'Полузащитник', 'Нападающий'] as const;

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      category: z.enum(NEWS_CATEGORIES),
      excerpt: z.string(),
      image: image().optional(),
      featured: z.boolean().default(false),
      score: z.string().optional(),
    }),
});

const squad = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/squad' }),
  schema: ({ image }) =>
    z.object({
      // sortKey — по нему сортируется список (число номер; null = в конце)
      number: z.number().int().nullable().default(null),
      lastName: z.string(),
      firstName: z.string(),
      age: z.number().int().min(14).max(50),
      role: z.enum(ROLES),
      photo: image().optional(),
      // order — для ручной перестановки внутри одной роли (опционально)
      order: z.number().int().default(100),
    }),
});

const staff = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/staff' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      photo: image().optional(),
      bio: z.string().optional(),
      order: z.number().int().default(100),
    }),
});

export const collections = { news, squad, staff };
export { NEWS_CATEGORIES, ROLES };
