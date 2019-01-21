import {Injectable} from '@angular/core';
import Web3 from 'web3';
import { contractAbis } from './abis';

const EthereumTx: any = require('ethereumjs-tx');
const Account: any = require('eth-lib/lib/account');
const RLP: any = require('eth-lib/lib/rlp');
const Bytes: any = require('eth-lib/lib/bytes');
const Hash: any = require('eth-lib/lib/hash');

const queryRange = 50000; // in blocks...
/*
const foreignNetwork = 'kovan';
const homeNetwork = 'ropsten'; */

const tokenContractAddr = '0x366021610bF0D5EbfdC9041a7f8b152aa76E6D98';
const depositContractAddr = '0xcBB5AeF36f6cde3e046c64EB2149BFFB59b8EFFf';


declare var require: any;
declare let window: any;

export const FOREIGN_NTW = 0;
export const HOME_NTW = 1;
export const gasPerChallenge = 206250;
export const gasPrice = 10000000000;


const promisify = (inner: any) =>
  new Promise((resolve, reject) =>
    inner((err: any, res: any) => {
      if (err) { reject(err); }

      resolve(res);
    })
  );


@Injectable()
export class BridgeService {

  private tokenContractWeb3: any = null;
  private depositContractWeb3: any = null;

  private connectedNetwork = '';
  private selectedAddress: string = null;


  // providers
  private web3: Web3 = null;
  private foreignWeb3: Web3 = null;
  private homeWeb3: Web3 = null;

  constructor() {
    window.addEventListener('load', async (event) => {
      this.intBridge();
    });
  }

  public async intBridge() {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.enable();
            // TODO: Get accounts
        } catch (error) {
            // User denied account access...
        }
      }

      if (typeof window.web3 !== 'undefined') {
        this.web3 = new Web3(window.web3.currentProvider);

        this.web3.currentProvider.publicConfigStore.on('update', (res) => {
          this.selectedAddress = res.selectedAddress;
        });

        this.tokenContractWeb3 = new this.web3.eth.Contract(JSON.parse(contractAbis.tokenAbi), tokenContractAddr);
        this.depositContractWeb3 = new this.web3.eth.Contract(JSON.parse(contractAbis.depositAbi), depositContractAddr);

        this.web3.eth.net.getNetworkType().then(ntwType => {
          this.connectedNetwork = ntwType;
         });


         this.foreignWeb3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/v3/e4d8f9fcacfd46ec872c77d66711e1aa'));
         this.homeWeb3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/e4d8f9fcacfd46ec872c77d66711e1aa'));

      }
  }

  public mintToken (amount) {
    if (this.selectedAddress !== '') {
      return promisify(cb => this.tokenContractWeb3.methods.mint(amount, this.selectedAddress).send({from: this.selectedAddress }, cb));
    } else {
      throw ({message: 'No address found.'});
    }
  }

  public depositToken (tokenId: string, minterAddress: string, amount: string) {
    return promisify(cb => this.depositContractWeb3.methods.deposit(
      tokenId, minterAddress).send({from: this.selectedAddress, value: amount }, cb));
  }

  public transferToken(toAdress, tokenId, declaredNonce) {
    return promisify(cb => this.tokenContractWeb3.methods.transferFrom(
      this.selectedAddress, toAdress, tokenId, declaredNonce).send({from: this.selectedAddress}, cb));
  }

  public custodianApprove(tokenId: string, nonce: any) {
    return promisify(cb => this.tokenContractWeb3.methods.custodianApprove(tokenId, nonce).send({from: this.selectedAddress}, cb));
  }

  public withdraw(tokenId: string) {
    return promisify(cb => this.tokenContractWeb3.methods.withdraw(tokenId).send({from: this.selectedAddress}, cb));
  }

  public withdrawOnDepositContract(
    to: string,
    tokenId: string,
    bytes32Bundle: any,
    txLengths: any,
    txMsgHashes: any,
    nonce: number,
    amount: number ) {

    return promisify(cb => this.depositContractWeb3.methods.withdraw(
      to,
      tokenId,
      bytes32Bundle,
      txLengths,
      txMsgHashes,
      nonce).send({from: this.selectedAddress, value: amount, gas: 8000000 }, cb));
  }

  public claim (tokenId: string) {
    return promisify(cb => this.depositContractWeb3.methods.claim(tokenId).send({from: this.selectedAddress}, cb));
  }


  public challenge (tokenId: string, challengeArgs: any, challengeType: string) {
    if (challengeType === 'past') {
      return promisify(cb => this.depositContractWeb3.methods.initiateChallengeWithPastCustody(
        this.selectedAddress,
        tokenId,
        challengeArgs.bytes32Bundle,
        challengeArgs.txLengths,
        challengeArgs.txMsgHashes,
        {gasPrice: gasPrice, value: gasPrice * gasPerChallenge * 4})
        .send({from: this.selectedAddress}, cb));
      } else {
        return promisify(cb => this.depositContractWeb3.methods.challengeWithFutureCustody(
          this.selectedAddress,
          tokenId,
          challengeArgs.bytes32Bundle,
          challengeArgs.txLengths,
          challengeArgs.txMsgHashes)
          .send({from: this.selectedAddress}, cb));
      }
  }







  public getW3TokenContract() {
    return this.tokenContractWeb3;
  }
  public getW3DepositContract() {
    return this.depositContractWeb3;
  }

  public async getConnectedNetwork() {
    if (this.connectedNetwork === '') {
      const delay = new Promise(resolve => setTimeout(resolve, 300));
      await delay;
      return await this.getConnectedNetwork();
    }
    return this.connectedNetwork;
  }

  public getConnectedNetworkName() {
    return this.connectedNetwork;
  }

  public async getW3TxReceipt(txHash: string) {
      return promisify( cb => this.web3.eth.getTransactionReceipt(txHash, cb));
  }

  public getCurrentAddress() {
    if (this.selectedAddress !== '') {
      return this.selectedAddress;
    }
    return '....';
  }

  public async getTransferRequestEventsFromTokenContract(startBlock?: number) {
    return this.getW3EventLog(this.foreignWeb3, tokenContractAddr, this.tokenContractWeb3.events.TransferRequest().options.params.topics[0], (startBlock) ? startBlock : null );
  }

  public async getMintEventsFromTokenContract(startBlock?: number) {
    return this.getW3EventLog(this.foreignWeb3, tokenContractAddr, this.tokenContractWeb3.events.Mint().options.params.topics[0], (startBlock) ? startBlock : null );


  }

  public async getDepositEventsFromDepositContract(startBlock?: number) {
    return this.getW3EventLog(this.homeWeb3, depositContractAddr, this.depositContractWeb3.events.Deposit().options.params.topics[0], (startBlock) ? startBlock : null );
  }

  public async getTransferEventsFromTokenContract(startBlock?: number) {

    return this.getW3EventLog(this.foreignWeb3, tokenContractAddr, this.tokenContractWeb3.events.Transfer().options.params.topics[0], (startBlock) ? startBlock : null );
  }

  public async getWithdrawalEventsFromDepositContract(startBlock?: number) {
    return this.getW3EventLog(this.homeWeb3, depositContractAddr, this.depositContractWeb3.events.Withdrawal().options.params.topics[0], (startBlock) ? startBlock : null );
  }


   public async getW3EventLog(w3, contractAddress, topic, startBlock?) {
    if (startBlock === null) {
      const lastBlock = await this.web3.eth.getBlockNumber();
      startBlock = lastBlock - queryRange;
      if (startBlock < 0) {
        startBlock = 0;
      }
    }

    const filter = {
      address: contractAddress,
      fromBlock: startBlock,
      toBlock: 'latest',
      topics: [topic]
    };
    return w3.eth.getPastLogs(filter);
  }

  public async getNonceFromTransferRequest (txHash) {
    const transactionReceipt = await this.getW3TxReceipt(txHash);
    return transactionReceipt['logs'][0]['data'][65];
  }

  public async generateRawTxAndMsgHash (_txHash) {

    const tx = await this.web3.eth.getTransaction(_txHash);

    // wait for tx
    if (tx === null) {
      const delay = new Promise(resolve => setTimeout(resolve, 300));
      await delay;
      return await this.generateRawTxAndMsgHash(_txHash);
    }

    const txParams: any = {};
    txParams.nonce = await this.web3.utils.toHex(tx['nonce']);
    txParams.gasPrice = await this.web3.utils.toHex(tx['gasPrice']);
    txParams.gasLimit = await this.web3.utils.toHex(tx['gas']);
    txParams.to = await tx['to'];
    txParams.value = await this.web3.utils.toHex(tx['value']);
    txParams.data = await tx['input'];
    txParams.v = await tx['v']; // .toString('hex');
    txParams.r = await tx['r']; // .toString('hex');
    txParams.s = await tx['s']; // .toString('hex');


    const txRaw =  new EthereumTx(txParams);
    const rawTx = txRaw.serialize();


    const values = RLP.decode('0x' + rawTx.toString('hex'));

    let v = values[6];

    if (v.substr(v.length - 1) === '7') {
      v = '0x1b';
    }
    if (v.substr(v.length - 1) === '8') {
      v = '0x1c';
    }
    const r = values[7];
    const s = values[8];

    const txParams2: any = {};
    txParams2.nonce = values[0];
    txParams2.gasPrice = values[1];
    txParams2.gasLimit = values[2];
    txParams2.to = values[3];
    txParams2.value = values[4];
    txParams2.data = values[5];
    txParams2.v = v;
    txParams2.r = values[7];
    txParams2.s = values[8];

    const txRaw2 = new EthereumTx(txParams2);
    const rawTx2 = txRaw2.serialize();

    // Form msgHash
    const signature = Account.encodeSignature(values.slice(6, 9));
    const recovery = Bytes.toNumber(values[6]);
    const extraData = recovery < 35 ? [] : [Bytes.fromNumber((recovery - 35) >> 1), '0x', '0x'];
    const signingData = values.slice(0, 6).concat(extraData);
    const signingDataHex = RLP.encode(signingData);

    const msgHash = Hash.keccak256(signingDataHex);

    return {rawTx: rawTx2, msgHash: msgHash};

  }

  public formBundleLengthsHashes(rawTxArr) {
    let bundleArr = [];
    let txLengths = [];
    let txMsgHashes = [];
    rawTxArr.forEach((value, i) => {
      bundleArr[i] = value.rawTx.toString('hex');
      txLengths[i] = value.rawTx.toString('hex').length + 2;
      txMsgHashes[i] = value.msgHash;

    });
    const bytes32Bundle = this.txsToBytes32BundleArr(bundleArr);
    return {bytes32Bundle: bytes32Bundle, txLengths: txLengths, txMsgHashes: txMsgHashes};
  }

  private txsToBytes32BundleArr(rawTxStringArr) {
    let bytes32Bundle = [];
    rawTxStringArr.forEach(value => {
      let tempBundle = this.toBytes32BundleArr(value);
      tempBundle.forEach(val => bytes32Bundle.push(val));
    });
    return bytes32Bundle;
  }

  private toBytes32BundleArr (rawBundle) {
    let bytes32Bundle = [];
    for (let i = 0; i < rawBundle.length; i ++) {
      bytes32Bundle[Math.floor(i / 64)] = (bytes32Bundle[Math.floor(i / 64)]) ? bytes32Bundle[Math.floor(i / 64)] + rawBundle[i] : rawBundle[i] ;
    }
    bytes32Bundle.forEach((value, index) => {
      bytes32Bundle[index] = '0x' + bytes32Bundle[index];
      // padding if shorter than 32
      while (bytes32Bundle[index].length < 66) { bytes32Bundle[index] += '0'; }
      if (bytes32Bundle[index].length !== 66) { throw new Error('invalid web3 implicit bytes32'); }
    });
    return bytes32Bundle;
  }


}
