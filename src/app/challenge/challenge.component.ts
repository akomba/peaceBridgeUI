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
    public challenges: any[] = [];

    public loaderMessage = '';
    public transactionHash = '';

    public isChallengeActivated = false;

    public transferTxHash = '';
    public approvalTxHash = '';

    public selectedIdx = -1;
    public challengeType = 'past';
    public isResponse = false;


    constructor(public _bs: BridgeService, private _router: Router) {}

    async ngOnInit() {
      this.isLoading = true;
      this.loaderMessage = 'Connecting to network';
      const connectedNetwork = await this._bs.getConnectedNetwork();

      const time = localStorage.getItem('challengeTime');
      const now = new Date().getTime();

      if (connectedNetwork !== 'ropsten') {
        this.loaderMessage = 'Please connect to the home netwok!';
      } else {
        if (time !== null && now - parseInt(time, 10) < expirationTime ) {
          this.doChallenge();
        } else {
          await this.getWithdrawals();
          await this.getPendingChallenges();
          this.isLoading = false;
        }

      }
    }

    public async getWithdrawals() {
      this.withdrawals = await this._bs.getWithdrawalEventsFromDepositContract(1);
      console.log('withdrawals', this.withdrawals);
    }
    public async getPendingChallenges() {
      this.challenges = await this._bs.getChallengeInitiatedEventsFromDepositContract(1);
      console.log('Challenges---', this.challenges);
    }

    public openModal(idx: number, isResponse: boolean) {
      this.selectedIdx = idx;
      this.isResponse = isResponse;
      this.isChallengeActivated = true;
      console.log('IDX: ', idx);
    }

    public closeModal() {
      this.selectedIdx = -1;
      this.transferTxHash = '';
      this.approvalTxHash = '';
      this.isResponse = false;
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

        const tokenId = (this.isResponse) ? this.challenges[this.selectedIdx].data : this.withdrawals[this.selectedIdx].topics[2];

        localStorage.setItem('challengeArgs', JSON.stringify(challengeArgs));
        localStorage.setItem('challengeTokenId', tokenId);
        localStorage.setItem('challengeType', this.challengeType);
        localStorage.setItem('challengeResponse', this.isResponse ? 'true' : 'false');
        localStorage.setItem('challengeTime', new Date().getTime().toString());

        await this.waitForNetwork('ropsten');

        this.doChallenge();

      }
    }

    private async doChallenge() {
      const challengeArgs = JSON.parse(localStorage.getItem('challengeArgs'));
      const tokenId = localStorage.getItem('challengeTokenId');
      const isResponse =  localStorage.getItem('challengeResponse');
      let challengeType = localStorage.getItem('challengeType');
      if (isResponse === 'true') {
        challengeType = 'response';
      }

      const balance = await this._bs.getBalanceForCurrentAccount();

      try {

        const res = await this._bs.challenge(tokenId, challengeArgs, challengeType);
        console.log('res', res);
        this.transactionHash = res.transactionHash;
        this.isLoading = false;
        localStorage.clear();

        const newBalance = await this._bs.getBalanceForCurrentAccount();

        if(newBalance > balance) {
          // challenge was succesful
        } else {
          // challenge failed
        }

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

