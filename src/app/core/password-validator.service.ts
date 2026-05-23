import { Injectable } from '@angular/core';
import type { ValidationErrors } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class PasswordValidatorService {
  /**
   * Rules aligned with user wizard: min 8, upper, lower, digit, special.
   * Empty value returns null (use Validators.required separately).
   */
  validatePasswordComplexity(password: string | null | undefined): ValidationErrors | null {
    const p = password ?? '';
    if (!p) return null;

    const errors: ValidationErrors = {};
    if (p.length < 8) errors['minLength'] = true;
    if (!/[A-Z]/.test(p)) errors['noUppercase'] = true;
    if (!/[a-z]/.test(p)) errors['noLowercase'] = true;
    if (!/\d/.test(p)) errors['noNumber'] = true;
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p)) errors['noSpecialChar'] = true;

    return Object.keys(errors).length ? errors : null;
  }

  getPasswordStrength(password: string): number {
    if (!password) return 0;

    let score = 0;
    const length = password.length;

    if (length >= 8) score += 10;
    if (length >= 12) score += 10;
    if (length >= 16) score += 5;

    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/\d/.test(password)) score += 15;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 15;

    return Math.min(score, 100);
  }

  getPasswordStrengthLevel(password: string): 'weak' | 'medium' | 'strong' | 'very-strong' {
    const score = this.getPasswordStrength(password);
    if (score < 30) return 'weak';
    if (score < 60) return 'medium';
    if (score < 80) return 'strong';
    return 'very-strong';
  }

  getPasswordStrengthColor(password: string): string {
    const level = this.getPasswordStrengthLevel(password);
    switch (level) {
      case 'weak':
        return 'strength-weak';
      case 'medium':
        return 'strength-medium';
      case 'strong':
        return 'strength-strong';
      case 'very-strong':
        return 'strength-very-strong';
      default:
        return 'strength-muted';
    }
  }
}
