import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ChallengeComponent} from './challenge.component';
import {RouterModule} from '@angular/router';
import { NgbAlertModule, NgbTabsetModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../util/shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbAlertModule,
    NgbTabsetModule,
    NgbTooltipModule,
    SharedModule
  ],
  declarations: [ChallengeComponent],
  exports: [ChallengeComponent]
})

export class ChallengeModule {
}
