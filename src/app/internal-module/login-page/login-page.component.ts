import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  model: LoginRequest = {
    userName: '',
    password: ''
  };

  submit(): void {
    this.errorMessage.set('');
    if (!this.model.userName.trim() || !this.model.password) {
      this.errorMessage.set('يرجى إدخال اسم المستخدم وكلمة المرور.');
      return;
    }

    this.loading.set(true);
    this.auth.login(this.model).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/internal']);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.errorMessage.set(err.message || 'فشل تسجيل الدخول.');
      }
    });
  }
}
