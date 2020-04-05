"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Faksimile = /** @class */ (function () {
    function Faksimile(type, title, pages, numPages, actualPage, pdfDoc, funqueueexecute, funqueue, index, size) {
        var ID = function () {
            // Math.random should be unique because of its seeding algorithm.
            // Convert it to base 36 (numbers + letters), and grab the first 9 characters
            // after the decimal.
            return '_' + Math.random().toString(36).substr(2, 9);
        };
        var Color = function () {
            var hue = Math.floor(Math.random() * 360);
            return 'hsl(' + hue + ', 100%, 87.5%)';
            /* return "hsla(" + ~~(360 * Math.random()) + "," +
               "70%," +
               "80%,1)";*/
        };
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
    return Faksimile;
}());
exports.Faksimile = Faksimile;
//# sourceMappingURL=faksimile.js.map