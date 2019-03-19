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
      this.errorMessage = '';

      this.loaderMessage = 'Claim in progress';
      this.isLoading = true;

      try {
        const owner = await this._bs.getTokenOwner(this.tokenId);
        if (owner.toLowerCase() !== this._bs.getCurrentAddress().toLowerCase()) {
          throw({message: 'No token id found'});
        }

        const result = await this._bs.claim(this.tokenId);
        this.transactionHash =  result.transactionHash;
        this.isLoading = false;
      } catch (e) {
          if (e.message.indexOf('reverted by the EVM') > -1) {
            this.errorMessage = 'Transaction reverted by EVM. Is the challenge period ended yet?';
          } else {
              this.errorMessage = e.message;
          }

        this.isLoading = false;
      }
    }
}

