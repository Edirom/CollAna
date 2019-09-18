import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Faksimile } from '../types/faksimile';
import { Pages } from '../types/pages';


@Injectable({ providedIn: 'root' })

export class FileService {

  // Observable string sources
  private faksimile = new Subject<any>();
  private faksimiles: Faksimile[] = new Array();


  setActualContain(faksimile: Faksimile, page: Pages, contain: any) {
    if (typeof page !== "undefined")
      faksimile.pages[page.index - 1].actualcontain = contain;
    else
      faksimile.pages[0].actualcontain = contain;
  }

  getActualContain(faksimile: Faksimile, page: Pages): any {

    if (typeof page !== "undefined")
      return faksimile.pages[page.index - 1].actualcontain;
    else
      return faksimile.pages[0].actualcontain;
  }

  getFaksimiles(): Faksimile[] {
    return this.faksimiles;
  }

  addFaksimile(faksimile: Faksimile) {
    this.faksimiles.push(faksimile);
    this.faksimile.next(this.faksimiles);
  
  }

  getPages(faksimile: Faksimile): Pages[] {
    return faksimile.pages;
  }

  addPage(faksimile: Faksimile, page: Pages) {
    this.insertArrayAt(faksimile.pages, page.index-1, page);
    //faksimile.pages.push(page);
   
  }

  insertArrayAt(array, index, arrayToInsert) {
    if (index >= array.length) {
      for (var i = array.length; i <= index; i++) {
        array.push(new Array());
      }
    }
    array[index] = arrayToInsert;
    return array;
  }

  checkPage(faksimile: Faksimile, page: Pages): boolean {
    for (var index = 0; index < faksimile.pages.length; ++index) {
      if (faksimile.pages[index].index == page.index)
        return true;
    }
    return false;

  }

  removeFaksimile(faksimile: Faksimile){
    const index = this.faksimiles.indexOf(faksimile, 0);
    if (index > -1) {
      this.faksimiles.splice(index, 1);
    }
    this.faksimile.next(this.faksimiles);
     
  }

}
