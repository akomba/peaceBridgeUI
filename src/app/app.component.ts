import { Component, ViewEncapsulation, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { BridgeService } from './util/bridge.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, OnDestroy {
  public currentAccount = '';
  private accountChangeRef: Subscription = null;
  constructor(public _bs: BridgeService, private zone: NgZone) { }


  ngOnInit() {
    const t = this;
    this.accountChangeRef = this._bs.accountCast.subscribe( (someAcc) => {
      this.zone.run(() => {
        this.currentAccount = this._bs.getCurrentAddress();
        });
    });
  }


  ngOnDestroy() {
    this.accountChangeRef.unsubscribe();
  }

}
