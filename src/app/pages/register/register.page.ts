import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth';
import { Query } from 'src/app/core/services/query';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  errorMsg: string = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService, // <-- corregido
    private query: Query,
    private router: Router
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onRegister() {
    const { email, password, name, lastname } = this.registerForm.value;
    this.auth.register(email, password)
      .then((res: any) => { // <-- tipo agregado
        if (res.user) {
          const userData = {
            name,
            lastName: lastname,
            email,
            uid: res.user.uid
          };
          this.query.create('users', userData)
            .then(() => {
              this.router.navigate(['/home']);
              // Usuario guardado en Firestore
            })
            .catch((err: any) => { // <-- tipo agregado
              this.errorMsg = 'Error al guardar usuario en Firestore';
            });
        } else {
          this.errorMsg = 'No se pudo obtener el usuario registrado.';
        }
      })
      .catch((err: any) => { // <-- tipo agregado
        this.errorMsg = err.message;
      });
  }
}