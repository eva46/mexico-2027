// Cloudflare Worker：GitHub Pages 前端 → 本 Worker → LLM gateway。
// 作用：1) API Key 只存在 Worker secret，不會出現在前端或 repo；2) 加上 CORS（gateway 本身不允許瀏覽器直接呼叫）。
//
// 部署（只需一次）：
//   cd worker
//   npx wrangler login
//   npx wrangler secret put GATEWAY_API_KEY      # 貼上 lg_xxx
//   npx wrangler deploy
// 再把印出的網址＋`/v1/responses` 填到 src/app/core/ai-chat.service.ts 的 AI_ENDPOINT。
// 網頁後台部署時：Settings → Variables and Secrets 需新增 ALLOWED_ORIGINS（Text）與 GATEWAY_API_KEY（Secret）。

const GATEWAY = 'https://llm-gateway-api.jhweb.workers.dev/v1/responses';
const MODEL = 'deepseek-v4.1-flash';
const MAX_BODY_BYTES = 200_000;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';
    const allowed = (env.ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
    const cors = {
      'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : (allowed[0] ?? ''),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    };

    if (!allowed.length || !env.GATEWAY_API_KEY) {
      return json({ error: 'Worker 尚未設定 ALLOWED_ORIGINS 或 GATEWAY_API_KEY' }, 500, cors);
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (new URL(request.url).pathname !== '/v1/responses' || request.method !== 'POST') {
      return json({ error: 'Not found' }, 404, cors);
    }
    // 只是擋掉其他網站的瀏覽器呼叫，無法阻止有心人直接打 API；gateway 端的用量上限仍是最後防線
    if (!allowed.includes(origin)) {
      return json({ error: 'Forbidden origin' }, 403, cors);
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ error: 'Request too large' }, 413, cors);
    }
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ error: 'Invalid JSON' }, 400, cors);
    }

    // 只轉送需要的欄位，並固定模型，避免被拿去呼叫其他（較貴的）模型
    const upstream = await fetch(GATEWAY, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.GATEWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        instructions: body.instructions,
        input: body.input,
        web_search: { mode: body.web_search?.mode === 'off' ? 'off' : 'auto' },
      }),
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  },
};

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}
