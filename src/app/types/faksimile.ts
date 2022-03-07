import { Pages } from './pages';

export class Faksimile {

  type: string;
  title: string;
  ID: string;
  numPages: number;
  pages: Pages[];
  actualPage: number;
  pdfDoc: any;
  funqueueexecute: boolean;
  funqueue: any[];
  index: number;
  Color: string;
  size: number[];
  constructor(type: string, title: string, pages?: Pages[], numPages?: number, actualPage?: number, pdfDoc?: any, funqueueexecute?: boolean, funqueue?: any[], index?: number, size?: number[]) {
    var ID  = function () {
      // Math.random should be unique because of its seeding algorithm.
      // Convert it to base 36 (numbers + letters), and grab the first 9 characters
      // after the decimal.
      return '_' + Math.random().toString(36).substr(2, 9);
    };

    
    var Color = function () {
      var hue = Math.floor(Math.random() * 360) + 1;//Math.floor(Math.random() * 360);
      return 'hsl(' + hue + ', 100%, 87.5%)';
    }

    this.Color = Color();
    this.ID = ID();
    this.type = type;
    this.title = title;
    this.numPages = numPages;
    this.pages = pages || [];
    this.actualPage = actualPage;
    this.pdfDoc = pdfDoc;
    this.funqueueexecute = funqueueexecute;
    this.funqueue = funqueue || [];
    this.index = index || null;
    this.size = size || [];
  }
}
