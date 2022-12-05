import { generate_posts, reset_poll_data, get_variables } from "./index.js";
import { clear_bell_counter } from "./update_data.js";
import { greece_regions, update_region_posts, clear_region_posts } from "../geojson/greece_regions.js";

let preferred_categories = null;
let radius_filter = null;
let post_locations = [];
let posts_ids_inside_region = null;
let posts_per_region = [
  ["East Macedonia and Thrace"],
  ["Central Macedonia"],
  ["Thessaly"],
  ["North Aegean"],
  ["South Aegean"],
  ["Central Greece"],
  ["Western Greece"],
  ["Peloponnese"],
  ["Attica"],
  ["West Macedonia"],
  ["Epirus"],
  ["Ionian Islands"],
  ["Crete"],
];
let all_regions = [
  "East Macedonia and Thrace",
  "Central Macedonia",
  "Thessaly",
  "North Aegean",
  "South Aegean",
  "Central Greece",
  "Western Greece",
  "Peloponnese",
  "Attica",
  "West Macedonia",
  "Epirus",
  "Ionian Islands",
  "Crete",
];

export function get_posts_ids_inside_region() {
  return posts_ids_inside_region;
}

//This is for hot filter functionality.
document.getElementById("hot").addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementsByClassName("post")[0]).opacity === "1") {
    if (window.getComputedStyle(document.getElementById("preferred-categories-container")).display !== "none") {
      return false;
    }
    const filter_obj = {
      search_text: null,
    };
    let filter = filter_check(filter_obj);
    if (preferred_categories !== null && preferred_categories.length === 0) {
      preferred_categories = null;
    }
    if (window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip === "text") {
      null_style("fa-fire-flame-curved");
      if (
        window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip !== "text" &&
        window.getComputedStyle(document.getElementsByClassName("fa-table-list")[0]).backgroundClip !== "text" &&
        (document.forms["search-box-container"]["search-text"].value === "" ||
          document.forms["search-box-container"]["search-text"].value === undefined) &&
        window.getComputedStyle(document.getElementsByClassName("fa-filter")[0]).backgroundClip !== "text" &&
        posts_ids_inside_region === null
      ) {
        clear_bell_counter();
      }
      $(".post").fadeOut(300, function () {});
      $(".post")
        .promise()
        .done(function () {
          $(".post").not(":first").remove();
          reset_poll_data();
          generate_posts(
            get_variables()[0],
            null,
            preferred_categories,
            filter,
            filter_obj.search_text,
            get_variables()[1],
            radius_filter,
            posts_ids_inside_region
          );
        });
    } else {
      highlight_filter("fa-fire-flame-curved");
      null_style("fa-sun");
      $(".post").fadeOut(300, function () {});
      $(".post")
        .promise()
        .done(function () {
          $(".post").not(":first").remove();
          reset_poll_data();
          generate_posts(
            get_variables()[0],
            "hot",
            preferred_categories,
            filter,
            filter_obj.search_text,
            get_variables()[1],
            radius_filter,
            posts_ids_inside_region
          );
        });
    }
  }
});

//This is for the recent filter functionality.
document.getElementById("recent").addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementsByClassName("post")[0]).opacity === "1") {
    if (
      window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip !== "text" &&
      window.getComputedStyle(document.getElementsByClassName("fa-table-list")[0]).backgroundClip !== "text" &&
      (document.forms["search-box-container"]["search-text"].value === "" ||
        document.forms["search-box-container"]["search-text"].value === undefined) &&
      window.getComputedStyle(document.getElementsByClassName("fa-filter")[0]).backgroundClip !== "text"
    ) {
      clear_bell_counter();
    }
    if (window.getComputedStyle(document.getElementById("preferred-categories-container")).display !== "none") {
      return false;
    }
    const filter_obj = {
      search_text: null,
    };
    let filter = filter_check(filter_obj);
    if (preferred_categories !== null && preferred_categories.length === 0) {
      preferred_categories = null;
    }
    if (window.getComputedStyle(document.getElementsByClassName("fa-sun")[0]).backgroundClip === "text") {
      null_style("fa-sun");
    } else {
      highlight_filter("fa-sun");
      null_style("fa-fire-flame-curved");
      $(".post").fadeOut(300, function () {});
      $(".post")
        .promise()
        .done(function () {
          $(".post").not(":first").remove();
          reset_poll_data();
          generate_posts(
            get_variables()[0],
            null,
            preferred_categories,
            filter,
            filter_obj.search_text,
            get_variables()[1],
            radius_filter,
            posts_ids_inside_region
          );
        });
    }
  }
});

document.getElementById("preferred-categories").addEventListener("click", function () {
  highlight_filter("fa-table-list");
  $("#preferred-categories-container").fadeIn(300, function () {});
});

//This is for the filter functionality.
document.getElementById("filter").addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("preferred-categories-container")).display !== "none") {
    return false;
  }
  if (window.getComputedStyle(document.getElementById("filters-outside-container")).display === "none") {
    highlight_filter("fa-filter");
    $("#filters-outside-container").fadeIn(300, function () {});
  } else {
    $("#filters-outside-container").fadeOut(300, function () {
      null_style("fa-filter");
      if (
        window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip !== "text" &&
        window.getComputedStyle(document.getElementsByClassName("fa-table-list")[0]).backgroundClip !== "text" &&
        (document.forms["search-box-container"]["search-text"].value === "" ||
          document.forms["search-box-container"]["search-text"].value === undefined) &&
        window.getComputedStyle(document.getElementsByClassName("fa-filter")[0]).backgroundClip !== "text" &&
        posts_ids_inside_region === null
      ) {
        $(".post").fadeOut(300, function () {});
        $(".post")
          .promise()
          .done(function () {
            $(".post").not(":first").remove();
            reset_poll_data();
            generate_posts(false);
          });
        clear_bell_counter();
      }
      $("#warning-time-filter-choice").fadeOut(300, function () {});
      document.forms["user-filter"]["user-filter-choice"].value = "";
      document.forms["time-filter"]["time-filter-choice"].value = "";
      document.querySelectorAll(".poll-filter").forEach((poll_filter) => {
        poll_filter.style.color = null;
        poll_filter.style.border = null;
      });
      document.querySelectorAll(".poll-status").forEach((status_filter) => {
        status_filter.style.color = null;
        status_filter.style.border = null;
      });
      radius_filter = null;
      document.querySelector("input[name=radius-filter-checkbox").checked = false;
    });
  }
});

//This is for the search filter functionality.
document.getElementById("search").addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("preferred-categories-container")).display !== "none") {
    return false;
  }
  if (window.getComputedStyle(document.getElementsByClassName("fa-magnifying-glass")[0]).backgroundClip !== "text") {
    highlight_filter("fa-magnifying-glass");
    $("#search-box-container").fadeIn(300, function () {});
  } else {
    document.forms["search-box-container"]["search-text"].value = "";
    null_style("fa-magnifying-glass");
    $("#search-box-container").fadeOut(300, function () {});
    if (
      window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip !== "text" &&
      window.getComputedStyle(document.getElementsByClassName("fa-table-list")[0]).backgroundClip !== "text" &&
      (document.forms["search-box-container"]["search-text"].value === "" ||
        document.forms["search-box-container"]["search-text"].value === undefined) &&
      window.getComputedStyle(document.getElementsByClassName("fa-filter")[0]).backgroundClip !== "text"
    ) {
      clear_bell_counter();
    }
  }
});

//This is for the search filter functionality.
document.getElementsByClassName("fa-circle-chevron-right")[0].addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("preferred-categories-container")).display !== "none") {
    return false;
  }
  const filter_obj = {
    search_text: null,
  };
  let filter = filter_check(filter_obj);
  if (preferred_categories !== null && preferred_categories.length === 0) {
    preferred_categories = null;
  }
  $(".post").fadeOut(300, function () {});
  $(".post")
    .promise()
    .done(function () {
      $(".post").not(":first").remove();
      reset_poll_data();
      if (window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip === "text") {
        generate_posts(
          get_variables()[0],
          "hot",
          preferred_categories,
          filter,
          filter_obj.search_text,
          get_variables()[1],
          radius_filter,
          posts_ids_inside_region
        );
      } else {
        generate_posts(
          get_variables()[0],
          null,
          preferred_categories,
          filter,
          filter_obj.search_text,
          get_variables()[1],
          radius_filter,
          posts_ids_inside_region
        );
      }
    });
});

export function null_style(class_name) {
  document.getElementsByClassName(class_name)[0].style.background = null;
  document.getElementsByClassName(class_name)[0].style.backgroundClip = null;
  document.getElementsByClassName(class_name)[0].style.webkitBackgroundClip = null;
  document.getElementsByClassName(class_name)[0].style.webkitTextFillColor = null;
}

export function highlight_filter(class_name) {
  document.getElementsByClassName(class_name)[0].style.background = "-webkit-linear-gradient(200deg, #cc0000, #000)";
  document.getElementsByClassName(class_name)[0].style.backgroundClip = "text";
  document.getElementsByClassName(class_name)[0].style.webkitBackgroundClip = "text";
  document.getElementsByClassName(class_name)[0].style.webkitTextFillColor = "transparent";
}

//This is for filtering inputs on radius input box when users create posts.
function setInputFilter(textbox, inputFilter, errMsg) {
  ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop", "focusout"].forEach(function (event) {
    textbox.addEventListener(event, function (e) {
      if (inputFilter(this.value)) {
        // Accepted value
        if (["keydown", "mousedown", "focusout"].indexOf(e.type) >= 0) {
          this.classList.remove("input-error");
          this.setCustomValidity("");
        }
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        // Rejected value - restore the previous one
        this.classList.add("input-error");
        this.setCustomValidity(errMsg);
        this.reportValidity();
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        // Rejected value - nothing to restore
        this.value = "";
      }
    });
  });
}

setInputFilter(
  document.getElementById("radius-number"),
  function (value) {
    return /^\d*$/.test(value); // Allow digits only, using a RegExp
  },
  "Only digits are allowed"
);

document.getElementsByClassName("nav-element")[0].addEventListener("click", function (e) {
  clear_filters();
  clear_bell_counter();
});

document.getElementsByClassName("nav-element")[3].addEventListener("click", function (e) {
  clear_filters();
});

document.getElementsByClassName("nav-element")[4].addEventListener("click", function (e) {
  clear_filters();
});

document.getElementsByClassName("nav-element")[5].addEventListener("click", function (e) {
  clear_filters();
});

document.getElementsByClassName("nav-element")[6].addEventListener("click", function (e) {
  clear_filters();
});

document.getElementById("add-post-icon").addEventListener("click", function (e) {
  clear_filters();
});

//This is for preferred categories filter functionality.
document.getElementById("categories-container").addEventListener(
  "click",
  (e) => {
    if (
      e.target.id !== "category-button" &&
      e.target.id !== "categories-container" &&
      e.target.id !== "category-box" &&
      String(e.target.closest(".category").className) === "category"
    ) {
      let target_category_icon = e.target.closest(".category").getElementsByTagName("i")[0].classList[1];
      if (window.getComputedStyle(document.getElementsByClassName(target_category_icon)[0]).backgroundClip !== "text") {
        highlight_filter(target_category_icon);
      } else if (window.getComputedStyle(document.getElementsByClassName(target_category_icon)[0]).backgroundClip === "text") {
        null_style(target_category_icon);
      }
    }
  },
  { passive: true }
);

//This is for preferred categories filter functionality.
document.getElementById("category-button").addEventListener("click", function () {
  const filter_obj = {
    search_text: null,
  };
  let filter = filter_check(filter_obj);
  let categories_counter = 0;
  if (preferred_categories === null || preferred_categories.length > 0) {
    preferred_categories = [];
    preferred_categories.length = 0;
  }
  $("#preferred-categories-container").fadeOut(300, function () {
    document.querySelectorAll(".category").forEach((category) => {
      let target_category_icon = category.getElementsByTagName("i")[0].classList[1];
      if (window.getComputedStyle(document.getElementsByClassName(target_category_icon)[0]).backgroundClip === "text") {
        preferred_categories.push(category.innerText.toLowerCase());
        categories_counter++;
      }
    });
    if (categories_counter === 0) {
      preferred_categories = null;
      null_style("fa-table-list");
      if (
        window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip !== "text" &&
        window.getComputedStyle(document.getElementsByClassName("fa-table-list")[0]).backgroundClip !== "text" &&
        (document.forms["search-box-container"]["search-text"].value === "" ||
          document.forms["search-box-container"]["search-text"].value === undefined) &&
        window.getComputedStyle(document.getElementsByClassName("fa-filter")[0]).backgroundClip !== "text" &&
        posts_ids_inside_region === null
      ) {
        clear_bell_counter();
      }
    }
    $(".post").fadeOut(300, function () {});
    $(".post")
      .promise()
      .done(function () {
        $(".post").not(":first").remove();
        reset_poll_data();
        if (window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip === "text") {
          generate_posts(
            get_variables()[0],
            "hot",
            preferred_categories,
            filter,
            filter_obj.search_text,
            get_variables()[1],
            radius_filter,
            posts_ids_inside_region
          );
        } else {
          generate_posts(
            get_variables()[0],
            null,
            preferred_categories,
            filter,
            filter_obj.search_text,
            get_variables()[1],
            radius_filter,
            posts_ids_inside_region
          );
        }
      });
  });
});

document.getElementById("poll-filters").addEventListener(
  "click",
  (e) => {
    if (e.target.id !== "poll-filters" && e.target.className === "poll-filter") {
      if (window.getComputedStyle(document.getElementsByClassName("poll-filter")[e.target.name - 1]).color === "rgb(204, 0, 0)") {
        document.getElementsByClassName("poll-filter")[e.target.name - 1].style.border = null;
        document.getElementsByClassName("poll-filter")[e.target.name - 1].style.color = null;
      } else {
        document.getElementsByClassName("poll-filter")[e.target.name - 1].style.border = "0.1em solid #cc0000";
        document.getElementsByClassName("poll-filter")[e.target.name - 1].style.color = "#cc0000";
      }
    }
  },
  { passive: true }
);

document.getElementById("poll-status-filter").addEventListener(
  "click",
  (e) => {
    if (e.target.id !== "poll-status-filter" && e.target.className === "poll-status") {
      if (window.getComputedStyle(document.getElementsByClassName("poll-status")[e.target.name - 1]).color === "rgb(204, 0, 0)") {
        document.getElementsByClassName("poll-status")[e.target.name - 1].style.border = null;
        document.getElementsByClassName("poll-status")[e.target.name - 1].style.color = null;
      } else {
        document.getElementsByClassName("poll-status")[e.target.name - 1].style.border = "0.1em solid #cc0000";
        document.getElementsByClassName("poll-status")[e.target.name - 1].style.color = "#cc0000";
      }
      if (e.target.name - 1 == 0) {
        document.getElementsByClassName("poll-status")[1].style.border = null;
        document.getElementsByClassName("poll-status")[1].style.color = null;
      } else if (e.target.name - 1 == 1) {
        document.getElementsByClassName("poll-status")[0].style.border = null;
        document.getElementsByClassName("poll-status")[0].style.color = null;
      }
    }
  },
  { passive: true }
);

//This clears all poll filters.
export function clear_filters() {
  $("#search-box-container").fadeOut(300, function () {});
  $("#admin-warning-time-filter-choice").fadeOut(300, function () {});
  $("#admin-chart-container").fadeOut(300, function () {});
  $("#preferred-categories-container").fadeOut(300, function () {
    document.querySelectorAll(".category").forEach((category) => {
      null_style(category.getElementsByTagName("i")[0].classList[1]);
    });
  });
  $("#filters-outside-container").fadeOut(300, function () {
    document.forms["user-filter"]["user-filter-choice"].value = "";
    document.forms["time-filter"]["time-filter-choice"].value = "";
    document.querySelectorAll(".poll-filter").forEach((poll_filter) => {
      poll_filter.style.color = null;
      poll_filter.style.border = null;
    });
    document.querySelectorAll(".poll-status").forEach((status_filter) => {
      status_filter.style.color = null;
      status_filter.style.border = null;
    });
    radius_filter = null;
    document.querySelector("input[name=radius-filter-checkbox").checked = false;
  });
  $("#warning-time-filter-choice").fadeOut(300, function () {});
  if (preferred_categories !== null) {
    preferred_categories.length = 0;
  }
  document.forms["search-box-container"]["search-text"].value = "";
  if (window.getComputedStyle(document.getElementById("post-locations-container")).display !== "none") {
    $("#post-locations-container").fadeOut(300, function () {
      clear_map(app_analytics_map, layerControl, all_geojson, app_analytics_all_markers);
      null_style("fa-map-location-dot");
    });
  }
  post_locations.length = 0;
  if (posts_ids_inside_region !== null) {
    posts_ids_inside_region = null;
  }
  posts_per_region.length = 0;
  posts_per_region = [
    ["East Macedonia and Thrace"],
    ["Central Macedonia"],
    ["Thessaly"],
    ["North Aegean"],
    ["South Aegean"],
    ["Central Greece"],
    ["Western Greece"],
    ["Peloponnese"],
    ["Attica"],
    ["West Macedonia"],
    ["Epirus"],
    ["Ionian Islands"],
    ["Crete"],
  ];
}

//This is for filter functionality.
document.getElementById("filter-button").addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementsByClassName("post")[0]).opacity === "1") {
    if (window.getComputedStyle(document.getElementById("preferred-categories-container")).display !== "none") {
      return false;
    }
    let search_text = document.forms["search-box-container"]["search-text"].value;
    if (search_text.replace(/\s/g, "") === "") {
      search_text = null;
    }
    let filter = filter_query();
    if (preferred_categories !== null && preferred_categories.length === 0) {
      preferred_categories = null;
    }
    $(".post").fadeOut(300, function () {});
    $(".post")
      .promise()
      .done(function () {
        $(".post").not(":first").remove();
        reset_poll_data();
        if (window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip === "text") {
          generate_posts(
            get_variables()[0],
            "hot",
            preferred_categories,
            filter,
            search_text,
            get_variables()[1],
            radius_filter,
            posts_ids_inside_region
          );
        } else {
          generate_posts(
            get_variables()[0],
            null,
            preferred_categories,
            filter,
            search_text,
            get_variables()[1],
            radius_filter,
            posts_ids_inside_region
          );
        }
      });
  }
});

flatpickr("#time-filter-selector", {
  enableTime: true,
  dateFormat: "Y-m-d H:i",
  time_24hr: true,
  mode: "range",
});

//This is for search filter functionality.
function filter_check(obj) {
  obj.search_text = document.forms["search-box-container"]["search-text"].value;
  if (obj.search_text.replace(/\s/g, "") === "") {
    obj.search_text = null;
  }
  return filter_query();
}

//This is for filter functionality.
function filter_query() {
  let filter = document.forms["time-filter"]["time-filter-choice"].value;
  let user_filter = document.forms["user-filter"]["user-filter-choice"].value;
  let poll_filter_counter = 0;
  let poll_filter = [];
  let poll_status = null;
  if (user_filter.replace(/\s/g, "") === "") {
    user_filter = null;
  }
  if (filter.search("to") > -1) {
    $("#warning-time-filter-choice").fadeOut(300, function () {});
    filter = filter.replace(" to ", ",");
  } else if (filter !== "") {
    filter = null;
    $("#warning-time-filter-choice").fadeIn(300, function () {});
  } else {
    filter = null;
  }

  document.querySelectorAll(".poll-filter").forEach((poll_filter_type) => {
    if (window.getComputedStyle(poll_filter_type).color === "rgb(204, 0, 0)") {
      poll_filter.push(poll_filter_type.name);
      poll_filter_counter++;
    }
  });
  if (poll_filter_counter === 0) {
    poll_filter = null;
  }

  document.querySelectorAll(".poll-status").forEach((poll_status_type) => {
    if (window.getComputedStyle(poll_status_type).color === "rgb(204, 0, 0)") {
      if (poll_status_type.name === "1") {
        poll_status = 1;
      } else if (poll_status_type.name === "2") {
        poll_status = 2;
      }
    }
  });
  return [filter, poll_filter, user_filter, poll_status];
}

document.querySelector("#time-filter-selector").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("filter-button").click();
  }
});

document.querySelector("#user-filter-select").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("filter-button").click();
  }
});

document.querySelector("input[name=radius-filter-checkbox").addEventListener("change", function () {
  if (this.checked) {
    radius_filter = get_variables()[4];
  } else {
    radius_filter = null;
  }
});

document.getElementsByClassName("filter-instruction")[4].addEventListener("mouseover", function () {
  document.getElementById("radius-filter-info").style.display = "block";
});

document.getElementsByClassName("filter-instruction")[4].addEventListener("mouseout", function () {
  document.getElementById("radius-filter-info").style.display = "none";
});

var app_analytics_map = L.map("post-locations-map").setView([38.5, 25.5], 6);
let app_analytics_marker = [];
let app_analytics_all_markers = L.layerGroup();

var base_of_map = L.tileLayer("https://{s}.tile.osm.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(app_analytics_map);

var geojson_layer = L.geoJson(greece_regions, { style: style });

export function getColor(d) {
  return d > 100
    ? "#800026"
    : d > 50
    ? "#BD0026"
    : d > 20
    ? "#E31A1C"
    : d > 10
    ? "#FC4E2A"
    : d > 5
    ? "#FD8D3C"
    : d > 2
    ? "#FEB24C"
    : d > 1
    ? "#FED976"
    : "#FFEDA0";
}

export function style(feature) {
  return {
    fillColor: getColor(feature.properties.number_of_posts),
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
  };
}

function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 5,
    color: "#666",
    dashArray: "",
    fillOpacity: 0.7,
  });

  layer.bringToFront();
  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}

var geojson;
// ... our listeners
geojson = L.geoJson(greece_regions);

function zoomToFeature(e) {
  app_analytics_map.fitBounds(e.target.getBounds());
  let index = all_regions.indexOf(e.sourceTarget.feature.properties.name);
  if (posts_ids_inside_region === null || posts_ids_inside_region.length > 0) {
    posts_ids_inside_region = [];
    posts_ids_inside_region.length = 0;
  }
  for (let i = 1; i < posts_per_region[index].length; i++) {
    posts_ids_inside_region.push(posts_per_region[index][i]);
  }
  const filter_obj = {
    search_text: null,
  };
  let filter = filter_check(filter_obj);
  if (preferred_categories !== null && preferred_categories.length === 0) {
    preferred_categories = null;
  }
  $(".post").fadeOut(300, function () {});
  $(".post")
    .promise()
    .done(function () {
      $(".post").not(":first").remove();
      reset_poll_data();
      if (window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip === "text") {
        generate_posts(
          get_variables()[0],
          "hot",
          preferred_categories,
          filter,
          filter_obj.search_text,
          get_variables()[1],
          radius_filter,
          posts_ids_inside_region
        );
      } else {
        generate_posts(
          get_variables()[0],
          null,
          preferred_categories,
          filter,
          filter_obj.search_text,
          get_variables()[1],
          radius_filter,
          posts_ids_inside_region
        );
      }
    });
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
  });
}

geojson = L.geoJson(greece_regions, {
  style: style,
  onEachFeature: onEachFeature,
});

var info = L.control.layers();

info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
  this._div.innerHTML =
    "<h4>Posts Number</h4>" + (props ? "<b>" + props.name + "</b><br />" + props.number_of_posts + " posts" : "Hover over a region");
};

info.addTo(app_analytics_map);

var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
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

legend.addTo(app_analytics_map);

var all_geojson;
var overlayMaps = {};
var layerControl;

//This function creates the map for location/responses analytics
function make_app_analytics_map(post_ids) {
  post_locations.length = 0;
  posts_per_region.length = 0;
  posts_per_region = [
    ["East Macedonia and Thrace"],
    ["Central Macedonia"],
    ["Thessaly"],
    ["North Aegean"],
    ["South Aegean"],
    ["Central Greece"],
    ["Western Greece"],
    ["Peloponnese"],
    ["Attica"],
    ["West Macedonia"],
    ["Epirus"],
    ["Ionian Islands"],
    ["Crete"],
  ];
  fetch("process_data.php", {
    method: "POST",
    body: JSON.stringify({
      request: "posts_per_location_data",
      post_ids: post_ids,
    }),
  })
    .then((res) => res.json())
    .then((response) => {
      post_locations = response;
    });
  fetch("process_data.php", {
    method: "POST",
    body: JSON.stringify({
      request: "location_responses_data",
      post_ids: post_ids,
    }),
  })
    .then((res) => res.json())
    .then((response) => {
      all_geojson = L.layerGroup([geojson, geojson_layer]);
      for (let i = 0; i < response.length; i++) {
        app_analytics_marker[i] = L.marker([response[i][0], response[i][1]]).bindTooltip(
          "User Posts:" + response[i][2] + " | User Responses:" + response[i][3]
        );
        app_analytics_all_markers.addLayer(app_analytics_marker[i]);
        var geo_out = greece_regions.features.filter(function (d) {
          return d3.geoContains(d, [response[i][1], response[i][0]]);
        });
        for (let j = 0; j < post_locations.length; j++) {
          if (post_locations[j][1] === response[i][0] && post_locations[j][2] === response[i][1]) {
            let index = all_regions.indexOf(geo_out[0].properties.name);
            posts_per_region[index].push(post_locations[j][0]);
          }
        }
        update_region_posts(geo_out[0], parseInt(response[i][2]));
      }
      resetHighlight(geojson_layer);
      layerControl = L.control.layers(null, overlayMaps).addTo(app_analytics_map);
      layerControl.addOverlay(all_geojson, "Choropleth");
      layerControl.addOverlay(app_analytics_all_markers, "Markers");
    });
}

//This function clears map layers.
export function clear_map(map_name, layer_control, geogjson, markers) {
  if (layer_control !== undefined) {
    map_name.removeControl(layer_control);
    map_name.removeLayer(geogjson);
    for (let i = 0; i < app_analytics_marker.length; i++) {
      markers.removeLayer(app_analytics_marker[i]);
    }
    clear_region_posts();
  }
}

//This is for Post Locations map functionality.
document.getElementById("post-locations-filter").addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("post-locations-container")).display !== "none") {
    $("#post-locations-container").fadeOut(300, function () {
      clear_map(app_analytics_map, layerControl, all_geojson, app_analytics_all_markers);
      null_style("fa-map-location-dot");
    });
  } else {
    if (get_variables()[3]) {
      let post_ids_data = [];
      (() => get_variables()[3].map((x) => post_ids_data.push(x[0])))();
      highlight_filter("fa-map-location-dot");
      $("#post-locations-container").fadeIn(300, function () {
        app_analytics_map.invalidateSize();
        make_app_analytics_map(post_ids_data);
      });
    } else {
      $("#notification-container").fadeIn(300, function () {});
      document.getElementById("notification-text").innerText = "There are no posts to check their post locations";
    }
  }
});

//This is for Post Locations map functionality.
document.getElementsByClassName("close-map")[0].addEventListener("click", function () {
  $("#post-locations-container").fadeOut(300, function () {
    clear_map(app_analytics_map, layerControl, all_geojson, app_analytics_all_markers);
    null_style("fa-map-location-dot");
  });
});

//This is for dragging post locations map
dragElementTouch(document.getElementById("post-locations-container"));
dragElementMouse(document.getElementById("post-locations-container"));

function dragElementTouch(elmnt) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  document.getElementById(elmnt.id + "-header").addEventListener("touchstart", function (e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onpointerup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onpointermove = elementDrag;
  });

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = 2 * (pos3 - e.clientX);
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) / 16 + "em";
    elmnt.style.left = (elmnt.offsetLeft - pos1) / 16 + "em";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onpointerup = null;
    document.onpointermove = null;
  }
}

function dragElementMouse(elmnt) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  document.getElementById(elmnt.id + "-header").addEventListener("mousedown", function (e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onpointerup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onpointermove = elementDrag;
  });

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = 2 * (pos3 - e.clientX);
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) / 16 + "em";
    elmnt.style.left = (elmnt.offsetLeft - pos1) / 16 + "em";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onpointerup = null;
    document.onpointermove = null;
  }
}
