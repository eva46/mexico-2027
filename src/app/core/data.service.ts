import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Itinerary, Packing, Payments } from './models';

/**
 * 讀取 `public/data/` 下的靜態 JSON。
 * 使用相對路徑（不加開頭斜線），以相容 GitHub Pages 的 base-href。
 */
@Service()
export class DataService {
  private readonly http = inject(HttpClient);

  getItinerary(): Observable<Itinerary> {
    return this.http.get<Itinerary>('data/itinerary.json');
  }

  getPacking(): Observable<Packing> {
    return this.http.get<Packing>('data/packing.json');
  }

  getPayments(): Observable<Payments> {
    return this.http.get<Payments>('data/payments.json');
  }
}
