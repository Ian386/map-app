// src/components/MainMap.js
import React, { useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, Polygon, LayerGroup } from 'react-leaflet';
import { Icon } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import Geocoder from './Geocoder';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './MainMap.css'; // Import the CSS file for button styling

const { BaseLayer, Overlay } = LayersControl;

delete Icon.Default.prototype._getIconUrl;

Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

function MainMap({ locations, farms, parseLocation, parsePolygon, customIcon, createCustomClusterIcon, farmers }) {
  const [activeLocation, setActiveLocation] = useState(null);
  const [activeFarm, setActiveFarm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState('');
  const [selectedProduce, setSelectedProduce] = useState('');
  const navigate = useNavigate();
  const mapRef = useRef();

  const handleDelete = async (id, type) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/${type}/${id}`);
        window.location.reload(); // Reload the page to reflect changes
      } catch (error) {
        console.error("There was an error deleting the item!", error);
      }
    }
  };

  const handleUpdate = (id, type) => {
    navigate(`/update-${type}/${id}`);
  };

  const handleSearch = () => {
    let foundItem = locations.find(location => location.name.toLowerCase() === searchTerm.toLowerCase());

    if (!foundItem) {
      foundItem = farms.find(farm => farm.name.toLowerCase() === searchTerm.toLowerCase());
    }

    if (foundItem) {
      const coordinates = foundItem.location
        ? parseLocation(foundItem.location)
        : parsePolygon(foundItem.farm_area)[0];
      mapRef.current.setView(coordinates, 15);
    } else {
      alert("No matching location or farm found!");
    }
  };

  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
  };

  const handleLabelChange = (event) => {
    setSelectedLabel(event.target.value);
  };

  const handleFarmerChange = (event) => {
    setSelectedFarmer(event.target.value);
  };

  const handleProduceChange = (event) => {
    setSelectedProduce(event.target.value);
  };

  const filteredLocations = locations.filter(location => {
    return (
      (!selectedRegion || location.region === selectedRegion) &&
      (!selectedLabel || location.label === selectedLabel)
    );
  });

  const filteredFarms = farms.filter(farm => {
    return (
      (!selectedFarmer || farm.farmer === selectedFarmer) &&
      (!selectedProduce || farm.produce.some(produce => produce.produce_type === selectedProduce))
    );
  });

  return (
    <>
            <div className="filter-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <div className="filters">
          <div className="filter-group">
            <h3>Location Filters</h3>
            <div className="select-group">
              <select value={selectedRegion} onChange={handleRegionChange}>
                <option value="">All Regions</option>
                {Array.from(new Set(locations.map(location => location.region))).map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              <select value={selectedLabel} onChange={handleLabelChange}>
                <option value="">All Labels</option>
                {Array.from(new Set(locations.map(location => location.label))).map(label => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="filter-group">
            <h3>Farm Filters</h3>
            <div className="select-group">
              <select value={selectedFarmer} onChange={handleFarmerChange}>
                <option value="">All Farmers</option>
                {farmers.map(farmer => (
                  <option key={farmer.id} value={farmer.id}>{farmer.name}</option>
                ))}
              </select>
              <select value={selectedProduce} onChange={handleProduceChange}>
                <option value="">All Produce</option>
                {Array.from(new Set(farms.flatMap(farm => farm.produce.map(produce => produce.produce_type)))).map(produce => (
                  <option key={produce} value={produce}>{produce}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="mainSideBar">
          <button className="mainSideBar-button">
            <Link to="/add-location">Add Location</Link>
          </button>
          <button className="mainSideBar-button">
            <Link to="/add-field">Add Field</Link>
          </button>
        </div>
      </div>
      <MapContainer center={[0, 35]} zoom={8} ref={mapRef}>
        <Geocoder />
        <LayersControl position="topright">
          <BaseLayer checked name='Google Hybrid Map'>
            <TileLayer
              url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
              attribution='&copy; Google Maps'
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              maxZoom={23}
            />
          </BaseLayer>
          <BaseLayer name='Terrain Map'>
            <TileLayer
              url="http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
              attribution='&copy; Google Maps'
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              maxZoom={20}
            />
          </BaseLayer>
          <BaseLayer name='OpenStreetMap'>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
            />
          </BaseLayer>
          <BaseLayer name='Esri World'>
            <TileLayer
              url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              maxZoom={20}
            />
          </BaseLayer>
          <BaseLayer name='Traffic Map'>
            <TileLayer
              url="https://{s}.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}"
              attribution='&copy; Google Maps'
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              maxZoom={20}
            />
          </BaseLayer>
          <Overlay checked name="Location Markers">
            <LayerGroup>
              <MarkerClusterGroup iconCreateFunction={createCustomClusterIcon}>
                {filteredLocations.map(location => (
                  <Marker
                    key={location.id}
                    position={parseLocation(location.location)}
                    icon={customIcon}
                    eventHandlers={{
                      click: () => {
                        setActiveLocation(location);
                      },
                    }}
                  />
                ))}
              </MarkerClusterGroup>
              {activeLocation && (
                <Popup
                  position={parseLocation(activeLocation.location)}
                  onClose={() => {
                    setActiveLocation(null);
                  }}
                >
                  <div>
                    <h2>{activeLocation.name}</h2>
                    <p>{activeLocation.label}</p>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(activeLocation.id, 'locations')}
                    >
                      Delete
                    </button>
                    <button
                      className="update-button"
                      onClick={() => navigate(`/update-location/${activeLocation.id}`)}
                    >
                      Update
                    </button>
                  </div>
                </Popup>
              )}
            </LayerGroup>
          </Overlay>
          <Overlay checked name="Farm Polygons">
            <LayerGroup>
              {filteredFarms.map(farm => (
                <Polygon
                  key={farm.id}
                  positions={parsePolygon(farm.farm_area)}
                  eventHandlers={{
                    click: () => {
                      setActiveFarm(farm);
                    },
                  }}
                />
              ))}
              {activeFarm && (
                <Popup
                  position={parsePolygon(activeFarm.farm_area)[0]}
                  onClose={() => {
                    setActiveFarm(null);
                  }}
                >
                  <div>
                    <h2>{activeFarm.name}</h2>
                    <p>{activeFarm.area}</p>
                    <p>{activeFarm.description}</p>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(activeFarm.id, 'farms')}
                    >
                      Delete
                    </button>
                    <button
                    className="update-button"
                    onClick={() => handleUpdate(activeFarm.id, 'farm')}
                  >
                    Update
                  </button>
                  </div>
                </Popup>
              )}
            </LayerGroup>
          </Overlay>
        </LayersControl>
      </MapContainer>
    </>
  );
}

export default MainMap;
