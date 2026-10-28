// itinerary.json

export interface ItineraryItem {
  /** `HH:mm`，可為空字串 */
  time: string;
  title: string;
  location: string;
  note: string;
  mapUrl: string;
}

export interface ItineraryDay {
  /** 1～9 */
  day: number;
  /** `YYYY-MM-DD` */
  date: string;
  title: string;
  city: string;
  items: ItineraryItem[];
  stay: string;
}

export interface Itinerary {
  /** `YYYY-MM-DD` */
  startDate: string;
  days: ItineraryDay[];
}

// packing.json

export type PackingLevel = 'critical' | 'recommended' | 'other';

export interface PackingItem {
  /** 全檔唯一，作為 localStorage 的 key */
  id: string;
  name: string;
  /** `YYYY-MM-DD` 或空字串 */
  deadline: string;
  note: string;
}

export interface PackingCategory {
  level: PackingLevel;
  label: string;
  items: PackingItem[];
}

export interface Packing {
  categories: PackingCategory[];
}

// payments.json

export interface Payment {
  /** `YYYY-MM-DD` */
  date: string;
  /** 正整數（新台幣） */
  amount: number;
}

export interface Member {
  nickname: string;
  payments: Payment[];
}

export interface Payments {
  /** 每人應繳金額 */
  due: number;
  members: Member[];
}
