import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Faksimile } from '../types/faksimile';


@Injectable({ providedIn: 'root' })

export class FileService {

  // Observable string sources
  private faksimile = new Subject<any>();
  private faksimiles: Faksimile[] = new Array();

  setActualContain(faksimile: Faksimile, contain: any) {
    faksimile.actualcontain = contain;
  }

  getActualContain(faksimile: Faksimile): any {
    return faksimile.actualcontain;
  }

  getFaksimiles(): Faksimile[] {
    return this.faksimiles;
  }

  addFaksimile(faksimile: Faksimile) {
    this.faksimiles.push(faksimile);
    this.faksimile.next(this.faksimiles);
  
  }

  

  removeFaksimile(faksimile: Faksimile){
    const index = this.faksimiles.indexOf(faksimile, 0);
    if (index > -1) {
      this.faksimiles.splice(index, 1);
    }
    this.faksimile.next(this.faksimiles);
     
  }

}
