import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TransferComponent} from './transfer.component';
import {RouterModule} from '@angular/router';
import { NgbAlertModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../util/shared.module';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbAlertModule,
    SharedModule,
    ClipboardModule,
    NgbTooltipModule

  ],
  declarations: [TransferComponent],
  exports: [TransferComponent]
})

export class TransferModule {
}
