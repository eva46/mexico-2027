import { buildInstructions, extractOutputText, toSegments } from './ai-chat.util';
import { Itinerary } from './models';

const itinerary: Itinerary = {
  startDate: '2027-05-20',
  days: Array.from({ length: 9 }, (_, i) => ({
    day: i + 1,
    date: `2027-05-${20 + i}`,
    title: `Day ${i + 1}`,
    city: '',
    items: [],
    stay: '',
  })),
};

describe('ai-chat.util', () => {
  describe('buildInstructions', () => {
    it('行程期間內標出今天是第幾天', () => {
      const text = buildInstructions(
        { itinerary, packing: null, payments: null },
        new Date(2027, 4, 22),
      );
      expect(text).toContain('2027-05-22');
      expect(text).toContain('今天是行程第 3 天');
    });

    it('行程期間外說明不在行程內', () => {
      const text = buildInstructions(
        { itinerary, packing: null, payments: null },
        new Date(2026, 9, 29),
      );
      expect(text).toContain('今天不在行程期間內');
    });

    it('團費加總每位成員', () => {
      const text = buildInstructions(
        {
          itinerary: null,
          packing: null,
          payments: {
            due: 50000,
            members: [{ nickname: '小明', payments: [{ date: '2026-11-03', amount: 20000 }] }],
          },
        },
        new Date(2026, 9, 29),
      );
      expect(text).toContain('小明：已繳 NT$20,000／NT$50,000');
    });

    it('資料都載入失敗時提示模型', () => {
      const text = buildInstructions(
        { itinerary: null, packing: null, payments: null },
        new Date(2026, 9, 29),
      );
      expect(text).toContain('網站資料暫時無法載入');
    });
  });

  describe('extractOutputText', () => {
    it('取出 message 中的 output_text', () => {
      expect(
        extractOutputText({
          output: [
            { type: 'web_search_call' },
            { type: 'message', content: [{ type: 'output_text', text: ' 你好 ' }] },
          ],
        }),
      ).toBe('你好');
    });

    it('格式不符回傳空字串', () => {
      expect(extractOutputText(null)).toBe('');
      expect(extractOutputText({ output: 'x' })).toBe('');
    });
  });

  describe('toSegments', () => {
    it('Markdown 連結與裸網址轉為連結片段', () => {
      expect(toSegments('看 [MSN](https://msn.com/a) 或 https://b.com 吧')).toEqual([
        { text: '看 ' },
        { text: 'MSN', href: 'https://msn.com/a' },
        { text: ' 或 ' },
        { text: 'https://b.com', href: 'https://b.com' },
        { text: ' 吧' },
      ]);
    });

    it('不接受非 http(s) 連結，並移除粗體記號', () => {
      expect(toSegments('**注意** [x](javascript:alert(1))')).toEqual([
        { text: '注意 [x](javascript:alert(1))' },
      ]);
    });
  });
});
