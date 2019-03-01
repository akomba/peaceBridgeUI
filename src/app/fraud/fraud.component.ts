import {Component, OnInit, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { BridgeService } from '../util/bridge.service';

const expirationTime = 60000;

@Component({
  selector: 'app-fraud',
  templateUrl: './fraud.component.html',
  styleUrls: ['./fraud.component.css']
})

export class FraudComponent implements OnInit {
    public errorMessage = '';

    public isLoading = false;
    public loaderMessage = '';

    constructor(public _bs: BridgeService, private _router: Router) {}

    ngOnInit() {}





}

