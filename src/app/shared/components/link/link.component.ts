import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.scss'],
  standalone: false
})
export class LinkComponent {
  @Input() text: string = '';
  @Input() href?: string;
  @Input() routerLink?: any[] | string;
}
