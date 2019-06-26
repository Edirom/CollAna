import { Faksimile } from "../types/faksimile";
import Map from 'ol/Map.js';

export class MapFaksimile{

  faksimile: Faksimile;
  map: Map;
  ID: string;

  constructor(map: Map, faksimile: Faksimile) {
    this.map = map;
    this.faksimile = faksimile;
    this.ID = faksimile.ID;
  }

}
