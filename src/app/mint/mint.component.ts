import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { BridgeService} from '../util/bridge.service';

@Component({
  selector: 'app-mint',
  templateUrl: './mint.component.html',
  styleUrls: ['./mint.component.css']
})

export class MintComponent implements OnInit {
    public errorMessage = '';
    public products: any[];

    public isLoading = false;
    public amountToMint: Number;

    public loaderMessage = '';

    public isMintingFinished = false;
    public mintedTokenId = '';
    public txHash = '';

    constructor(public _bs: BridgeService, private _router: Router) {}

    async ngOnInit() {

      this.isLoading = true;
      this.loaderMessage = 'Connecting to network';

      const connectedNetwork = await this._bs.getConnectedNetwork();

      if (connectedNetwork !== 'kovan') {
        this.loaderMessage = 'Please connect to the foreign netwok!';
        return;
      }
      this.isLoading = false;
     }

    public async mint() {
      this.mintedTokenId = '';
      this.errorMessage = '';
      let result = null;
      this.loaderMessage = 'Minting in progress';
      this.isMintingFinished = false;
      this.isLoading = true;
      try {
        result = await this._bs.mintToken(this.amountToMint);
        this.mintedTokenId = this._bs.toHex(result.events.Mint.returnValues.tokenId);
        this.txHash = result.transactionHash;
        this.isMintingFinished = true;
        this.isLoading = false;
      } catch (e) {
        this.errorMessage = e.message;
        this.isLoading = false;
      }
    }
}
