import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { BridgeService} from '../util/bridge.service';



const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err); }

      resolve(res);
    })
  );

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

      let txHash = null;

      this.loaderMessage = 'Minting in progress';
      this.isLoading = true;

      try {
        txHash = await this._bs.mintToken(this.amountToMint);
      } catch (e) {
        console.log('error', e.message);
        this.isLoading = false;
        return;
      }

      this.loaderMessage = 'Wainting for tx receipt';

      let tokenId: string = null;

      try {
        tokenId = await this.getTokenId(txHash);
      } catch (e) {
        console.log('error', e.message);
        this.isLoading = false;
        return;
      }

      this.mintedTokenId = tokenId;
      this.isMintingFinished = true;
      this.isLoading = false;
    }

    private async getTokenId(hash: any) {
      let receipt = null;
      try {
        receipt = await this._bs.getW3TxReceipt(hash);
      } catch (e) {
        console.log('error:', e.message);
      }
      if (receipt === null) {
        const delay = new Promise(resolve => setTimeout(resolve, 300));
        await delay;
        return await this.getTokenId(hash);
      }
      const tokenId = receipt['logs'][0]['topics'][3];
      return tokenId;
    }
}
