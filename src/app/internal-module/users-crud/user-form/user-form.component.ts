import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { environment } from '../../../../environments/environment';
import { GceSoftBase } from '../../../core/gce-soft-base';
import { RoleDto, UserRoleDto, UsersDto } from '../../../core/models';
import { RoleService, UserService } from '../../../core/services';
import { NotificationService } from '../../../core/notification.service';
import { PasswordValidatorService } from '../../../core/password-validator.service';
import { OperationType } from '../../../shared/operation-type.enum';
import { InternalLocalStoreService } from '../../services/internal-local-store.service';
import { buildDefaultRoles } from '../../shared/role-seed';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, FormsModule, RouterLink, ToggleSwitch],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent extends GceSoftBase implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly localStore = inject(InternalLocalStoreService);
  readonly notificationService = inject(NotificationService);
  private readonly passwordValidator = inject(PasswordValidatorService);

  roles: RoleDto[] = [];

  wizardStep = 1;
  formUser: Partial<UsersDto> = { fullName: '', active: 1, email: '' };
  roleIds: number[] = [];
  saving = false;
  loading = false;

  passwordTouched = false;
  passwordErrors: Record<string, boolean> = {};
  passwordStrength = 0;
  passwordStrengthLevel = '';
  passwordStrengthColor = '';

  newPasswordTouched = false;
  newPasswordErrors: Record<string, boolean> = {};
  newPasswordStrength = 0;
  newPasswordStrengthLevel = '';
  newPasswordStrengthColor = '';

  step1Errors: Partial<Record<string, string>> = {};

  get isEditMode(): boolean {
    return !!this.formUser?.id;
  }

  ngOnInit(): void {
    this.getAllRoles();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUser(Number(id));
    } else {
      this.resetForm();
    }
  }

  clearStep1Error(field: string): void {
    if (!this.step1Errors[field]) return;
    const next = { ...this.step1Errors };
    delete next[field];
    this.step1Errors = next;
  }

  private resetForm(): void {
    this.wizardStep = 1;
    this.formUser = { fullName: '', active: 1, email: '' };
    this.roleIds = [];
    this.passwordTouched = false;
    this.passwordErrors = {};
    this.passwordStrength = 0;
    this.passwordStrengthLevel = '';
    this.passwordStrengthColor = '';
    this.newPasswordTouched = false;
    this.newPasswordErrors = {};
    this.newPasswordStrength = 0;
    this.newPasswordStrengthLevel = '';
    this.newPasswordStrengthColor = '';
    this.step1Errors = {};
  }

  getAllRoles(): void {
    if (environment.useLocalInternalStore) {
      this.roles = buildDefaultRoles();
      return;
    }
    this.roleService.search({ pagingParameters: { pageNumber: 1, pageSize: 150 }, active: 1 }).subscribe({
      next: (page) => {
        this.roles = page.collections ?? [];
      },
      error: (err: Error) => this.notificationService.showError(err.message)
    });
  }

  loadUser(id: number): void {
    if (!id || Number.isNaN(id)) {
      void this.router.navigate(['/internal/users']);
      return;
    }
    this.loading = true;
    if (environment.useLocalInternalStore) {
      const found = this.localStore.findUser(id);
      this.loading = false;
      if (!found) {
        this.notificationService.showError('تعذر تحميل بيانات المستخدم');
        void this.router.navigate(['/internal/users']);
        return;
      }
      this.applyUserForEdit(found.user, found.roleIds);
      return;
    }
    this.userService.getById(id).subscribe({
      next: (user) => {
        this.loading = false;
        const ids = (user.userRoles ?? []).map((r) => r.roleId).filter((x) => x > 0);
        this.applyUserForEdit(user, ids);
      },
      error: (err: Error) => {
        this.loading = false;
        this.notificationService.showError(err.message);
        void this.router.navigate(['/internal/users']);
      }
    });
  }

  private applyUserForEdit(user: UsersDto, roleIds: number[]): void {
    this.wizardStep = 1;
    this.formUser = {
      id: user.id,
      fullName: user.fullName,
      userName: user.userName,
      email: user.email,
      active: user.active ?? 1,
      cityId: user.cityId ?? null,
      password: user.password,
      newPassword: user.newPassword,
      createdDate: user.createdDate,
      token: user.token,
      refreshToken: user.refreshToken,
      permssions: user.permssions
    };
    this.roleIds = [...roleIds];
    this.step1Errors = {};
  }

  validatePassword(password: string | undefined): void {
    this.passwordErrors = {};
    if (!password) return;
    if (password.length < 8) this.passwordErrors['minLength'] = true;
    if (!/[A-Z]/.test(password)) this.passwordErrors['noUppercase'] = true;
    if (!/[a-z]/.test(password)) this.passwordErrors['noLowercase'] = true;
    if (!/\d/.test(password)) this.passwordErrors['noNumber'] = true;
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) this.passwordErrors['noSpecialChar'] = true;
    if (password) {
      this.passwordStrength = this.passwordValidator.getPasswordStrength(password);
      const level = this.passwordValidator.getPasswordStrengthLevel(password);
      this.passwordStrengthLevel = level === 'very-strong' ? 'veryStrong' : level;
      this.passwordStrengthColor = this.passwordValidator.getPasswordStrengthColor(password);
    }
  }

  isPasswordInvalid(): boolean {
    return this.passwordTouched && (Object.keys(this.passwordErrors).length > 0 || !this.formUser.password);
  }

  onPasswordBlur(): void {
    this.passwordTouched = true;
    if (this.formUser.password) this.validatePassword(this.formUser.password);
  }

  onPasswordChange(): void {
    if (this.passwordTouched && this.formUser.password) {
      this.validatePassword(this.formUser.password);
    } else if (this.formUser.password) {
      this.passwordStrength = this.passwordValidator.getPasswordStrength(this.formUser.password);
      const level = this.passwordValidator.getPasswordStrengthLevel(this.formUser.password);
      this.passwordStrengthLevel = level === 'very-strong' ? 'veryStrong' : level;
      this.passwordStrengthColor = this.passwordValidator.getPasswordStrengthColor(this.formUser.password);
    }
  }

  setActiveFromToggle(on: boolean): void {
    this.formUser.active = on ? 1 : 0;
  }

  validateNewPassword(password: string | undefined): void {
    this.newPasswordErrors = {};
    if (!password) return;
    if (password.length < 8) this.newPasswordErrors['minLength'] = true;
    if (!/[A-Z]/.test(password)) this.newPasswordErrors['noUppercase'] = true;
    if (!/[a-z]/.test(password)) this.newPasswordErrors['noLowercase'] = true;
    if (!/\d/.test(password)) this.newPasswordErrors['noNumber'] = true;
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) this.newPasswordErrors['noSpecialChar'] = true;
    if (password) {
      this.newPasswordStrength = this.passwordValidator.getPasswordStrength(password);
      const level = this.passwordValidator.getPasswordStrengthLevel(password);
      this.newPasswordStrengthLevel = level === 'very-strong' ? 'veryStrong' : level;
      this.newPasswordStrengthColor = this.passwordValidator.getPasswordStrengthColor(password);
    }
  }

  isNewPasswordInvalid(): boolean {
    return (
      (this.newPasswordTouched &&
        !!this.formUser.newPassword &&
        Object.keys(this.newPasswordErrors).length > 0) ||
      false
    );
  }

  onNewPasswordBlur(): void {
    this.newPasswordTouched = true;
    if (this.formUser.newPassword) this.validateNewPassword(this.formUser.newPassword);
  }

  onNewPasswordChange(): void {
    if (this.newPasswordTouched && this.formUser.newPassword) {
      this.validateNewPassword(this.formUser.newPassword);
    } else if (this.formUser.newPassword) {
      this.newPasswordStrength = this.passwordValidator.getPasswordStrength(this.formUser.newPassword);
      const level = this.passwordValidator.getPasswordStrengthLevel(this.formUser.newPassword);
      this.newPasswordStrengthLevel = level === 'very-strong' ? 'veryStrong' : level;
      this.newPasswordStrengthColor = this.passwordValidator.getPasswordStrengthColor(this.formUser.newPassword);
    }
  }

  isRoleOn(roleId: number | undefined): boolean {
    if (roleId == null || roleId <= 0) return false;
    return this.roleIds.includes(roleId);
  }

  onRoleToggle(roleId: number | undefined, checked: boolean): void {
    if (roleId == null || roleId <= 0) return;
    const next = [...this.roleIds];
    const idx = next.indexOf(roleId);
    if (checked && idx === -1) next.push(roleId);
    else if (!checked && idx >= 0) next.splice(idx, 1);
    this.roleIds = next;
  }

  nextWizardStep(): void {
    if (this.wizardStep !== 1) return;
    if (!this.validateStep1()) return;
    this.step1Errors = {};
    this.wizardStep = 2;
  }

  prevWizardStep(): void {
    if (this.wizardStep > 1) {
      this.wizardStep--;
      this.step1Errors = {};
    }
  }

  goToWizardStep(step: number): void {
    if (step === 2) {
      if (!this.validateStep1()) return;
      this.step1Errors = {};
    } else if (step === 1) {
      this.step1Errors = {};
    }
    if (step >= 1 && step <= 2) this.wizardStep = step;
  }

  validateStep1(): boolean {
    this.step1Errors = {};
    const u = this.formUser;
    const err: Partial<Record<string, string>> = {};
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!u.fullName?.trim()) err['fullName'] = 'الاسم الكامل مطلوب';
    if (!u.userName?.trim()) err['userName'] = 'رمز المستخدم مطلوب';
    if (!u.email?.trim()) err['email'] = 'البريد الإلكتروني مطلوب';
    else if (!emailPattern.test(u.email.trim())) err['email'] = 'صيغة البريد الإلكتروني غير صحيحة';

    if (this.isEditMode) {
      if (u.newPassword?.trim()) {
        this.newPasswordTouched = true;
        this.validateNewPassword(u.newPassword);
        if (Object.keys(this.newPasswordErrors).length > 0) {
          err['newPassword'] = 'كلمة المرور الجديدة لا تستوفي شروط التعقيد';
        }
      }
    } else {
      this.passwordTouched = true;
      if (!u.password) {
        err['password'] = 'كلمة المرور مطلوبة';
      } else {
        this.validatePassword(u.password);
        if (Object.keys(this.passwordErrors).length > 0) {
          err['password'] = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتشمل حرفاً كبيراً وصغيراً ورقماً ورمزاً';
        }
      }
    }

    this.step1Errors = err;
    return Object.keys(err).length === 0;
  }

  private buildUserRoles(userId: number): UserRoleDto[] {
    return this.roleIds.map(
      (roleId) =>
        ({
          userId,
          roleId
        }) as UserRoleDto
    );
  }

  private buildUpdatePayload(userId: number): UsersDto {
    const payload: UsersDto = {
      id: userId,
      userName: this.formUser.userName!.trim(),
      fullName: this.formUser.fullName!.trim(),
      email: this.formUser.email!.trim(),
      active: this.formUser.active ?? 1,
      cityId: this.formUser.cityId ?? null,
      operationType: OperationType.UserRole,
      userRoles: this.buildUserRoles(userId),
      createdBy: this.currentUserId || 0,
      createdDate: this.formUser.createdDate ?? new Date().toISOString()
    };
    if (this.formUser.newPassword?.trim()) {
      payload.newPassword = this.formUser.newPassword.trim();
    }
    return payload;
  }

  save(): void {
    if (!this.validateStep1()) {
      this.wizardStep = 1;
      return;
    }
    this.saving = true;

    const onSuccess = (): void => {
      this.saving = false;
      this.notificationService.showSuccess();
      void this.router.navigate(['/internal/users']);
    };

    const onError = (message: string): void => {
      this.saving = false;
      this.notificationService.showError(message || 'تعذر حفظ المستخدم');
    };

    if (environment.useLocalInternalStore) {
      try {
        const userId = this.formUser.id;
        if (!userId) {
          const createPayload: UsersDto = {
            userName: this.formUser.userName!.trim(),
            fullName: this.formUser.fullName!.trim(),
            email: this.formUser.email!.trim(),
            active: this.formUser.active ?? 1,
            cityId: this.formUser.cityId ?? null,
            password: this.formUser.password,
            createdBy: this.currentUserId || 0,
            createdDate: new Date().toISOString(),
            id: 0
          };
          this.localStore.createUser(createPayload, [...this.roleIds]);
        } else {
          this.localStore.saveUser(this.buildUpdatePayload(userId), [...this.roleIds]);
        }
        onSuccess();
      } catch {
        onError('تعذر حفظ المستخدم محلياً');
      }
      return;
    }

    const userId = this.formUser.id;
    if (userId) {
      this.userService.update(this.buildUpdatePayload(userId)).subscribe({
        next: () => onSuccess(),
        error: (err: Error) => onError(err.message)
      });
      return;
    }

    const createPayload: UsersDto = {
      userName: this.formUser.userName!.trim(),
      fullName: this.formUser.fullName!.trim(),
      email: this.formUser.email!.trim(),
      active: this.formUser.active ?? 1,
      cityId: this.formUser.cityId ?? null,
      password: this.formUser.password,
      createdBy: this.currentUserId || 0,
      createdDate: new Date().toISOString(),
      id: 0
    };

    this.userService.create(createPayload).subscribe({
      next: (newId) => {
        const id = Number(newId);
        if (!id || Number.isNaN(id)) {
          onError('تعذر إنشاء المستخدم');
          return;
        }
        this.userService.update(this.buildUpdatePayload(id)).subscribe({
          next: () => onSuccess(),
          error: (err: Error) => onError(err.message)
        });
      },
      error: (err: Error) => onError(err.message)
    });
  }

  strengthLabel(level: string): string {
    const map: Record<string, string> = {
      weak: 'ضعيف',
      medium: 'متوسط',
      strong: 'قوي',
      veryStrong: 'قوي جداً'
    };
    return map[level] ?? level;
  }
}
