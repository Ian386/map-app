import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, LayersControl } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import axios from 'axios';
import Geocoder from './Geocoder';
import './crudForm.css'



const { BaseLayer } = LayersControl;

const AddField = ({ onAddField}) => {
  const [drawnCoordinates, setDrawnCoordinates] = useState('');
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [description, setDescription] = useState('');
  const [produce, setProduce] = useState([{ produce_type: '', variety: '' }]);
  const [farmer, setFarmer] = useState('');
  const [farm_area, setFarmArea] = useState('');
  const [farmers, setFarmers] = useState([]);
  const [notification, setNotification] = useState('');

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

  useEffect(() => {
    setFarmArea(drawnCoordinates);
  }, [drawnCoordinates]);

  const handleProduceChange = (index, field, value) => {
    const newProduce = [...produce];
    newProduce[index][field] = value;
    setProduce(newProduce);
  };

  const handleFieldAddition = async (e) => {
    e.preventDefault();

    const fieldData = {
      id,
      name,
      description,
      produce,
      farmer,
      farm_area,
    };

    try {
      await axios.post('http://localhost:5000/farms', fieldData);
      onAddField(fieldData);
      setName('');
      setId('');
      setDescription('');
      setProduce([{ produce_type: '', variety: '' }]);
      setFarmer('');
      setFarmArea('');
      setNotification('Field added successfully!');
      setTimeout(() => {
        setNotification('');
      }, 3000); // Clear notification after 3 seconds
    } catch (error) {
      console.error('Error adding field:', error);
    }
  };

  const handleCreated = (e) => {
    const type = e.layerType;
    const layer = e.layer;
    if (type === 'polygon') {
      const latlngs = layer.getLatLngs()[0].map(latlng => `${latlng.lng} ${latlng.lat}`);
      const polygonString = `SRID=4326;POLYGON ((${latlngs.join(', ')}))`;
      setDrawnCoordinates(polygonString);
    }
  };

  return (
    <>
    <div className="add-location-container">
    <div className="form-sidebar-container">
    <form className="add-field-form" onSubmit={handleFieldAddition}>
      <h2>Add Field Drawing</h2>
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
        <label>Identification Number</label>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Enter Identification Number"
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
      <div className='form-control'>
        <label>Produce Farmed (at least one required)</label>
        {produce.map((prod, index) => (
          <div key={index} className="produce-inputs">
            <input
              type='text'
              placeholder={`Produce Type ${index + 1}`}
              value={prod.produce_type}
              onChange={(e) => handleProduceChange(index, 'produce_type', e.target.value)}
              required={index === 0}
            />
            <input
              type='text'
              placeholder={`Variety ${index + 1}`}
              value={prod.variety}
              onChange={(e) => handleProduceChange(index, 'variety', e.target.value)}
              required={index === 0}
            />
          </div>
        ))}
        <button
          type='button'
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
      <div className='form-control'>
        <label>Farm Area Coordinates</label>
        <textarea
          value={farm_area}
          onChange={(e) => setFarmArea(e.target.value)}
          rows="5"
          readOnly
        />
      </div>
      <button className="btn" type="submit">Save Field</button>
    </form>
    </div>
    <MapContainer center={[0, 38]} zoom={8} className='leaflet-container'>
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
        <BaseLayer name='Esri World'>
          <TileLayer
            url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            maxZoom={20}
          />
        </BaseLayer>
        </LayersControl>
                <FeatureGroup>
                  <EditControl
                    position="topright"
                    onCreated={handleCreated}
                    draw={{
                      rectangle: false,
                      circle: false,
                      circlemarker: false,
                      marker: false,
                      polyline: false
                    }}
                  />
                </FeatureGroup>
              </MapContainer>
    </div>
    </>
  );

};

export default AddField;
