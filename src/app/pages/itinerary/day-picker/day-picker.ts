import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { formatShortDate } from '../../../core/date.util';
import { ItineraryDay } from '../../../core/models';

/**
 * 日期下拉選單（disclosure 模式）：平時只顯示目前日期，點擊才展開。
 * 鍵盤：↓ 展開、↑↓ Home End 移動、Esc 收合並回到按鈕；點擊外部或焦點離開自動收合。
 */
@Component({
  selector: 'app-day-picker',
  templateUrl: './day-picker.html',
  styleUrl: './day-picker.scss',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(focusout)': 'onFocusOut($event)',
    '(keydown.escape)': 'closeAndRestoreFocus()',
    '(keydown.arrowup)': 'moveFocus($event, -1)',
    '(keydown.arrowdown)': 'moveFocus($event, 1)',
    '(keydown.home)': 'moveFocus($event, "first")',
    '(keydown.end)': 'moveFocus($event, "last")',
  },
})
export class DayPicker {
  readonly days = input.required<ItineraryDay[]>();
  readonly selected = input.required<number>();
  readonly daySelect = output<number>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly toggleButton = viewChild.required<ElementRef<HTMLButtonElement>>('toggle');
  private readonly optionButtons = viewChildren<ElementRef<HTMLButtonElement>>('option');

  protected readonly open = signal(false);

  protected readonly options = computed(() =>
    this.days().map((d) => ({
      day: d.day,
      title: d.title,
      label: `Day ${d.day} · ${formatShortDate(d.date)}`,
    })),
  );

  protected readonly currentLabel = computed(
    () => this.options().find((o) => o.day === this.selected())?.label ?? `Day ${this.selected()}`,
  );

  protected toggleOpen(): void {
    if (this.open()) {
      this.open.set(false);
    } else {
      this.openPanel();
    }
  }

  protected openAndFocus(event: Event): void {
    if (this.open()) {
      return; // 已展開時交給 moveFocus 處理
    }
    event.preventDefault();
    this.openPanel();
  }

  protected choose(day: number): void {
    this.daySelect.emit(day);
    this.closeAndRestoreFocus();
  }

  protected closeAndRestoreFocus(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.toggleButton().nativeElement.focus();
  }

  protected moveFocus(event: Event, step: 1 | -1 | 'first' | 'last'): void {
    const buttons = this.optionButtons().map((ref) => ref.nativeElement);
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (!this.open() || current === -1) {
      return;
    }
    event.preventDefault();
    const last = buttons.length - 1;
    const next =
      step === 'first' ? 0 : step === 'last' ? last : Math.min(last, Math.max(0, current + step));
    buttons[next].focus();
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  protected onFocusOut(event: FocusEvent): void {
    // relatedTarget 為 null（例如 Safari 點擊按鈕不會取得焦點）時交給 document click 處理
    const next = event.relatedTarget as Node | null;
    if (this.open() && next && !this.host.nativeElement.contains(next)) {
      this.open.set(false);
    }
  }

  private openPanel(): void {
    this.open.set(true);
    afterNextRender(
      () => {
        const buttons = this.optionButtons().map((ref) => ref.nativeElement);
        const index = this.options().findIndex((o) => o.day === this.selected());
        buttons[Math.max(0, index)]?.focus();
      },
      { injector: this.injector },
    );
  }
}
