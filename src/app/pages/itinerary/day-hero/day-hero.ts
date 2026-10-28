import { Component, computed, input } from '@angular/core';
import { formatShortDate, padDay } from '../../../core/date.util';
import { ItineraryDay } from '../../../core/models';

@Component({
  selector: 'app-day-hero',
  templateUrl: './day-hero.html',
  styleUrl: './day-hero.scss',
})
export class DayHero {
  readonly day = input.required<ItineraryDay>();

  protected readonly dayNumber = computed(() => padDay(this.day().day));
  protected readonly date = computed(() => formatShortDate(this.day().date));
}
