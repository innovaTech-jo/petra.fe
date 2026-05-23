import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { EXTERNAL_ROOT } from '../external-route-paths';

@Component({
  selector: 'app-external-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './external-layout.component.html',
  styleUrl: './external-layout.component.css'
})
export class ExternalLayoutComponent {
  readonly externalRoot = EXTERNAL_ROOT;

  readonly sessionDisplayName = signal<string>('');

  isMenuOpen = false;

  constructor(private readonly router: Router) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.refreshSessionDisplayName());

    this.refreshSessionDisplayName();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  private refreshSessionDisplayName(): void {
    const raw = localStorage.getItem('dcpExternalUser');
    if (!raw) {
      this.sessionDisplayName.set('');
      return;
    }
    try {
      const u = JSON.parse(raw) as { fullName?: string; userName?: string };
      const name = (u.fullName?.trim() || u.userName?.trim() || '').trim();
      this.sessionDisplayName.set(name);
    } catch {
      this.sessionDisplayName.set('');
    }
  }
}
