import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AiChat } from './shared/ai-chat/ai-chat';
import { Nav } from './shared/nav/nav';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Nav, AiChat],
  template: `
    <app-nav />
    <main class="main">
      <router-outlet />
    </main>
    <app-ai-chat />
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
      // 手機底部導覽列＋AI 浮動按鈕＋safe-area 預留空間
      padding-bottom: calc(
        var(--layout-nav-height) + var(--fab-size) + env(safe-area-inset-bottom) + var(--spacing-lg)
      );

      @include bp(tablet) {
        padding-block: var(--spacing-xl) calc(var(--fab-size) + var(--spacing-2xl));
      }
    }
  `,
})
export class App {}
