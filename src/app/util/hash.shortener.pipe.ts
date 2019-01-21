import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'hashShortener'})
export class HashShortener implements PipeTransform {
  transform(hash: string, length: number): string {
    if (!hash) { return ''; }
    const shortHash: string = hash.slice(0, 2 + length) + '...' + hash.slice(-length);
    return shortHash;
  }
}

