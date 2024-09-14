import React from 'react';
import '../css/Popup.css';

const Popup = ({ layerName, onClose }) => {
  const layerInfo = {
    "Desert Locust Band": [
      "Desert Locust Band helps in understanding rainfall patterns across various regions.",
      "Monthly data provides insights into seasonal changes, allowing researchers and policymakers to track long-term climate trends.",
      "This information is crucial for agricultural planning, water resource management, and disaster preparedness.",
      "CHIRPS data combines satellite imagery with in-situ station data to create gridded rainfall time series.",
      "Learn more about CHIRPS methodology: https://www.chc.ucsb.edu/data/chirps",
      "Access CHIRPS data: https://data.chc.ucsb.edu/products/CHIRPS-2.0/"
    ],
    "Desert Locust Swarms": [
      "Desert Locust Swarms indicates the deviation from average moisture levels in the soil, providing crucial information about the water content available for vegetation.",
      "This data is invaluable for drought monitoring, flood prediction, and assessing wildfire risk.",
      "It helps in evaluating crop health, determining irrigation needs, and supporting precision agriculture practices.",
      "Soil moisture anomalies can be an early indicator of developing drought conditions or potential flood risks.",
      "Explore global soil moisture data: https://www.esa-soilmoisture-cci.org/",
      "Learn about NASA's SMAP mission for soil moisture mapping: https://smap.jpl.nasa.gov/"
    ],
    "Desert Locust Hoppers": [
      "Desert Locust Hoppers shows deviations from long-term average temperatures, serving as a key indicator of climate change and variability.",
      "This data is essential for identifying and studying phenomena like global warming, urban heat islands, and extreme weather events.",
      "It helps in monitoring heatwaves and cold spells, which is crucial for public health and energy management.",
      "Temperature anomalies can impact ecosystems, agriculture, and human activities, making this data vital for adaptation strategies.",
      "Explore global temperature data: https://data.giss.nasa.gov/gistemp/",
      "Learn about NOAA's climate monitoring: https://www.ncdc.noaa.gov/monitoring-references/faq/"
    ],
    "Monthly Precipitation (CHIRPS)": [
      "Precipitation data from CHIRPS (Climate Hazards Group InfraRed Precipitation with Station data) helps in understanding rainfall patterns across various regions.",
      "Monthly data provides insights into seasonal changes, allowing researchers and policymakers to track long-term climate trends.",
      "This information is crucial for agricultural planning, water resource management, and disaster preparedness.",
      "CHIRPS data combines satellite imagery with in-situ station data to create gridded rainfall time series.",
      "Learn more about CHIRPS methodology: https://www.chc.ucsb.edu/data/chirps",
      "Access CHIRPS data: https://data.chc.ucsb.edu/products/CHIRPS-2.0/"
    ],
    "Monthly Soil Moisture Anomaly": [
      "Soil moisture anomaly indicates the deviation from average moisture levels in the soil, providing crucial information about the water content available for vegetation.",
      "This data is invaluable for drought monitoring, flood prediction, and assessing wildfire risk.",
      "It helps in evaluating crop health, determining irrigation needs, and supporting precision agriculture practices.",
      "Soil moisture anomalies can be an early indicator of developing drought conditions or potential flood risks.",
      "Explore global soil moisture data: https://www.esa-soilmoisture-cci.org/",
      "Learn about NASA's SMAP mission for soil moisture mapping: https://smap.jpl.nasa.gov/"
    ],
    "Monthly Temperature Anomaly": [
      "Temperature anomaly shows deviations from long-term average temperatures, serving as a key indicator of climate change and variability.",
      "This data is essential for identifying and studying phenomena like global warming, urban heat islands, and extreme weather events.",
      "It helps in monitoring heatwaves and cold spells, which is crucial for public health and energy management.",
      "Temperature anomalies can impact ecosystems, agriculture, and human activities, making this data vital for adaptation strategies.",
      "Explore global temperature data: https://data.giss.nasa.gov/gistemp/",
      "Learn about NOAA's climate monitoring: https://www.ncdc.noaa.gov/monitoring-references/faq/"
    ],
    "Desert Locust Risk": [
      "Desert Locust Risk shows deviations from long-term average temperatures, serving as a key indicator of climate change and variability.",
      "This data is essential for identifying and studying phenomena like global warming, urban heat islands, and extreme weather events.",
      "It helps in monitoring heatwaves and cold spells, which is crucial for public health and energy management.",
      "Desert Locust Risks can impact ecosystems, agriculture, and human activities, making this data vital for adaptation strategies.",
      "Explore global temperature data: https://data.giss.nasa.gov/gistemp/",
      "Learn about NOAA's climate monitoring: https://www.ncdc.noaa.gov/monitoring-references/faq/"
    ]
  };

  return (
    <div className="popup-container">
      <div className="popup-content">
        <button className="popup-close" onClick={onClose}>X</button>
        <h2 className="popup-heading">{layerName}</h2>
        <hr className="popup-divider" />
        {layerInfo[layerName].map((text, index) => (
          <p key={index}>
            {text.startsWith("http") ? (
              <a href={text} target="_blank" rel="noopener noreferrer">
                {text}
              </a>
            ) : (
              text
            )}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Popup;
