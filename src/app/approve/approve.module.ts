import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ApproveComponent} from './approve.component';
import {RouterModule} from '@angular/router';
import { NgbAlertModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../util/shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbAlertModule,
    NgbTooltipModule,
    SharedModule
  ],
  declarations: [ApproveComponent],
  exports: [ApproveComponent]
})

export class ApproveModule {
}
