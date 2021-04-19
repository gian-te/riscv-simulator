import { Component, OnInit } from '@angular/core';
import { IdeService } from './ide.service';

// This is the parent component that will contain all other components
@Component({
  selector: 'app-ide',
  templateUrl: './ide.component.html',
  styleUrls: ['./ide.component.css']
})
export class IdeComponent {
  constructor(ideService: IdeService) {

  }


}
