import React from 'react';

const Legend = ({ map, layersVisibility }) => {
  if (!map || !layersVisibility) {
    return null;
  }

  return (
    <div className="legend">
      <h4>Legend</h4>
      <ul>
        {Object.entries(layersVisibility).map(([layer, isVisible]) => (
          <li key={layer} style={{ display: isVisible ? 'block' : 'none' }}>
            {layer.split(':')[1].replace('_layer', '').toUpperCase()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Legend;


