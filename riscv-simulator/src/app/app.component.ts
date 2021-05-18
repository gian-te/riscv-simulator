import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IdeService } from './feature/ide/ide.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'riscv-simulator';
  constructor(private router: Router, private ideService: IdeService) { }

}
