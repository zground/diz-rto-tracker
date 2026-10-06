import { AfterViewInit, ChangeDetectionStrategy, Component, Input } from '@angular/core';

export const ADSENSE_CLIENT = 'ca-pub-4616923792569310';

/**
 * Display ad unit IDs from AdSense → Ads → By ad unit.
 * Units left as 'TODO' render nothing (no ad request). Hosts should also skip
 * their wrapper via isAdSlotConfigured() so no empty space is reserved.
 */
export const AD_SLOTS: Record<'loginSidebar' | 'dashboardBottom', string> = {
  loginSidebar:    'TODO',
  dashboardBottom: 'TODO',
};

export const isAdSlotConfigured = (slot: string): boolean => /^\d+$/.test(slot);

/**
 * Single responsive AdSense display unit.
 * The loader script lives in index.html; each instance only pushes its own <ins>.
 * minHeight reserves space up front so the fill doesn't cause layout shift (CLS).
 */
@Component({
  selector: 'app-ad-slot',
  standalone: true,
  template: `
    @if (enabled) {
      <ins class="adsbygoogle"
           [style.min-height.px]="minHeight"
           [attr.data-ad-client]="client"
           [attr.data-ad-slot]="slot"
           [attr.data-ad-format]="format"
           data-full-width-responsive="true"></ins>
    }
  `,
  styles: [`
    :host { display: block; }
    ins.adsbygoogle { display: block; width: 100%; }
    ins.adsbygoogle[data-ad-status="unfilled"] { display: none; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdSlotComponent implements AfterViewInit {
  @Input({ required: true }) slot!: string;
  @Input() format: 'auto' | 'rectangle' | 'horizontal' | 'vertical' = 'auto';
  @Input() minHeight = 100;

  readonly client = ADSENSE_CLIENT;

  get enabled(): boolean {
    return isAdSlotConfigured(this.slot);
  }

  ngAfterViewInit(): void {
    if (!this.enabled) return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.warn('AdSense slot init failed', e);
    }
  }
}
