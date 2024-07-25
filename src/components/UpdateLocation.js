import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, LayersControl, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import Geocoder from './Geocoder';
import './crudForm.css';

const { BaseLayer } = LayersControl;

const UpdateLocation = ({ locations, farms, onUpdate }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = locations.find((loc) => loc.id === id);

  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [farmName, setFarmName] = useState('');
  const [notification, setNotification] = useState('');

  const mapRef = useRef();
  const featureGroupRef = useRef();

  useEffect(() => {
    if (location) {
      setName(location.name);
      setLabel(location.label);

      // Parse the location string
      const coords = parseLocation(location.location);
      setLatitude(coords.lat);
      setLongitude(coords.lng);

      setRegion(location.region);
      setDescription(location.description);
      setFarmName(location.farmName || '');
    }
  }, [location]);

  useEffect(() => {
    if (latitude && longitude) {
      mapRef.current.flyTo([latitude, longitude], 15);
    }
  }, [latitude, longitude]);

  const parseLocation = (locationString) => {
    const match = locationString.match(/SRID=\d+;POINT\s*\(([^)]+)\)/);
    if (match) {
      const [lng, lat] = match[1].split(' ').map(parseFloat);
      return { lat, lng };
    }
    return { lat: 0, lng: 0 };
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!name || !latitude || !longitude) {
      alert('Please add all required location details');
      return;
    }

    const updatedLocation = {
      id,
      name,
      label,
      location: `SRID=4326;POINT (${longitude} ${latitude})`,
      region,
      description,
      farmName: label === 'Farm' ? farmName : undefined,
    };

    await onUpdate(id, updatedLocation);

    setNotification('Location details updated successfully!');

    setTimeout(() => {
      setNotification('');
      navigate('/');
    }, 3000); // Clear the notification and navigate to main map after 3 seconds
  };

  if (!location) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="update-location-container">
        <div className="form-sidebar-container">
          <form className="update-location-form" onSubmit={onSubmit}>
            <h2>Update Location Details</h2>
            {notification && <div className="notification">{notification}</div>}
            <div className="form-control">
              <label>Location Name</label>
              <input
                type="text"
                placeholder="Update Location Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label>Identification Number</label>
              <input
                type="text"
                placeholder="Update Identification Number"
                value={id}
                readOnly
              />
            </div>
            <div className="form-control">
              <label>Label</label>
              <select value={label} onChange={(e) => setLabel(e.target.value)}>
                <option value="">Select Label</option>
                <option value="Farm">Farm</option>
                <option value="Processing Facility">Processing Facility</option>
                <option value="Distribution Center">Distribution Center</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Supermarket">Supermarket</option>
              </select>
            </div>
            {label === 'Farm' && (
              <div className="form-control">
                <label>Farm</label>
                <select value={farmName} onChange={(e) => setFarmName(e.target.value)}>
                  <option value="">Select Farm</option>
                  {farms.map((farm) => (
                    <option key={farm.name} value={farm.name}>
                      {farm.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-control">
              <label>Latitude</label>
              <input
                type="text"
                placeholder="Update Latitude"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
              />
            </div>
            <div className="form-control">
              <label>Longitude</label>
              <input
                type="text"
                placeholder="Update Longitude"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
              />
            </div>
            <div className="form-control">
              <label>Region</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="">Select Region</option>
                <option value="Central">Central</option>
                <option value="Coast">Coast</option>
                <option value="Eastern">Eastern</option>
                <option value="Rift Valley">Rift Valley</option>
                <option value="Nairobi">Nairobi</option>
                <option value="North Eastern">North Eastern</option>
                <option value="Nyanza">Nyanza</option>
                <option value="Western">Western</option>
              </select>
            </div>
            <div className="form-control">
              <label>Description</label>
              <textarea
                type="text"
                placeholder="Update Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
              />
            </div>
            <input type="submit" value="Update Location" className="btn btn-block" />
          </form>
        </div>
        <MapContainer center={[latitude || 0, longitude || 38]} zoom={8} className='leaflet-container' ref={mapRef} >
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
            <BaseLayer name='Esri World'>
              <TileLayer
                url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                maxZoom={20}
              />
            </BaseLayer>
          </LayersControl>
          <FeatureGroup ref={featureGroupRef}>
            {latitude && longitude && (
              <Marker position={[latitude, longitude]} draggable
                eventHandlers={{
                  dragend: (event) => {
                    const marker = event.target;
                    const position = marker.getLatLng();
                    setLatitude(position.lat);
                    setLongitude(position.lng);
                  },
                }}
              />
            )}
            <EditControl
              position="topright"
              onCreated={(e) => {
                const { layerType, layer } = e;
                if (layerType === 'marker') {
                  const { lat, lng } = layer.getLatLng();
                  setLatitude(lat);
                  setLongitude(lng);
                }
              }}
              featureGroup={featureGroupRef.current}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                polyline: false,
                polygon: false,
              }}
            />
          </FeatureGroup>
        </MapContainer>
      </div>
    </>
  );
};

export default UpdateLocation;
