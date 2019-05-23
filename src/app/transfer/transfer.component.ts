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

    public tokenContractAddr = '';


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

      this.tokenContractAddr = this._bs.getTokenContractAddr();

      this.isLoading = true;
      this.loaderMessage = 'Connecting to network';

      const connectedNetwork = await this._bs.getConnectedNetwork();

      if (connectedNetwork !== 'ethereum') {
        this.loaderMessage = 'Please connect to the foreign network!';
        return;
      }

      if (this._bs.getCurrentAddress() !== '') {
        this.getTokenIds();
      }

      this.accountChangeRef = this._bs.accountCast.subscribe( async () => {
        this.zone.run(() => {
          this.getTokenIds();
          });
      });

    }

    public async getTokenIds() {
      this.loaderMessage = 'Getting the tokenIds';
      this.isLoading = true;

      this.tokens = [];
      const currentAddress = this._bs.getCurrentAddress();

      let tokens: any[] = await this._bs.getTransferEventsFromTokenContract(1, null, currentAddress);
      let sentTokens: any[] = await this._bs.getTransferEventsFromTokenContract(1, currentAddress, null);
      let withdrawnTokens: any[] = await this._bs.getWithdrawEventsFromTokenContract(1, currentAddress);

      let filtered: any[] = [];
      // filter out sent tokens
      for (let i = 0; i < tokens.length; i++) {
        let match = false;
        for (let j = 0; j < sentTokens.length; j++ ) {
          if (tokens[i].topics[3] === sentTokens[j].topics[3]) {
            sentTokens.splice(j, 1);
            match = true;
            break;
          }
        }
        if (!match) {
          filtered.push(tokens[i].topics[3]);
        }
      }

      // filter out withdrawn tokens
      for (let i = 0; i < filtered.length; i++) {
        let match = false;
        for (let j = 0; j < withdrawnTokens.length; j++ ) {
          if (filtered[i] === withdrawnTokens[j].topics[1]) {
            withdrawnTokens.splice(j, 1);
            match = true;
            break;
          }
        }
        if (!match) {
          this.tokens.push(filtered[i]);
        }
      }


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

          // if (this.toAdress.toLowerCase() === this._bs.getCurrentAddress().toLowerCase()) {
          //   throw({message: 'You can\'t send tokens to yourself'});
          // }

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
}
