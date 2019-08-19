import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BridgeService } from '../util/bridge.service';
// import { ethers, Wallet } from 'ethers';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-approve',
  templateUrl: './approve.component.html',
  styleUrls: ['./approve.component.css']
})

export class ApproveComponent implements OnInit, OnDestroy {
    public errorMessage = '';
    public isLoading = false;
    public loaderMessage = '';

    public transfers: any = null;
    public apprTxHash = '';

    public isApproveFinished = false;

    public tokenContractAddr = '';

    constructor(public _bs: BridgeService, private _router: Router, private route: ActivatedRoute) {
    }

    async ngOnInit() {
      this.isLoading = true;
      this.loaderMessage = 'Connecting to network';

      const connectedNetwork = await this._bs.getConnectedNetwork();

      if (connectedNetwork !== 'ethereum') {
        this.loaderMessage = 'Please connect to the foreign network!' + ' (' + this._bs.getForeignNetworkName() + ')';
        return;
      }

      this.loaderMessage = 'Getting the latest transactions';
      this.getTransfers();
      this.tokenContractAddr = this._bs.getTokenContractAddr();
    }

    public ngOnDestroy(): void {

    }

    public async getTransfers() {
      const transferRequests: any[] = await this._bs.getTransferRequestEventsFromTokenContract(1);
      const transfers: any[] = await this._bs.getTransferEventsFromTokenContract(1);

      let tr: any[] = [];
      let t: any[] = [];


      for (let i = 0; i < transferRequests.length; i++) {
        tr.push(this.getTxValues(transferRequests[i]));
      }
      for (let i = 0; i < transfers.length; i++) {
        // filter mints
        if (transfers[i].topics[1] !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
          t.push(this.getTxValues(transfers[i]));
        }
      }


      this.transfers = tr.filter(this.comparer(t));

      this.isLoading = false;
    }

    public async approve(txHash: string, tokenId: string) {

        this.isLoading = true;
        this.loaderMessage = 'Getting nonce from tx';
        this.errorMessage = '';

        try {

          const nonce = await this._bs.getNonceFromTransferRequest(txHash);

          this.loaderMessage = 'Custodian approve call';

          const result: any = await this._bs.custodianApprove(tokenId, nonce);

           this.apprTxHash = result.transactionHash;
          this.isApproveFinished = true;
          this.isLoading = false;
          this.transfers = [];

        } catch (e) {
          this.isLoading = false;
          this.errorMessage = 'Transaction error: ' + e.message;
        }
    }

    private getTxValues(resItem) {
      return {
        transferRequests: resItem.transactionHash,
        blockNumber: resItem.blockNumber,
        from: resItem.topics[1],
        to: resItem.topics[2],
        tokenId: resItem.topics[3],
        nonce: (resItem.data.length > 3) ? parseInt(resItem.data.slice(0, 66), 16) : 0
      };
    }

    private comparer(otherArray) {
      return function(current) {
        return otherArray.filter(function(other) {
          return other.tokenId === current.tokenId  && other.blockNumber > current.blockNumber;
        }).length === 0;
      };
    }

    private highestNonce(otherArray) {
      return function(current) {
        return otherArray.filter(function(other) {
          return other.tokenId === current.tokenId && other.nonce > current.nonce;
        }).length === 0;
      };
    }

  }
