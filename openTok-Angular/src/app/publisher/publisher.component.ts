import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  Input
} from '@angular/core';
import {
  Router
} from '@angular/router';
import {
  MatSnackBar
} from '@angular/material/snack-bar';
import { OpentokService } from '../core/services/opentok.service';

@Component({
  selector: 'app-publisher',
  templateUrl: './publisher.component.html',
  styleUrls: ['./publisher.component.css']
})

export class PublisherComponent implements AfterViewInit {
  @ViewChild('publisherDiv',{static: false}) publisherDiv: ElementRef;
  // @ViewChild('screenPreview') screenPreview: ElementRef;
  @Input() session: OT.Session;
  @Input() userInfo;
  publisher: OT.Publisher;
  publishing: Boolean;
  showAudio = false;
  showVideo = true;
  showShare = true;
  screenShare;
  subscriber;
  constructor(private opentokService: OpentokService,
    private _snackBar: MatSnackBar, private router: Router) {
    this.publishing = false;
  }

  ngAfterViewInit() {
    this.videoShare();
  }
  videoShare() {
    // if(this.screenShare){
    //   this.screenShare.off();
    // }
    this.showShare = true;
    var name;
    if (!this.userInfo && sessionStorage.getItem('userData')) {
      name = sessionStorage.getItem('userData');
    } else if (this.userInfo && this.userInfo.userName) {
      name = this.userInfo.userName;
    } else {
      this.router.navigateByUrl('videoConferencing/login');
    }
    const OT = this.opentokService.getOT();
    this.publisher = OT.initPublisher(this.publisherDiv.nativeElement, {
        publishAudio: true,
        mirror: false,
        publishVideo: false,
        width: 1000,
        height: 550,
        name: name,
        style: {
          buttonDisplayMode: 'off'
        }
      },
      (error) => {
        if (error) {
          this._snackBar.open('Please allow access to audio and Video devices', 'OK', {
            duration: 10000,
          });
        }
      });
    if (this.session) {
      if (this.session['isConnected']()) {
        this.publish(this.publisher);
      }
      this.session.on('sessionConnected', () =>
        this.publish(this.publisher)
      );
    }
  }
  hideVideo() {
    this.publisher.publishVideo(false);
    this.showVideo = true;
  }
  enableVideo() {
    if (this.publisher.accessAllowed) {
      this.publisher.publishVideo(true);
      this.showVideo = false;
    } else {
      this._snackBar.open('Please provide access to the video and audio device to access by browser', 'OK', {
        duration: 2000,
      });
    }
  }
  enableAudio() {
    if (this.publisher.accessAllowed) {
      this.showAudio = true;
      this.publisher.publishAudio(true);
    } else {
      this._snackBar.open('Please provide access to the video and audio device to access by browser', 'OK', {
        duration: 2000,
      });
    }
  }
  disableAudio() {
    this.showAudio = false;
    this.publisher.publishAudio(false);
  }
  enableSharing() {
    // if(navigator.userAgent.toLowerCase().indexOf('safari/') > -1){
    //   alert('Safari browser doesnot support screen share please use different browser to share your screen');
    // } else {
      this.showShare = false;
      const OT = this.opentokService.getOT();
      const screenPublisherProps = {
        publishAudio: true,
        videoSource: 'screen',
        width: 1000,
        height: 550,
        mirror: false,
        maxResolution: {
          width: 1920,
          height: 1080
        }
      };
      var screenPublisherElement = document.createElement('div');
      OT.checkScreenSharingCapability((response) => {
        if (!response.supported) {
          this._snackBar.open('This browser does not support screen sharing.', 'OK', {
            duration: 2000,
          });
        } else if (navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2] < '72' || (window.navigator.userAgent.match(/Firefox\/([0-9]+)\./) && window.navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1] < '69')) {
          window.confirm('Upgrade your browser version');
          return false;
        } else {
          this.screenShare = OT.initPublisher(screenPublisherElement, screenPublisherProps,
            (error) => {
              if (error) {
                this._snackBar.open('You have cancelled screen share', 'OK', {
                  duration: 10000,
                });
              }
            });
          this.publish(this.screenShare);
        }
      });
      // this.session.on('streamCreated', (event) =>
      
      //   this.session.subscribe(event.stream, this.publisherDiv.nativeElement)
      // );
      this.screenShare.on('mediaStopped', (event) =>
        this.hideSharing()
      );
  }
  hideSharing() {
    // this.session.unpublish(this.screenShare);
    this.showShare = true;
    this.videoShare();
  }

  // onVolumeChange(event){
  //   this.subscriber = this.session.subscribe(this.stream);
  //   this.subscriber.setAudioVolume(event.value);
  // }
  closeMeeting() {
    if (this.publisher) {
      this.publisher.off();
    }
    if (this.screenShare) {
      this.screenShare.off();
    }
    this.session.disconnect();
    sessionStorage.removeItem('userData')
    this.router.navigateByUrl('/videoConferencing/login');
  }
  publish(data) {
    this.session.publish(data, (err) => {
      if (err) {
        this.hideSharing()
      } else {
        this.publishing = true;
      }
    });
  }
}
