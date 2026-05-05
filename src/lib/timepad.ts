/**
 * Клиент TimePad API. Тянет ближайший матч ФК «Знамя Труда».
 *
 * Токен и ID орги — в env-переменных TIMEPAD_TOKEN, TIMEPAD_ORG_ID.
 * Если их нет (например, на CI без секретов) — возвращаем null,
 * Match.astro подставит fallback-данные.
 */

export interface TimepadEvent {
  id: number;
  name: string;
  startsAt: Date;
  url: string;
  posterUrl: string | null;
  location: {
    city: string;
    address: string;
  };
  descriptionShort: string;
}

const API_BASE = 'https://api.timepad.ru/v1';

export async function fetchUpcomingEvents(): Promise<TimepadEvent[]> {
  // На сервере (build-time) берём из process.env. Если нет — пропускаем,
  // чтобы Match.astro отрисовался на fallback-данных.
  const token = process.env.TIMEPAD_TOKEN;
  const orgId = process.env.TIMEPAD_ORG_ID;

  if (!token || !orgId) {
    console.warn('[timepad] TIMEPAD_TOKEN или TIMEPAD_ORG_ID не заданы — пропускаю');
    return [];
  }

  const params = new URLSearchParams({
    organization_ids: String(orgId),
    limit: '10',
    sort: '+starts_at',
    starts_at_min: new Date().toISOString(),
    fields: 'id,name,starts_at,location,description_short,poster_image,url',
  });

  try {
    const res = await fetch(`${API_BASE}/events?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.warn(`[timepad] API вернул ${res.status}`);
      return [];
    }
    const data = await res.json();
    return (data.values ?? []).map(parseEvent);
  } catch (e) {
    console.warn('[timepad] fetch fail:', e);
    return [];
  }
}

export async function fetchNextEvent(): Promise<TimepadEvent | null> {
  const events = await fetchUpcomingEvents();
  return events[0] ?? null;
}

function parseEvent(raw: any): TimepadEvent {
  return {
    id: raw.id,
    name: raw.name,
    startsAt: new Date(raw.starts_at),
    url: raw.url,
    posterUrl: raw.poster_image?.default_url ?? null,
    location: {
      city: raw.location?.city ?? '',
      address: raw.location?.address ?? '',
    },
    descriptionShort: raw.description_short ?? '',
  };
}

/** Парсит «Знамя Труда» – «Сатурн-2» → home/away. */
export function parseMatchTeams(name: string): { home: string; away: string } | null {
  const m = name.match(/«([^»]+)»\s*[–—-]\s*«([^»]+)»/);
  if (!m) return null;
  return { home: m[1], away: m[2] };
}

/**
 * Определяет, домашний ли матч для «Знамени Труда»
 * (по названию команды или по адресу).
 */
export function isHomeMatch(event: TimepadEvent): boolean {
  const teams = parseMatchTeams(event.name);
  if (teams && /знамя труда/i.test(teams.home)) return true;
  // По адресу/городу: Орехово-Зуево — наш стадион
  return /орехово/i.test(event.location.city);
}

/** Форматирование даты: "11 мая 2026 · вс" */
export function formatMatchDate(date: Date): string {
  const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  const days = ['вс','пн','вт','ср','чт','пт','сб'];
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  const w = days[date.getDay()];
  return `${d} ${m} ${y} · ${w}`;
}

/** Время "14:00" в МСК */
export function formatMatchTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow',
  });
}
