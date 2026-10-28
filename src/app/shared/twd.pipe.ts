import { Pipe, PipeTransform } from '@angular/core';
import { formatTwd } from '../core/payments.util';

/** `{{ 50000 | twd }}` → `NT$50,000` */
@Pipe({ name: 'twd' })
export class TwdPipe implements PipeTransform {
  transform(amount: number): string {
    return formatTwd(amount);
  }
}
