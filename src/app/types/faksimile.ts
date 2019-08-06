import { Pages } from './pages';

export class Faksimile {

  type: string;
  title: string;
  ID: string;
  numPages: number;
  pages: Pages[];
  actualPage: number;
  pdfDoc: any;
  constructor(type: string, title: string, pages?: Pages[], numPages?: number, actualPage?: number, pdfDoc?: any) {
    var ID  = function () {
      // Math.random should be unique because of its seeding algorithm.
      // Convert it to base 36 (numbers + letters), and grab the first 9 characters
      // after the decimal.
      return '_' + Math.random().toString(36).substr(2, 9);
    };
    this.ID = ID();
    this.type = type;
    this.title = title;
    this.numPages = numPages;
    this.pages = pages || [];
    this.actualPage = actualPage;
    this.pdfDoc = pdfDoc;
  }
}
