import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, LayersControl, Polygon } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Geocoder from './Geocoder';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import './crudForm.css';

const { BaseLayer } = LayersControl;

const UpdateFarm = ({ farms, onUpdateFarm }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef();
  const polygonRef = useRef(); // Create a ref for the Polygon
  const [farm, setFarm] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [produce, setProduce] = useState([{ produce_type: '', variety: '' }]);
  const [farmer, setFarmer] = useState('');
  const [farmArea, setFarmArea] = useState('');
  const [area, setArea] = useState('');
  const [farmers, setFarmers] = useState([]);
  const [notification, setNotification] = useState('');
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const currentFarm = farms.find((farm) => farm.id === id);
    if (currentFarm) {
      setFarm(currentFarm);
      setName(currentFarm.name);
      setDescription(currentFarm.description);
      setProduce(currentFarm.produce);
      setFarmer(currentFarm.farmer);
      setFarmArea(currentFarm.farm_area);
      setArea(currentFarm.area);

      const parsedArea = parseFarmArea(currentFarm.farm_area);
      if (mapReady && mapRef.current) {
        mapRef.current.fitBounds(parsedArea);
      }
    }
  }, [id, farms, mapReady]);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/farmers');
        setFarmers(res.data);
      } catch (error) {
        console.error('Error fetching farmers:', error);
      }
    };

    fetchFarmers();
  }, []);

  const handleProduceChange = (index, field, value) => {
    const newProduce = [...produce];
    newProduce[index][field] = value;
    setProduce(newProduce);
  };

  const handleFieldUpdate = async (e) => {
    e.preventDefault();

    const updatedFarm = {
      ...farm,
      name,
      description,
      produce,
      farmer,
      farm_area: farmArea,
      area,
    };

    await axios.put(`http://localhost:5000/farms/${farm.id}`, updatedFarm);
    onUpdateFarm(farm.id, updatedFarm);
    setNotification('Field updated successfully!');
      setTimeout(() => {
        setNotification('');
        navigate('/');
      }, 3000);

  };

  const handleEdited = (e) => {
    e.layers.eachLayer((layer) => {
      if (layer instanceof L.Polygon) {
        const latlngs = layer.getLatLngs()[0].map((latlng) => `${latlng.lng} ${latlng.lat}`);
        const polygonString = `SRID=4326;POLYGON ((${latlngs.join(', ')}))`;
        setFarmArea(polygonString);
      }
    });
  };

  const handleCreated = (e) => {
    const layer = e.layer;
    if (layer instanceof L.Polygon) {
      const latlngs = layer.getLatLngs()[0].map((latlng) => `${latlng.lng} ${latlng.lat}`);
      const polygonString = `SRID=4326;POLYGON ((${latlngs.join(', ')}))`;
      setFarmArea(polygonString);
    }
  };

  const parseFarmArea = (farmArea) => {
    const coordinatesString = farmArea.replace('SRID=4326;POLYGON ((', '').replace('))', '');
    const coordinates = coordinatesString.split(', ').map((coord) => {
      const [lng, lat] = coord.split(' ').map(Number);
      return [lat, lng];
    });
    return coordinates;
  };

  return (
    <>
      <div className="add-location-container">
        <div className="form-sidebar-container">
          <form className="add-field-form" onSubmit={handleFieldUpdate}>
            <h2>Update Field Drawing</h2>
            {notification && <div className="notification">{notification}</div>}
            <div className="form-control">
              <label>Field Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Field Name"
                required
              />
            </div>
            <div className="form-control">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter Description"
                rows="4"
              />
            </div>
            <div className="form-control">
              <label>Produce Farmed (at least one required)</label>
              {produce.map((prod, index) => (
                <div key={index} className="produce-inputs">
                  <input
                    type="text"
                    placeholder={`Produce Type ${index + 1}`}
                    value={prod.produce_type}
                    onChange={(e) => handleProduceChange(index, 'produce_type', e.target.value)}
                    required={index === 0}
                  />
                  <input
                    type="text"
                    placeholder={`Variety ${index + 1}`}
                    value={prod.variety}
                    onChange={(e) => handleProduceChange(index, 'variety', e.target.value)}
                    required={index === 0}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setProduce([...produce, { produce_type: '', variety: '' }])}
              >
                Add Produce
              </button>
            </div>
            <div className="form-control">
              <label>Farmer</label>
              <select value={farmer} onChange={(e) => setFarmer(e.target.value)} required>
                <option value="">Select Farmer</option>
                {farmers.map((farmer) => (
                  <option key={farmer.id} value={farmer.id}>{farmer.name}</option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label>Area</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Enter Area"
              />
            </div>
            <div className="form-control">
              <label>Farm Area Coordinates</label>
              <textarea
                value={farmArea}
                onChange={(e) => setFarmArea(e.target.value)}
                rows="5"
                readOnly
                required
              />
            </div>
            <button className="btn" type="submit">Update Field</button>
          </form>
        </div>
        <MapContainer 
          center={[0, 38]} 
          zoom={8} 
          className="leaflet-container" 
          ref={mapRef}
          whenReady={() => setMapReady(true)}
        >
          <Geocoder />
          <LayersControl position="topright">
            <BaseLayer checked name="Google Hybrid Map">
              <TileLayer
                url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
                attribution="&copy; Google Maps"
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                maxZoom={23}
              />
            </BaseLayer>
            <BaseLayer name="Esri World">
              <TileLayer
                url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                maxZoom={20}
              />
            </BaseLayer>
          </LayersControl>
          <FeatureGroup>
            <EditControl
              position="topright"
              onEdited={handleEdited}
              onCreated={handleCreated}
              draw={{
                rectangle: false,
                polyline: false,
                circle: false,
                marker: false,
                circlemarker: false,
              }}
            />
            {farmArea && (
              <Polygon
                ref={polygonRef}
                positions={parseFarmArea(farmArea)}
              />
            )}
          </FeatureGroup>
        </MapContainer>
      </div>
    </>
  );
};

export default UpdateFarm;
