import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Nav } from './shared/nav/nav';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Nav],
  template: `
    <app-nav />
    <main class="main">
      <router-outlet />
    </main>
  `,
  styles: `
    @use 'breakpoints' as *;

    :host {
      display: block;
    }

    .main {
      max-width: var(--layout-max-width);
      margin-inline: auto;
      padding: var(--spacing-lg) var(--layout-screen-padding);
      // 手機底部導覽列＋safe-area 預留空間
      padding-bottom: calc(var(--layout-nav-height) + env(safe-area-inset-bottom) + var(--spacing-lg));

      @include bp(tablet) {
        padding-block: var(--spacing-xl) var(--spacing-2xl);
      }
    }
  `,
})
export class App {}
