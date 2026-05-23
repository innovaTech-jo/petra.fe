import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { GceSoftBase } from '../../core/gce-soft-base';
import { RoleDto, UserRoleDto, UsersDto } from '../../core/models';
import { RoleService, UserService } from '../../core/services';
import { NotificationService } from '../../core/notification.service';
import { PasswordValidatorService } from '../../core/password-validator.service';
import { OperationType } from '../../shared/operation-type.enum';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ListPaginationBarComponent } from '../../shared/list-pagination-bar/list-pagination-bar.component';

@Component({
  selector: 'app-users-crud',
  imports: [CommonModule, FormsModule, PageHeaderComponent, ListPaginationBarComponent, Select, ToggleSwitch],
  templateUrl: './users-crud.component.html',
  styleUrl: './users-crud.component.css'
})
export class UsersCrudComponent extends GceSoftBase implements OnInit {
  @ViewChild('signatureFileInput') private signatureFileInput?: ElementRef<HTMLInputElement>;

  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  readonly notificationService = inject(NotificationService);
  private readonly passwordValidator = inject(PasswordValidatorService);

  allUsers: UsersDto[] = [];
  roles: RoleDto[] = [];
  /** Loaded on edit; sent on save to avoid clearing أوامر/مجموعات on server. */
  wizardCommandIds: string[] = [];
  /** Loaded on edit; sent on save. */
  wizardGroupIds: string[] = [];

  managerCandidates: { id: string; label: string }[] = [];

  isWizardOpen = false;
  wizardStep = 1;
  wizardUser: Partial<UsersDto> = { fullName: '', active: 1, email: '' };
  wizardRoleIds: string[] = [];
  wizardSaving = false;
  loadingList = false;

  wizardPasswordTouched = false;
  wizardPasswordErrors: Record<string, boolean> = {};
  wizardPasswordStrength = 0;
  wizardPasswordStrengthLevel = '';
  wizardPasswordStrengthColor = '';

  wizardNewPasswordTouched = false;
  wizardNewPasswordErrors: Record<string, boolean> = {};
  wizardNewPasswordStrength = 0;
  wizardNewPasswordStrengthLevel = '';
  wizardNewPasswordStrengthColor = '';

  readonly pageSizeOptions = [5, 10, 20, 50];

  /** Shown in the modal after «التالي» when step 1 validation fails. */
  wizardStep1Errors: Partial<Record<string, string>> = {};

  get isWizardEditMode(): boolean {
    return !!this.wizardUser?.id;
  }

  get signaturePreviewUrl(): string {
    const b = this.wizardUser.signatureImageBase64;
    if (!b?.trim()) return '';
    return b.startsWith('data:') ? b : `data:image/png;base64,${b}`;
  }

  get wizardStep1ErrorBannerLines(): string[] {
    return Object.values(this.wizardStep1Errors).filter((x): x is string => !!x?.trim());
  }

  get showWizardStep1ErrorBanner(): boolean {
    return this.wizardStep1ErrorBannerLines.length > 0;
  }

  clearStep1Error(field: string): void {
    if (!this.wizardStep1Errors[field]) return;
    const next = { ...this.wizardStep1Errors };
    delete next[field];
    this.wizardStep1Errors = next;
  }

  get totalPages(): number {
    const total = this.searchParameters.totalCount ?? 0;
    const size = this.searchParameters.pagingParameters?.pageSize ?? 10;
    return Math.max(1, Math.ceil(total / size) || 1);
  }

  /** If no permissions in session (dev), allow actions. */
  override can(permission: string): boolean {
    return super.can(permission);
  }

  readonly departmentSelectOptions: { id: string; label: string }[] = [];

  private prioritizeCurrentUserFirst(users: UsersDto[]): UsersDto[] {
    const sid = this.currentUserId?.trim();
    if (!sid) return users;
    return [...users].sort((a, b) => {
      const aSelf = a.id === sid ? 0 : 1;
      const bSelf = b.id === sid ? 0 : 1;
      return aSelf - bSelf;
    });
  }

  ngOnInit(): void {
    this.getAllRoles();
    this.loadManagerCandidates();
    this.getAllUsers();
  }

  loadManagerCandidates(): void {
    this.userService
      .search({ pagingParameters: { pageNumber: 1, pageSize: 500 } })
      .subscribe({
        next: (page) => {
          this.managerCandidates = (page.collections ?? [])
            .filter((u) => u.id && u.active === 1)
            .map((u) => ({
              id: String(u.id),
              label: (u.fullName || u.userName || '').trim() || String(u.id)
            }));
        },
        error: () => {
          this.managerCandidates = [];
        }
      });
  }

  onSearchInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.searchParameters.keyword = v;
    this.searchParameters.pagingParameters.pageNumber = 1;
    this.getAllUsers();
  }

  getAllRoles(): void {
    this.roleService
      .search({ pagingParameters: { pageNumber: 1, pageSize: 150 }, active: 1 })
      .subscribe({
        next: (page) => {
          this.roles = page.collections ?? [];
        },
        error: (err: Error) => this.notificationService.showError(err.message)
      });
  }

  getAllUsers(): void {
    this.loadingList = true;
    this.userService
      .search({
        keyword: this.searchParameters.keyword,
        pagingParameters: this.searchParameters.pagingParameters,
        isByPass: false
      })
      .subscribe({
        next: (page) => {
          this.allUsers = this.prioritizeCurrentUserFirst(page.collections ?? []);
          this.searchParameters.totalCount = page.count ?? 0;
          this.loadingList = false;
        },
        error: (err: Error) => {
          this.loadingList = false;
          this.notificationService.showError(err.message);
        }
      });
  }

  showWizard(): void {
    this.loadManagerCandidates();
    this.wizardStep = 1;
    this.wizardUser = { fullName: '', active: 1, email: '', departmentId: '' };
    this.wizardRoleIds = [];
    this.wizardCommandIds = [];
    this.wizardGroupIds = [];
    this.wizardPasswordTouched = false;
    this.wizardPasswordErrors = {};
    this.wizardPasswordStrength = 0;
    this.wizardPasswordStrengthLevel = '';
    this.wizardPasswordStrengthColor = '';
    this.wizardNewPasswordTouched = false;
    this.wizardNewPasswordErrors = {};
    this.wizardNewPasswordStrength = 0;
    this.wizardNewPasswordStrengthLevel = '';
    this.wizardNewPasswordStrengthColor = '';
    this.wizardStep1Errors = {};
    this.isWizardOpen = true;
  }

  closeWizard(): void {
    this.isWizardOpen = false;
    this.wizardStep = 1;
    this.wizardUser = { fullName: '', active: 1, email: '', departmentId: '' };
    this.wizardRoleIds = [];
    this.wizardCommandIds = [];
    this.wizardGroupIds = [];
    this.wizardNewPasswordTouched = false;
    this.wizardNewPasswordErrors = {};
    this.wizardNewPasswordStrength = 0;
    this.wizardNewPasswordStrengthLevel = '';
    this.wizardNewPasswordStrengthColor = '';
    this.wizardStep1Errors = {};
  }

  validateWizardPassword(password: string | undefined): void {
    this.wizardPasswordErrors = {};
    if (!password) return;
    if (password.length < 8) this.wizardPasswordErrors['minLength'] = true;
    if (!/[A-Z]/.test(password)) this.wizardPasswordErrors['noUppercase'] = true;
    if (!/[a-z]/.test(password)) this.wizardPasswordErrors['noLowercase'] = true;
    if (!/\d/.test(password)) this.wizardPasswordErrors['noNumber'] = true;
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) this.wizardPasswordErrors['noSpecialChar'] = true;
    if (password) {
      this.wizardPasswordStrength = this.passwordValidator.getPasswordStrength(password);
      const level = this.passwordValidator.getPasswordStrengthLevel(password);
      this.wizardPasswordStrengthLevel = level === 'very-strong' ? 'veryStrong' : level;
      this.wizardPasswordStrengthColor = this.passwordValidator.getPasswordStrengthColor(password);
    }
  }

  isWizardPasswordInvalid(): boolean {
    return this.wizardPasswordTouched && (Object.keys(this.wizardPasswordErrors).length > 0 || !this.wizardUser.password);
  }

  onWizardPasswordBlur(): void {
    this.wizardPasswordTouched = true;
    if (this.wizardUser.password) this.validateWizardPassword(this.wizardUser.password);
  }

  onWizardPasswordChange(): void {
    if (this.wizardPasswordTouched && this.wizardUser.password) {
      this.validateWizardPassword(this.wizardUser.password);
    } else if (this.wizardUser.password) {
      this.wizardPasswordStrength = this.passwordValidator.getPasswordStrength(this.wizardUser.password);
      const level = this.passwordValidator.getPasswordStrengthLevel(this.wizardUser.password);
      this.wizardPasswordStrengthLevel = level === 'very-strong' ? 'veryStrong' : level;
      this.wizardPasswordStrengthColor = this.passwordValidator.getPasswordStrengthColor(this.wizardUser.password);
    }
  }

  setWizardActiveFromToggle(on: boolean): void {
    this.wizardUser.active = on ? 1 : 0;
  }

  validateWizardNewPassword(password: string | undefined): void {
    this.wizardNewPasswordErrors = {};
    if (!password) return;
    if (password.length < 8) this.wizardNewPasswordErrors['minLength'] = true;
    if (!/[A-Z]/.test(password)) this.wizardNewPasswordErrors['noUppercase'] = true;
    if (!/[a-z]/.test(password)) this.wizardNewPasswordErrors['noLowercase'] = true;
    if (!/\d/.test(password)) this.wizardNewPasswordErrors['noNumber'] = true;
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) this.wizardNewPasswordErrors['noSpecialChar'] = true;
    if (password) {
      this.wizardNewPasswordStrength = this.passwordValidator.getPasswordStrength(password);
      const level = this.passwordValidator.getPasswordStrengthLevel(password);
      this.wizardNewPasswordStrengthLevel = level === 'very-strong' ? 'veryStrong' : level;
      this.wizardNewPasswordStrengthColor = this.passwordValidator.getPasswordStrengthColor(password);
    }
  }

  isWizardNewPasswordInvalid(): boolean {
    return (
      (this.wizardNewPasswordTouched &&
        !!this.wizardUser.newPassword &&
        Object.keys(this.wizardNewPasswordErrors).length > 0) ||
      false
    );
  }

  onWizardNewPasswordBlur(): void {
    this.wizardNewPasswordTouched = true;
    if (this.wizardUser.newPassword) this.validateWizardNewPassword(this.wizardUser.newPassword);
  }

  onWizardNewPasswordChange(): void {
    if (this.wizardNewPasswordTouched && this.wizardUser.newPassword) {
      this.validateWizardNewPassword(this.wizardUser.newPassword);
    } else if (this.wizardUser.newPassword) {
      this.wizardNewPasswordStrength = this.passwordValidator.getPasswordStrength(this.wizardUser.newPassword);
      const level = this.passwordValidator.getPasswordStrengthLevel(this.wizardUser.newPassword);
      this.wizardNewPasswordStrengthLevel = level === 'very-strong' ? 'veryStrong' : level;
      this.wizardNewPasswordStrengthColor = this.passwordValidator.getPasswordStrengthColor(this.wizardUser.newPassword);
    }
  }

  isWizardRoleOn(roleId: string | undefined): boolean {
    if (roleId == null || roleId === '') return false;
    const id = String(roleId);
    return this.wizardRoleIds.some((x) => String(x) === id);
  }

  onWizardRoleToggle(roleId: string | undefined, checked: boolean): void {
    if (roleId == null || roleId === '') return;
    const id = String(roleId);
    const next = [...this.wizardRoleIds.map((x) => String(x))];
    const idx = next.indexOf(id);
    if (checked && idx === -1) next.push(id);
    else if (!checked && idx >= 0) next.splice(idx, 1);
    this.wizardRoleIds = next;
  }

  /** Table: department name from seeded / loaded departments. */
  getDepartmentLabel(_departmentId: string | undefined): string {
    return '—';
  }

  getManagerLabelForUser(_user: UsersDto): string {
    return '—';
  }

  getWizardDepartmentManagerHint(): string {
    return '';
  }

  /** Resolves a user id to display name (candidates list, then directory page). */
  private resolveManagerDisplayName(managerId: string | undefined): string {
    const id = managerId?.trim();
    if (!id) return '—';
    const fromList = this.managerCandidates.find((m) => m.id === id);
    if (fromList?.label?.trim()) return fromList.label.trim();
    const u = this.allUsers.find((x) => String(x.id) === id);
    if (u) return (u.fullName || u.userName || '').trim() || '—';
    return id;
  }

  onSignatureFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      this.notificationService.showError('اختر ملف صورة صالحاً');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result as string;
      this.wizardUser.signatureImageBase64 = r.includes(',') ? r.split(',')[1]! : r;
    };
    reader.readAsDataURL(file);
  }

  clearSignatureImage(): void {
    this.wizardUser.signatureImageBase64 = undefined;
    const el = this.signatureFileInput?.nativeElement;
    if (el) el.value = '';
  }

  nextWizardStep(): void {
    if (this.wizardStep !== 1) return;
    if (!this.validateWizardStep1()) return;
    this.wizardStep1Errors = {};
    this.wizardStep = 2;
  }

  prevWizardStep(): void {
    if (this.wizardStep > 1) {
      this.wizardStep--;
      this.wizardStep1Errors = {};
    }
  }

  goToWizardStep(step: number): void {
    if (step === 2) {
      if (!this.validateWizardStep1()) return;
      this.wizardStep1Errors = {};
    } else if (step === 1) {
      this.wizardStep1Errors = {};
    }
    if (step >= 1 && step <= 2) this.wizardStep = step;
  }

  getRoleNameById(id: string): string {
    const role = this.roles.find((r) => r.id === id || String(r.id) === id);
    return role ? (this.isArabic ? role.nameAr : role.nameOt) || id : id;
  }

  /**
   * Validates step 1 and fills `wizardStep1Errors` for display in the modal.
   * @returns true if all required fields pass.
   */
  validateWizardStep1(): boolean {
    this.wizardStep1Errors = {};
    const u = this.wizardUser;
    const err: Partial<Record<string, string>> = {};
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!u.fullName?.trim()) err['fullName'] = 'الاسم الكامل مطلوب';
    if (!u.userName?.trim()) err['userName'] = 'رمز المستخدم مطلوب';
    if (!u.email?.trim()) err['email'] = 'البريد الإلكتروني مطلوب';
    else if (!emailPattern.test(u.email.trim())) err['email'] = 'صيغة البريد الإلكتروني غير صحيحة';
    if (this.isWizardEditMode) {
      if (u.newPassword?.trim()) {
        this.wizardNewPasswordTouched = true;
        this.validateWizardNewPassword(u.newPassword);
        if (Object.keys(this.wizardNewPasswordErrors).length > 0) {
          err['newPassword'] = 'كلمة المرور الجديدة لا تستوفي شروط التعقيد';
        }
      }
    } else {
      this.wizardPasswordTouched = true;
      if (!u.password) {
        err['password'] = 'كلمة المرور مطلوبة';
      } else {
        this.validateWizardPassword(u.password);
        if (Object.keys(this.wizardPasswordErrors).length > 0) {
          err['password'] = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتشمل حرفاً كبيراً وصغيراً ورقماً ورمزاً';
        }
      }
    }

    this.wizardStep1Errors = err;
    return Object.keys(err).length === 0;
  }

  saveWizard(): void {
    if (!this.validateWizardStep1()) {
      this.wizardStep = 1;
      return;
    }
    this.wizardSaving = true;
    const userId = this.wizardUser.id;
    const userToSave: UsersDto = {
      ...(this.wizardUser as UsersDto),
      ...(userId ? { id: userId } : {}),
      operationType: OperationType.UserRoleAndGroup,
      userRoles: this.wizardRoleIds.map((roleId) =>
        userId ? ({ roleId, userId } as UserRoleDto) : ({ roleId } as UserRoleDto)
      ),
      createdBy: this.currentUserId || '',
      createdDate: this.wizardUser.createdDate ?? new Date().toISOString(),
      token: this.wizardUser.token ?? '',
      refreshToken: this.wizardUser.refreshToken ?? '',
      permssions: this.wizardUser.permssions ?? []
    };
    if (!userId) {
      userToSave.password = this.wizardUser.password;
    } else if (this.wizardUser.newPassword) {
      userToSave.newPassword = this.wizardUser.newPassword;
    }
    const req = userId ? this.userService.update(userToSave) : this.userService.create(userToSave);
    req.subscribe({
      next: () => {
        this.wizardSaving = false;
        this.searchParameters.pagingParameters!.pageNumber = 1;
        this.closeWizard();
        this.getAllUsers();
        this.notificationService.showSuccess();
      },
      error: (err: Error) => {
        this.wizardSaving = false;
        this.notificationService.showError(err.message || 'تعذر حفظ المستخدم');
      }
    });
  }

  openWizardForEdit(user: UsersDto, roleIds: string[]): void {
    this.loadManagerCandidates();
    this.wizardStep = 1;
    this.wizardUser = {
      id: user.id,
      fullName: user.fullName,
      userName: user.userName,
      email: user.email,
      active: user.active ?? 1,
      password: user.password,
      newPassword: user.newPassword,
      departmentId: user.departmentId ?? '',
      signatureImageBase64: user.signatureImageBase64
    };
    this.wizardRoleIds = roleIds.map((id) => String(id));
    this.wizardPasswordTouched = false;
    this.wizardPasswordErrors = {};
    this.wizardNewPasswordTouched = false;
    this.wizardNewPasswordErrors = {};
    this.wizardNewPasswordStrength = 0;
    this.wizardNewPasswordStrengthLevel = '';
    this.wizardNewPasswordStrengthColor = '';
    this.wizardStep1Errors = {};
    this.isWizardOpen = true;
  }

  getUserById(id: string | undefined): void {
    if (!id) return;
    this.userService.getById(id).subscribe({
      next: (user) => {
        const roleIds = (user.userRoles ?? []).map((r) => r.roleId).filter((x): x is string => !!x);
        this.openWizardForEdit(user, roleIds);
      },
      error: (err: Error) => this.notificationService.showError(err.message)
    });
  }

  changePage(page: number): void {
    const current = this.searchParameters.pagingParameters.pageNumber ?? 1;
    if (page < 1 || page > this.totalPages || page === current) {
      return;
    }
    this.searchParameters.pagingParameters.pageNumber = page;
    this.getAllUsers();
  }

  onPageSizeChange(size: number): void {
    const s = size > 0 ? size : 10;
    this.searchParameters.pagingParameters.pageSize = s;
    this.searchParameters.pagingParameters.pageNumber = 1;
    this.getAllUsers();
  }

  trackByUserId(_: number, user: UsersDto): string {
    return String(user.id ?? '');
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
