import { InjectionToken } from '@angular/core';

/** 取得「現在」的來源；測試時可替換為固定日期 */
export const NOW = new InjectionToken<() => Date>('NOW', {
  providedIn: 'root',
  factory: () => () => new Date(),
});
