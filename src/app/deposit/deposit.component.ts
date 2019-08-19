import {Component, OnInit, OnDestroy, NgZone} from '@angular/core';
import { Router } from '@angular/router';
import { BridgeService } from '../util/bridge.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css']
})

export class DepositComponent implements OnInit, OnDestroy {
    public errorMessage = '';
    public products: any[];

    public isLoading = false;

    public depositContractAddr = '';

    public loaderMessage = '';
    public transactionHash = '';
    public minterAddress = '';
    public noTokensFound = false;
    public mintedTokensFiltered: any[] = [];
    private mintedTokens: any[] = [];
    private depositedTokens: any[] = [];

    private accountChangeRef: Subscription = null;

    constructor(public _bs: BridgeService, private _router: Router, private zone: NgZone) {}

    async ngOnInit() {
      this.isLoading = true;
      this.errorMessage = '';
      this.loaderMessage = 'Connecting to network';
      const connectedNetwork = await this._bs.getConnectedNetwork();

      if (connectedNetwork !== 'classic') {
        this.loaderMessage = 'Please connect to the home network!' + ' (' + this._bs.getHomeNetworkName() + ')';
        return;
      } else {
        this.isLoading = false;
      }

      this.depositContractAddr = this._bs.getDepositContractAddr();

      /* if (this._bs.getCurrentAddress() !== '') {
        this.getTokens();
      }

      this.accountChangeRef = this._bs.accountCast.subscribe( async () => {
        this.zone.run(() => {
          this.mintedTokensFiltered = [];
          this.transactionHash = '';
          this.getTokens();
          });
      }); */
    }

    ngOnDestroy() {
      /* if (this.accountChangeRef) {
        this.accountChangeRef.unsubscribe();
      } */
    }

    public findTokens() {
      if (this.minterAddress !== '') {
        this.transactionHash = '';
        this.getTokens(this.minterAddress);
      }
    }

    public async getTokens(address: string) {
      this.mintedTokensFiltered = [];
      this.noTokensFound = false;
      this.loaderMessage = 'Getting the latest minted tokens';
      this.isLoading = true;
      this.mintedTokens = await this.getMintedTokens(address);
      this.depositedTokens = await this.getDepositEvents();
      this.mintedTokensFiltered = this.mintedTokens.filter(this.comparer(this.depositedTokens));

      if (this.mintedTokensFiltered.length === 0) {
        this.noTokensFound = true;
      }
      this.isLoading = false;
    }

    public async deposit(index: number) {
      this.errorMessage = '';




      if ( this.mintedTokensFiltered[index].amount === '' || parseFloat(this.mintedTokensFiltered[index].amount) === 0) {
        this.errorMessage = 'Amount can\'t be 0';
        return;
      }

      const amount: any = this._bs.toWei(this.mintedTokensFiltered[index].amount);

      this.isLoading = true;
      this.errorMessage = '';
      this.loaderMessage = 'Depositing in progress';
      try {
        const depositResult: any = await this._bs.depositToken(this.mintedTokensFiltered[index].tokenId,
                                                          this.mintedTokensFiltered[index].minter,
                                                         amount/* this.mintedTokensFiltered[index].amount */);
        this.transactionHash = depositResult.transactionHash;
        this.isLoading = false;
      } catch (e) {
        this.errorMessage = e.message;
        this.isLoading = false;
      }
    }

    private async getMintedTokens(minter: string) {
      const res = await this._bs.getMintEventsFromTokenContract(1);
      const currentAddress = this._bs.getCurrentAddress();
      let eventsLog: any[] = [];

      for (let i = 0; i < res.length; i++) {
       if ('0x' + res[i].topics[1].slice(26).toLowerCase() === minter.toLowerCase()) {
          eventsLog.push({
            tokenId: '0x' + res[i].data.slice(130),
            amount:  this._bs.toEth(this._bs.toBN(res[i].data.slice(0, 66))), // parseInt(res[i].data.slice(2, 66), 16),
            minter: '0x' + res[i].topics[1].slice(26)
          });
        }
      }
      return eventsLog;
    }

    private async getDepositEvents() {
      const res = await this._bs.getDepositEventsFromDepositContract(1);

      const currentAddress = this._bs.getCurrentAddress();

      let eventsLog: any[] = [];

      for (let i = 0; i < res.length; i++) {
       // if ('0x' + res[i].topics[1].slice(26).toLowerCase() === currentAddress.toLowerCase()) {
            eventsLog.push({
            tokenId: '0x' + res[i].data.slice(66, 130),
            amount: parseInt(res[i].data.slice(2, 66), 16),
            minter: '0x' + res[i].topics[1].slice(26)
          });
        //}
      }

      return eventsLog;
    }

    private comparer(otherArray) {
      return function(current) {
        return otherArray.filter(function(other) {
          return other.tokenId === current.tokenId /* && other.amount === current.amount */;
        }).length === 0;
      };
    }
}

