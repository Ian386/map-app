// src/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './mainSideBar.css'

const mainSideBar = () => {
  return (
    <div className="mainSideBar">
          <button className="mainSideBar-button">
            <Link to="/add-location">Add Location</Link>
          </button>
          <button className="mainSideBar-button">
            <Link to="/add-field">Add Field</Link>
          </button>
        </div>
  );
};

export default mainSideBar;
