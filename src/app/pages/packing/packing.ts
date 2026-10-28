import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DataService } from '../../core/data.service';
import { PackingLevel } from '../../core/models';
import { PackingChecks } from '../../core/packing-checks.service';
import { PackingCategory } from './packing-category/packing-category';

/** 極度重要置頂，其餘依序排列，不受 JSON 順序影響 */
const LEVEL_ORDER: Record<PackingLevel, number> = { critical: 0, recommended: 1, other: 2 };

@Component({
  selector: 'app-packing-page',
  imports: [PackingCategory],
  templateUrl: './packing.html',
  styleUrl: './packing.scss',
})
export class PackingPage {
  private readonly data = inject(DataService);
  private readonly checks = inject(PackingChecks);

  protected readonly packing = rxResource({ stream: () => this.data.getPacking() });

  protected readonly categories = computed(() =>
    [...(this.packing.value()?.categories ?? [])].sort(
      (a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level],
    ),
  );

  private readonly ids = computed(() =>
    this.categories().flatMap((category) => category.items.map((item) => item.id)),
  );

  protected readonly total = computed(() => this.ids().length);
  protected readonly checkedCount = computed(() => this.checks.countChecked(this.ids()));
}
