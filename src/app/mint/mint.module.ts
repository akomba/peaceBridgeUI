import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MintComponent} from './mint.component';
import {RouterModule} from '@angular/router';
import { NgbAlertModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbAlertModule,
    ClipboardModule,
    NgbTooltipModule
  ],
  declarations: [MintComponent],
  exports: [MintComponent]
})

export class MintModule {
}
