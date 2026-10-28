import { Component, computed, inject, input } from '@angular/core';
import { daysUntil, formatShortDate } from '../../../core/date.util';
import { PackingItem as Item, PackingLevel } from '../../../core/models';
import { NOW } from '../../../core/now';
import { PackingChecks } from '../../../core/packing-checks.service';

/** 30 天內視為即將到期 */
const SOON_DAYS = 30;

type DueStatus = 'done' | 'overdue' | 'today' | 'soon' | 'normal';

interface Due {
  date: string;
  days: number;
  status: DueStatus;
}

@Component({
  selector: 'app-packing-item',
  templateUrl: './packing-item.html',
  styleUrl: './packing-item.scss',
})
export class PackingItem {
  private readonly checks = inject(PackingChecks);
  private readonly now = inject(NOW)();

  readonly item = input.required<Item>();
  readonly level = input.required<PackingLevel>();

  protected readonly checked = computed(() => this.checks.isChecked(this.item().id));
  protected readonly detailsId = computed(() =>
    this.item().note || this.due() ? `packing-${this.item().id}-details` : null,
  );

  protected readonly due = computed<Due | null>(() => {
    const { deadline } = this.item();
    const days = daysUntil(this.now, deadline);
    if (days === null) {
      return null;
    }
    return { date: formatShortDate(deadline), days, status: this.statusOf(days) };
  });

  protected toggle(event: Event): void {
    this.checks.setChecked(this.item().id, (event.target as HTMLInputElement).checked);
  }

  private statusOf(days: number): DueStatus {
    if (this.checked()) {
      return 'done';
    }
    if (days < 0) {
      return 'overdue';
    }
    if (days === 0) {
      return 'today';
    }
    return days <= SOON_DAYS ? 'soon' : 'normal';
  }
}
