// 費用計算（純函式）。所有金額皆為新台幣整數。

import { Member, Payment } from './models';

/** 未繳（0 元）／部分繳交／已繳清（= 應繳）／超繳（> 應繳） */
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'over';

export interface MemberSummary {
  nickname: string;
  paid: number;
  due: number;
  status: PaymentStatus;
  /** 0～1，超繳時為 1 */
  progress: number;
  /** 超繳需退還的差額；未超繳為 0 */
  refund: number;
  /** 依日期由舊到新 */
  payments: Payment[];
}

export interface GroupSummary {
  due: number;
  totalPaid: number;
  totalDue: number;
  /** 0～1 */
  progress: number;
  /** 已繳清或超繳的人數 */
  settledCount: number;
  memberCount: number;
  members: MemberSummary[];
}

const twd = new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 0 });

/** `50000` → `50,000` */
export function formatAmount(amount: number): string {
  return twd.format(amount);
}

/** `50000` → `NT$50,000` */
export function formatTwd(amount: number): string {
  return `NT$${formatAmount(amount)}`;
}

export function sumAmounts(payments: readonly Payment[]): number {
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
}

export function paymentStatus(paid: number, due: number): PaymentStatus {
  if (paid <= 0) {
    return 'unpaid';
  }
  if (paid < due) {
    return 'partial';
  }
  return paid === due ? 'paid' : 'over';
}

/** 已繳比例，限制在 0～1 */
export function progressOf(paid: number, due: number): number {
  if (due <= 0) {
    return paid > 0 ? 1 : 0;
  }
  return Math.min(Math.max(paid / due, 0), 1);
}

/** 依日期由舊到新排序（`YYYY-MM-DD` 可直接以字串比較），不修改原陣列 */
export function sortByDate(payments: readonly Payment[]): Payment[] {
  return [...payments].sort((a, b) => a.date.localeCompare(b.date));
}

export function summarizeMember(member: Member, due: number): MemberSummary {
  const paid = sumAmounts(member.payments);
  return {
    nickname: member.nickname,
    paid,
    due,
    status: paymentStatus(paid, due),
    progress: progressOf(paid, due),
    refund: Math.max(paid - due, 0),
    payments: sortByDate(member.payments),
  };
}

export function summarizeGroup(members: readonly Member[], due: number): GroupSummary {
  const summaries = members.map((member) => summarizeMember(member, due));
  const totalPaid = summaries.reduce((sum, member) => sum + member.paid, 0);
  const totalDue = due * summaries.length;
  return {
    due,
    totalPaid,
    totalDue,
    progress: progressOf(totalPaid, totalDue),
    settledCount: summaries.filter((m) => m.status === 'paid' || m.status === 'over').length,
    memberCount: summaries.length,
    members: summaries,
  };
}
