export class Pages {

  title: string;
  contain: string;
  actualcontain: string;
  alpha: number;
  index: number;
  cropImage: string;
  cropCoord: any;
  constructor(index: number, title: string, contain: string, actualcontain?: any, alpha?: number, cropImage?: string, cropCoord?: any) {
    this.index = index;
    this.title = title;
    this.contain = contain;
    this.actualcontain = actualcontain;
    this.alpha = alpha;
    this.cropImage = cropImage;
    this.cropCoord = cropCoord;
  }
}
