import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TransferComponent} from './transfer.component';
import {RouterModule} from '@angular/router';
import { NgbAlertModule} from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../util/shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbAlertModule,
    SharedModule

  ],
  declarations: [TransferComponent],
  exports: [TransferComponent]
})

export class TransferModule {
}
