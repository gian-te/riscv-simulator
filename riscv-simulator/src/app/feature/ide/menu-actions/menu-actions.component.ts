
import { Component, OnInit, Inject } from '@angular/core';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { IdeService } from '../ide.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { IdeSettings } from '../../../models/ide-settings'

@Component({
  selector: 'app-menu-actions',
  templateUrl: './menu-actions.component.html',
  styleUrls: ['./menu-actions.component.css']
})
  
export class MenuActionsComponent implements OnInit {

  ideSettings: IdeSettings;
  constructor(private ideService: IdeService, private dialog: MatDialog)
  {
    this.ideSettings = {
      cacheBlockSize: '4',// 4 words per block
      numCacheBlocks: '256' // 256 blocks
    }
   

  }
  
  menuClicked(e, menu: string) {
    console.log(e);
    console.log(menu);
    if (menu == 'assemble')
    {
      this.ideService.assembling(true);
    }
    if (menu == 'reset')
    {
      // reset memory (data)
      // reset memory (instructions)
      // reset symbols
      // reset registers
    }
    if (menu == 'settings')
    {
      // console.log(this.ideSettings);
      // dialog box here
      const dialogRef = this.dialog.open(IdeSettingsDialogComponent, {
        width: '300px',
        data: this.ideSettings
      });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        if (result)
        {
          this.ideSettings = result;
          // update state here to notify memory table component of changes in cache block size?
          this.ideService.updateSettings(this.ideSettings);
        }
      });
    }
  }
  
  ngOnInit(){}
}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'ide-settings-dialog.html',
})
export class IdeSettingsDialogComponent {
  data: IdeSettings;
  constructor(
    public dialogRef: MatDialogRef<IdeSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public settings: IdeSettings) {
      this.data = settings;
      console.log('The passed model is:');
      console.log(this.data);
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

}