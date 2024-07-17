// Geocoder.js

import{ useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

const Geocoder = () => {
  const map = useMap();
  const geocoderAdded = useRef(false);

  useEffect(() => {
    if (map && !geocoderAdded.current) {
      L.Control.geocoder({
        defaultMarkGeocode: false
      })
        .on('markgeocode', function (e) {
          const latlng = e.geocode.center;
          map.setView(latlng, 14); // Set the zoom level as desired
        })
        .addTo(map);
      geocoderAdded.current = true;
    }
  }, [map]);

  return null;
};

export default Geocoder;
