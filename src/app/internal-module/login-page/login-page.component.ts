import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models';
import { InternalLocalStoreService } from '../services/internal-local-store.service';
import { RoleSeedIds } from '../shared/role-seed';

const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = '12345';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly localStore = inject(InternalLocalStoreService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly infoMessage = signal('');

  rememberMe = false;

  model: LoginRequest = {
    userName: '',
    password: ''
  };

  submit(): void {
    this.errorMessage.set('');
    this.infoMessage.set('');

    const userName = this.model.userName.trim();
    const password = this.model.password;

    if (!userName || !password) {
      this.errorMessage.set('يرجى إدخال اسم المستخدم وكلمة المرور.');
      return;
    }

    if (userName.toLowerCase() !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
      this.errorMessage.set('بيانات الدخول غير صحيحة. استخدم admin / 12345');
      return;
    }

    this.loading.set(true);

    const session = this.auth.loginOffline({
      id: 1,
      userName: DEMO_USERNAME,
      fullName: 'مسؤول النظام',
      email: 'admin@petra.local',
      active: 1,
      token: 'local-demo-token',
      refreshToken: '',
      permssions: [],
      userRoles: [
        {
          id: 0,
          createdBy: 0,
          createdDate: new Date().toISOString(),
          roleId: RoleSeedIds.admin,
          userId: 1
        }
      ],
      createdBy: 0,
      createdDate: new Date().toISOString()
    });

    this.localStore.ensureSessionUserListed(session);

    if (this.rememberMe) {
      localStorage.setItem('petraInternalRememberUser', DEMO_USERNAME);
    } else {
      localStorage.removeItem('petraInternalRememberUser');
    }

    this.loading.set(false);
    void this.router.navigate(['/internal']);
  }

  showForgotHint(): void {
    this.infoMessage.set('في الوضع التجريبي: admin / 12345');
    this.errorMessage.set('');
  }

  constructor() {
    const remembered = localStorage.getItem('petraInternalRememberUser');
    if (remembered) {
      this.model.userName = remembered;
      this.rememberMe = true;
    }
  }
}
