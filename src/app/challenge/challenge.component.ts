import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { BridgeService } from '../util/bridge.service';

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
      if (connectedNetwork !== 'ropsten') {
        this.loaderMessage = 'Please connect to the home netwok!';
      } else {
        this.isLoading = false;
        this.getWithdrawals();
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
        this.isLoading = true;

        const rawTransferFrom = await this._bs.generateRawTxAndMsgHash(this.transferTxHash);
        const rawCustodianApprove = await this._bs.generateRawTxAndMsgHash(this.approvalTxHash);
        const challengeArgs = await this._bs.formBundleLengthsHashes([rawTransferFrom, rawCustodianApprove]);
        const tokenId = this.withdrawals[this.selectedIdx].topics[2];

        this._bs.challenge(tokenId, challengeArgs, this.challengeType);
      }
    }
}

