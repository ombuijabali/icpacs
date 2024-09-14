import React, { useState, useMemo, useCallback } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../css/ControlPanel.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const ControlPanel = ({
  layersVisibility,
  toggleLayerVisibility,
  onApplyFilter,
  onClearFilter,
  layerNameMapping,
  onInfoIconClick,
  addLogMessage = (msg, type) => console.log(`${type}: ${msg}`), // Add this prop to handle log messages
}) => {
  const [layerFilters, setLayerFilters] = useState({});
  

  const layerUrls = useMemo(
    () => ({
      'Soil Moisture':
        'http://localhost:8080/geoserver/igad/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=igad%3Avw_temp_soil_with_geom&maxFeatures=50&outputFormat=application%2Fjson',
      Temperature:
        'http://localhost:8080/geoserver/igad/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=igad:vw_temp_temperature_with_geom&outputFormat=application%2Fjson',
      Precipitation:
        'http://localhost:8080/geoserver/igad/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=igad:vw_temp_spi_with_geom&outputFormat=application%2Fjson',
      'Band Master':
        'http://localhost:8080/geoserver/igad/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=igad:band_1&outputFormat=application%2Fjson',
      Hoppers:
        'http://localhost:8080/geoserver/igad/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=igad:hopper_master&outputFormat=application%2Fjson',
      Swarms:
        'http://localhost:8080/geoserver/igad/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=igad:swarm&outputFormat=application%2Fjson',
      'Desert Locust Risk':
        'http://localhost:8080/geoserver/igad/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=igad:desert_locust_risk&outputFormat=application%2Fjson',
      'IGAD Boundary': 
        'http://localhost:8080/geoserver/igad/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=igad:boundary_with_geom&outputFormat=application%2Fjson',
    }),
    []
  );

  const handleFilterChange = useCallback((layerKey, filterType, value) => {
    setLayerFilters((prev) => ({
      ...prev,
      [layerKey]: {
        ...prev[layerKey],
        [filterType]: value,
      },
    }));
  }, []);

  const handleApplyFilter = useCallback(
    (layerKey) => {
      const filter = layerFilters[layerKey];
      if (!filter || !filter.year || !filter.month || (['Soil Moisture', 'Temperature', 'Precipitation'].includes(layerKey) && !filter.dekad)) {
        addLogMessage(`Please select all required fields (Year, Month${layerKey.includes('Soil Moisture') || layerKey.includes('Temperature') || layerKey.includes('Precipitation') ? ', and Dekad' : ''}) for ${layerKey}`, 'error');
        return;
      }
      
      let cqlFilter = '';
      if (['Band Master', 'Hoppers', 'Swarms'].includes(layerKey)) {
        const startDate = `${filter.year}-${filter.month.toString().padStart(2, '0')}-01`;
        const endDate = new Date(filter.year, filter.month, 0).getDate();
        cqlFilter = `finishdate >= '${startDate}' AND finishdate <= '${filter.year}-${filter.month.toString().padStart(2, '0')}-${endDate.toString().padStart(2, '0')}'`;
      } else if (['Soil Moisture', 'Temperature', 'Precipitation'].includes(layerKey)) {
        const dekadStart = (filter.dekad - 1) * 10 + 1;
        const dekadEnd = filter.dekad === 3 ? 31 : filter.dekad * 10;
        cqlFilter = `updated_when >= '${filter.year}-${filter.month.toString().padStart(2, '0')}-${dekadStart.toString().padStart(2, '0')}' AND updated_when <= '${filter.year}-${filter.month.toString().padStart(2, '0')}-${dekadEnd.toString().padStart(2, '0')}'`;
      }

      onApplyFilter(layerKey, cqlFilter, layerUrls[layerKey]);
      
      // Ensure the layer is visible after applying the filter
      if (!layersVisibility[layerKey]) {
        toggleLayerVisibility(layerKey);
      }
    },
    [layerFilters, onApplyFilter, layerUrls, layersVisibility, toggleLayerVisibility, addLogMessage]
  );

  const handleClearFilter = useCallback(
    (layerKey) => {
      setLayerFilters((prev) => {
        const newState = { ...prev };
        delete newState[layerKey];
        return newState;
      });
      onClearFilter(layerKey);
    },
    [onClearFilter]
  );

  const renderFilterControls = (layerKey) => {
    const filter = layerFilters[layerKey] || {};
    const isPestLayer = ['Band Master', 'Hoppers', 'Swarms'].includes(layerKey);
    const isClimatologyLayer = ['Soil Moisture', 'Temperature', 'Precipitation'].includes(layerKey);
    if (!isClimatologyLayer && !isPestLayer) return null;

    return (
      <div className="filter-options" key={`filter-${layerKey}`}>
        <select
          key={`year-${layerKey}`}
          value={filter.year || ''}
          onChange={(e) => handleFilterChange(layerKey, 'year', e.target.value)}
        >
          <option value="">Select Year</option>
          {Array.from({ length: 2024 - 1965 + 1 }, (_, i) => 2024 - i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <select
          key={`month-${layerKey}`}
          value={filter.month || ''}
          onChange={(e) => handleFilterChange(layerKey, 'month', e.target.value)}
        >
          <option value="">Select Month</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
            <option key={month} value={month}>{new Date(0, month - 1).toLocaleString('en', { month: 'long' })}</option>
          ))}
        </select>
        {isClimatologyLayer && (
          <select
            key={`dekad-${layerKey}`}
            value={filter.dekad || ''}
            onChange={(e) => handleFilterChange(layerKey, 'dekad', e.target.value)}
          >
            <option value="">Select Dekad</option>
            <option value="1">Dekad 1 (1-10)</option>
            <option value="2">Dekad 2 (11-20)</option>
            <option value="3">Dekad 3 (21-End)</option>
          </select>
        )}
        <button key={`apply-${layerKey}`} onClick={() => handleApplyFilter(layerKey)} className="filter-icon-button">
          <i className="fas fa-check"></i>
        </button>
        <button key={`clear-${layerKey}`} onClick={() => handleClearFilter(layerKey)} className="filter-icon-button">
          <i className="fas fa-times"></i>
        </button>
      </div>
    );
  };

  const renderLayerControls = (layerGroups) => {
    return Object.entries(layerGroups).map(([groupName, layers]) => (
      <div key={groupName} className="layer-group">
        <h4 className="layer-group-heading">
          <i className="fas fa-ellipsis-v" style={{ marginRight: '8px', verticalAlign: 'middle' }}></i>
          {groupName.replace(/([A-Z])/g, ' $1').trim()}
        </h4>
        <div className="layer-toggles">
          {layers.map((layer) => {
            const layerName = typeof layer === 'string' ? layer : layer.name;
            const layerKey = Object.keys(layerNameMapping).find((key) => layerNameMapping[key] === layerName);
            const isVisible = layersVisibility[layerKey];
            const isFiltered = !!layerFilters[layerKey];

            return (
              <div key={layerKey} className="layer-toggle-container">
                <div className="layer-toggle">
                  <span>{layerName}</span>
                  <div
                    className={`toggle-switch ${isVisible ? 'on' : 'off'}`}
                    onClick={() => toggleLayerVisibility(layerKey)}
                  >
                    <div className="toggle-knob"></div>
                  </div>
                  <button className="info-button" onClick={() => onInfoIconClick(layerKey)}>
                    <i className="fas fa-info-circle"></i>
                  </button>
                </div>
                {layersVisibility[layerKey] && renderFilterControls(layerKey)}
                {isFiltered && isVisible && (
                  <div className="filter-indicator">
                    <i className="fas fa-filter"></i> Filtered
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ));
  };

  const layerGroupsMonitoring = {
    DesertLocustRisk: ['Desert Locust Risk'],
    DesertLocustPests: [
      { name: 'Bands', icon: 'brown', geoserverName: 'Band Master' },
      { name: 'Swarms', icon: 'blue', geoserverName: 'Swarms' },
      { name: 'Hoppers', icon: 'green', geoserverName: 'Hoppers' },
    ],
    ClimatologyData: [
      { name: 'Monthly Precipitation (CHIRPS)', geoserverName: 'Precipitation' },
      { name: 'Monthly Soil Moisture Anomaly', geoserverName: 'Soil Moisture' },
      { name: 'Monthly Temperature Anomaly', geoserverName: 'Temperature' },
    ],
    Boundary: ['IGAD Boundary'],  // Correctly mapped
  };
  
  const layerGroupsForecasting = {
    DesertLocustRisk: ['Desert Locust Risk'],
    ClimatologyData: [
      { name: 'Monthly Precipitation (CHIRPS)', geoserverName: 'Precipitation' },
      { name: 'Monthly Soil Moisture Anomaly', geoserverName: 'Soil Moisture' },
      { name: 'Monthly Temperature Anomaly', geoserverName: 'Temperature' },
    ],
  };
    

  return (
    <div className="control-panel">
      <Tabs>
        <TabList>
          <Tab>
            <i className="fas fa-database"></i> Monitoring Data
          </Tab>
          <Tab>
            <i className="fas fa-broadcast-tower"></i> Forecast Data
          </Tab>
        </TabList>

        <TabPanel>{renderLayerControls(layerGroupsMonitoring)}</TabPanel>
        <TabPanel>{renderLayerControls(layerGroupsForecasting)}</TabPanel>
      </Tabs>
    </div>
  );
};

export default ControlPanel;
