export class Faksimile {

  title: string;
  contain: string;
  scaleFactor: number;
  width: number;
  height: number;
  actualwidth: number;

  constructor(title: string, contain: string, scaleFactor: number, width: number, height: number, actualwidth?: number) {
    this.title = title;
    this.contain = contain;
    this.scaleFactor = scaleFactor | 100;
    this.width = width;
    this.height = height;
    this.actualwidth = actualwidth;
  }
}
