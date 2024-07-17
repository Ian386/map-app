// src/App.js
import './App.css';
import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "leaflet-draw/dist/leaflet.draw.css";
import AddLocation from './components/AddLocation';
import AddField from './components/AddField';
import Sidebar from './components/mainSideBar';
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

  const addLocation = async (location) => {
    try {
      const res = await axios.post('http://localhost:5000/locations', location, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setLocations([...locations, res.data]);
    } catch (error) {
      console.error("There was an error adding the location!", error);
    }
  };

  const addField = async (farm) => {
    try {
      const res = await axios.post('http://localhost:5000/farms', farm, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setFarms([...farms, res.data]);
    } catch (error) {
      console.error("There was an error adding the field!", error);
    }
  };


  const handleUpdateLocation = async (id, updatedLocation) => {
    const res = await fetch(`http://localhost:5000/locations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedLocation),
    });

    if (res.ok) {
      setLocations(locations.map((loc) => (loc.id === id ? updatedLocation : loc)));
    }
  };

   const updateFarm = async (id, updatedFarm) => {
    try {
      await axios.put(`http://localhost:5000/farms/${id}`, updatedFarm);
      setFarms(farms.map((farm) => (farm.id === id ? updatedFarm : farm)));
    } catch (error) {
      console.error("There was an error updating the farm!", error);
    }
  };

  return (
    <Router>
      <div className="app">       
        <Routes>
          <Route path="/" element={
            <>
              <Sidebar />
              <MainMap 
                locations={locations}
                farms={farms}
                parseLocation={parseLocation}
                parsePolygon={parsePolygon}
                customIcon={customIcon}
                createCustomClusterIcon={createCustomClusterIcon}
              />
            </>
          } />
          <Route path="/add-location" element={
            <AddLocation onAdd={addLocation} />
          }/>
          <Route path="/add-field" element={
            <AddField onAdd={addField}/>
          }/>
           <Route path="/update-location/:id" element={<UpdateLocation locations={locations} farms={farms} onUpdate={handleUpdateLocation} />} />
          <Route path='/update-farm/:id' element={<UpdateFarm farms={farms} onUpdateFarm={updateFarm} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
