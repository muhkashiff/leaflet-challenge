// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2023-11-23&endtime=2023-11-30&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";
let tectonic_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"


// create function for my map style for radius size and color.
function mapStyle(feature){
  return {
    fillColor : depthColor(feature.geometry.coordinates[2]),
    color : "white",
    radius : circleSize(feature.properties.mag),
    stroke : true,
    weight : 0.6,
    opacity: 1,
    fillOpacity: 1
  }
};
// Create function for circle fill color (depthColor)
function depthColor(depth){
  switch(true){
    case depth > 90:
    return "red";
    case depth > 70:
    return "orangered";
    case depth > 50:
    return "orange";
    case depth > 30:
    return "gold";
    case depth > 10:
    return "yellow";
    default:
      return "lightgreen";
  }
};
// create function for circle size based on magnitude.
function circleSize(mag){
  if (mag === 0){
    return 1;
  }
  return mag * 4;
};
// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  console.log(data)
  createFeatures(data.features)
});

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {  
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    style : mapStyle,
    pointToLayer: function(feature,latlng){
      return L.circleMarker(latlng);
    },
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {
   
// Create the base layers.
  // Create tile layers
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});
  // Tectonic Plates (Bonus part)
  // Creating layer group to hold various layer of map.
  tectonicPlates = new L.layerGroup();

  d3.json(tectonic_url).then(function(tectonicData){
    console.log(tectonicData);
    L.geoJSON(tectonicData,{
      color : "red",
      weight:2
    }).addTo(tectonicPlates)
  });
  // create my map object
  let myMap = L.map("map", {
  center: [
    37.09, -95.71
  ],
  zoom: 5,
  layers: [street,tectonicPlates, earthquakes]
  });
  
  // Create a baseMaps object.
  let baseMaps = {
    "street": street,
    "Topo" : topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates" : tectonicPlates

  };
  // create legend to correlate with map 

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  
  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  
  // Add the layer control to the map.
  
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
  // Set up the legend.
  let legend = L.control({position: "bottomright"});
  legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend"),
    depth = [-10, 10, 30, 50, 70, 90];
    let labels = [];
  
    for (var i = 0; i < depth.length; i++) {
      div.innerHTML +=
      '<i style="background:' + depthColor(depth[i] + 1)  + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }
    return div;
  }
  legend.addTo(myMap);
}
// ------------------------------------------------------------------//


