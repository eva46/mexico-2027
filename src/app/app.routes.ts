import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'itinerary' },
  {
    path: 'itinerary',
    title: '行程｜墨西哥 2027',
    loadComponent: () => import('./pages/itinerary/itinerary').then((m) => m.ItineraryPage),
  },
  {
    path: 'packing',
    title: '攜帶物品｜墨西哥 2027',
    loadComponent: () => import('./pages/packing/packing').then((m) => m.PackingPage),
  },
  {
    path: 'costs',
    title: '費用｜墨西哥 2027',
    loadComponent: () => import('./pages/costs/costs').then((m) => m.CostsPage),
  },
  // TODO: 臨時的 design token 檢查頁，確認後刪除
  {
    path: 'tokens',
    title: 'Design Tokens｜墨西哥 2027',
    loadComponent: () => import('./pages/tokens/tokens').then((m) => m.TokensPage),
  },
  { path: '**', redirectTo: 'itinerary' },
];
