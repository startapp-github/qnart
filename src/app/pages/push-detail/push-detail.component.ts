import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { appSolutionInfo } from 'src/clientInfo/client-info';

@Component({
  selector: 'app-push-detail',
  templateUrl: './push-detail.component.html',
  styleUrls: ['./push-detail.component.scss'],
})
export class PushDetailComponent implements OnInit {
  title = appSolutionInfo.title;
  constructor(
    public dialogRef: MatDialogRef<PushDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit() {}
  cancel() {
    this.dialogRef.close();
  }
}
