import {Component, OnInit, OnDestroy, ɵConsole} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {BridgeService, gasPerChallenge, gasPrice } from '../util/bridge.service';
// import { ethers, Wallet } from 'ethers';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { isFulfilled } from 'q';
// import { TransactionReceipt } from 'ethers/providers';
// import { throwError } from 'ethers/errors';

const expirationTime = 60000;

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.css']
})

export class WithdrawComponent implements OnInit, OnDestroy {
    public errorMessage = '';
    public isLoading = false;
    public loaderMessage = '';

    public tokenId = '';
    public transferTxHash = '';
    public custApproveTxHash = '';
    public withdrawTxHash = '';

    public resultHash: any = '';

    public accountCheckerVisible = false;

    constructor(public _bs: BridgeService, private _router: Router, private route: ActivatedRoute) {
    }

    async ngOnInit() {
      const connectedNetwork = await this._bs.getConnectedNetwork();

      const time = localStorage.getItem('time');
      const now = new Date().getTime();
      if (time !== null && now - parseInt(time, 10) < expirationTime ) {
        this.isLoading = true;
        if (connectedNetwork !== 'ropsten') {
          this.loaderMessage = 'Please connect to the home netwok!';
        } else {
          // popup with address change
          this.accountCheckerVisible = true;
          this.isLoading = false;
        }
      } else {
        if (connectedNetwork !== 'kovan') {
          this.isLoading = true;
          this.loaderMessage = 'Please connect to the foreign netwok!';
        }
      }
    }

    public ngOnDestroy(): void {
    }

    public async withdraw() {

      this.isLoading = true;
      await this.waitForNetwork('kovan');

      this.loaderMessage = 'Withdraw on tonken contract';

      try {

        // getting the token id from approve
        const res: any = await this._bs.getW3TxReceipt(this.custApproveTxHash/* , FOREIGN_NTW */);
        if (res === null) {
          throw({message: 'Transaction not found'});
        }
        this.tokenId = res.logs[0].topics[3];

        const owner = await this._bs.getTokenOwner(this.tokenId);
        if (owner.toLowerCase() !== this._bs.getCurrentAddress().toLowerCase()) {
          throw({message: 'No token id found'});
        }


        // getting the transaction hash
        this.transferTxHash =  await this.getTransferTxHash(res);

        const txNonce = await this._bs.getTransferNonce(this.tokenId);

        if ( this.transferTxHash === null) {
          throw ({message: 'No transfer tx hash found.'});
        }


        const tx: any = await this._bs.withdraw(this.tokenId);


        this.withdrawTxHash = tx.transactionHash;

        const rawTransferFrom = await this._bs.generateRawTxAndMsgHash(this.transferTxHash);
        const rawCustodianApprove = await this._bs.generateRawTxAndMsgHash(this.custApproveTxHash);
        const rawWithdrawal = await this._bs.generateRawTxAndMsgHash(this.withdrawTxHash);
        const withdrawArgs = await this._bs.formBundleLengthsHashes([rawWithdrawal, rawTransferFrom, rawCustodianApprove]);

        const receipt = await this._bs.getW3TxReceipt(this.transferTxHash);

        let addr: string = <string>receipt['logs'][0]['topics'][2];
        const toAddress = '0x' + addr.substr(26);

        localStorage.setItem('toAddress', toAddress);
        localStorage.setItem('withdrawArgs', JSON.stringify(withdrawArgs));
        localStorage.setItem('tokenId', this.tokenId);
        localStorage.setItem('nonce', txNonce);
        localStorage.setItem('time', new Date().getTime().toString());
        await this.waitForNetwork('ropsten');

      } catch (e) {
        if (e.message.indexOf('reverted by the EVM') > -1) {
            this.errorMessage = 'Transaction reverted by EVM';
        } else {
            this.errorMessage = e.message;
        }
        this.isLoading = false;
      }
    }

    public continueWithdraw() {
      this.accountCheckerVisible = false;
      this.isLoading = true;
      this.withdrawOnDepositContract();
    }


    private async getTransferTxHash(res: any) {

      const transfers = await this._bs.getTransferRequestEventsFromTokenContract(1);

      const aTopics = res.logs[0].topics;

      for (let i = 0; i < transfers.length; i++) {
        let topics = transfers[i].topics;

        if (topics[3] === aTopics[3] && topics[2] === aTopics[2] && topics[1] === aTopics[1]) {
          return transfers[i].transactionHash;
        }
      }
      return null;
    }





    private async withdrawOnDepositContract() {
      const withdrawArgs = JSON.parse(localStorage.getItem('withdrawArgs'));
      const toAddress = localStorage.getItem('toAddress');
      let amt = gasPerChallenge * gasPrice;

      this.tokenId = localStorage.getItem('tokenId');
      const nonce = parseInt(localStorage.getItem('nonce'), 10);

      if (nonce > 0) {
        amt = amt * nonce;
      }

      this.loaderMessage = 'Withdraw on deposit contract';
      let result = null;
      try {
          result = await this._bs.withdrawOnDepositContract(toAddress, this.tokenId, withdrawArgs.bytes32Bundle, withdrawArgs.txLengths, withdrawArgs.txMsgHashes, nonce,  amt);
          this.resultHash = result.transactionHash;
          this.isLoading = false;
        } catch (e) {
          if (e.message.indexOf('reverted by the EVM') > -1) {
              this.errorMessage = 'Transaction reverted by EVM';
          } else {
              this.errorMessage = e.message;
          }
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
