import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { BridgeService } from '../util/bridge.service';

const expirationTime = 60000;

@Component({
  selector: 'app-challenge',
  templateUrl: './challenge.component.html',
  styleUrls: ['./challenge.component.css']
})

export class ChallengeComponent implements OnInit {
    public errorMessage = '';

    public isLoading = false;
    public  tokenId: string;

    public withdrawals: any[] = [];

    public loaderMessage = '';
    public transactionHash = '';

    public isChallengeActivated = false;

    public transferTxHash = '';
    public approvalTxHash = '';

    public selectedIdx = -1;
    public challengeType = 'past';


    constructor(public _bs: BridgeService, private _router: Router) {}

    async ngOnInit() {
      this.isLoading = true;
      this.loaderMessage = 'Connecting to network';
      const connectedNetwork = await this._bs.getConnectedNetwork();

      const time = localStorage.getItem('challengeTime');
      const now = new Date().getTime();
      if (time !== null && now - parseInt(time, 10) < expirationTime ) {
        this.isLoading = true;
        if (connectedNetwork !== 'ropsten') {
          this.loaderMessage = 'Please connect to the home netwok!';
        } else {
          this.doChallenge();
        }
      } else {
        if (connectedNetwork !== 'kovan') {
          this.isLoading = true;
          this.loaderMessage = 'Please connect to the foreign netwok!';
        } else {
          this.isLoading = false;
          this.getWithdrawals();
        }
      }
    }

    public async getWithdrawals() {
      this.withdrawals = await this._bs.getWithdrawalEventsFromDepositContract(1);
      console.log('withdrawals', this.withdrawals);
    }

    public openModal(idx: number) {
      this.selectedIdx = idx;
      this.isChallengeActivated = true;

      console.log('IDX: ', idx);
    }

    public closeModal() {
      this.selectedIdx = -1;
      this.transferTxHash = '';
      this.approvalTxHash = '';
      this.isChallengeActivated = false;
    }


    public async challenge() {
      if (this.transferTxHash !== '' && this.approvalTxHash !== '' && this.transferTxHash.length === 66 && this.approvalTxHash.length === 66) {
        this.loaderMessage = 'Challenging...';
        this.isLoading = true;
        this.errorMessage = '';

        const rawTransferFrom =  await this._bs.generateRawTxAndMsgHash(this.transferTxHash);

        const rawCustodianApprove = await this._bs.generateRawTxAndMsgHash(this.approvalTxHash);

        const challengeArgs =  await this._bs.formBundleLengthsHashes([rawTransferFrom, rawCustodianApprove]);

        const tokenId = this.withdrawals[this.selectedIdx].topics[2];

        localStorage.setItem('challengeArgs', JSON.stringify(challengeArgs));
        localStorage.setItem('challengeTokenId', tokenId);
        localStorage.setItem('challengeType', this.challengeType);
        localStorage.setItem('challengeTime', new Date().getTime().toString());

        await this.waitForNetwork('ropsten');
      }
    }

    private async doChallenge() {
      const challengeArgs = JSON.parse(localStorage.getItem('challengeArgs'));
      const tokenId = localStorage.getItem('challengeTokenId');
      const challengeType = localStorage.getItem('challengeType');
      try {

        const res = await this._bs.challenge(tokenId, challengeArgs, challengeType);
        console.log('res', res);
        this.transactionHash = res.transactionHash;
        this.isLoading = false;
        localStorage.clear();
      } catch (e) {
        this.errorMessage = e.message;
        this.isLoading = false;
      }
    }

    private async waitForNetwork(targetNetwork: string ) {
      const connectedNetwork = await this._bs.getConnectedNetwork();
      if (connectedNetwork !== targetNetwork) {
        this.loaderMessage = 'Please connect to the ' + ((targetNetwork === 'ropsten') ? 'home' : 'foreign') + ' netwok!';
        const delay = new Promise(resolve => setTimeout(resolve, 300));
        await delay;
        return await this.waitForNetwork(targetNetwork);
      }
    }
}

