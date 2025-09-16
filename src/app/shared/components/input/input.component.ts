import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  standalone:false
})
export class InputComponent implements OnInit {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() formControl!: AbstractControl;

  constructor() {}

  ngOnInit() {}
}