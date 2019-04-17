import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'hashShortener'})
export class HashShortener implements PipeTransform {
  transform(hash: string, length: number): string {
    if (!hash) { return ''; }
    const prefix = (hash.indexOf('0x') > -1) ? 2 : 0;
    const shortHash: string = hash.slice(0, prefix + length) + '...' + hash.slice(-length);
    return shortHash;
  }
}

