// Cloudflare Worker — прокси для TimePad API.
//
// Зачем: GitHub Actions блокируется на стороне TimePad (403 Forbidden).
// Этот Worker делает запрос с IP Cloudflare, токен живёт в Secrets.
//
// Деплой:
//   1. https://dash.cloudflare.com → Workers & Pages → Create Worker
//   2. Назови, например, "timepad-znamya"
//   3. Quick Edit → вставь содержимое этого файла → Save and Deploy
//   4. Settings → Variables → Add Secret:
//        Name: TIMEPAD_TOKEN
//        Value: <твой токен>
//      Add Secret:
//        Name: TIMEPAD_ORG_ID
//        Value: 301061
//      Add Variable (не secret):
//        Name: ALLOWED_ORIGIN
//        Value: https://tori2k.github.io
//   5. Settings → Triggers → запомни URL вида
//      https://timepad-znamya.<your-subdomain>.workers.dev
//
// Использование с фронта/CI:
//   GET https://timepad-znamya.<...>.workers.dev/events?limit=10
//   (никаких заголовков авторизации — прокси сам подставит токен)

const TIMEPAD_API = 'https://api.timepad.ru/v1';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Простая защита от случайного использования: только GET, только /events
    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed' }, 405);
    }
    if (!url.pathname.startsWith('/events')) {
      return json({ error: 'Only /events is proxied' }, 404);
    }

    if (!env.TIMEPAD_TOKEN || !env.TIMEPAD_ORG_ID) {
      return json({ error: 'Worker is missing TIMEPAD_TOKEN or TIMEPAD_ORG_ID' }, 500);
    }

    // Прокидываем все query-параметры клиента, дополняем org_id и стандартными полями
    const params = new URLSearchParams(url.search);
    if (!params.has('organization_ids')) {
      params.set('organization_ids', env.TIMEPAD_ORG_ID);
    }
    if (!params.has('limit')) {
      params.set('limit', '10');
    }
    if (!params.has('sort')) {
      params.set('sort', '+starts_at');
    }
    if (!params.has('starts_at_min')) {
      params.set('starts_at_min', new Date().toISOString());
    }
    if (!params.has('fields')) {
      params.set('fields', 'id,name,starts_at,location,description_short,poster_image,url');
    }

    try {
      const upstream = await fetch(`${TIMEPAD_API}/events?${params}`, {
        headers: {
          Authorization: `Bearer ${env.TIMEPAD_TOKEN}`,
          'User-Agent': 'znamya-truda-site/1.0',
        },
      });

      const body = await upstream.text();
      return new Response(body, {
        status: upstream.status,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=300',  // 5 минут кэша на стороне CF
          'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
        },
      });
    } catch (e) {
      return json({ error: 'Upstream fetch failed', detail: String(e) }, 502);
    }
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
