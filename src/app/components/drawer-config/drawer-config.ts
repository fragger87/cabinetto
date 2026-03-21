import { Component, input, output, OnInit, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DrawerConfig, DrawerLayout, DRAWER_DEFAULTS } from '../../models';

@Component({
  selector: 'app-drawer-config',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './drawer-config.html',
})
export class DrawerConfigForm implements OnInit, OnChanges {
  readonly config = input<DrawerConfig | undefined>(undefined);
  readonly configChange = output<DrawerConfig | undefined>();

  protected enabled = false;
  protected count = 3;
  protected layout: DrawerLayout = 'equal';
  protected slideClearance = DRAWER_DEFAULTS.slideClearance;
  protected frontGap = DRAWER_DEFAULTS.frontGap;
  protected drawerGap = DRAWER_DEFAULTS.drawerGap;
  protected drawerMaterialThickness = DRAWER_DEFAULTS.drawerMaterialThickness;
  protected customHeights: number[] = [];

  ngOnInit(): void {
    this.syncFrom(this.config());
  }

  ngOnChanges(): void {
    this.syncFrom(this.config());
  }

  private syncFrom(cfg: DrawerConfig | undefined): void {
    if (cfg) {
      this.enabled = true;
      this.count = cfg.count;
      this.layout = cfg.layout;
      this.slideClearance = cfg.slideClearance;
      this.frontGap = cfg.frontGap;
      this.drawerGap = cfg.drawerGap;
      this.drawerMaterialThickness = cfg.drawerMaterialThickness;
      this.customHeights = cfg.heights ? [...cfg.heights] : [];
    } else {
      this.enabled = false;
    }
  }

  protected toggleEnabled(): void {
    this.enabled = !this.enabled;
    this.emit();
  }

  protected onCountChange(): void {
    if (this.layout === 'custom') {
      this.resizeCustomHeights();
    }
    this.emit();
  }

  protected onLayoutChange(): void {
    if (this.layout === 'custom') {
      this.resizeCustomHeights();
    }
    this.emit();
  }

  private resizeCustomHeights(): void {
    while (this.customHeights.length < this.count) {
      this.customHeights.push(120);
    }
    this.customHeights.length = this.count;
  }

  protected emit(): void {
    if (!this.enabled) {
      this.configChange.emit(undefined);
      return;
    }
    const cfg: DrawerConfig = {
      count: this.count,
      layout: this.layout,
      slideClearance: this.slideClearance,
      frontGap: this.frontGap,
      drawerGap: this.drawerGap,
      drawerMaterialThickness: this.drawerMaterialThickness,
    };
    if (this.layout === 'custom') {
      cfg.heights = [...this.customHeights];
    }
    this.configChange.emit(cfg);
  }

  protected readonly layouts: DrawerLayout[] = ['equal', 'graduated', 'custom'];
}
