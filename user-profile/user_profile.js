"use strict";

//To set active button.
const room = document.querySelector(".side_nav");
const btns = document.querySelectorAll(".nav_btn");

room.addEventListener("click", (e) => {
  btns.forEach((btn) => {
    if (btn.getAttribute("id") === e.target.getAttribute("id")) btn.classList.add("active");
    else btn.classList.remove("active");
  });
});

function set_coordinates() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "map.php",
      success: function (res) {
        let data_from_server = JSON.parse(res);
        for (let i = 0; i < data_from_server.length; i++) {
          data_from_server[i].lat = parseFloat(data_from_server[i].lat);
          data_from_server[i].lng = parseFloat(data_from_server[i].lng);
          data_from_server[i].count = parseInt(data_from_server[i].count);
        }
        resolve(data_from_server);
      },
    });
  });
}

function showResetUsername() {
  let su = document.getElementById("ResetUsername");
  let sp = document.getElementById("ResetPassword");
  let st = document.getElementById("ShowStatistics");
  let sm = document.getElementById("map");
  su.style.display = "block";
  sp.style.display = "none";
  st.style.display = "none";
  sm.style.display = "none";
}

function showResetPassword() {
  let su = document.getElementById("ResetUsername");
  let sp = document.getElementById("ResetPassword");
  let st = document.getElementById("ShowStatistics");
  let sm = document.getElementById("map");
  su.style.display = "none";
  sp.style.display = "block";
  st.style.display = "none";
  sm.style.display = "none";
}

function showStatistics() {
  let su = document.getElementById("ResetUsername");
  let sp = document.getElementById("ResetPassword");
  let st = document.getElementById("ShowStatistics");
  let sm = document.getElementById("map");
  su.style.display = "none";
  sp.style.display = "none";
  st.style.display = "block";
  sm.style.display = "none";
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const [last_upload, total_entries] = this.responseText.split("+");
      document.getElementById("last_upload").innerHTML = last_upload;
      document.getElementById("total_entries").innerHTML = total_entries;
    }
  };
  xhttp.open("POST", "statistics.php?q=", true);
  xhttp.send();
}

function showMap() {
  let su = document.getElementById("ResetUsername");
  let sp = document.getElementById("ResetPassword");
  let st = document.getElementById("ShowStatistics");
  let sm = document.getElementById("map");
  su.style.display = "none";
  sp.style.display = "none";
  st.style.display = "none";
  sm.style.display = "block";
  sm.style.visibility = "visible";
}

function username_check() {
  let x = document.forms["u-form"]["new_username"].value;
  if (x === "") {
    document.getElementById("username-help-block").innerHTML = "Username must be filled!";
    return false;
  } else if (x.length < 6 || x.length > 16) {
    document.getElementById("username-help-block").innerHTML = "Username must be between 6 and 16 characters!";
    return false;
  } else if (x.indexOf(" ") > 0) {
    document.getElementById("username-help-block").innerHTML = "Username must not have spaces!";
    return false;
  } else {
    document.getElementById("new-username").submit();
    return true;
  }
}

function password_check() {
  let new_pass = document.forms["pass-form"]["new_password"].value;
  let conf_pass = document.forms["pass-form"]["confirm_password"].value;
  if (new_pass === "" || conf_pass === "") {
    document.getElementById("password-help-block").innerHTML = "One of the password fields is empty!";
    return false;
  } else if (new_pass !== conf_pass) {
    document.getElementById("password-help-block").innerHTML = "Passwords must match!";
    return false;
  } else if (new_pass.length < 8) {
    document.getElementById("password-help-block").innerHTML = "Password must be at least 8 characters!";
    return false;
  } else if (new_pass.indexOf(" ") > 0) {
    document.getElementById("password-help-block").innerHTML = "Password must not have spaces!";
    return false;
  } else if (!/[A-Z]/g.test(new_pass) || !/[0-9]/g.test(new_pass) || !/[.!@#$&*]/g.test(new_pass)) {
    document.getElementById("password-help-block").innerHTML =
      "Password must contain at least 8 character and must also contain, at least one capital letter, a digit and one of these symbols (e.g. .!#$*&@)!";
    return false;
  } else {
    document.getElementById("new-password").submit();
    return true;
  }
}
// Creating map options
async function make_map() {
  let coordinates = [2];
  let max_count;
  let map_data = await set_coordinates();
  for (let i = 0; i < map_data.length; i++) {
    if (i === 0) {
      max_count = map_data[i].count;
      coordinates[0] = map_data[i].lat;
      coordinates[1] = map_data[i].lng;
    } else if (i > 0 && map_data[i].count > max_count) {
      max_count = map_data[i].count;
      coordinates[0] = map_data[i].lat;
      coordinates[1] = map_data[i].lng;
    }
  }
  // Creating a map object
  var map = new L.map("map", {
    center: [coordinates[0], coordinates[1]],
    zoom: 10,
  });

  // Creating a Layer object
  var layer = new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");

  // Adding layer to the map
  map.addLayer(layer);

  let testData = {
    max: max_count,
    data: map_data,
  };
  let cfg = {
    radius: 40,
    maxOpacity: 0.8,
    scaleRadius: false,
    useLocalExtrema: false,
    latField: "lat",
    lngField: "lng",
    valueField: "count",
  };
  let heatmapLayer = new HeatmapOverlay(cfg);
  map.addLayer(heatmapLayer);
  heatmapLayer.setData(testData);
}

make_map();

$.ajax({
  type: "POST",
  url: "../users-info/collect_data.php",
  data: {
    request: "request_role",
  },
  success: function (res) {
    let adon = document.getElementById("admin-only");
    if (res.trim() === "admin") {
      var theme = document.getElementsByTagName("link")[2];
      // Change the value of href attribute
      // to change the css sheet.
      if (theme.getAttribute("href") === "../user.css") {
        theme.setAttribute("href", "../admin.css");
      } else {
        theme.setAttribute("href", "../user.css");
      }
    }
  },
});

setTimeout(function () {
  let nor = document.getElementById("loader");
  nor.style.display = "none";
  var x = document.getElementById("content");
  x.style.visibility = "visible";
}, 1400);

(function () {
  var c = document.getElementById("sum_us");
  function addAnim() {
    c.classList.add("animated");
    // remove the listener, no longer needed
    c.removeEventListener("mouseover", addAnim);
  }

  // listen to mouseover for the container
  c.addEventListener("mouseover", addAnim);
})();

(function () {
  var c = document.getElementById("sum_pass");
  function addAnim() {
    c.classList.add("animated");
    // remove the listener, no longer needed
    c.removeEventListener("mouseover", addAnim);
  }

  // listen to mouseover for the container
  c.addEventListener("mouseover", addAnim);
})();
