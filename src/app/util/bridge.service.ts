import {Injectable} from '@angular/core';
import Web3 from 'web3';
import { contractAbis } from './abis';
import { Subject, Observable } from 'rxjs';

declare var require: any;
declare let window: any;


const EthereumTx: any = require('ethereumjs-tx');
const Account: any = require('eth-lib/lib/account');
const RLP: any = require('eth-lib/lib/rlp');
const Bytes: any = require('eth-lib/lib/bytes');
const Hash: any = require('eth-lib/lib/hash');

const QUERY_RANGE = 50000; // in blocks...
const TOKEN_CONTRACT_ADDRESS = '0x20dD16A7CFb58b1a61a79CC0FD014342e75C16c7';
// const DEPOSIT_CONTRACT_ADDRESS = '0x2Ac55CA0a8CD28B4355bc7737B41aAd3f0117904'; // Ropsten
const DEPOSIT_CONTRACT_ADDRESS = '0x3fb03455923341b0176947e395f46d086c38fe7d'; // Kotti

const FOREIGN_PROVIDER = 'https://kovan.infura.io/v3/e4d8f9fcacfd46ec872c77d66711e1aa';
// const HOME_PROVIDER = 'http://localhost:8545';
const HOME_PROVIDER = 'https://www.ethercluster.com/kotti';
const HOME_BLOCK_EXPLORER = 'kottiexplorer.ethernode.io';
const FOREIGN_BLOCK_EXPLORER = 'kovan.etherscan.io';


export const gasPerChallenge = 206250;
export const gasPrice = 10000000000;


@Injectable()
export class BridgeService {

  public accountChange: Subject<string>;
  public accountCast: Observable<string>;


  private networks = {
    foreign: {
      id: 42,
      code: 'ethereum',
      name: 'Ethereum',
      networkName: 'kovan'
    },
    home: {
      id: 6,
      code: 'classic',
      name: 'Ethereum Classic',
      networkName: 'kotti'
    }
  };


  private connectedNetwork = '';
  private selectedAddress: string = null;

  // for read
  private tokenContractWeb3: any = null;
  private depositContractWeb3: any = null;


  // providers
  private web3: Web3 = null;
  private foreignWeb3: Web3 = null;
  private homeWeb3: Web3 = null;

  constructor() {
    this.accountChange = new Subject<string>();
    this.accountCast = this.accountChange.asObservable();

    window.addEventListener('load', async (event) => {
      this.intBridge();
    });
  }

  public async intBridge() {

      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.enable();
        } catch (error) {
            console.error(error);
        }
      }

      if (typeof window.web3 !== 'undefined') {

        this.web3 = new Web3(window.web3.currentProvider);
        this.homeWeb3 = new Web3(new Web3.providers.HttpProvider(HOME_PROVIDER));
        this.foreignWeb3 = new Web3(new Web3.providers.HttpProvider(FOREIGN_PROVIDER));

        // get the first account
        const accounts = await this.web3.eth.getAccounts();
        this.selectedAddress = accounts[0];
        this.accountChange.next(this.selectedAddress);

        // start polling for account changes
        const t = this;
        let accountInterval = setInterval(async function() {
          // tslint:disable-next-line:no-shadowed-variable
          let accounts: any = await t.web3.eth.getAccounts();
          if (accounts[0] !== t.selectedAddress) {
            t.selectedAddress = accounts[0];
            t.accountChange.next(t.selectedAddress);
          }
        }, 600);

        this.tokenContractWeb3 = new this.foreignWeb3.eth.Contract(JSON.parse(contractAbis.tokenAbi), TOKEN_CONTRACT_ADDRESS);
        this.depositContractWeb3 = new this.homeWeb3.eth.Contract(JSON.parse(contractAbis.depositAbi), DEPOSIT_CONTRACT_ADDRESS);


        this.web3.eth.net.getId().then(netId => {
          if (netId === this.networks.foreign.id) {
            this.connectedNetwork = 'foreign';
          } else {
            this.connectedNetwork = 'home';
          }
        });
      }
  }

  /* Contract functions */
  public mintToken (amount: any) {
    if (this.selectedAddress !== null) {
      const tokenContract = this.getTokenContract();
      return tokenContract.methods.mint(amount, this.selectedAddress).send({from: this.selectedAddress });
    } else {
      throw ({message: 'No address found.'});
    }
  }

  public depositToken (tokenId: string, minterAddress: string, amount: string) {
    if (this.selectedAddress !== null) {
     const depositContract = this.getDepositContract();

     console.log('contract', depositContract);


     return depositContract.methods.deposit(tokenId, minterAddress).send({from: this.selectedAddress, value: amount });
    } else {
      throw ({message: 'No address found.'});
    }
  }

  public transferToken(toAdress, tokenId, declaredNonce) {
    if (this.selectedAddress !== null) {
      const tokenContract = this.getTokenContract();
      return tokenContract.methods.transferFrom(this.selectedAddress, toAdress, tokenId, declaredNonce).send({from: this.selectedAddress});
    } else {
       throw ({message: 'No address found.'});
    }
  }

  public custodianApprove(tokenId: string, nonce: any) {
    if (this.selectedAddress !== null) {
      const tokenContract = this.getTokenContract();
      return tokenContract.methods.custodianApprove(tokenId, nonce).send({from: this.selectedAddress});
    } else {
       throw ({message: 'No address found.'});
    }
  }

  public withdraw(tokenId: string) {
    if (this.selectedAddress !== null) {
      const tokenContract = this.getTokenContract();
      return tokenContract.methods.withdraw(tokenId).send({from: this.selectedAddress});
    } else {
       throw ({message: 'No address found.'});
    }
  }

  public withdrawOnDepositContract(
    to: string,
    tokenId: string,
    bytes32Bundle: any,
    txLengths: any,
    txMsgHashes: any,
    nonce: number,
    amount: number ) {

    if (this.selectedAddress !== null) {
      const depositContract = this.getDepositContract();
      return depositContract.methods.withdraw(
        to,
        tokenId,
        bytes32Bundle,
        txLengths,
        txMsgHashes,
        nonce).send({from: this.selectedAddress, value: amount, gas: 8000000});
    } else {
      throw ({message: 'No address found.'});
    }
}

  public claim (tokenId: string) {
    if (this.selectedAddress !== null) {
      const depositContract = this.getDepositContract();
      return depositContract.methods.claim(tokenId).send({from: this.selectedAddress});
    } else {
      throw ({message: 'No address found.'});
    }
  }

  public claimStake (tokenId: string) {
    if (this.selectedAddress !== null) {
      const depositContract = this.getDepositContract();
      return depositContract.methods.claimStake(tokenId).send({from: this.selectedAddress});
    } else {
      throw ({message: 'No address found.'});
    }
  }

  public challenge (tokenId: string, challengeArgs: any, challengeType: string, challengeEndNonce: number) {

    if (this.selectedAddress !== null) {

      const depositContract = this.getDepositContract();
      switch (challengeType) {
        case 'past': {
          return depositContract.methods.initiateChallengeWithPastCustody(
            this.selectedAddress,
            tokenId,
            challengeArgs.bytes32Bundle,
            challengeArgs.txLengths,
            challengeArgs.txMsgHashes)
            .send({from: this.selectedAddress, gasPrice: gasPrice, value: gasPrice * gasPerChallenge * challengeEndNonce});
        }
        case 'response': {
          return depositContract.methods.challengeWithPastCustody(
            this.selectedAddress,
            tokenId,
            challengeArgs.bytes32Bundle,
            challengeArgs.txLengths,
            challengeArgs.txMsgHashes)
            .send({from: this.selectedAddress});
          break;
        }
        case 'future': {
          return depositContract.methods.challengeWithFutureCustody(
            this.selectedAddress,
            tokenId,
            challengeArgs.bytes32Bundle,
            challengeArgs.txLengths,
            challengeArgs.txMsgHashes)
            .send({from: this.selectedAddress});
        }
      }
    } else {
      throw ({message: 'No address found.'});
    }
  }


  /* Getters */
  public getDepositContract(){
    return new this.web3.eth.Contract(JSON.parse(contractAbis.depositAbi), DEPOSIT_CONTRACT_ADDRESS);
  }

  public getTokenContract(){
    return new this.web3.eth.Contract(JSON.parse(contractAbis.tokenAbi), TOKEN_CONTRACT_ADDRESS);
  }

  public getHomeBlockExplorer(){
    return HOME_BLOCK_EXPLORER;
  }
  public getForeignBlockExplorer(){
    return FOREIGN_BLOCK_EXPLORER;
  }

  public getTokenContractAddr(){
    return TOKEN_CONTRACT_ADDRESS;
  }

  public getDepositContractAddr(){
    return DEPOSIT_CONTRACT_ADDRESS;
  }

  public getHomeNetworkName(){
    return this.networks.home.networkName;
  }

  public getForeignNetworkName(){
    return this.networks.foreign.networkName;
  }


  public async getConnectedNetwork() {
    if (this.connectedNetwork === '') {
      const delay = new Promise(resolve => setTimeout(resolve, 300));
      await delay;
      return await this.getConnectedNetwork();
    }
    return this.networks[this.connectedNetwork].code;
  }

  public getConnectedNetworkName() {

    if (this.connectedNetwork === '') {
      return '';
    }
    return this.networks[this.connectedNetwork].name;
  }

  public getCurrentAddress() {
    if (this.selectedAddress !== null) {
      return this.selectedAddress;
    }
    return '';
  }

  public getBalanceForCurrentAccount() {
    return this.web3.eth.getBalance(this.selectedAddress);
  }

  public async getW3TxReceipt(txHash: any) {
      return this.web3.eth.getTransactionReceipt(txHash);
  }

  public async waitForW3TxReceipt(txHash: any) {
      const receipt = await this.getW3TxReceipt(txHash);
      if (receipt === null) {
        const delay = new Promise(resolve => setTimeout(resolve, 1000));
        await delay;
        return await this.waitForW3TxReceipt(txHash);
      } else {
        return receipt;
      }
  }

  public getBlock(blockNumber: string) {
    return this.web3.eth.getBlock(blockNumber);
  }

  /* Event functions */

  public async getWithdrawEventsFromTokenContract(startBlock: number, withdrawerAddress: string) {
    const topic: any[] = [this.foreignWeb3.utils.sha3('Withdraw(uint256,address)'), null, ('0x000000000000000000000000' + withdrawerAddress.slice(2).toLowerCase())];
    return this.getW3EventLog(this.foreignWeb3, TOKEN_CONTRACT_ADDRESS, topic, startBlock );
  }

  public async getTransferRequestEventsFromTokenContract(startBlock?: number) {
    const topic: any[] = [this.foreignWeb3.utils.sha3('TransferRequest(address,address,uint256,uint256,bytes32)')];
    return this.getW3EventLog(this.foreignWeb3, TOKEN_CONTRACT_ADDRESS, topic, (startBlock) ? startBlock : null );
  }

  public async getTransferRequestEventsFromTokenContractByToken(startBlock: number, tokenId: string ) {
    let topic: any[] = [this.foreignWeb3.utils.sha3('TransferRequest(address,address,uint256,uint256,bytes32)')];
    topic[1] = null;
    topic[2] = null;
    topic[3] = tokenId;
    return this.getW3EventLog(this.foreignWeb3, TOKEN_CONTRACT_ADDRESS, topic, (startBlock) ? startBlock : null );
  }

  public async getMintEventsFromTokenContract(startBlock?: number) {
    const topic: any[] = [this.foreignWeb3.utils.sha3('Mint(uint256,address,uint256,uint256)')];
    return this.getW3EventLog(this.foreignWeb3, TOKEN_CONTRACT_ADDRESS, topic, (startBlock) ? startBlock : null );
  }

  public async getTransferEventsFromTokenContract(startBlock: number, fromAddress?: string, toAddress?: string) {
    let topic: any[] = [this.foreignWeb3.utils.sha3('Transfer(address,address,uint256)'), null, null, null];
    if (fromAddress !== undefined && fromAddress !== null) {
      topic[1] = '0x000000000000000000000000' + fromAddress.slice(2).toLowerCase();
    }
    if (toAddress !== undefined && toAddress !== null) {
      topic[2] = '0x000000000000000000000000' + toAddress.slice(2).toLowerCase();
    }
    return this.getW3EventLog(this.foreignWeb3, TOKEN_CONTRACT_ADDRESS, topic, (startBlock) ? startBlock : null );
  }

  public async getTransferEventsFromTokenContractByToken(startBlock: number, tokenId: string) {
    let topic: any[] = [this.foreignWeb3.utils.sha3('Transfer(address,address,uint256)'), null, null, null];
/*     topic[1] = null;
    topic[2] = null; */
    topic[3] = tokenId;
    return this.getW3EventLog(this.foreignWeb3, TOKEN_CONTRACT_ADDRESS, topic, (startBlock) ? startBlock : null );
  }

  public async getDepositEventsFromDepositContract(startBlock?: number) {
    let topic: any[] = [this.homeWeb3.utils.sha3('Deposit(address,uint256,uint256,address)')];
    return this.getW3EventLog(this.homeWeb3, DEPOSIT_CONTRACT_ADDRESS, topic, (startBlock) ? startBlock : null );

  }

  public async getChallengeInitiatedEventsFromDepositContract(startBlock?: number) {
    let topic: any[] = [this.homeWeb3.utils.sha3('ChallengeInitiated(address,address,uint256)'), null, null, null];
    return this.getW3EventLog(this.homeWeb3, DEPOSIT_CONTRACT_ADDRESS, topic, (startBlock) ? startBlock : null );

  }

  public async getResolvedChallenges(startBlock?: number) {
    let topic: any[] = [this.homeWeb3.utils.sha3('ChallengeResolved(uint256)'), null, null, null];
    return this.getW3EventLog(this.homeWeb3, DEPOSIT_CONTRACT_ADDRESS, topic, (startBlock) ? startBlock : null );

  }

  public async getWithdrawalEventsFromDepositContract(startBlock?: number) {
    let topic: any[] = [this.homeWeb3.utils.sha3('Withdrawal(address,uint256,uint256,uint256)')];
    return this.getW3EventLog(this.homeWeb3, DEPOSIT_CONTRACT_ADDRESS, topic, (startBlock) ? startBlock : null );
  }

  public async getW3EventLog(w3, contractAddress, topic, startBlock?) {
    if (startBlock === null) {
      const lastBlock = await w3.eth.getBlockNumber();
      startBlock = lastBlock - QUERY_RANGE;
      if (startBlock < 0) {
        startBlock = 0;
      }
    }

    const filter = {
      address: contractAddress,
      fromBlock: startBlock,
      toBlock: 'latest',
      topics: topic
    };
    return w3.eth.getPastLogs(filter);
  }

  public async getNonceFromTransferRequest (txHash) {
    const transactionReceipt = await this.getW3TxReceipt(txHash);
    return parseInt(transactionReceipt['logs'][0]['data'].slice(0, 66), 16);
  }

  public getTransferNonce(tokenId) {
    return this.tokenContractWeb3.methods.transferNonce(tokenId).call();
  }

  public getTokenOwner(tokenId: string) {
    return this.tokenContractWeb3.methods.ownerOf(tokenId).call();
  }

  public getLastProvenCustodian(tokenId: string) {
    return this.depositContractWeb3.methods.tokenIdToMinter(tokenId).call();
  }
  public getChallengeEndTime(tokenId: string) {
    return this.depositContractWeb3.methods.challengeTime(tokenId).call();
  }
  public getChallengeEndNonce(tokenId: string) {
    return this.depositContractWeb3.methods.challengeEndNonce(tokenId).call();
  }
  public getLastProvenNonce(tokenId: string) {
    return this.depositContractWeb3.methods.challengeNonce(tokenId).call();
  }


  /* Utils */

  public toWei(ethAmount: any) {
    return this.web3.utils.toWei(ethAmount, 'ether');
  }

  public toEth(weiAmount: any) {
    return this.web3.utils.fromWei(weiAmount, 'ether');
  }

  public toBN(value: any) {
    return this.web3.utils.toBN(value);
  }

  public async generateRawTxAndMsgHash (_txHash, onForeignNetwork = false) {
    // let w3 = this.web3; 
    let w3 = this.homeWeb3;

    if (onForeignNetwork === true) {
      w3 = this.foreignWeb3;
    } else {
      onForeignNetwork = false;
    }


    const tx = await w3.eth.getTransaction(_txHash);
    // wait for tx
    if (tx === null) {
      const delay = new Promise(resolve => setTimeout(resolve, 2000));
      await delay;
      return await this.generateRawTxAndMsgHash(_txHash, onForeignNetwork);
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

  public toHex (value: string) {
    return this.web3.utils.toHex(value);
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
