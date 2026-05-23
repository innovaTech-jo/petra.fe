import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Unified page top section: eyebrow (orange), title, description, optional actions via ng-content.
 * Use global classes `.app-page-header-btn` / `.app-page-header-toolbar` on projected content.
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="app-page-header" style="margin-bottom: 10px;" dir="rtl">
      <div class="app-page-header-text">
        @if (eyebrow()) {
          <p class="app-page-header-eyebrow">{{ eyebrow() }}</p>
        }
        <h1 class="app-page-header-title">{{ title() }}</h1>
        @if (description()) {
          <p class="app-page-header-desc">{{ description() }}</p>
        }
      </div>
      <div class="app-page-header-aside">
        <ng-content />
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './page-header.component.css'
})
export class PageHeaderComponent {
  readonly eyebrow = input<string>();
  readonly title = input.required<string>();
  readonly description = input<string>();
}
