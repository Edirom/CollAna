declare var _: any;
declare var d3: any;

export function createRectFromCoords(start: number[], end: number[]): [number, number][] {
  return [[Math.min(start[0], end[0]), Math.min(start[1], end[1])],
  [Math.min(start[0], end[0]), Math.max(start[1], end[1])],
  [Math.max(start[0], end[0]), Math.max(start[1], end[1])],
  [Math.max(start[0], end[0]), Math.min(start[1], end[1])]];
}

export function outlineRectangle(polygon: [number, number][]): [number, number][] {
  var rect: [number, number][] = [];
  var xVals = polygon.map(function (obj) { return obj[0]; });
  var yVals = polygon.map(function (obj) { return obj[1]; });

  var minX = Math.min.apply(null, xVals);
  var minY = Math.min.apply(null, yVals);
  var maxX = Math.max.apply(null, xVals);
  var maxY = Math.max.apply(null, yVals);

  return [[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY]];
}

export function proveRectangle(shape: [number, number][]): boolean {
  if (shape.length != 4) return false;
  var sDA = Math.sqrt(Math.pow(shape[0][0] - shape[3][0], 2) + Math.pow(shape[0][1] - shape[3][1], 2));
  var sAB = Math.sqrt(Math.pow(shape[1][0] - shape[0][0], 2) + Math.pow(shape[1][1] - shape[0][1], 2));
  var sBC = Math.sqrt(Math.pow(shape[2][0] - shape[1][0], 2) + Math.pow(shape[2][1] - shape[1][1], 2));
  var sCD = Math.sqrt(Math.pow(shape[3][0] - shape[2][0], 2) + Math.pow(shape[3][1] - shape[2][1], 2));

  var sAC = Math.sqrt(Math.pow(shape[2][0] - shape[0][0], 2) + Math.pow(shape[2][1] - shape[0][1], 2));
  var sBD = Math.sqrt(Math.pow(shape[3][0] - shape[1][0], 2) + Math.pow(shape[3][1] - shape[1][1], 2));
  if (sDA !== sBC || sAB !== sCD) return false;
  if (sBD !== sAC) return false;
  return true;
}
