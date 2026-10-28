import { Component, computed, input } from '@angular/core';
import { formatAmount, GroupSummary } from '../../../core/payments.util';
import { TwdPipe } from '../../../shared/twd.pipe';

@Component({
  selector: 'app-costs-summary',
  imports: [TwdPipe],
  templateUrl: './costs-summary.html',
  styleUrl: './costs-summary.scss',
})
export class CostsSummary {
  readonly group = input.required<GroupSummary>();

  protected readonly percent = computed(() => Math.floor(this.group().progress * 100));

  protected amount(value: number): string {
    return formatAmount(value);
  }
}
