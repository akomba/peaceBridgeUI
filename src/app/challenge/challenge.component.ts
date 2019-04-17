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
    public isWithdrawalsRefreshing = false;
    public isPendingRefreshing = false;

    public proofs: any[] = [];
    public selectedProofIdx = -1;
    public suspiciousWithdrawal: any;

    public loaderMessage = '';
    public transactionHash = '';

    public isChallengeActivated = false;

    public transferTxHash = '';
    public approvalTxHash = '';

    public selectedIdx = -1;
    public challengeType = 'past';
    public isResponse = false;

    public challengerReward = 0;

    constructor(public _bs: BridgeService, private _router: Router) {}

    async ngOnInit() {
      this.isLoading = true;
      this.loaderMessage = 'Connecting to network';
      const connectedNetwork = await this._bs.getConnectedNetwork();

      const time = localStorage.getItem('challengeTime');
      const now = new Date().getTime();

      if (connectedNetwork !== 'classic') {
        this.loaderMessage = 'Please connect to the home netwok!';
      } else {
        this.loaderMessage = 'Collecting withdrawals';
        await this.getWithdrawals();
        // await this.getPendingChallenges();
        this.isLoading = false;
      }
    }

    public async getWithdrawals() {
      this.withdrawals = [];
      this.isWithdrawalsRefreshing = true;
      const withdrawals = await this._bs.getWithdrawalEventsFromDepositContract(1);
      const challenges = await this._bs.getResolvedChallenges(1);

      const filteredWithdrawals = withdrawals.filter(function(w: any) {
        return challenges.filter(function(c: any) {
          return c.data === w.topics[2];
        }).length === 0;
      });

      let time = Date.now();
      for (let i = 0; i < filteredWithdrawals.length; i++) {
        const challengeEnd = parseInt(await this._bs.getChallengeEndTime(filteredWithdrawals[i].topics[2]), 10) * 1000;

        if ( challengeEnd > /*1*/ time) {
          filteredWithdrawals[i].challengeEnd = challengeEnd;
          filteredWithdrawals[i].challengeEndNonce = parseInt(filteredWithdrawals[i].data.slice(-4), 16);
          this.withdrawals.push(filteredWithdrawals[i]);
        }
      }
      this.isWithdrawalsRefreshing = false;
    }

    public async getPendingChallenges() {
      this.isPendingRefreshing = true;
      this.challenges = [];
      const pendingChallenges = await this._bs.getChallengeInitiatedEventsFromDepositContract(1);


      let time = Date.now();
      for (let i = 0; i < pendingChallenges.length; i++) {
        const challengeEnd = parseInt(await this._bs.getChallengeEndTime(pendingChallenges[i].data), 10) * 1000;

        if ( challengeEnd > /*1*/ time) {
          pendingChallenges[i].challengeEnd = challengeEnd;
          this.challenges.push(pendingChallenges[i]);
        }
      }
      this.isPendingRefreshing = false;
    }

    public async openModal(idx: number, isResponse: boolean) {
      this.selectedIdx = idx;
      this.isResponse = isResponse;
      this.isChallengeActivated = true;
      this.selectedProofIdx = -1;
      this.proofs = [];

      // collect hashes for proof
      const tokenId = (isResponse) ? this.challenges[idx].data : this.withdrawals[idx].topics[2];

      this.suspiciousWithdrawal = {
        token: tokenId,
        to: '',
        challengeEndNonce: 0,
        lastProvenNonce: 0
      };

      if (isResponse) {
        this.suspiciousWithdrawal.to = '0x' + this.challenges[idx].topics[1].slice(26);
      } else {
        this.suspiciousWithdrawal.to = '0x' + this.withdrawals[idx].topics[1].slice(26);
     }

     this.suspiciousWithdrawal.challengeEndNonce = await this._bs.getChallengeEndNonce(tokenId);
     this.suspiciousWithdrawal.lastProvenNonce = await this._bs.getLastProvenNonce(tokenId);

      const transferRequests: any[] = await this._bs.getTransferRequestEventsFromTokenContractByToken(1, tokenId);
      const transfers: any[] = await this._bs.getTransferEventsFromTokenContractByToken(1, tokenId);

      for (let i = 0; i < transferRequests.length; i++) {
        let matchIdx = -1;
        let blockDistance = 10000000;
        for ( let j = 0; j < transfers.length; j++) {
          // find the closest matching transaction
          if (transferRequests[i].topics[1] === transfers[j].topics[1] &&
             transferRequests[i].topics[2] === transfers[j].topics[2] &&
             transferRequests[i].topics[3] === transfers[j].topics[3] &&
             transferRequests[i].blockNumber < transfers[j].blockNumber) {
             if (transfers[j].blockNumber - transferRequests[i].blockNumber < blockDistance) {
                blockDistance = transfers[j].blockNumber - transferRequests[i].blockNumber;
                matchIdx = j;
              }
         }
        }
        if (matchIdx !== -1) {
          let res = {
            from: '0x' + transfers[matchIdx].topics[1].slice(26).toLowerCase(),
            to: '0x' + transfers[matchIdx].topics[2].slice(26).toLowerCase(),
            transferHash: transferRequests[i].transactionHash,
            approvalHash: transfers[matchIdx].transactionHash,
            transferBlock: transferRequests[i].blockNumber,
            approvalBlock: transfers[matchIdx].blockNumber,
            nonce: parseInt(transferRequests[i].data.slice(62, 66), 16)
          };
          this.proofs.push(res);
        }
      }
    }

    public closeModal() {
      this.selectedIdx = -1;
      this.transferTxHash = '';
      this.approvalTxHash = '';
      this.isResponse = false;
      this.isChallengeActivated = false;
    }

    public selectProof(idx) {
      this.selectedProofIdx = idx;
    }

    public async newChallenge() {
      this.transactionHash = '';
      this.loaderMessage = 'Collecting withdrawals';
      this.isLoading = true;
      await this.getWithdrawals();
      await this.getPendingChallenges();
      this.isLoading = false;
    }

    public refreshTab(which: string) {
      // clear result message
      this.transactionHash = '';
      if (which === 'pending') {
        if (!this.isPendingRefreshing) {
          this.getPendingChallenges();
        }
      } else {
        if (!this.isWithdrawalsRefreshing) {
          this.getWithdrawals();
        }
      }
    }

    public tabSwitch(which: string ) {
      // clear error message on tab change
      this.errorMessage = '';
      if (which === 'pending') {
        if (this.challenges.length === 0) {
          this.refreshTab(which);
        }
      } else {
        if (this.withdrawals.length === 0) {
          this.refreshTab(which);
        }
      }
    }

    public async challenge() {
     // if (this.transferTxHash !== '' && this.approvalTxHash !== '' && this.transferTxHash.length === 66 && this.approvalTxHash.length === 66) {
      this.challengerReward = 0;

     if (this.selectedProofIdx !== -1) {
        this.loaderMessage = 'Challenging...';
        this.isLoading = true;
        this.errorMessage = '';

        const rawTransferFrom =  await this._bs.generateRawTxAndMsgHash(this.proofs[this.selectedProofIdx].transferHash, true); // use the foreign network
        const rawCustodianApprove = await this._bs.generateRawTxAndMsgHash(this.proofs[this.selectedProofIdx].approvalHash, true);
        const challengeArgs =  await this._bs.formBundleLengthsHashes([rawTransferFrom, rawCustodianApprove]);
        const tokenId = (this.isResponse) ? this.challenges[this.selectedIdx].data : this.withdrawals[this.selectedIdx].topics[2];

        let challengeType = this.challengeType;
        if (this.isResponse === true) {
          challengeType = 'response';
        }

        const balance = await this._bs.getBalanceForCurrentAccount();

        try {
          const challengeEndNonce = await this._bs.getChallengeEndNonce(tokenId);
          const res = await this._bs.challenge(tokenId, challengeArgs, challengeType, challengeEndNonce);
          this.transactionHash = res.transactionHash;
          this.isLoading = false;

          if (this.challengeType === 'future' || this.challengeType === 'response') {
            const newBalance = await this._bs.getBalanceForCurrentAccount();
            if (newBalance > balance) {
              // challenge was succesful
              this.challengerReward = newBalance - balance;
            } else {
              // challenge failed
              this.challengerReward = newBalance - balance;
            }
          }

          this.closeModal();

        } catch (e) {
          if (e.message.indexOf('reverted by the EVM') > -1) {
            this.errorMessage = 'Transaction reverted by EVM.';
          } else {
              this.errorMessage = e.message;
          }

          this.isLoading = false;
          // localStorage.clear();
          this.closeModal();
        }
      }
    }
}

