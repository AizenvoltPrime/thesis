import { conn, get_variables } from "./index.js";
import { style, getColor, highlight_filter, null_style, clear_map } from "./filters.js";
import { greece_regions, update_region_posts } from "../geojson/greece_regions.js";
import { set_admin_map_bool } from "./update_data.js";

document.getElementById("map-analytics").addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("admin-analytics-map")).display === "none") {
    highlight_filter("fa-solid fa-map");
    null_style("fa-solid fa-chart-column");
    $("#admin-analytics-map").fadeIn(300, function () {
      admin_analytics_map.invalidateSize();
      conn.send(JSON.stringify(["admin_analytics_map", get_variables()[3][0][16], true]));
      set_admin_map_bool(true);
    });
  }
});

document.getElementById("chart-analytics").addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("admin-analytics-map")).display !== "none") {
    highlight_filter("fa-solid fa-chart-column");
    null_style("fa-solid fa-map");
    $("#admin-analytics-map").fadeOut(300, function () {
      clear_map(admin_analytics_map, admin_layerControl, admin_all_geojson, admin_analytics_all_markers);
      clear_admin_map();
      conn.send(JSON.stringify(["admin_map_status", false]));
      set_admin_map_bool(false);
    });
  }
});

export var admin_analytics_map = L.map("admin-analytics-map").setView([38.5, 25.5], 6);
export let admin_analytics_marker = [];
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
  if (props !== undefined && parseInt(props.number_of_posts) === 1) {
    this._div.innerHTML =
      "<h4>Number of Users</h4>" + (props ? "<b>" + props.name + "</b><br />" + props.number_of_posts + " user" : "Hover over a region");
  } else {
    this._div.innerHTML =
      "<h4>Number of Users</h4>" + (props ? "<b>" + props.name + "</b><br />" + props.number_of_posts + " users" : "Hover over a region");
  }
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

export function make_admin_analytics_map(user_latitude, user_longitude) {
  admin_all_geojson = L.layerGroup([admin_geojson, admin_geojson_layer]);
  admin_analytics_marker.push(L.marker([user_latitude, user_longitude]));
  admin_analytics_all_markers.addLayer(admin_analytics_marker[admin_analytics_marker.length - 1]);
  var geo_out = greece_regions.features.filter(function (d) {
    return d3.geoContains(d, [user_longitude, user_latitude]);
  });
  update_region_posts(geo_out[0], 1);
  resetHighlight(admin_geojson_layer);
  if (admin_layerControl === undefined) {
    admin_layerControl = L.control.layers(null, admin_overlayMaps).addTo(admin_analytics_map);
    admin_layerControl.addOverlay(admin_all_geojson, "Choropleth");
    admin_layerControl.addOverlay(admin_analytics_all_markers, "Markers");
  } else {
    admin_analytics_all_markers.addLayer(admin_analytics_marker[admin_analytics_marker.length - 1]);
  }
}

export function admin_map_remove_marker(user_latitude, user_longitude) {
  for (let i = 0; i < admin_analytics_marker.length; i++) {
    if (admin_analytics_marker[i]._latlng.lat === parseFloat(user_latitude) && admin_analytics_marker[i]._latlng.lng === parseFloat(user_longitude)) {
      admin_analytics_map.removeLayer(admin_analytics_marker[i]);
      admin_analytics_all_markers.removeLayer(admin_analytics_marker[i]);
      var geo_out = greece_regions.features.filter(function (d) {
        return d3.geoContains(d, [user_longitude, user_latitude]);
      });
      update_region_posts(geo_out[0], -1);
      resetHighlight(admin_geojson_layer);
      admin_analytics_marker.splice(i, 1);
      admin_analytics_map.invalidateSize();
      break;
    }
  }
}

export function clear_admin_map() {
  for (let i = 0; i < admin_analytics_marker.length; i++) {
    admin_analytics_map.removeLayer(admin_analytics_marker[i]);
    admin_analytics_all_markers.removeLayer(admin_analytics_marker[i]);
  }
  admin_analytics_marker.length = 0;
  admin_layerControl = undefined;
}
