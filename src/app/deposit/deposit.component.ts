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

    public loaderMessage = '';
    public transactionHash = '';
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

      if (connectedNetwork !== 'ropsten') {
        this.loaderMessage = 'Please connect to the home netwok!';
        return;
      }

      this.getTokens();

      this.accountChangeRef = this._bs.accountCast.subscribe( async () => {


        this.zone.run(() => {
          this.mintedTokensFiltered = null;
          this.transactionHash = '';
          this.getTokens();
          });
      });
    }

    ngOnDestroy() {
      if (this.accountChangeRef) {
        this.accountChangeRef.unsubscribe();
      }
    }

    public async getTokens() {
      this.loaderMessage = 'Getting the latest minted tokens';
      this.isLoading = true;
      this.mintedTokens = await this.getMintedTokens();
      this.depositedTokens = await this.getDepositEvents();
      this.mintedTokensFiltered = this.mintedTokens.filter(this.comparer(this.depositedTokens));
      this.isLoading = false;
    }

    public async deposit(index: number) {

      this.isLoading = true;
      this.errorMessage = '';
      this.loaderMessage = 'Depositing in progress';
      try {
        const depositResult: any = await this._bs.depositToken(this.mintedTokensFiltered[index].tokenId,
                                                          this.mintedTokensFiltered[index].minter,
                                                          this.mintedTokensFiltered[index].amount);
        this.transactionHash = depositResult.transactionHash;
        this.isLoading = false;
      } catch (e) {
        this.errorMessage = e.message;
        this.isLoading = false;
      }
    }

    private async getMintedTokens() {
      const res = await this._bs.getMintEventsFromTokenContract(1);
      const currentAddress = this._bs.getCurrentAddress();
      let eventsLog: any[] = [];

      for (let i = 0; i < res.length; i++) {
       if ('0x' + res[i].topics[1].slice(26).toLowerCase() === currentAddress.toLowerCase()) {
          eventsLog.push({
            tokenId: '0x' + res[i].data.slice(130),
            amount: parseInt(res[i].data.slice(2, 66), 16),
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
       if ('0x' + res[i].topics[1].slice(26).toLowerCase() === currentAddress.toLowerCase()) {
            eventsLog.push({
            tokenId: '0x' + res[i].data.slice(66, 130),
            amount: parseInt(res[i].data.slice(2, 66), 16),
            minter: '0x' + res[i].topics[1].slice(26)
          });
        }
      }

      return eventsLog;
    }

    private comparer(otherArray) {
      return function(current) {
        return otherArray.filter(function(other) {
          return other.tokenId === current.tokenId && other.amount === current.amount;
        }).length === 0;
      };
    }
}

