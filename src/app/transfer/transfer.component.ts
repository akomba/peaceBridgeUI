import {Component, OnInit, OnDestroy, NgZone} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {BridgeService } from '../util/bridge.service';
// import { ethers, Wallet } from 'ethers';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})

export class TransferComponent implements OnInit, OnDestroy {
    public errorMessage = '';
    public isLoading = false;
    public loaderMessage = '';

    public tokens: string[] = [];

    public tokenId = '';
    public tokenIdIdx = 0;
    public toAdress = '';
    public txHash = '';

    private subscription: any;
    private accountChangeRef: Subscription = null;

    constructor(public _bs: BridgeService, private _router: Router, private route: ActivatedRoute, private zone: NgZone) {
    }

    async ngOnInit() {
      this.txHash = '';
      this.subscription = this.route.params.subscribe(params => {
        if (params['tokenId'] !== undefined) {

          let tid = (params['tokenId'].startsWith('0x')) ? params['tokenId'].substr(2) : params['tokenId'];
          if (tid.length === 64) {
            this.tokenId = '0x' + tid;

          } else {
            console.error('Wrong token id param');
          }
        }
      });

      this.isLoading = true;
      this.loaderMessage = 'Connecting to network';

      const connectedNetwork = await this._bs.getConnectedNetwork();

      if (connectedNetwork !== 'kovan') {
        this.loaderMessage = 'Please connect to the foreign netwok!';
        return;
      }

      this.accountChangeRef = this._bs.accountCast.subscribe( async () => {
        this.zone.run(() => {
          this.getTokenIds();
          });
      });

      this.getTokenIds();
    }

    public async getTokenIds() {
      this.loaderMessage = 'Getting the tokenIds';
      this.isLoading = true;

      const res = await this._bs.getTransferEventsFromTokenContract(1);

      const currentAddress = this._bs.getCurrentAddress();
      let tokens: any[] = [];
      let sentTokens: any[] = [];

      for (let i = 0; i < res.length; i++) {
       if ('0x' + res[i].topics[2].slice(26).toLowerCase() === currentAddress.toLowerCase()) {
          tokens.push(res[i].topics[3]);
        }
        if ('0x' + res[i].topics[1].slice(26).toLowerCase() === currentAddress.toLowerCase()) {
          sentTokens.push(res[i].topics[3]);
        }
      }
      this.tokens = tokens.filter(this.comparer(sentTokens));
      this.isLoading = false;
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.accountChangeRef.unsubscribe();
    }

    public async transfer() {
      if (this.tokenIdIdx < 0) { return; }

        this.tokenId = this.tokens[this.tokenIdIdx];

        this.loaderMessage = 'Transfer in progress';
        this.isLoading = true;
        this.errorMessage = '';

        // transfer
        try {

          if (this.toAdress.toLowerCase() === this._bs.getCurrentAddress().toLowerCase()) {
            throw({message: 'You can\'t send tokens to yourself'});
          }

          const txNonce = await this._bs.getTransferNonce(this.tokenId);

          const res: any = await this._bs.transferToken(this.toAdress, this.tokenId, txNonce);

          this.isLoading = false;
          this.txHash = res.transactionHash;

          // remove the sent token id
          this.tokens.splice(this.tokenIdIdx, 1);

        } catch (e) {
          this.errorMessage = e.message;
          this.isLoading = false;
        }
    }

    private comparer(otherArray: any) {
      return function(current: any) {
        return otherArray.filter(function(other: string, idx: number , arr: any) {
          if (other === current) {
            delete arr[idx];
            return true;
          }
          return false;
        }).length === 0;
      };
    }

}
