import { HttpClient } from '@angular/common/http';
import { inject, InjectionToken, Service } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { buildInstructions, ChatMessage, extractOutputText, SiteContext } from './ai-chat.util';
import { DataService } from './data.service';
import { NOW } from './now';

/**
 * AI proxy（Cloudflare Worker，見 `worker/ai-proxy.js`）。開發與正式環境共用；
 * Worker 的 ALLOWED_ORIGINS 需包含 `http://localhost:4200` 才能在本機使用。
 */
export const AI_ENDPOINT = new InjectionToken<string>('AI_ENDPOINT', {
  providedIn: 'root',
  factory: () => 'https://mexico-2027-ai.eva890406.workers.dev/v1/responses',
});

const MODEL = 'deepseek-v4.1-flash';

@Service()
export class AiChatService {
  private readonly http = inject(HttpClient);
  private readonly data = inject(DataService);
  private readonly endpoint = inject(AI_ENDPOINT);
  private readonly now = inject(NOW);

  /** 網站三份資料只讀一次；個別失敗時以 null 代替，不影響提問 */
  private readonly context$: Observable<SiteContext> = forkJoin({
    itinerary: this.data.getItinerary().pipe(catchError(() => of(null))),
    packing: this.data.getPacking().pipe(catchError(() => of(null))),
    payments: this.data.getPayments().pipe(catchError(() => of(null))),
  }).pipe(shareReplay(1));

  readonly configured = this.endpoint !== '';

  /** 送出整段對話（最後一則為使用者的新問題），回傳 AI 的回覆文字 */
  ask(history: readonly ChatMessage[]): Observable<string> {
    return this.context$.pipe(
      switchMap((context) =>
        this.http.post<unknown>(this.endpoint, {
          model: MODEL,
          instructions: buildInstructions(context, this.now()),
          input: history.map((m) => ({ role: m.role, content: m.text })),
          // 由模型自行判斷是否需要上網搜尋（例如餐廳推薦）
          web_search: { mode: 'auto' },
        }),
      ),
      map((response) => {
        const text = extractOutputText(response);
        if (!text) {
          throw new Error('AI 回覆格式不正確');
        }
        return text;
      }),
    );
  }
}
