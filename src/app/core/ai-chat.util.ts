// AI 助理用的純函式：組系統提示、解析 API 回應、把回覆切成可安全綁定的文字／連結片段。

import { formatShortDate, toIsoDate, tripDayOf } from './date.util';
import { Itinerary, Packing, Payments } from './models';
import { formatTwd, summarizeGroup } from './payments.util';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  text: string;
}

export interface SiteContext {
  itinerary: Itinerary | null;
  packing: Packing | null;
  payments: Payments | null;
}

/** 回覆中的一段：純文字，或帶 `href` 的連結 */
export interface TextSegment {
  text: string;
  href?: string;
}

/** 組出給模型的系統提示：角色設定＋今天日期＋網站三份資料 */
export function buildInstructions(context: SiteContext, today: Date): string {
  const lines = [
    '你是「MEXICO 2027」7 人墨西哥自由行網站的 AI 旅遊小幫手。',
    '一律使用繁體中文，回答簡潔、條列清楚，適合手機閱讀；不要使用 Markdown 標題或表格。',
    '關於行程、攜帶物品、團費的問題，只根據下方「網站資料」回答；資料沒有的就直說不知道，不要編造。',
    '需要即時或網站以外的資訊（例如餐廳推薦、天氣、交通、營業時間）時，請上網搜尋並附上來源連結。',
    '使用者說「今天」「明天」時，以下方的今天日期換算成行程的第幾天。',
    '',
    `今天日期（使用者裝置）：${toIsoDate(today)} ${formatShortDate(toIsoDate(today))}`,
  ];

  const { itinerary, packing, payments } = context;

  if (itinerary) {
    const tripDay = tripDayOf(today, itinerary.startDate, itinerary.days.length);
    lines.push(
      tripDay
        ? `今天是行程第 ${tripDay} 天（Day ${tripDay}）。`
        : `今天不在行程期間內（行程為 ${itinerary.days[0]?.date} ～ ${itinerary.days.at(-1)?.date}）。`,
    );
  }

  lines.push('', '# 網站資料');

  if (itinerary) {
    lines.push('## 行程（空字串代表未填）', JSON.stringify(itinerary.days));
  }
  if (packing) {
    lines.push('## 攜帶物品（deadline 為準備期限）', JSON.stringify(packing.categories));
  }
  if (payments) {
    const group = summarizeGroup(payments.members, payments.due);
    lines.push(
      '## 團費',
      `每人應繳 ${formatTwd(group.due)}；全團已繳 ${formatTwd(group.totalPaid)}／應繳 ${formatTwd(group.totalDue)}。`,
      ...group.members.map(
        (m) =>
          `- ${m.nickname}：已繳 ${formatTwd(m.paid)}／${formatTwd(m.due)}` +
          (m.payments.length
            ? `（${m.payments.map((p) => `${p.date} ${formatTwd(p.amount)}`).join('、')}）`
            : '（尚無繳費記錄）'),
      ),
    );
  }

  if (!itinerary && !packing && !payments) {
    lines.push('（網站資料暫時無法載入，請告知使用者稍後再試。）');
  }

  return lines.join('\n');
}

interface ResponsesApiOutput {
  type?: string;
  content?: { type?: string; text?: string }[];
}

/** 從 `/v1/responses` 的回應取出所有 `output_text`；格式不符時回傳空字串 */
export function extractOutputText(response: unknown): string {
  const output = (response as { output?: unknown } | null)?.output;
  if (!Array.isArray(output)) {
    return '';
  }
  return (output as ResponsesApiOutput[])
    .filter((item) => item.type === 'message')
    .flatMap((item) => item.content ?? [])
    .filter((part) => part.type === 'output_text' && typeof part.text === 'string')
    .map((part) => part.text)
    .join('')
    .trim();
}

// [文字](https://…) 或裸網址
const LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>()（）]+)/g;

/**
 * 把模型回覆切成文字與連結片段，讓模板以 `{{ }}` 綁定（禁止 innerHTML）。
 * 只接受 http(s) 連結，並移除 Markdown 粗體記號 `**`。
 */
export function toSegments(text: string): TextSegment[] {
  const clean = text.replace(/\*\*/g, '');
  const segments: TextSegment[] = [];
  let last = 0;
  for (const match of clean.matchAll(LINK)) {
    const index = match.index ?? 0;
    if (index > last) {
      segments.push({ text: clean.slice(last, index) });
    }
    const [, label, mdHref, bareHref] = match;
    segments.push(mdHref ? { text: label, href: mdHref } : { text: bareHref, href: bareHref });
    last = index + match[0].length;
  }
  if (last < clean.length) {
    segments.push({ text: clean.slice(last) });
  }
  return segments;
}
