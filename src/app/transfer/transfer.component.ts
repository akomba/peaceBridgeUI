import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {BridgeService } from '../util/bridge.service';
// import { ethers, Wallet } from 'ethers';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

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

    constructor(public _bs: BridgeService, private _router: Router, private route: ActivatedRoute) {
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


      this.loaderMessage = 'Getting the tokenIds';

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
    }

    public async transfer() {
      if (this.tokenIdIdx < 0) { return; }

        this.tokenId = this.tokens[this.tokenIdIdx];

        this.loaderMessage = 'Transfer in progress';
        this.isLoading = true;
        this.errorMessage = '';

        // transfer
        try {
          const tx: any = await this._bs.transferToken(this.toAdress, this.tokenId, 0);

          console.log('transfer token tx', tx);
          this.isLoading = false;
          this.txHash = tx;

          // remove the sent token id
          this.tokens.splice(this.tokenIdIdx, 1);

        } catch (e) {
          console.log('ERROR', e);
          this.errorMessage = e.message;
          this.isLoading = false;
        }
    }

    private comparer(otherArray) {
      return function(current) {
        return otherArray.filter(function(other) {
          return other === current;
        }).length === 0;
      };
    }

}
