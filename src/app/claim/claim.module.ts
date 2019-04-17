import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ClaimComponent} from './claim.component';
import {RouterModule} from '@angular/router';
import { NgbAlertModule, NgbTabsetModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbAlertModule,
    NgbTabsetModule
  ],
  declarations: [ClaimComponent],
  exports: [ClaimComponent]
})

export class ClaimModule {
}
