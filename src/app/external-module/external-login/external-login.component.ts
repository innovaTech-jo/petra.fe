import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { externalUrl } from '../external-route-paths';

@Component({
  selector: 'app-external-login',
  imports: [RouterLink],
  templateUrl: './external-login.component.html',
  styleUrl: './external-login.component.css'
})
export class ExternalLoginComponent {
  constructor(private readonly router: Router) {}

  signIn(): void {
    localStorage.setItem(
      'dcpExternalUser',
      JSON.stringify({ userName: 'external.user', fullName: 'مستخدم خارجي' })
    );
    void this.router.navigate(externalUrl());
  }
}
