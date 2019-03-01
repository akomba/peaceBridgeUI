import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {FraudComponent} from './fraud.component';
import {RouterModule} from '@angular/router';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbAlertModule
  ],
  declarations: [FraudComponent],
  exports: [FraudComponent]
})

export class FraudModule {
}
