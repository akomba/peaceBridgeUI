import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { HashShortener } from './hash.shortener.pipe';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [HashShortener],
  exports: [HashShortener],
})
export class SharedModule {}
