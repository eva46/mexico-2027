import { Component, input } from '@angular/core';
import { ItineraryItem } from '../../../core/models';

@Component({
  selector: 'app-day-items',
  templateUrl: './day-items.html',
  styleUrl: './day-items.scss',
})
export class DayItems {
  readonly items = input.required<ItineraryItem[]>();
}
