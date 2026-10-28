import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DataService } from '../../core/data.service';
import { summarizeGroup } from '../../core/payments.util';
import { CostsSummary } from './costs-summary/costs-summary';
import { MemberRow } from './member-row/member-row';

@Component({
  selector: 'app-costs-page',
  imports: [CostsSummary, MemberRow],
  templateUrl: './costs.html',
  styleUrl: './costs.scss',
})
export class CostsPage {
  private readonly data = inject(DataService);

  protected readonly payments = rxResource({ stream: () => this.data.getPayments() });

  protected readonly group = computed(() => {
    const data = this.payments.value();
    return data ? summarizeGroup(data.members, data.due) : null;
  });
}
