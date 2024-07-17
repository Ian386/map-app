// src/App.js
import './App.css';
import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import "leaflet-draw/dist/leaflet.draw.css";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AddLocation from './components/AddLocation';
import AddField from './components/AddField';
import Sidebar from './components/Sidebar';
import MainMap from './components/MainMap';
import UpdateLocation from './components/UpdateLocation';
import UpdateFarm from './components/UpdateFarm';
import { Icon, divIcon, point } from 'leaflet';

function App() {
  const [locations, setLocations] = useState([]);
  const [farms, setFarms] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/locations')
      .then(response => {
        setLocations(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the location data!", error);
      });

    axios.get('http://localhost:5000/farms')
      .then(response => {
        setFarms(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the farm data!", error);
      });
  }, []);

  const customIcon = new Icon({
    iconUrl: require("./img/location-marker.png"),
    iconSize: [38, 38],
  });

  const createCustomClusterIcon = (cluster) => {
    return new divIcon({
      html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
      className: 'custom-marker-cluster',
      iconSize: point(33, 33, true)
    });
  };

  const parseLocation = (locationString) => {
    const coords = locationString.split('POINT (')[1].split(')')[0].split(' ');
    return [parseFloat(coords[1]), parseFloat(coords[0])];
  };

  const parsePolygon = (polygonString) => {
    const coords = polygonString.split('POLYGON ((')[1].split('))')[0].split(', ');
    return coords.map(coord => {
      const [lng, lat] = coord.split(' ');
      return [parseFloat(lat), parseFloat(lng)];
    });
  };

  return (
    <Router>
      <div className="App">
        <Sidebar />
        <Routes>
          <Route path="/" element={
            <MainMap
              locations={locations}
              farms={farms}
              parseLocation={parseLocation}
              parsePolygon={parsePolygon}
              customIcon={customIcon}
              createCustomClusterIcon={createCustomClusterIcon}
            />
          } />
          <Route path="/add-location" element={<AddLocation />} />
          <Route path="/add-field" element={<AddField />} />
          <Route path="/update-location/:id" element={<UpdateLocation />} />
          <Route path="/update-farm/:id" element={<UpdateFarm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
