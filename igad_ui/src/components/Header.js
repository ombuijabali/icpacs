import React, { useState } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Header.css';

const Header = ({ setActiveComponent }) => {
  const [activeTab, setActiveTab] = useState('map'); 

  const handleSetActiveComponent = (tabName) => {
    setActiveTab(tabName);
    setActiveComponent(tabName);
  };

  return (
    <Navbar bg="light" expand="lg" className="header-navbar">
      <Navbar.Brand href="#home" className="header-brand">
        <img
          src="../icpaclogo_en.svg"
          width="70"
          height="50"
          className="d-inline-block align-top"
          alt="ICPAC logo"
        />
        <span className="header-title">ICPAC Pests Watch</span>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto nav-right">
          <Nav.Link
            onClick={() => handleSetActiveComponent('home')}
            className={activeTab === 'home' ? 'active' : ''}
          >
            Home
          </Nav.Link>
          <Nav.Link
            onClick={() => handleSetActiveComponent('map')}
            className={activeTab === 'map' ? 'active' : ''}
          >
            Map
          </Nav.Link>
          <Nav.Link
            onClick={() => handleSetActiveComponent('analytics')}
            className={activeTab === 'analytics' ? 'active' : ''}
          >
            Analytics
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
