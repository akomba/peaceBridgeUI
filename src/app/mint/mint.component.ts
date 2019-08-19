import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { BridgeService} from '../util/bridge.service';
import BigNumber from 'bignumber.js';

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

    public tokenContractAddr = '';

    constructor(public _bs: BridgeService, private _router: Router) {}

    async ngOnInit() {

      this.isLoading = true;
      this.loaderMessage = 'Connecting to network';

      const connectedNetwork = await this._bs.getConnectedNetwork();

      if (connectedNetwork !== 'ethereum') {
        this.loaderMessage = 'Please connect to the foreign network!' + ' (' + this._bs.getForeignNetworkName() + ')';
        return;
      }
      this.tokenContractAddr = this._bs.getTokenContractAddr();
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

        const amount = this._bs.toBN(this._bs.toWei(this.amountToMint));
        const balance = this._bs.toBN(await this._bs.getBalanceForCurrentAccount());

        if (balance.isLessThan(amount)) {
          console.log('HE');
          throw ({message: 'Not enough funds.'});
        }

        result = await this._bs.mintToken(amount.toString());

        this.mintedTokenId = this._bs.toHex(result.events.Mint.returnValues.tokenId);
        this.txHash = result.transactionHash;
        this.isMintingFinished = true;
        this.isLoading = false;
      } catch (e) {
        this.errorMessage = e.message;
        this.isLoading = false;
      }
    }

    public clearErrorMsg() {
      this.errorMessage = '';
    }
}
