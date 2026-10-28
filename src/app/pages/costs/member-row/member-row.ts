import { Component, computed, input, signal } from '@angular/core';
import { formatFullDate } from '../../../core/date.util';
import { MemberSummary, PaymentStatus } from '../../../core/payments.util';
import { TwdPipe } from '../../../shared/twd.pipe';

const STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: '未繳',
  partial: '部分繳交',
  paid: '已繳清',
  over: '超繳',
};

@Component({
  selector: 'app-member-row',
  imports: [TwdPipe],
  templateUrl: './member-row.html',
  styleUrl: './member-row.scss',
})
export class MemberRow {
  readonly member = input.required<MemberSummary>();
  /** 用於產生唯一的 aria-controls id */
  readonly index = input.required<number>();

  protected readonly open = signal(false);
  protected readonly detailsId = computed(() => `member-${this.index()}-details`);
  protected readonly statusLabel = computed(() => STATUS_LABELS[this.member().status]);

  protected toggle(): void {
    this.open.update((value) => !value);
  }

  protected date(iso: string): string {
    return formatFullDate(iso);
  }
}
