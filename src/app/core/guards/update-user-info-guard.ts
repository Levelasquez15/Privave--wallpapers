import { Injectable } from '@angular/core';
import { CanActivate, Router, Navigation } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UpdateUserInfoGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const navigation: Navigation | null = this.router.getCurrentNavigation();
    const fromHome = navigation?.extras?.state?.['fromHome'];

    if (fromHome) {
      return true;
    } else {
      this.router.navigate(['/home']);
      return false;
    }
  }
}
