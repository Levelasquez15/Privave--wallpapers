import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';   // 👈 importa esto
import { LinkComponent } from './link.component';

@NgModule({
  declarations: [LinkComponent],
  imports: [
    CommonModule,
    RouterModule  // 👈 y agréga aquí
  ],
  exports: [LinkComponent]
})
export class LinkModule {}
