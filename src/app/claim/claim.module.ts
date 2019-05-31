import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ClaimComponent} from './claim.component';
import {RouterModule} from '@angular/router';
import { NgbAlertModule, NgbTabsetModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbAlertModule,
    NgbTabsetModule,
    NgbTooltipModule,
    ClipboardModule
  ],
  declarations: [ClaimComponent],
  exports: [ClaimComponent]
})

export class ClaimModule {
}
