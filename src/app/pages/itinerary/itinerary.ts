import { Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { DataService } from '../../core/data.service';
import { resolveInitialDay } from '../../core/date.util';
import { NOW } from '../../core/now';
import { DayHero } from './day-hero/day-hero';
import { DayItems } from './day-items/day-items';
import { DayPicker } from './day-picker/day-picker';

@Component({
  selector: 'app-itinerary-page',
  imports: [DayPicker, DayHero, DayItems],
  templateUrl: './itinerary.html',
  styleUrl: './itinerary.scss',
})
export class ItineraryPage {
  private readonly data = inject(DataService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly now = inject(NOW)();

  protected readonly itinerary = rxResource({ stream: () => this.data.getItinerary() });

  private readonly dayParam = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('day'))),
  );

  protected readonly days = computed(() => this.itinerary.value()?.days ?? []);

  /** 網址的 ?day=N 為唯一狀態來源；沒有或不合法時依今天日期決定 */
  private readonly selectedDay = computed(() => {
    const data = this.itinerary.value();
    if (!data) {
      return 1;
    }
    return resolveInitialDay({
      dayParam: this.dayParam(),
      today: this.now,
      startDate: data.startDate,
      totalDays: data.days.length,
    });
  });

  protected readonly currentDay = computed(
    () => this.days().find((d) => d.day === this.selectedDay()) ?? this.days()[0],
  );

  protected selectDay(day: number): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { day },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
