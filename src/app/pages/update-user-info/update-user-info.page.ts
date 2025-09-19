import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth';
import { Query } from 'src/app/core/services/query';
import { Router } from '@angular/router';

@Component({
  selector: 'app-update-user-info',
  templateUrl: './update-user-info.page.html',
  styleUrls: ['./update-user-info.page.scss'],
  standalone: false
})
export class UpdateUserInfoPage implements OnInit {
  profileForm!: FormGroup;
  errorMsg: string = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private query: Query,
    private router: Router
  ) {}

  ngOnInit() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });

    // Aquí puedes cargar los datos actuales del usuario si lo necesitas
  }

  async onUpdate() {
    const { name, lastname, email, password, confirmPassword } = this.profileForm.value;

    if (password !== confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden';
      return;
    }
    

    try {
      // Actualiza en autenticación (email y password)
      await this.auth.updateEmail(email);
      await this.auth.updatePassword(password);

      // Actualiza en Firestore
      const userData = { name, lastName: lastname, email };
      await this.query.updateUser(userData);

      this.errorMsg = '';
      // Puedes mostrar mensaje de éxito o redirigir
    } catch (err: any) {
      this.errorMsg = err.message || 'Error al actualizar';
    }
  }
  onLogout() {
  this.auth.logout().then(() => {
    this.router.navigate(['/login']);
  });
}
}