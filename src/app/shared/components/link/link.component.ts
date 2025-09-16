import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.scss'],
  standalone: false
})
export class LinkComponent implements OnInit {
  @Input() text: string = '';
  @Input() routerLink: any[] = [];

  constructor() { }

  ngOnInit() {}
}