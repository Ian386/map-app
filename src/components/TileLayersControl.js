// components/TileLayersControl.js
import React from 'react';
import { LayersControl, TileLayer } from 'react-leaflet';

const { BaseLayer } = LayersControl;

function TileLayersControl() {
  return (
    <LayersControl position="topright">
      <BaseLayer checked name="Google Hybrid Map">
        <TileLayer
          url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
          attribution="&copy; Google Maps"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          maxZoom={23}
        />
      </BaseLayer>
      <BaseLayer name="Terrain Map">
        <TileLayer
          url="http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
          attribution="&copy; Google Maps"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          maxZoom={20}
        />
      </BaseLayer>
      <BaseLayer name="OpenStreetMap">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        />
      </BaseLayer>
      <BaseLayer name="Esri World">
        <TileLayer
          url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          maxZoom={20}
        />
      </BaseLayer>
      <BaseLayer name="Traffic Map">
        <TileLayer
          url="https://{s}.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}"
          attribution="&copy; Google Maps"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          maxZoom={20}
        />
      </BaseLayer>
    </LayersControl>
  );
}

export default TileLayersControl;
