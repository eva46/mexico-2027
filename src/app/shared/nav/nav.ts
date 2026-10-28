import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  /** 24×24 viewBox 的線條路徑 */
  icon: string[];
}

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="nav" aria-label="主要導覽">
      <div class="nav__inner">
        <span class="nav__brand">MEXICO 2027</span>
        <ul class="nav__list">
          @for (item of items; track item.path) {
            <li>
              <a
                class="nav__link"
                [routerLink]="item.path"
                routerLinkActive="is-active"
                ariaCurrentWhenActive="page"
              >
                <span class="nav__pill">
                  <svg
                    class="nav__icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    @for (d of item.icon; track $index) {
                      <path [attr.d]="d" />
                    }
                  </svg>
                  <span class="nav__label t-caption-caps t-zh">{{ item.label }}</span>
                </span>
              </a>
            </li>
          }
        </ul>
      </div>
    </nav>
  `,
  styleUrl: './nav.scss',
})
export class Nav {
  protected readonly items: NavItem[] = [
    {
      path: '/itinerary',
      label: '行程',
      icon: ['M4 6h16v14H4z', 'M4 10h16', 'M8 3v4', 'M16 3v4'],
    },
    {
      path: '/packing',
      label: '物品',
      icon: ['M3 8h18v12H3z', 'M9 8V5h6v3', 'M3 13h18'],
    },
    {
      path: '/costs',
      label: '費用',
      icon: ['M3 7h18v10H3z', 'M12 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5z', 'M6 10v4', 'M18 10v4'],
    },
  ];
}
