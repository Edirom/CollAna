import { Control } from 'ol/control.js';
import { Faksimile } from '../types/faksimile';
import { MapFaksimile } from '../types/mapfaksimile';
import Map from 'ol/Map.js';


export class Magnify extends Control {
  state: boolean = true;

  map: Map;
  
  constructor(data: Faksimile, map: Map) {
    super({});
    this.map = map;

      var button = document.createElement('button');

      var i = document.createElement('i');
      i.className = 'fa fa-binoculars';

      button.appendChild(i);

      var element = document.createElement('div');
      element.className = 'ol-feature';
      element.appendChild(button);

        Control.call(this, {
            element: element
    });

    var test = () => this.click(data, map);
    button.addEventListener('click', test);
    //button.removeEventListener('click', test);
  
    
  }



  click(faksimile: Faksimile, map: Map) {
    var radius = 75;

      
      document.addEventListener('keydown', function _evt(evt) {
       
        if(evt.which === 38) {
        radius = Math.min(radius + 5, 150);
        map.render();
        evt.preventDefault();
      } else if (evt.which === 40) {
        radius = Math.max(radius - 5, 25);
        map.render();
        evt.preventDefault();
        }
        document.removeEventListener('keydown', _evt);
    });

      // get the pixel position with every move
      var mousePosition = null;
    var container = document.getElementById('card-block' + faksimile.ID);
      container.addEventListener('mousemove', function (event) {
        mousePosition = map.getEventPixel(event);
        map.render();
        
      });

      container.addEventListener('mouseout', function () {
        mousePosition = null;
        map.render();
      });

      var layer = this.map.getLayers().getArray()[0];
      // after rendering the layer, show an oversampled version around the pointer
      layer.on('postcompose', function (event) {
        if (mousePosition) {
          var context = event.context;
          var pixelRatio = event.frameState.pixelRatio;
          var half = radius * pixelRatio;
          var centerX = mousePosition[0] * pixelRatio;
          var centerY = mousePosition[1] * pixelRatio;
          var originX = centerX - half;
          var originY = centerY - half;
          var size = 2 * half + 1;
          var sourceData = context.getImageData(originX, originY, size, size).data;
          var dest = context.createImageData(size, size);
          var destData = dest.data;
          for (var j = 0; j < size; ++j) {
            for (var i = 0; i < size; ++i) {
              var dI = i - half;
              var dJ = j - half;
              var dist = Math.sqrt(dI * dI + dJ * dJ);
              var sourceI = i;
              var sourceJ = j;
              if (dist < half) {
                sourceI = Math.round(half + dI / 2);
                sourceJ = Math.round(half + dJ / 2);
              }
              var destOffset = (j * size + i) * 4;
              var sourceOffset = (sourceJ * size + sourceI) * 4;
              destData[destOffset] = sourceData[sourceOffset];
              destData[destOffset + 1] = sourceData[sourceOffset + 1];
              destData[destOffset + 2] = sourceData[sourceOffset + 2];
              destData[destOffset + 3] = sourceData[sourceOffset + 3];
            }
          }
          context.beginPath();
          context.arc(centerX, centerY, half, 0, 2 * Math.PI);
          context.lineWidth = 3 * pixelRatio;
          context.strokeStyle = 'rgba(255,255,255,0.5)';
          context.putImageData(dest, originX, originY);
          context.stroke();
          context.restore();
        }
      });

   
      console.log('click');
        //console.log(this.getMap());
   
  }

}
