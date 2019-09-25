import { Component, ElementRef, AfterViewInit, ViewChild, Input } from '@angular/core';
import * as OT from '@opentok/client';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-subscriber',
  templateUrl: './subscriber.component.html',
  styleUrls: ['./subscriber.component.css']
})

export class SubscriberComponent implements AfterViewInit {
  @ViewChild('subscriberDiv',{static: false}) subscriberDiv: ElementRef;
  @Input() session: OT.Session;
  @Input() stream: OT.Stream;
  subscriber = {};
  constructor(private _snackBar: MatSnackBar) { 
  }

  ngAfterViewInit() {
    var subOptions: any = {audioVolume : 10,width: 200,height: 150};
    this.subscriber = this.session.subscribe(this.stream, this.subscriberDiv.nativeElement, subOptions, (err) => {
      if (err) {
        this._snackBar.open(err.message, 'OK', {
          duration: 2000,
        });
      }
    });
  }
}
