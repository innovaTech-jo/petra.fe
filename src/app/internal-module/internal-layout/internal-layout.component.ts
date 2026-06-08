import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { INTERNAL_ROOT } from '../internal-route-paths';

@Component({
  selector: 'app-internal-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './internal-layout.component.html',
  styleUrl: './internal-layout.component.css'
})
export class InternalLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly internalRoot = INTERNAL_ROOT;
  readonly sessionDisplayName = signal('');

  isMenuOpen = false;

  constructor() {
    this.refreshSessionDisplayName();
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/internal/login']);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  private refreshSessionDisplayName(): void {
    const u = this.auth.readSession();
    const name = (u?.fullName?.trim() || u?.userName?.trim() || '').trim();
    this.sessionDisplayName.set(name);
  }
}
