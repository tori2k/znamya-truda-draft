export const FFMO_TOURNAMENT_URL = 'https://ffmo.ru/tournament43869/';
export const TIMEPAD_CLUB_URL = 'https://fczt.timepad.ru/';

export const RESULT_LABELS = {
  win: 'ПОБЕДА',
  draw: 'НИЧЬЯ',
  loss: 'ПОРАЖЕНИЕ',
} as const;

export const lastMatch = {
  league: 'ФФМО · Б-2 · 3 тур',
  date: '2026-05-10',
  dateText: '10 мая',
  home: { name: 'Знамя Труда', short: 'ЗНМ', score: 0 },
  away: { name: 'Сатурн-2', short: 'САТ', score: 2 },
  result: 'loss' as const,
  reportSlug: '2026-05-10-поражение-с-горьким-осадком',
};

export const lastMatches = [lastMatch] as const;
