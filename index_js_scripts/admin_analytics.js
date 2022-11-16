import { conn, get_variables } from "./index.js";
import { style, getColor, highlight_filter, null_style, clear_map } from "./filters.js";
import { greece_regions, update_region_posts } from "../geojson/greece_regions.js";
import { set_admin_map_bool } from "./update_data.js";

let DateTime = luxon.DateTime;
let ctx; //used for charts
let admin_chart; //the chart

document.getElementById("map-analytics").addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("admin-analytics-map")).display === "none") {
    $("#admin-chart-container").fadeOut(300, function () {});
    $("#admin-analytics-chart-filters-container").fadeOut(300, function () {
      $("#admin-warning-time-filter-choice").fadeOut(300, function () {});
      highlight_filter("fa-solid fa-map");
      null_style("fa-solid fa-chart-column");
      $("#admin-analytics-map").fadeIn(300, function () {
        admin_analytics_map.invalidateSize();
        conn.send(JSON.stringify(["admin_analytics_map", get_variables()[3][0][16], true]));
        set_admin_map_bool(true);
      });
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
    document.forms["admin-chart-time-filter-container"]["admin-time-filter-choice"].value = "";
    $("#admin-analytics-chart-filters-container").fadeIn(300, function () {});
  }
});

flatpickr("#admin-time-filter-selector", {
  enableTime: true,
  dateFormat: "Y-m-d H:i",
  time_24hr: true,
  mode: "range",
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

function get_admin_analytics_data(time_filter, filter_type) {
  fetch("process_data.php", {
    method: "POST",
    body: JSON.stringify({ request: "get_admin_analytics_data", admin_time_filter: time_filter, filter_type: filter_type }),
  })
    .then((res) => res.json())
    .then((response) => {
      let chart_data = [];
      if (response.length > 0) {
        if (response[0][0].trim() === "different_days_with_range") {
          const date_filter_array = time_filter.split(",");
          let d1 = DateTime.fromFormat(date_filter_array[0], "yyyy-MM-dd HH:mm").toFormat("yyyy-MM-dd");
          let d2 = DateTime.fromFormat(date_filter_array[1], "yyyy-MM-dd HH:mm").toFormat("yyyy-MM-dd");
          d1 = new Date(d1);
          d2 = new Date(d2);
          getDatesInRange(d1, d2).forEach((date) => {
            date = DateTime.fromFormat(date.toString().slice(0, 15), "ccc LLL dd yyyy").toFormat("dd/MM/yyyy");
            chart_data.push([0, date]);
          });
          for (let i = 0; i < response.length; i++) {
            let index = (() => chart_data.map((x) => x[1]))().indexOf(DateTime.fromFormat(response[i][2], "yyyy-MM-dd").toFormat("dd/MM/yyyy"));
            if (index > -1) {
              chart_data[index][0] = parseInt(response[i][1]);
            }
          }
          make_admin_posts_chart((() => chart_data.map((x) => x[0]))(), (() => chart_data.map((x) => x[1]))(), "Posts Per Day");
        } else if (response[0][0].trim() === "same_day_with_range") {
          for (let i = 0; i < 24; i++) {
            if (i < 10) {
              chart_data.push([0, "0" + i + ":00"]);
            } else {
              chart_data.push([0, i + ":00"]);
            }
            for (let j = 0; j < response.length; j++) {
              if (i < 10) {
                if (response[j][1] >= "0" + i + ":00:00" && response[j][1] <= "0" + i + ":59:59") {
                  chart_data[i][0]++;
                }
              } else {
                if (response[j][1] >= i + ":00:00" && response[j][1] <= i + ":59:59") {
                  chart_data[i][0]++;
                }
              }
            }
          }
          make_admin_posts_chart((() => chart_data.map((x) => x[0]))(), (() => chart_data.map((x) => x[1]))(), "Posts Per Hour");
        }
      }
    });
}

document.getElementById("admin-filter-button").addEventListener("click", function () {
  let admin_time_filter = document.forms["admin-chart-time-filter-container"]["admin-time-filter-choice"].value;
  if (admin_time_filter.search("to") > -1) {
    $("#admin-warning-time-filter-choice").fadeOut(300, function () {});
    admin_time_filter = admin_time_filter.replace(" to ", ",");
    const date_filter_array = admin_time_filter.split(",");
    let d1 = DateTime.fromFormat(date_filter_array[0], "yyyy-MM-dd HH:mm").toFormat("yyyy-MM-dd");
    let d2 = DateTime.fromFormat(date_filter_array[1], "yyyy-MM-dd HH:mm").toFormat("yyyy-MM-dd");
    d1 = DateTime.fromISO(d1);
    d2 = DateTime.fromISO(d2);
    if (d1.hasSame(d2, "day")) {
      get_admin_analytics_data(admin_time_filter, "same_day_with_range");
    } else {
      get_admin_analytics_data(admin_time_filter, "different_days_with_range");
    }
  } else if (admin_time_filter !== "") {
    $("#admin-warning-time-filter-choice").fadeIn(300, function () {});
  }
});

function make_admin_posts_chart(chart_data, labels, title) {
  if (admin_chart) {
    admin_chart.destroy();
  }
  $("#admin-chart-container").fadeIn(300, function () {});
  ctx = document.getElementById("admin-chart").getContext("2d");
  admin_chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: title,
          data: chart_data,
          backgroundColor: [],
          borderColor: "#00ffffbb",
          borderWidth: 1,
          hoverBackgroundColor: "#00ffffbb",
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      hover: { mode: null },
      plugins: {
        legend: {
          labels: {
            color: "#f3f3f3",
            boxWidth: 0,
            fontSize: 1,
          },
        },
      },
      scales: {
        y: {
          ticks: {
            color: "#f3f3f3",
            precision: 0,
          },
        },
        x: {
          ticks: {
            color: "#f3f3f3",
          },
        },
      },
    },
  });
}

function getDatesInRange(startDate, endDate) {
  const date = new Date(startDate.getTime());

  const dates = [];

  while (date <= endDate) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return dates;
}
