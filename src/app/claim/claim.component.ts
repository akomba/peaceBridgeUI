import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { BridgeService } from '../util/bridge.service';

@Component({
  selector: 'app-claim',
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.css']
})

export class ClaimComponent implements OnInit {
    public errorMessage = '';

    public isLoading = false;
    public  tokenId: string;

    public loaderMessage = '';
    public transactionHash = '';


    constructor(public _bs: BridgeService, private _router: Router) {}

    async ngOnInit() {
      this.isLoading = true;
      this.loaderMessage = 'Connecting to network';
      const connectedNetwork = await this._bs.getConnectedNetwork();
      if (connectedNetwork !== 'ropsten') {
        this.loaderMessage = 'Please connect to the home netwok!';
      } else {
        this.isLoading = false;
      }
    }

    public async claim() {
      this.transactionHash = '';

      this.loaderMessage = 'Claim in progress';
      this.isLoading = true;

      try {
        const result = await this._bs.claim(this.tokenId);
        this.transactionHash =  result.toString();
      } catch (e) {
        this.isLoading = false;
      }


      this.isLoading = false;
    }
}

