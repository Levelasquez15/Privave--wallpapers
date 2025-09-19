import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth';
import { Query } from 'src/app/core/services/query';

@Component({
  selector: 'app-update-user-info',
  templateUrl: './update-user-info.page.html',
  styleUrls: ['./update-user-info.page.scss'],
  standalone: false
})
export class UpdateUserInfoPage implements OnInit {
  profileForm!: FormGroup;
  errorMsg: string = '';
  successMsg: string = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private query: Query,
    private router: Router
  ) {}

  async ngOnInit() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    const { getAuth } = await import('@angular/fire/auth');
    const user = getAuth().currentUser;

    if (user) {
      let userDoc = await this.query.getUser(user.uid);

      if (userDoc) {
        this.profileForm.patchValue({
          name: userDoc?.['name'] ?? '',
          lastName: userDoc?.['lastName'] ?? '',
          email: userDoc?.['email'] ?? user.email ?? ''
        });
      } else {
        // Si no existe documento en Firestore, lo crea
        const userData = {
          name: '',
          lastName: '',
          email: user.email ?? '',
          uid: user.uid
        };
        await this.query.create('users', userData);

        userDoc = await this.query.getUser(user.uid);
        if (userDoc) {
          this.profileForm.patchValue({
            name: userDoc?.['name'] ?? '',
            lastName: userDoc?.['lastName'] ?? '',
            email: userDoc?.['email'] ?? user.email ?? ''
          });
        }
      }
    }
  }

  async onUpdate() {
    const { name, lastName } = this.profileForm.value;

    try {
      const { getAuth } = await import('@angular/fire/auth');
      const user = getAuth().currentUser;

      if (user) {
        const userData = {
          name,
          lastName,
          uid: user.uid
        };
        await this.query.updateUser(userData);
      }

      this.errorMsg = '';
      this.successMsg = '✅ Datos actualizados correctamente';
    } catch (err: any) {
      console.error(err);
      this.errorMsg = err.message || 'Error al actualizar';
    }
  }

  onLogout() {
    this.auth.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
