import { Component, computed, inject, input } from '@angular/core';
import { PackingCategory as Category, PackingLevel } from '../../../core/models';
import { PackingChecks } from '../../../core/packing-checks.service';
import { PackingItem } from '../packing-item/packing-item';

const CAPTIONS: Record<PackingLevel, string> = {
  critical: 'Must have',
  recommended: 'Recommended',
  other: 'Others',
};

@Component({
  selector: 'app-packing-category',
  imports: [PackingItem],
  templateUrl: './packing-category.html',
  styleUrl: './packing-category.scss',
})
export class PackingCategory {
  private readonly checks = inject(PackingChecks);

  readonly category = input.required<Category>();

  protected readonly caption = computed(() => CAPTIONS[this.category().level]);
  protected readonly headingId = computed(() => `packing-${this.category().level}-heading`);
  protected readonly checkedCount = computed(() =>
    this.checks.countChecked(this.category().items.map((item) => item.id)),
  );
}
