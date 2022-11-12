import { style, getColor, highlight_filter, null_style, clear_map } from "./filters.js";
import { greece_regions, update_region_posts } from "../geojson/greece_regions.js";

document.getElementById("map-analytics").addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("admin-analytics-map")).display === "none") {
    highlight_filter("fa-solid fa-map");
    null_style("fa-solid fa-chart-column");
    $("#admin-analytics-map").fadeIn(300, function () {
      admin_analytics_map.invalidateSize();
      make_admin_analytics_map();
    });
  }
});

document.getElementById("chart-analytics").addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("admin-analytics-map")).display !== "none") {
    highlight_filter("fa-solid fa-chart-column");
    null_style("fa-solid fa-map");
    $("#admin-analytics-map").fadeOut(300, function () {
      clear_map(admin_analytics_map, admin_layerControl, admin_all_geojson, admin_analytics_all_markers);
    });
  }
});

export var admin_analytics_map = L.map("admin-analytics-map").setView([38.5, 25.5], 6);
let admin_analytics_marker = [];
export let admin_analytics_all_markers = L.layerGroup();

var admin_base_of_map = L.tileLayer("https://{s}.tile.osm.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(admin_analytics_map);

var admin_geojson_layer = L.geoJson(greece_regions, { style: style });

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: "#666",
    dashArray: "",
    fillOpacity: 0.7,
  });

  layer.bringToFront();
  info_admin.update(layer.feature.properties);
}

function resetHighlight(e) {
  admin_geojson.resetStyle(e.target);
  info_admin.update();
}

var admin_geojson;
// ... our listeners
admin_geojson = L.geoJson(greece_regions);

function zoomToFeature(e) {
  admin_analytics_map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
  });
}

admin_geojson = L.geoJson(greece_regions, {
  style: style,
  onEachFeature: onEachFeature,
});

var info_admin = L.control.layers();

info_admin.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
info_admin.update = function (props) {
  this._div.innerHTML =
    "<h4>Posts Number</h4>" + (props ? "<b>" + props.name + "</b><br />" + props.number_of_posts + " posts" : "Hover over a region");
};

info_admin.addTo(admin_analytics_map);

var admin_legend = L.control({ position: "bottomright" });

admin_legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend"),
    grades = [0, 1, 2, 5, 10, 20, 50, 100],
    labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
  }

  return div;
};

admin_legend.addTo(admin_analytics_map);

export var admin_all_geojson;
var admin_overlayMaps = {};
export var admin_layerControl;

//This function creates the map for location/responses analytics
export function make_admin_analytics_map() {
  fetch("process_data.php", {
    method: "POST",
    body: JSON.stringify({
      request: "location_responses_data",
    }),
  })
    .then((res) => res.json())
    .then((response) => {
      admin_all_geojson = L.layerGroup([admin_geojson, admin_geojson_layer]);
      for (let i = 0; i < response.length; i++) {
        admin_analytics_marker[i] = L.marker([response[i][0], response[i][1]]).bindTooltip(
          "User Posts:" + response[i][2] + " | User Responses:" + response[i][3]
        );
        admin_analytics_all_markers.addLayer(admin_analytics_marker[i]);
        var geo_out = greece_regions.features.filter(function (d) {
          return d3.geoContains(d, [response[i][1], response[i][0]]);
        });
        update_region_posts(geo_out[0], parseInt(response[i][2]));
      }
      resetHighlight(admin_geojson_layer);
      admin_layerControl = L.control.layers(null, admin_overlayMaps).addTo(admin_analytics_map);
      admin_layerControl.addOverlay(admin_all_geojson, "Choropleth");
      admin_layerControl.addOverlay(admin_analytics_all_markers, "Markers");
    });
}
