export class Pages {

  title: string;
  contain: string;
  actualcontain: string;
  alpha: number;
  index: number;
  constructor(index: number, title: string, contain: string, actualcontain?: any, alpha?: number) {
    this.index = index;
    this.title = title;
    this.contain = contain;
    this.actualcontain = actualcontain;
    this.alpha = alpha;
  }
}
