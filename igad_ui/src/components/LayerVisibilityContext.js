import React, { createContext, useState, useContext } from 'react';

const LayerVisibilityContext = createContext();

export const useLayerVisibility = () => useContext(LayerVisibilityContext);

export const LayerVisibilityProvider = ({ children }) => {
  const [layersVisibility, setLayersVisibility] = useState({
    'pews:band_dl_custom': true,
    'pews:newswams': true,
    'pews:newhoppers': true,
  });

  const toggleLayerVisibility = (layer) => {
    setLayersVisibility((prevVisibility) => ({
      ...prevVisibility,
      [layer]: !prevVisibility[layer],
    }));
  };

  const activeLayers = Object.keys(layersVisibility).filter((layer) => layersVisibility[layer]);

  return (
    <LayerVisibilityContext.Provider value={{ layersVisibility, toggleLayerVisibility, activeLayers }}>
      {children}
    </LayerVisibilityContext.Provider>
  );
};
