import {Component, OnInit, OnDestroy, NgZone} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {BridgeService, gasPerChallenge, gasPrice } from '../util/bridge.service';
import { Subscription } from 'rxjs';


const expirationTime = 120000;

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
    public noTokensFound = false;
    public noWithdrawnTokensFound = false;
    public transferTxHash = '';
    public custApproveTxHash = '';
    public withdrawTxHash = '';

    public resultHash: any = '';

    public accountCheckerVisible = false;

    public tokens: any [] = [];
    public withdrawnTokens: any [] = [];

    private accountChangeRef: Subscription = null;

    constructor(public _bs: BridgeService, private _router: Router, private route: ActivatedRoute, private zone: NgZone) {
    }

    async ngOnInit() {
      const connectedNetwork = await this._bs.getConnectedNetwork();

      const time = localStorage.getItem('time');
      const now = new Date().getTime();
      if (time !== null && now - parseInt(time, 10) < expirationTime ) {
        this.isLoading = true;
        if (connectedNetwork !== 'classic') {
          this.loaderMessage = 'Please connect to the home network!';
        } else {
          // popup with address change
          this.accountCheckerVisible = true;
          this.isLoading = false;
        }
      } else {
        if (connectedNetwork !== 'ethereum') {
          this.isLoading = true;
          this.loaderMessage = 'Please connect to the foreign network!';
        } else {



          if (this._bs.getCurrentAddress() !== '') {
            this.getTokens();
          }

          this.accountChangeRef = this._bs.accountCast.subscribe( async () => {
            this.zone.run(() => {
              this.getTokens();
              });
          });

        }
      }
    }

    public ngOnDestroy(): void {
      if (this.accountChangeRef !== null) {
        this.accountChangeRef.unsubscribe();
      }
    }

    private async getTokens() {
      this.loaderMessage = 'Collecting tokens...';
      this.isLoading = true;

      this.tokens = [];
      this.withdrawnTokens = [];
      this.noTokensFound = false;
      this.noWithdrawnTokensFound = false;

      const currentAddress = this._bs.getCurrentAddress();
      const allIncoming: any[] = await this._bs.getTransferEventsFromTokenContract(1, null, currentAddress);
      const outgoing: any[] = await this._bs.getTransferEventsFromTokenContract(1, currentAddress, null);
      const withdrawals: any[] = await this._bs.getWithdrawEventsFromTokenContract(1, currentAddress);

      let incoming: any[] = [];

      // filter mints
      for (let i = 0; i < allIncoming.length; i++) {
        if (allIncoming[i].topics[1] !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
          incoming.push(allIncoming[i]);
        }
      }

      // filter outgoing transfers
      let filtered: any = [];
      for (let i = 0; i < incoming.length; i++) {
        let match = false;
        for (let j = 0; j < outgoing.length; j++ ) {
          if (incoming[i].topics[3] === outgoing[j].topics[3]) {
            outgoing.splice(j, 1);
            match = true;
            break;
          }
        }
        if (!match) {
          filtered.push(incoming[i]);
        }
      }
      // filter withdrawn tokens
      for (let i = 0; i < filtered.length; i++) {
        let match = false;
        for (let j = 0; j < withdrawals.length; j++) {
          if (filtered[i].topics[3] === withdrawals[j].topics[1]) {
            match = true;
            break;
          }
        }
        if (!match) {
          this.tokens.push(filtered[i]);
        } else {
          this.withdrawnTokens.push(filtered[i]);
        }
      }

      if (this.tokens.length === 0) {
        this.noTokensFound = true;
      }

      if (this.withdrawnTokens.length === 0) {
        this.noWithdrawnTokensFound = true;
      }

      this.isLoading = false;
    }

    public async withdraw(idx: number) {

      this.custApproveTxHash = this.tokens[idx].transactionHash;

      this.isLoading = true;
      await this.waitForNetwork('ethereum');

      this.loaderMessage = 'Withdraw on token contract';

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
        await this.waitForNetwork('classic');

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
        this.loaderMessage = 'Please connect to the ' + ((targetNetwork === 'classic') ? 'home' : 'foreign') + ' network!';
        const delay = new Promise(resolve => setTimeout(resolve, 300));
        await delay;
        return await this.waitForNetwork(targetNetwork);
      }
    }
}
