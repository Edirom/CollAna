import { Subject, Observable } from 'rxjs';
import { MapFaksimile } from '../types/mapfaksimile';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })

export class MapService{
  // Observable string sources
  private map = new Subject<any>();
  private maps: MapFaksimile[] = new Array();

  getMaps(): MapFaksimile[] {
    return this.maps;
  }

  addMap(map: MapFaksimile) {
    this.maps.push(map);
    this.map.next(this.maps);

  }

 
  removeMap(map: MapFaksimile){
    const index = this.maps.indexOf(map, 0);
    if (index > -1) {
      this.maps.splice(index, 1);
    }
    this.map.next(this.maps);
     
  }

}
