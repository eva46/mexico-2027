import { DOCUMENT, Component, afterNextRender, inject, signal } from '@angular/core';

// TODO: 臨時頁面，用來目視檢查 design tokens，確認後連同路由一起刪除

interface TokenGroup {
  title: string;
  tokens: string[];
}

const COLOR_GROUPS: TokenGroup[] = [
  {
    title: 'Primitive',
    tokens: [
      '--color-white-cream',
      '--color-oatmeal',
      '--color-forest-green',
      '--color-brick-red',
      '--color-espresso-black',
    ],
  },
  {
    title: 'Background',
    tokens: [
      '--bg-page',
      '--bg-surface-primary',
      '--bg-surface-secondary',
      '--bg-surface-accent-green',
      '--bg-surface-accent-red',
      '--bg-surface-dark',
    ],
  },
  {
    title: 'Text',
    tokens: ['--text-primary', '--text-inverse', '--text-accent', '--text-muted'],
  },
  {
    title: 'Interactive',
    tokens: [
      '--btn-primary-bg',
      '--btn-primary-text',
      '--pill-active-bg',
      '--pill-active-text',
      '--pill-inactive-bg',
    ],
  },
  {
    title: 'Status',
    tokens: [
      '--status-done-bg',
      '--status-done-text',
      '--status-warn-bg',
      '--status-warn-text',
      '--status-partial-bg',
      '--status-partial-text',
      '--status-over-bg',
      '--status-over-text',
      '--progress-track',
      '--progress-fill',
    ],
  },
];

const TYPE_SCALE = [
  { cls: 't-display-xl', token: '--font-size-display-xl', latin: 'DAY 03', zh: '瓜納華托古城散步' },
  { cls: 't-heading-md', token: '--font-size-heading-md', latin: 'Heading MD', zh: '團費繳交狀況' },
  { cls: 't-heading-sm', token: '--font-size-heading-sm', latin: 'Heading SM', zh: '出發前準備清單' },
  { cls: 't-body', token: '--font-size-body', latin: 'Body text 0123456789', zh: '桃園機場第二航廈集合，請提前兩小時抵達。' },
  { cls: 't-caption-caps', token: '--font-size-caption-caps', latin: 'Due in 45 days', zh: '剩 45 天' },
];

const SPACING = [
  '--spacing-xs',
  '--spacing-sm',
  '--spacing-md',
  '--spacing-md-plus',
  '--spacing-lg',
  '--spacing-xl',
  '--spacing-2xl',
  '--layout-screen-padding',
  '--layout-gutter',
];

const RADIUS = ['--radius-sm', '--radius-md', '--radius-lg', '--radius-full'];

const BORDERS = ['--border-subtle', '--border-strong'];

@Component({
  selector: 'app-tokens-page',
  templateUrl: './tokens.html',
  styleUrl: './tokens.scss',
})
export class TokensPage {
  private readonly document = inject(DOCUMENT);

  protected readonly colorGroups = COLOR_GROUPS;
  protected readonly typeScale = TYPE_SCALE;
  protected readonly spacing = SPACING;
  protected readonly radius = RADIUS;
  protected readonly borders = BORDERS;
  protected readonly values = signal<Record<string, string>>({});

  constructor() {
    afterNextRender(() => {
      const style = getComputedStyle(this.document.documentElement);
      const names = [
        ...COLOR_GROUPS.flatMap((g) => g.tokens),
        ...TYPE_SCALE.map((t) => t.token),
        ...SPACING,
        ...RADIUS,
      ];
      this.values.set(Object.fromEntries(names.map((n) => [n, style.getPropertyValue(n).trim()])));
    });
  }
}
