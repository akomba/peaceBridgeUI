import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFound404Component } from './not-found404.component';
import { MintComponent } from './mint/mint.component';
import { DepositComponent } from './deposit/deposit.component';
import { TransferComponent } from './transfer/transfer.component';
import { ApproveComponent } from './approve/approve.component';
import { WithdrawComponent } from './withdraw/withdraw.component';
import { ClaimComponent } from './claim/claim.component';
import { ChallengeComponent } from './challenge/challenge.component';

const routes: Routes = [
{ path: '', component: MintComponent, pathMatch: 'full' },
{ path: 'mint', component: MintComponent },
{ path: 'deposit', component: DepositComponent },
{ path: 'transfer', component: TransferComponent},
{ path: 'transfer/:tokenId', component: TransferComponent},
{ path: 'approve', component: ApproveComponent},
{ path: 'withdraw', component: WithdrawComponent},
{ path: 'claim', component: ClaimComponent},
{ path: 'claim/:tokenId', component: ClaimComponent},
{ path: 'challenge', component: ChallengeComponent},
{ path: '**', component: NotFound404Component }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
