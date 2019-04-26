import {Component, OnInit, OnDestroy, NgZone} from '@angular/core';
import { Router } from '@angular/router';
import { BridgeService } from '../util/bridge.service';
import { Subscription } from 'rxjs';

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
    public transactionHash = ''

    public tokens: any[] = [];
    public tokenIdIdx = -1;
    private accountChangeRef: Subscription = null;

    public depositContractAddr = '';


    constructor(public _bs: BridgeService, private _router: Router, private zone: NgZone) {}

    async ngOnInit() {
      this.isLoading = true;
      this.loaderMessage = 'Connecting to network';
      const connectedNetwork = await this._bs.getConnectedNetwork();
      if (connectedNetwork !== 'classic') {
        this.loaderMessage = 'Please connect to the home network!';
        return;
      }

      if (this._bs.getCurrentAddress() !== '') {
        this.getTokens();
      }

      this.accountChangeRef = this._bs.accountCast.subscribe( async () => {
        this.zone.run(() => {
          this.getTokens();
          });
      });
      this.depositContractAddr = this._bs.getDepositContractAddr();

    }


    public async getTokens() {
      this.errorMessage = '';
      this.transactionHash = '';

      this.loaderMessage = 'Collecting tokens...';
      const currentAddress = this._bs.getCurrentAddress();
      this.tokens = await this._bs.getWithdrawEventsFromTokenContract(1, currentAddress);
      this.isLoading = false;
    }

    public async claim(isStake: boolean) {
      this.transactionHash = '';
      this.errorMessage = '';

      this.loaderMessage = 'Claim in progress';
      this.isLoading = true;

      try {
          const tokenId = (isStake) ? this.tokenId : this.tokens[this.tokenIdIdx].topics[1];
          const challengeTime = await this._bs.getChallengeEndTime(tokenId);
          const challengeEndNonce = await this._bs.getChallengeEndNonce(tokenId);
          const lastProvenNonce = await this._bs.getLastProvenNonce(tokenId);

        if (!isStake) {
          if (challengeTime === 0) {
            throw({message: 'The challenge period has not started yet'});
          }
          if (challengeTime * 1000 > Date.now()) {
            throw({message: 'The challenge period has not ended yet'});
          }
          if (challengeEndNonce !== lastProvenNonce) {
            throw({message: 'The challenge response has not been proven to endNonce'});
          }

          const owner = await this._bs.getTokenOwner(tokenId);
          if (owner.toLowerCase() !== this._bs.getCurrentAddress().toLowerCase()) {
            throw({message: 'No token id found'});
          }

          const result = await this._bs.claim(tokenId);
          this.transactionHash =  result.transactionHash;
          this.isLoading = false;
        } else {
          if (challengeTime === 0) {
            throw({message: 'The challenge period has not started yet'});
          }
          if (challengeTime * 1000 > Date.now()) {
            throw({message: 'The challenge period has not ended yet'});
          }
          if (challengeEndNonce === lastProvenNonce && lastProvenNonce === 0 ) {
            throw({message: 'Challenge not initated / withdrawal is honest'});
          }

          const result = await this._bs.claimStake(this.tokenId);
          this.transactionHash =  result.transactionHash;
          this.isLoading = false;
        }

      } catch (e) {
          if (e.message.indexOf('reverted by the EVM') > -1) {
            this.errorMessage = 'Transaction reverted by EVM. Has the challenge period ended yet?';
          } else {
              this.errorMessage = e.message;
          }

        this.isLoading = false;
      }
    }
}

