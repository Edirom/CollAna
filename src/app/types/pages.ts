export class Pages {

  title: string;
  contain: string;
  actualcontain: string;
  previouscontain: string;
  alpha: number;
  index: number;
  cropImage: string;
  cropCoord: any;
  minx: any;
  miny: any;
  maxx: any;
  maxy: any;
  colourcounter: number;
  constructor(index: number, title: string, contain: string , colourcounter:number, actualcontain?: any, previouscontain?: any, alpha?: number, cropImage?: string, cropCoord?: any, minx?: any, miny?: any, maxx?: any, maxy?: any) {
    this.index = index;
    this.title = title;
    this.contain = contain;
    this.actualcontain = actualcontain;
    this.previouscontain = previouscontain;
    this.alpha = alpha;
    this.cropImage = cropImage;
    this.cropCoord = cropCoord;
    this.minx = minx;
    this.miny = miny;
    this.maxx = maxx;
    this.maxy = maxy;
    this.colourcounter = colourcounter;
  }
}
