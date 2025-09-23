import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-floating-button',
  templateUrl: './floating-button.component.html',
  styleUrls: ['./floating-button.component.scss'],
  standalone: false
})
export class FloatingButtonComponent {
  @Output() profileClick = new EventEmitter<void>();
  @Output() uploadImageClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();

  isOpen = false;

  toggleMenu() {
    this.isOpen = !this.isOpen;  
  }

  onProfileClick() {
    this.profileClick.emit();
    this.isOpen = false;
  }

  onUploadImageClick() {
    this.uploadImageClick.emit();
    this.isOpen = false;
  }

  onLogoutClick() {
    this.logoutClick.emit();
    this.isOpen = false;
  }
}
