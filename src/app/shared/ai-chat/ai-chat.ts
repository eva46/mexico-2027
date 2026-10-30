import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { disabled, form, FormField } from '@angular/forms/signals';
import { Subscription } from 'rxjs';
import { AiChatService } from '../../core/ai-chat.service';
import { ChatMessage, TextSegment, toSegments } from '../../core/ai-chat.util';

interface DisplayMessage extends ChatMessage {
  id: number;
  segments: TextSegment[];
}

/**
 * 右下角 AI 助理：點擊浮動按鈕展開對話框（非 modal），關閉即清空紀錄。
 * 鍵盤：Enter 送出、Shift+Enter 換行（輸入法選字中不送出）；Esc 關閉並回到浮動按鈕。
 */
@Component({
  selector: 'app-ai-chat',
  imports: [FormField],
  templateUrl: './ai-chat.html',
  styleUrl: './ai-chat.scss',
  host: {
    '(keydown.escape)': 'close()',
  },
})
export class AiChat {
  private readonly ai = inject(AiChatService);
  private readonly injector = inject(Injector);
  private readonly fab = viewChild.required<ElementRef<HTMLButtonElement>>('fab');
  private readonly input = viewChild<ElementRef<HTMLTextAreaElement>>('input');
  private readonly log = viewChild<ElementRef<HTMLElement>>('log');

  protected readonly configured = this.ai.configured;
  protected readonly suggestions = [
    '今天的行程是什麼？',
    '明天幾點出發？',
    '今晚飯店附近有什麼推薦餐廳？',
    '還有哪些東西要準備？',
  ];

  protected readonly open = signal(false);
  protected readonly messages = signal<DisplayMessage[]>([]);
  protected readonly pending = signal(false);
  protected readonly error = signal(false);

  private readonly model = signal({ question: '' });
  protected readonly chatForm = form(this.model, (path) => {
    disabled(path.question, () => !this.configured);
  });

  private nextId = 0;
  private request?: Subscription;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.request?.unsubscribe());
  }

  protected toggle(): void {
    if (this.open()) {
      this.close();
    } else {
      this.open.set(true);
      this.afterRender(() => this.input()?.nativeElement.focus());
    }
  }

  /** 關閉並清空所有紀錄（含進行中的請求） */
  protected close(): void {
    if (!this.open()) {
      return;
    }
    this.request?.unsubscribe();
    this.open.set(false);
    this.messages.set([]);
    this.pending.set(false);
    this.error.set(false);
    this.model.set({ question: '' });
    this.fab().nativeElement.focus();
  }

  protected onEnter(event: Event): void {
    const { shiftKey, isComposing } = event as KeyboardEvent;
    if (shiftKey || isComposing) {
      return;
    }
    event.preventDefault();
    this.send();
  }

  protected send(text = this.model().question): void {
    const question = text.trim();
    if (!question || this.pending() || !this.configured) {
      return;
    }
    this.push('user', question);
    this.model.set({ question: '' });
    this.pending.set(true);
    this.error.set(false);

    const history = this.messages().map(({ role, text }) => ({ role, text }));
    this.request = this.ai.ask(history).subscribe({
      next: (answer) => {
        this.pending.set(false);
        this.push('assistant', answer);
      },
      error: () => {
        this.pending.set(false);
        this.error.set(true);
        this.scrollToBottom();
      },
    });
  }

  private push(role: DisplayMessage['role'], text: string): void {
    this.messages.update((list) => [
      ...list,
      { id: this.nextId++, role, text, segments: toSegments(text) },
    ]);
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    this.afterRender(() => {
      const el = this.log()?.nativeElement;
      el?.scrollTo({ top: el.scrollHeight });
    });
  }

  private afterRender(fn: () => void): void {
    afterNextRender(fn, { injector: this.injector });
  }
}
