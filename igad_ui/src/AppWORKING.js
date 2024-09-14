import React, { useState } from 'react';

import { Container, Row, Col, Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Header from './components/Header';
import Navigation from './components/Navbar';

import HomeComponent from './components/HomeComponent'; // Import the HomeComponent
import MapComponent from './components/MapDisplay';
import AnalysisComponent from './components/AnalysisComponent'; 


<Header />

function App() {
  const [isTocCollapsed, setIsTocCollapsed] = useState(false);
  const [activeComponent, setActiveComponent] = useState('map');

  const toggleToc = () => {
    setIsTocCollapsed(!isTocCollapsed);
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'home':
        return <HomeComponent />;
      case 'map':
        return <MapComponent />;
      case 'analytics':
        return  <AnalysisComponent />;
      default:
        return <div>Home Content</div>;
    }
  };
<Header />
  return (
    <Container fluid>
      <header>
		<Header />
		
		<Navigation setActiveComponent={setActiveComponent} />
      </header>
	  
	  <Row>
        <Col xs={12} md={isTocCollapsed ? 1 : 3} className="toc">
          <button className="btn btn-primary" onClick={toggleToc}>
            {isTocCollapsed ? 'Expand' : 'Hide'}
          </button>
          {!isTocCollapsed && <div className="toc-content">Controls</div>}
        </Col>
        <Col xs={12} md={isTocCollapsed ? 11 : 9} className="content">
          {renderComponent()}
        </Col>
      </Row>
    </Container>
  );
}

export default App;