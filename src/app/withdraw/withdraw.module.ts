import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {WithdrawComponent} from './withdraw.component';
import {RouterModule} from '@angular/router';
import { NgbAlertModule, NgbTooltipModule, NgbTabsetModule} from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../util/shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbAlertModule,
    NgbTooltipModule,
    NgbTabsetModule,
    SharedModule
  ],
  declarations: [WithdrawComponent],
  exports: [WithdrawComponent]
})

export class WithdrawModule {
}
