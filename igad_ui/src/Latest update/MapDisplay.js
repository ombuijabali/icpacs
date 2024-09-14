import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../plugins/Control.FullScreen.css';
import '../plugins/Control.FullScreen.js';
import '../plugins/leaflet.browser.print.min.js';
import '../plugins/Leaflet.Control.Layers.Tree-master/L.Control.Layers.Tree.css';
import '../plugins/Leaflet.Control.Layers.Tree-master/L.Control.Layers.Tree.js';
import '../css/MapDisplay.css';
import * as turf from '@turf/turf';

const MapComponent = forwardRef(({ layersVisibility, filteredLayers, onToggleLayer, onMapInitialized }, ref) => {
  const mapRef = useRef(null);
  const overlayLayersRef = useRef({});
  const treeControlRef = useRef(null);

  const colorRamps = useMemo(() => ({
    'Soil Moisture': [
      { range: '-5 to -3', color: '#8c510a', label: 'Dark Brown' },
      { range: '-3 to -1', color: '#d8b365', label: 'Medium Brown' },
      { range: '-1 to 1', color: '#f6e8c3', label: 'Light Brown' },
      { range: '1 to 3', color: '#c7eae5', label: 'Light Beige' },
      { range: '3 to 5', color: '#5ab4ac', label: 'Medium Beige' },
      { range: '5+', color: '#01665e', label: 'Dark Beige' },
    ],
    'Temperature': [
      { range: '0 to 2', color: '#fff5f0', label: 'Lightest Red' },
      { range: '2 to 4', color: '#fee0d2', label: 'Very Light Red' },
      { range: '4 to 6', color: '#fcbba1', label: 'Light Red' },
      { range: '6 to 8', color: '#fc9272', label: 'Medium Light Red' },
      { range: '8 to 10', color: '#fb6a4a', label: 'Medium Red' },
      { range: '10+', color: '#ef3b2c', label: 'Medium Dark Red' },
    ],
    'Precipitation': [
      { range: '0 to 40', color: '#f7fbff', label: 'Lightest Blue' },
      { range: '41 to 80', color: '#deebf7', label: 'Very Light Blue' },
      { range: '81 to 120', color: '#c6dbef', label: 'Light Blue' },
      { range: '121 to 160', color: '#9ecae1', label: 'Medium Light Blue' },
      { range: '161 to 180', color: '#6baed6', label: 'Medium Blue' },
      { range: '181 to 200', color: '#4292c6', label: 'Medium Dark Blue' },
      { range: '200+', color: '#084594', label: 'Darkest Blue' },
    ],
    'Desert Locust Risk': [
      { range: 'None', color: '#D9D9D9', label: 'Grey' },
      { range: 'Low', color: '#F5DEB3', label: 'Light Yellow' },
      { range: 'Moderate', color: '#FFB347', label: 'Orange' },
      { range: 'High', color: '#FF8000', label: 'Darker Orange' },
      { range: 'Very High', color: '#FF3300', label: 'Red' },
    ],
  }), []);

  const baseLayers = useMemo(() => ({
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }),
    "Esri World Imagery": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    }),
    "Esri World Terrain": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
    }),
    "ICPAC Drought Watch": L.tileLayer('https://eahazardswatch.icpac.net/tileserver-gl/styles/droughtwatch/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://eahazardswatch.icpac.net/">ICPAC Drought Watch</a>',
      tileSize: 512,
      zoomOffset: -1,
    }),
  }), []);

  const overlayLayers = useMemo(() => ({
    "Soil Moisture": L.tileLayer.wms('http://localhost:8080/geoserver/igad/wms', {
      layers: 'igad:vw_temp_soil',
      format: 'image/png',
      transparent: true,
      styles: 'soil_style',
      opacity: 1,
    }),
    "Temperature": L.tileLayer.wms('http://localhost:8080/geoserver/igad/wms', {
      layers: 'igad:vw_temp_temperature',
      format: 'image/png',
      transparent: true,
      styles: 'temperature_style',
      opacity: 1,
    }),
    "Precipitation": L.tileLayer.wms('http://localhost:8080/geoserver/igad/wms', {
      layers: 'igad:vw_temp_spi',
      format: 'image/png',
      transparent: true,
      styles: 'spi_style',
      opacity: 1,
    }),
    "Desert Locust Risk": L.tileLayer.wms('http://localhost:8080/geoserver/igad/wms', {
      layers: 'igad:vw_risk',
      format: 'image/png',
      transparent: true,
      styles: 'risk_style',
      opacity: 1,
    }),
    "IGAD Boundary": L.tileLayer.wms('http://localhost:8080/geoserver/igad/wms', {
      layers: 'igad:boundary',
      format: 'image/png',
      transparent: true,
      styles: 'boundary_style',
      opacity: 1,
    }),
    "Band Master": L.tileLayer.wms('http://localhost:8080/geoserver/igad/wms', {
      layers: 'igad:band_1',
      format: 'image/png',
      transparent: true,
      styles: 'bands_swarm',
      opacity: 1,
    }),
    "Hoppers": L.tileLayer.wms('http://localhost:8080/geoserver/igad/wms', {
      layers: 'igad:hopper_master',
      format: 'image/png',
      transparent: true,
      styles: 'hopper_style',
      opacity: 1,
    }),
    "Swarms": L.tileLayer.wms('http://localhost:8080/geoserver/igad/wms', {
      layers: 'igad:swarm',
      format: 'image/png',
      transparent: true,
      styles: 'swarms_style',
      opacity: 1,
    }),
  }), []);

  const initializeMap = useCallback(() => {
    const map = L.map('map', {
      center: [9.127, 42.338],
      zoom: 4.4,
      minZoom: 3,
      layers: [
        baseLayers["ICPAC Drought Watch"],
        overlayLayers["Band Master"],
        overlayLayers["Hoppers"],
        overlayLayers["Swarms"],
      ],
      fullscreenControl: true,
    });

    mapRef.current = map;

    Object.entries(overlayLayers).forEach(([name, layer]) => {
      overlayLayersRef.current[name] = layer;
      if (layersVisibility[name]) {
        layer.addTo(map);
      }
    });

    updateTreeControl();

    const homeButton = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: function () {
        const button = L.DomUtil.create('button', 'home-button');
        button.title = 'Go to Home';
        button.innerHTML = '<i class="fas fa-home"></i>';
        button.style.cssText = 'background-color: white; padding: 10px; cursor: pointer;';

        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.on(button, 'click', function () {
          map.setView([9.127, 42.338], 4.4);
        });

        return button;
      },
    });
    map.addControl(new homeButton());

    L.control.scale({ position: 'bottomleft' }).addTo(map);
    L.control.browserPrint({ position: 'bottomleft' }).addTo(map);

    map.on('click', handleMapClick);
    map.on('overlayadd', handleOverlayAdd);
    map.on('overlayremove', handleOverlayRemove);

    onMapInitialized();
  }, [onMapInitialized, layersVisibility, baseLayers, overlayLayers]);

  const updateTreeControl = useCallback(() => {
    if (!mapRef.current) return;

    if (treeControlRef.current) {
      mapRef.current.removeControl(treeControlRef.current);
    }

    const baseTree = {
      label: 'Base Layers',
      children: Object.entries(baseLayers).map(([label, layer]) => ({ label, layer })),
      collapsed: true,
    };

    const riskTree = {
      label: 'Risk Layers',
      children: [
        {
          label: 'Desert Locust Risk',
          layer: overlayLayersRef.current["Desert Locust Risk"],
          children: colorRamps['Desert Locust Risk'] ? colorRamps['Desert Locust Risk'].map((ramp) => ({
            label: `<div class="color-ramp" style="background-color: ${ramp.color}; width: 15px; height: 15px; display: inline-block; margin-right: 5px;"></div> ${ramp.label} (${ramp.range})`,
            layer: null,
          })) : [],
        },
      ],
      collapsed: false,
    };

    const pestsTree = {
      label: 'Pest Layers',
      children: [
        {
          label: `Band Master <br><div style="background-color: brown; width: 15px; height: 15px; border-radius: 50%; display: inline-block; margin-top: 2px; margin-left: 20px;"></div>`,
          layer: overlayLayersRef.current["Band Master"]
        },
        {
          label: `Swarms <br><div style="background-color: blue; width: 15px; height: 15px; border-radius: 50%; display: inline-block; margin-top: 2px; margin-left: 20px;"></div>`,
          layer: overlayLayersRef.current["Swarms"]
        },
        {
          label: `Hoppers <br><div style="background-color: green; width: 15px; height: 15px; border-radius: 50%; display: inline-block; margin-top: 2px; margin-left: 20px;"></div>`,
          layer: overlayLayersRef.current["Hoppers"]
        }
      ],
      collapsed: false,
    };

    const climateTree = {
      label: 'Climate Layers',
      children: Object.entries(overlayLayersRef.current)
        .filter(([layerName]) => layersVisibility[layerName]) // Show only if visible
        .filter(([layerName]) => ['Soil Moisture', 'Temperature', 'Precipitation'].includes(layerName))
        .map(([label, layer]) => ({
          label,
          layer,
          children: colorRamps[label] ? colorRamps[label].map((ramp) => ({
            label: `<div class="color-ramp" style="background-color: ${ramp.color}; width: 15px; height: 15px; display: inline-block; margin-right: 5px;"></div> ${ramp.label} (${ramp.range})`,
            layer: null,
          })) : [],
        })),
      collapsed: false,
    };

    const boundaryTree = {
      label: 'Boundary Layer',
      children: [
        {
          label: 'IGAD Boundary',
          layer: overlayLayersRef.current["IGAD Boundary"],
        },
      ],
      collapsed: false,
    };

    treeControlRef.current = L.control.layers.tree(baseTree, [
      riskTree,
      { label: '<hr style="border: 1px solid #ccc; margin: 5px 0;">' },
      climateTree,
      { label: '<hr style="border: 1px solid #ccc; margin: 5px 0;">' },
      pestsTree,
      { label: '<hr style="border: 1px solid #ccc; margin: 5px 0;">' },
      boundaryTree
    ], {
      collapsed: false,
    }).addTo(mapRef.current);
  }, [layersVisibility, colorRamps, baseLayers]);

  const updateLayerVisibility = useCallback(() => {
    if (!mapRef.current) return;

    Object.entries(overlayLayersRef.current).forEach(([layerName, layer]) => {
      if (layersVisibility[layerName]) {
        mapRef.current.addLayer(layer);
      } else {
        mapRef.current.removeLayer(layer);
      }
    });
    updateTreeControl();
  }, [layersVisibility, updateTreeControl]);

  const updateFilteredLayers = useCallback(() => {
    if (!mapRef.current) {
      console.warn('Map not initialized');
      return;
    }

    if (filteredLayers) {
      Object.entries(filteredLayers).forEach(([layerName, features]) => {
        const layer = overlayLayersRef.current[layerName];
        if (layer && features && features.length > 0) {
          const cqlFilter = `CQL_FILTER=${features.map(f => `id=${f.id}`).join(' OR ')}`;

          layer.setParams({
            CQL_FILTER: cqlFilter,
            STYLES: layer.options.styles,
            FORMAT: layer.options.format,
            TRANSPARENT: layer.options.transparent,
            OPACITY: layer.options.opacity,
            random: Math.random()
          });
        } else if (layer) {
          layer.setParams({
            CQL_FILTER: null,
            STYLES: layer.options.styles,
            FORMAT: layer.options.format,
            TRANSPARENT: layer.options.transparent,
            OPACITY: layer.options.opacity,
            random: Math.random()
          });
        }
      });
    }

    updateTreeControl();
  }, [filteredLayers, updateTreeControl]);

  const handleMapClick = useCallback(async (e) => {
    const latlng = e.latlng;
    const boundaryLayer = overlayLayersRef.current['IGAD Boundary'];
    const pestLayers = ['Band Master', 'Hoppers', 'Swarms'];
    const climateLayers = ['Soil Moisture', 'Temperature', 'Precipitation'];
    let popupContent = '';

    if (!boundaryLayer) {
        L.popup()
            .setLatLng(latlng)
            .setContent('Boundary layer is not available.')
            .openOn(mapRef.current);
        return;
    }

    const boundaryUrl = getFeatureInfoUrl(boundaryLayer, latlng);
    if (!boundaryUrl) {
        L.popup()
            .setLatLng(latlng)
            .setContent('Error generating GetFeatureInfo URL.')
            .openOn(mapRef.current);
        return;
    }

    try {
        const boundaryResponse = await fetch(boundaryUrl);
        const boundaryData = await boundaryResponse.json();

        if (boundaryData.features && boundaryData.features.length > 0) {
            const countryName = boundaryData.features[0].properties.name;
            const boundaryGeometry = boundaryData.features[0].geometry;
            popupContent += `<h5 style="margin-bottom: 10px;">${countryName}</h5>`;

            let mostRecentPestDate = new Date(0); // Initialize with the oldest possible date

            for (const layerName of pestLayers) {
                const layer = overlayLayersRef.current[layerName];
                const layerUrl = getFeatureInfoUrl(layer, latlng);
                if (!layerUrl) {
                    popupContent += `<strong>${layerName}:</strong> Error generating URL<br>`;
                    continue;
                }

                const layerResponse = await fetch(layerUrl);
                const layerData = await layerResponse.json();

                if (layerData.features && layerData.features.length > 0) {
                    // Filter points within the country's boundary
                    const pestPoints = layerData.features.filter((feature) => 
                        turf.booleanPointInPolygon(feature, boundaryGeometry)
                    );

                    // Aggregate the most recent date for the entire country
                    pestPoints.forEach((feature) => {
                        const date = new Date(feature.properties.finishdate);
                        if (date > mostRecentPestDate) {
                            mostRecentPestDate = date;
                        }
                    });
                }

                if (mostRecentPestDate > new Date(0)) {
                    popupContent += `<strong>${layerName} Recent Infestation Date:</strong> ${mostRecentPestDate.toISOString().split('T')[0]}<br>`;
                } else {
                    popupContent += `<strong>${layerName} Recent Infestation Date:</strong> No data available<br>`;
                }
            }

            for (const layerName of climateLayers) {
                const layer = overlayLayersRef.current[layerName];
                const layerUrl = getFeatureInfoUrl(layer, latlng);
                if (!layerUrl) {
                    popupContent += `<strong>${layerName}:</strong> Error generating URL<br>`;
                    continue;
                }

                const layerResponse = await fetch(layerUrl);
                const layerData = await layerResponse.json();

                if (layerData.features && layerData.features.length > 0) {
                    const latestDate = layerData.features[0].properties.updated_when;
                    popupContent += `<strong>${layerName} Last Update:</strong> ${latestDate}<br>`;
                } else {
                    popupContent += `<strong>${layerName} Last Update:</strong> No data available<br>`;
                }
            }

            popupContent += `
                <button 
                    onclick="window.goToAnalytics()" 
                    style="
                        background-color: #4CAF50; 
                        border: none; 
                        color: white; 
                        padding: 10px 20px; 
                        text-align: center; 
                        text-decoration: none; 
                        display: inline-block; 
                        font-size: 16px; 
                        margin: 4px 2px; 
                        cursor: pointer; 
                        border-radius: 4px; 
                        transition: background-color 0.3s;
                    "
                    onmouseover="this.style.backgroundColor='#1557b0'"
                    onmouseout="this.style.backgroundColor='#4CAF50'"
                >
                    Go to Analytics
                </button>
            `;
        } else {
            popupContent = 'No data available for this location.';
        }
    } catch (error) {
        console.error('Error fetching WMS GetFeatureInfo:', error);
        popupContent = 'Error fetching data.';
    }

    L.popup()
        .setLatLng(latlng)
        .setContent(popupContent)
        .openOn(mapRef.current);
}, []);

  const getFeatureInfoUrl = useCallback((layer, latlng) => {
    if (!layer || !layer._url) {
      console.error('Layer or layer URL is undefined');
      return null;
    }

    const map = mapRef.current;
    const point = map.latLngToContainerPoint(latlng);
    const size = map.getSize();

    return `${layer._url}?service=WMS&version=1.1.0&request=GetFeatureInfo&layers=${layer.options.layers}&query_layers=${layer.options.layers}&info_format=application/json&x=${Math.round(point.x)}&y=${Math.round(point.y)}&width=${size.x}&height=${size.y}&srs=EPSG:4326&bbox=${map.getBounds().toBBoxString()}`;
  }, []);

  const handleOverlayAdd = useCallback((e) => {
    const layerName = Object.keys(overlayLayersRef.current).find(key => overlayLayersRef.current[key] === e.layer);
    if (layerName) onToggleLayer(layerName, true);
  }, [onToggleLayer]);

  const handleOverlayRemove = useCallback((e) => {
    const layerName = Object.keys(overlayLayersRef.current).find(key => overlayLayersRef.current[key] === e.layer);
    if (layerName) onToggleLayer(layerName, false);
  }, [onToggleLayer]);

  useImperativeHandle(ref, () => ({
    invalidateSize: () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    },
    getLayerByName: (name) => {
      return overlayLayersRef.current[name];
    },
    getBounds: () => {
      if (mapRef.current) {
        return mapRef.current.getBounds();
      }
    },
    getSize: () => {
      if (mapRef.current) {
        return mapRef.current.getSize();
      }
    },
    updateTreeControl: (layerName, isVisible) => {
      if (mapRef.current) {
        const layer = overlayLayersRef.current[layerName];
        if (layer) {
          if (isVisible) {
            mapRef.current.addLayer(layer);
          } else {
            mapRef.current.removeLayer(layer);
          }
          updateTreeControl();
        }
      }
    },
    removeLayer: (layer) => {
      if (mapRef.current) {
        mapRef.current.removeLayer(layer);
      }
    },
  }));

  useEffect(() => {
    initializeMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [initializeMap]);

  useEffect(() => {
    updateLayerVisibility();
  }, [layersVisibility, updateLayerVisibility]);

  useEffect(() => {
    updateFilteredLayers();
  }, [filteredLayers, updateFilteredLayers]);

  return <div id="map" style={{ width: '100%', height: '100%' }}></div>;
});

export default MapComponent;
