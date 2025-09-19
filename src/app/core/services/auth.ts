import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateEmail, updatePassword } from '@angular/fire/auth';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  updateEmail(newEmail: string) {
    if (this.auth.currentUser) {
      return updateEmail(this.auth.currentUser, newEmail);
    }
    return Promise.reject('No hay usuario autenticado');
  }

  updatePassword(newPassword: string) {
    if (this.auth.currentUser) {
      return updatePassword(this.auth.currentUser, newPassword);
    }
    return Promise.reject('No hay usuario autenticado');
  }
  isAuthenticated(): boolean {
    return this.auth.currentUser != null;
  }
}