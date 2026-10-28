import {
  formatTwd,
  paymentStatus,
  progressOf,
  sortByDate,
  sumAmounts,
  summarizeGroup,
  summarizeMember,
} from './payments.util';

const DUE = 50000;

describe('payments.util', () => {
  describe('formatTwd', () => {
    it('加上 NT$ 與千分位', () => {
      expect(formatTwd(50000)).toBe('NT$50,000');
      expect(formatTwd(350000)).toBe('NT$350,000');
      expect(formatTwd(0)).toBe('NT$0');
    });
  });

  describe('sumAmounts', () => {
    it('加總所有金額', () => {
      expect(
        sumAmounts([
          { date: '2026-11-03', amount: 20000 },
          { date: '2026-12-15', amount: 30000 },
        ]),
      ).toBe(50000);
    });

    it('沒有記錄時為 0', () => {
      expect(sumAmounts([])).toBe(0);
    });
  });

  describe('paymentStatus', () => {
    it.each([
      [0, 'unpaid'],
      [1, 'partial'],
      [49999, 'partial'],
      [50000, 'paid'],
      [50001, 'over'],
    ] as const)('已繳 %d → %s', (paid, expected) => {
      expect(paymentStatus(paid, DUE)).toBe(expected);
    });
  });

  describe('progressOf', () => {
    it('依比例計算並限制在 0～1', () => {
      expect(progressOf(0, DUE)).toBe(0);
      expect(progressOf(20000, DUE)).toBe(0.4);
      expect(progressOf(60000, DUE)).toBe(1);
    });

    it('應繳為 0 時不會除以零', () => {
      expect(progressOf(0, 0)).toBe(0);
      expect(progressOf(100, 0)).toBe(1);
    });
  });

  describe('sortByDate', () => {
    it('由舊到新排序且不修改原陣列', () => {
      const payments = [
        { date: '2026-10-20', amount: 15000 },
        { date: '2026-09-12', amount: 40000 },
      ];
      expect(sortByDate(payments).map((p) => p.date)).toEqual(['2026-09-12', '2026-10-20']);
      expect(payments[0].date).toBe('2026-10-20');
    });
  });

  describe('summarizeMember', () => {
    it('超繳時計算退還差額，進度為 1', () => {
      const summary = summarizeMember(
        {
          nickname: '阿傑',
          payments: [
            { date: '2026-10-20', amount: 15000 },
            { date: '2026-09-12', amount: 40000 },
          ],
        },
        DUE,
      );
      expect(summary).toMatchObject({
        paid: 55000,
        status: 'over',
        progress: 1,
        refund: 5000,
      });
      expect(summary.payments[0].date).toBe('2026-09-12');
    });

    it('未繳時退還差額為 0', () => {
      expect(summarizeMember({ nickname: 'Kiki', payments: [] }, DUE)).toMatchObject({
        paid: 0,
        status: 'unpaid',
        progress: 0,
        refund: 0,
      });
    });
  });

  describe('summarizeGroup', () => {
    it('計算全團總額與已繳清人數', () => {
      const group = summarizeGroup(
        [
          { nickname: 'A', payments: [{ date: '2026-09-01', amount: 50000 }] },
          { nickname: 'B', payments: [{ date: '2026-09-01', amount: 20000 }] },
          { nickname: 'C', payments: [{ date: '2026-09-01', amount: 55000 }] },
          { nickname: 'D', payments: [] },
        ],
        DUE,
      );
      expect(group).toMatchObject({
        totalPaid: 125000,
        totalDue: 200000,
        progress: 0.625,
        settledCount: 2,
        memberCount: 4,
      });
    });

    it('沒有成員時不會出錯', () => {
      expect(summarizeGroup([], DUE)).toMatchObject({ totalPaid: 0, totalDue: 0, progress: 0 });
    });
  });
});
