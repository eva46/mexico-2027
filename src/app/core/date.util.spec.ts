import {
  daysUntil,
  formatFullDate,
  formatShortDate,
  padDay,
  parseDayParam,
  parseIsoDate,
  resolveInitialDay,
  toIsoDate,
  tripDayOf,
} from './date.util';

const START = '2027-05-20';
const TOTAL = 9;

/** 以本地時間建構，避免 UTC 解析造成的時差 */
function local(year: number, month: number, day: number, hour = 12, minute = 0): Date {
  return new Date(year, month - 1, day, hour, minute);
}

describe('date.util', () => {
  describe('parseIsoDate', () => {
    it('解析為本地午夜', () => {
      const date = parseIsoDate('2027-05-20');
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2027);
      expect(date!.getMonth()).toBe(4);
      expect(date!.getDate()).toBe(20);
      expect(date!.getHours()).toBe(0);
    });

    it.each(['', '2027-5-20', '2027/05/20', '2027-02-30', '2027-13-01', 'abc'])(
      '不合法的 "%s" 回傳 null',
      (value) => {
        expect(parseIsoDate(value)).toBeNull();
      },
    );
  });

  describe('toIsoDate', () => {
    it('使用本地日期並補零', () => {
      expect(toIsoDate(local(2027, 5, 2))).toBe('2027-05-02');
    });

    it('深夜時間不會跳到隔天', () => {
      expect(toIsoDate(local(2027, 5, 20, 23, 59))).toBe('2027-05-20');
    });
  });

  describe('tripDayOf', () => {
    it('行前回傳 null', () => {
      expect(tripDayOf(local(2027, 5, 19, 23, 59), START, TOTAL)).toBeNull();
      expect(tripDayOf(local(2026, 10, 29), START, TOTAL)).toBeNull();
    });

    it('第一天回傳 1（清晨與深夜皆同）', () => {
      expect(tripDayOf(local(2027, 5, 20, 0, 0), START, TOTAL)).toBe(1);
      expect(tripDayOf(local(2027, 5, 20, 23, 59), START, TOTAL)).toBe(1);
    });

    it('中間某天：5/22 → 3', () => {
      expect(tripDayOf(local(2027, 5, 22), START, TOTAL)).toBe(3);
    });

    it('最後一天回傳 9', () => {
      expect(tripDayOf(local(2027, 5, 28, 23, 59), START, TOTAL)).toBe(9);
    });

    it('行程結束後回傳 null', () => {
      expect(tripDayOf(local(2027, 5, 29, 0, 0), START, TOTAL)).toBeNull();
      expect(tripDayOf(local(2028, 5, 22), START, TOTAL)).toBeNull();
    });

    it('startDate 不合法回傳 null', () => {
      expect(tripDayOf(local(2027, 5, 22), 'bad', TOTAL)).toBeNull();
    });
  });

  describe('daysUntil', () => {
    it('期限前回傳剩餘天數（忽略時分）', () => {
      expect(daysUntil(local(2026, 10, 29, 23, 59), '2026-12-20')).toBe(52);
    });

    it('當天回傳 0', () => {
      expect(daysUntil(local(2027, 2, 20, 0, 0), '2027-02-20')).toBe(0);
      expect(daysUntil(local(2027, 2, 20, 23, 59), '2027-02-20')).toBe(0);
    });

    it('已過期限回傳負數', () => {
      expect(daysUntil(local(2027, 2, 21), '2027-02-20')).toBe(-1);
    });

    it('跨年與閏年計算正確', () => {
      expect(daysUntil(local(2027, 12, 31), '2028-03-01')).toBe(61);
    });

    it.each(['', 'bad', '2027-02-30'])('不合法的 "%s" 回傳 null', (value) => {
      expect(daysUntil(local(2027, 2, 20), value)).toBeNull();
    });
  });

  describe('parseDayParam', () => {
    it.each([
      ['1', 1],
      ['3', 3],
      ['9', 9],
      ['03', 3],
    ])('"%s" → %d', (value, expected) => {
      expect(parseDayParam(value, TOTAL)).toBe(expected);
    });

    it.each([null, undefined, '', '0', '10', '-1', '2.5', '3a', ' 3', 'abc'])(
      '不合法的 %j 回傳 null',
      (value) => {
        expect(parseDayParam(value, TOTAL)).toBeNull();
      },
    );
  });

  describe('resolveInitialDay', () => {
    const resolve = (dayParam: string | null, today: Date) =>
      resolveInitialDay({ dayParam, today, startDate: START, totalDays: TOTAL });

    it('網址參數優先於今天日期', () => {
      expect(resolve('7', local(2027, 5, 22))).toBe(7);
    });

    it('網址參數不合法時改用今天日期', () => {
      expect(resolve('99', local(2027, 5, 22))).toBe(3);
    });

    it('行前 → Day 1', () => {
      expect(resolve(null, local(2026, 10, 29))).toBe(1);
    });

    it('第一天 → Day 1', () => {
      expect(resolve(null, local(2027, 5, 20))).toBe(1);
    });

    it('中間某天 5/22 → Day 3', () => {
      expect(resolve(null, local(2027, 5, 22))).toBe(3);
    });

    it('最後一天 → Day 9', () => {
      expect(resolve(null, local(2027, 5, 28))).toBe(9);
    });

    it('行程結束後 → Day 1', () => {
      expect(resolve(null, local(2027, 5, 29))).toBe(1);
    });
  });

  describe('formatShortDate', () => {
    it('含星期', () => {
      expect(formatShortDate('2027-05-20')).toBe('5/20（四）');
      expect(formatShortDate('2027-05-23')).toBe('5/23（日）');
    });

    it('不合法時原樣回傳', () => {
      expect(formatShortDate('bad')).toBe('bad');
    });
  });

  describe('formatFullDate', () => {
    it('含年份與星期', () => {
      expect(formatFullDate('2026-09-03')).toBe('2026/9/3（四）');
    });

    it('不合法時原樣回傳', () => {
      expect(formatFullDate('bad')).toBe('bad');
    });
  });

  describe('padDay', () => {
    it('補零為兩位數', () => {
      expect(padDay(3)).toBe('03');
      expect(padDay(12)).toBe('12');
    });
  });
});
