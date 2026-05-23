import { Component } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet
} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private splashTimeoutId: ReturnType<typeof setTimeout> | null = null;
  showSplash = true;

  constructor(private readonly router: Router) {
    this.triggerSplash(1100);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.showSplash = true;
        this.clearSplashTimeout();
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.triggerSplash(650);
      }
    });
  }

  private triggerSplash(delayMs: number): void {
    this.clearSplashTimeout();
    this.splashTimeoutId = setTimeout(() => {
      this.showSplash = false;
    }, delayMs);
  }

  private clearSplashTimeout(): void {
    if (this.splashTimeoutId !== null) {
      clearTimeout(this.splashTimeoutId);
      this.splashTimeoutId = null;
    }
  }
}
