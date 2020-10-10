import React from 'react';
import './App.css';
import zipmap from './zipmap.json';


const ol = global.ol;

const RANDOMNESS = 0.04;
function addRand(coord) {
  return coord + (Math.random() * RANDOMNESS) - (RANDOMNESS / 2);
}

class App extends React.Component {

  async componentDidMount() {

    const raw = await fetch('https://hslapi.herokuapp.com/postal_counts');
    const data = await raw.json();
    console.log('data', data);
    const geoJSON = { type: 'FeatureCollection', features: [] };
    let maxSize = 0;
    const vectorSource = new ol.source.Vector({wrapX: false});
    console.log('zips', zipmap['85203'], zipmap['85213']);

    data.forEach((d) => {
      if(zipmap[d.postal_code]) {
        const size = parseInt(d.count, 10);
        if (size > maxSize) {
          maxSize = size
        }

        // console.log('adding', d.postal_code);
        for (let i = 0; i < size; i++) {
          
          vectorSource.addFeature(new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([
              addRand(zipmap[d.postal_code][1]),
              addRand(zipmap[d.postal_code][0]),
            ])),
            // size,
          }));
          // totalPoints.push([zipmap[d.postal_code][1], zipmap[d.postal_code][0]])
        }
        // console.log('total')

      }
    });
    
    const vector = new ol.layer.Heatmap({
      source: vectorSource,
      blur: 6,
      radius: 12,
      weight: function (feature) {
        return 0.2;
      },
    });

    const map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        }),
        vector,
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([zipmap['85201'][1], zipmap['85201'][0]]),
        zoom: 9
      })
    });

    console.log(map, zipmap['85201'], geoJSON);
  }

  render() {
    return (
      <div className="App">
        <div id="map" style={{height: '600px', width: '100%'}}></div>
      </div>
    );
  }
  
}

export default App;
