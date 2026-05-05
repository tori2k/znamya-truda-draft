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

// Картинки храним как обычные строки-URL вида "/news/file.jpg" —
// это формат, который сохраняет Decap CMS. На странице рендерим через
// обычный <img>, не через Astro <Image> (без оптимизации, но совместимо
// с любыми путями: и /news/..., и /team/..., и старыми ../../../public/...).
//
// Чтобы починить старые .md, где photo был относительным "../../../public/team/...",
// нормализуем в строку без префикса.
const normalizePath = (val: unknown): string | undefined => {
  if (typeof val !== 'string') return undefined;
  if (!val) return undefined;
  // Старый формат: ../../../public/team/file.jpg → /team/file.jpg
  const m = val.match(/public\/(.+)$/);
  if (m) return `/${m[1]}`;
  // Уже абсолютный путь от корня сайта
  if (val.startsWith('/')) return val;
  return val;
};

const imagePath = z.preprocess(normalizePath, z.string().optional());

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(NEWS_CATEGORIES),
    excerpt: z.string(),
    image: imagePath,
    featured: z.boolean().default(false),
    score: z.string().optional(),
  }),
});

const squad = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/squad' }),
  schema: z.object({
    number: z.number().int().nullable().default(null),
    lastName: z.string(),
    firstName: z.string(),
    age: z.number().int().min(14).max(50),
    role: z.enum(ROLES),
    photo: imagePath,
    order: z.number().int().default(100),
    showName: z.boolean().default(false),
  }),
});

const staff = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/staff' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    photo: imagePath,
    bio: z.string().optional(),
    order: z.number().int().default(100),
  }),
});

export const collections = { news, squad, staff };
export { NEWS_CATEGORIES, ROLES };
