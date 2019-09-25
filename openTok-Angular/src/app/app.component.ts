import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import * as OT from '@opentok/client';
import {
  Router,
  NavigationEnd
} from '@angular/router';
import {
  MatSnackBar
} from '@angular/material/snack-bar';
import {
  OpentokService
} from './core/services/opentok.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Video Chat';
  session: OT.Session;
  streams: Array < OT.Stream > = [];
  changeDetectorRef: ChangeDetectorRef;
  showVideoPage = false;
  userName;
  userInfo;
  selectedOption;
  mediaAllowed = true;
  constructor(private ref: ChangeDetectorRef, private _snackBar: MatSnackBar, private router: Router, private opentokService: OpentokService) {
    this.changeDetectorRef = ref;
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.urlAfterRedirects.includes('videoConferencing/home')) {
          this.showVideoPage = true;
        } else {
          this.showVideoPage = false;
        }
      }
    });
  }
  ngOnInit() {
    this.opentokService.initSession().then((session: OT.Session) => {
        this.session = session;
        this.session.on('streamCreated', (event) => {
          this.streams.push(event.stream);
          this.changeDetectorRef.detectChanges();
        });
        this.session.on('streamDestroyed', (event) => {
          const idx = this.streams.indexOf(event.stream);
          if (idx > -1) {
            this.streams.splice(idx, 1);
            this.changeDetectorRef.detectChanges();
          }
        });
      })
      .then(() => this.opentokService.connect())
      .catch((err) => {
        console.error(err);
        alert('Unable to connect. Make sure you have updated the config.ts file with your OpenTok details.');
      });
  }
  joinRoom() {
    this.userInfo = {
      userName: this.userName,
      userOption: this.selectedOption
    };
    if (!this.mediaAllowed) {
      this._snackBar.open('Please allow video and audio devices', 'OK', {
        duration: 2000,
      });
      return false;
    }
    if (navigator.getUserMedia && this.mediaAllowed) {
      navigator.getUserMedia({
          video: true,
          audio: true
        },

        // successCallback
        (localMediaStream) => {
          if (this.userName) {
            this.showVideoPage = true;
            sessionStorage.setItem('userData', this.userInfo.userName);
            this.router.navigateByUrl('videoConferencing/home');
          } else {
            this._snackBar.open('Please enter your name', 'OK', {
              duration: 2000,
            });
          }
        },

        // errorCallback
        (err) => {
          this.mediaAllowed = false;
          if (err) {
            // Explain why you need permission and how to update the permission setting
            this._snackBar.open('Please allow video and audio devices', 'OK', {
              duration: 2000,
            });
            return false;
          }
        });
    }
  }
}
