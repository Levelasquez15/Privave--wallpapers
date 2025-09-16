import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  constructor(private afAuth: AngularFireAuth) {}

  async login(email: string, password: string): Promise<boolean> {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
      return true;
    } catch (error) {
      return false;
    }
  }
}