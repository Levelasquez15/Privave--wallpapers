import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from './components/button/button.module';
import { FloatingButtonModule } from './components/floating-button/floating-button.module';
import { CardModule } from './components/card/card.module';
import { LinkModule } from './components/link/link.module';

import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ToggleTranslateComponent } from './components/toggle-translate/toggle-translate.component';
import { InputComponent } from './components/input/input.component';

@NgModule({
  declarations: [
    ToggleTranslateComponent,
    InputComponent   // 👈 lo declaramos aquí directo
  ],
  imports: [
    CommonModule,
    ButtonModule,
    FloatingButtonModule,
    CardModule,
    LinkModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ],
  exports: [
    ToggleTranslateComponent,
    InputComponent, // 👈 y lo exportamos
    ButtonModule,
    FloatingButtonModule,
    CardModule,
    LinkModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class SharedModule {}
