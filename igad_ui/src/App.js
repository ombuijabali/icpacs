import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './components/Header';
import HomeComponent from './components/HomeComponent';
import MapComponent from './components/MapDisplay';
import AnalysisComponent from './components/AnalysisComponent';
import ControlPanel from './components/ControlPanel';
import Legend from './components/Legend';
import Popup from './components/Popup';

const App = () => {
  const layerNameMapping = {
    'Band Master': 'Bands',
    'Swarms': 'Swarms',
    'Hoppers': 'Hoppers',
    'Soil Moisture': 'Monthly Soil Moisture Anomaly',
    'Temperature': 'Monthly Temperature Anomaly',
    'Precipitation': 'Monthly Precipitation (CHIRPS)',
    'Boundary': 'IGAD Boundary',
    'Desert Locust Risk': 'Desert Locust Risk'
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTocCollapsed, setIsTocCollapsed] = useState(isMobile);
  const [activeComponent, setActiveComponent] = useState('map');
  const [layersVisibility, setLayersVisibility] = useState({
    'Band Master': true,
    'Swarms': true,
    'Hoppers': true,
    'Desert Locust Risk': true,
    'Soil Moisture': false,
    'Temperature': false,
    'Precipitation': false,
    'Boundary': false,
  });
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [infoPopupLayer, setInfoPopupLayer] = useState(null);
  const [filteredLayers, setFilteredLayers] = useState({});
  const [logMessages, setLogMessages] = useState([]); // State to store log messages
  const mapRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      if (newIsMobile !== isMobile) {
        setIsTocCollapsed(newIsMobile);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  const toggleToc = useCallback(() => {
    setIsTocCollapsed(prev => !prev);
  }, []);

  useEffect(() => {
    if (isMapInitialized && mapRef.current && mapRef.current.invalidateSize) {
      const timer = setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isTocCollapsed, isMapInitialized]);

  useEffect(() => {
    window.goToAnalytics = () => {
      setActiveComponent('analytics');
    };

    return () => {
      delete window.goToAnalytics;
    };
  }, []);

  // Modified addLogMessage function to overwrite the previous log message
  const addLogMessage = useCallback((message, type = 'info') => {
    setLogMessages([{ text: message, type, id: Date.now() }]);
  }, []);

  const clearLogMessages = useCallback(() => {
    setLogMessages([]);
  }, []);

  const handleLayerToggleFromMap = useCallback((layerName, isVisible) => {
    setLayersVisibility(prevState => ({
      ...prevState,
      [layerName]: isVisible
    }));
  }, []);

  const toggleLayerVisibility = useCallback(layer => {
    setLayersVisibility(prevState => {
      const newState = {
        ...prevState,
        [layer]: !prevState[layer],
      };
      if (mapRef.current && mapRef.current.updateTreeControl) {
        mapRef.current.updateTreeControl(layer, newState[layer]);
      }
      return newState;
    });
  }, []);  

  const onApplyFilter = useCallback(async (layer, cqlFilter, url) => {
    if (!isMapInitialized || !mapRef.current || !mapRef.current.getLayerByName) {
        addLogMessage('Map not initialized or getLayerByName method not available', 'error');
        return;
    }

    addLogMessage(`Applied filter for ${layer}: ${cqlFilter}`, 'info');

    try {
        const response = await fetch(`${url}&CQL_FILTER=${encodeURIComponent(cqlFilter)}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch features');
        }

        const data = await response.json();

        if (data && data.features) {
            addLogMessage(`Received ${data.features.length} features for ${layer}`, 'info');
            setFilteredLayers(prevState => ({
                ...prevState,
                [layer]: {
                    features: data.features,
                    cqlFilter: cqlFilter,
                },
            }));

            // Ensure the layer visibility is set to true after applying the filter
            setLayersVisibility(prevState => ({
                ...prevState,
                [layer]: true,
            }));

            // Update the tree control if necessary
            if (mapRef.current && mapRef.current.updateTreeControl) {
                mapRef.current.updateTreeControl(layer, true);
            }
        } else {
            addLogMessage(`No features received for ${layer}`, 'warning');
        }
    } catch (error) {
        addLogMessage(`Error fetching features for ${layer}: ${error.message}`, 'error');
    }
  }, [isMapInitialized, addLogMessage]);
  

  const handleClearFilter = useCallback(layerName => {
    if (!isMapInitialized || !mapRef.current || !mapRef.current.getLayerByName) {
      addLogMessage('Map not initialized or getLayerByName method not available', 'error');
      return;
    }

    setFilteredLayers(prevState => {
      const newState = { ...prevState };
      delete newState[layerName];
      return newState;
    });

    setLayersVisibility(prevState => ({
      ...prevState,
      [layerName]: prevState[layerName], // Maintain the original visibility state
    }));

    addLogMessage(`Cleared filter for ${layerName}`, 'info'); // Log message added
  }, [isMapInitialized, addLogMessage]);

  const handleInfoIconClick = layerName => {
    setInfoPopupLayer(prev => (prev === layerName ? null : layerName));
  };

  const renderComponent = useCallback(() => {
    switch (activeComponent) {
      case 'home':
        return <HomeComponent />;
      case 'map':
        return (
          <MapComponent
            layersVisibility={layersVisibility}
            filteredLayers={filteredLayers}
            ref={mapRef}
            onToggleLayer={handleLayerToggleFromMap}
            onMapInitialized={() => setIsMapInitialized(true)}
            isMobile={isMobile}
          />
        );
      case 'analytics':
        return <AnalysisComponent />;
      default:
        return <div>Home Content</div>;
    }
  }, [activeComponent, layersVisibility, filteredLayers, handleLayerToggleFromMap, isMobile]);

  return (
    <Container fluid className="app-container">
      <header>
        <Header setActiveComponent={setActiveComponent} />
      </header>
      <div className="content-wrapper">
        {activeComponent === 'map' && (
          <div className={`toc ${isTocCollapsed ? 'collapsed' : 'expanded'}`}>
            <button className="btn toggle-btn" onClick={toggleToc}>
              <span className="double-chevron">
                <i className={`fas fa-chevron-${isTocCollapsed ? 'right' : 'left'}`}></i>
                <i className={`fas fa-chevron-${isTocCollapsed ? 'right' : 'left'}`}></i>
              </span>
            </button>
            {!isTocCollapsed && (
              <ControlPanel
                layersVisibility={layersVisibility}
                toggleLayerVisibility={toggleLayerVisibility}
                onApplyFilter={onApplyFilter}
                onClearFilter={handleClearFilter}
                layerNameMapping={layerNameMapping}
                onInfoIconClick={handleInfoIconClick}
                isMobile={isMobile}
              />
            )}
          </div>
        )}
        <div
          className={`main-content ${
            activeComponent === 'map' ? (isTocCollapsed ? 'map-collapsed' : 'map-expanded') : 'full-width'
          }`}
        >
          {renderComponent()}
          {infoPopupLayer && (
            <Popup
              layerName={layerNameMapping[infoPopupLayer]}
              onClose={() => setInfoPopupLayer(null)}
            />
          )}
        </div>
      </div>
      <Legend />
      {logMessages.length > 0 && (
        <div className="log-messages">
          <div className="log-header">
            <button className="close-log" onClick={clearLogMessages}>×</button>
          </div>
          {logMessages.map((message) => (
            <div key={message.id} className={`log-message ${message.type}`}>
              {message.text}
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default App;
