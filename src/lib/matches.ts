export const FFMO_TOURNAMENT_URL = 'https://ffmo.ru/tournament43869/';
export const TIMEPAD_CLUB_URL = 'https://fczt.timepad.ru/';

export const RESULT_LABELS = {
  win: 'ПОБЕДА',
  draw: 'НИЧЬЯ',
  loss: 'ПОРАЖЕНИЕ',
} as const;

export const FALLBACK_LAST_MATCH = {
  league: 'ФФМО · Б-2 · 3 тур',
  date: new Date('2026-05-10'),
  dateText: '10 мая',
  home: { name: 'Знамя Труда', short: 'ЗНМ', score: 0 },
  away: { name: 'Сатурн-2', short: 'САТ', score: 2 },
  result: 'loss' as const,
  reportSlug: '2026-05-10-поражение-с-горьким-осадком',
};

export type MatchResult = keyof typeof RESULT_LABELS;

export const isOurTeam = (name: string) => /знамя труда/i.test(name);

export const shortTeamName = (name: string) => {
  const words = name
    .replace(/[«»"']/g, '')
    .split(/[\s\-]+/)
    .filter((w) => w && !/^фк$/i.test(w));
  if (words.length >= 2) return words.map((w) => w[0]).join('').toUpperCase().slice(0, 4);
  return (words[0] || name).slice(0, 3).toUpperCase();
};

export const formatMatchDateShort = (date: Date): string => {
  const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

export const formatMatchDateFull = (date: Date): string => {
  const days = ['вс','пн','вт','ср','чт','пт','сб'];
  return `${formatMatchDateShort(date)} ${date.getFullYear()} · ${days[date.getDay()]}`;
};

export const matchTimeValue = (date: Date, time?: string): number => {
  const d = new Date(date);
  const [h = '0', m = '0'] = (time || '00:00').split(':');
  d.setHours(Number(h), Number(m), 0, 0);
  return d.getTime();
};

export const inferResult = (
  homeName: string,
  awayName: string,
  homeScore?: number | null,
  awayScore?: number | null,
): MatchResult | null => {
  if (homeScore == null || awayScore == null) return null;
  if (homeScore === awayScore) return 'draw';
  const ourScore = isOurTeam(homeName) ? homeScore : isOurTeam(awayName) ? awayScore : homeScore;
  const opponentScore = isOurTeam(homeName) ? awayScore : isOurTeam(awayName) ? homeScore : awayScore;
  return ourScore > opponentScore ? 'win' : 'loss';
};

export const reportHref = (base: string, slug?: string) => {
  if (!slug) return '';
  if (slug.startsWith('http') || slug.startsWith('/')) return slug;
  return `${base}/news/${slug}/`;
};
