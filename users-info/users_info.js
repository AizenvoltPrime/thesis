"use strict";

//To set active button.
const room = document.querySelector(".side_nav");
const btns = document.querySelectorAll(".nav_btn");
let select_status;
let select_content;
let select_filter = [];
let options_status = [];
let options_content = [];
let options_filter = [];
let opt_status;
let opt_content;
let opt_filter = [];
let el_status = [];
let el_content = [];
let el_filter = [[], [], [], [], [], [], [], [], []];
let hasChild_status = false;
let hasChild_content = false;
let color_array = [];

var ctx = document.getElementById("rtaChart").getContext("2d");
var rtaChart;

var hac = document.getElementById("haChart").getContext("2d");
var haChart;

let chosen_ct_filters = [];
let chosen_dotw_filters = [];
let chosen_http_filters = [];
let chosen_isp_filters = [];
let chosen_ttl_ct_filters = [];
let chosen_ha_isp_filters = [];
let chosen_msmf_ct_filters = [];
let chosen_msmf_isp_filters = [];
let chosen_cd_ct_filters = [];
let chosen_cd_isp_filters = [];

palette("tol-sq", 12).map(function (hex) {
  color_array.push("#" + hex);
});
palette("tol", 12).map(function (hex) {
  color_array.push("#" + hex);
});

//This is for active css color for Side Menu
room.addEventListener("click", (e) => {
  btns.forEach((btn) => {
    if (btn.getAttribute("id") === e.target.getAttribute("id")) btn.classList.add("active");
    else btn.classList.remove("active");
  });
});

//Setting starting map coordinates
function set_coordinates() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "collect_data.php",
      data: {
        request: "request_server_ips",
      },
      success: function (res) {
        let data_from_server = JSON.parse(res);
        for (let i = 0; i < data_from_server.length; i++) {
          data_from_server[i][0] = parseFloat(data_from_server[i][0]);
          data_from_server[i][1] = parseFloat(data_from_server[i][1]);
          data_from_server[i][2] = parseFloat(data_from_server[i][2]);
          data_from_server[i][3] = parseFloat(data_from_server[i][3]);
          data_from_server[i][4] = parseInt(data_from_server[i][4]);
        }
        resolve(data_from_server);
      },
    });
  });
}

//This function runs when Number of Users is selected from Side Menu
function NumberOfUsers() {
  if (document.getElementById("NumberOfUsers").style.display !== "block") {
    if (hasChild_status === true) {
      for (let i = 0; i < options_status.length; i++) {
        select_status.removeChild(el_status[i]);
      }
      hasChild_status = false;
    }
    if (hasChild_content === true) {
      for (let i = 0; i < options_content.length; i++) {
        select_content.removeChild(el_content[i]);
      }
      hasChild_content = false;
    }
    let nou = document.getElementById("NumberOfUsers");
    let rms = document.getElementById("RequestMethodStatistics");
    let rss = document.getElementById("ResponseStatusStatistics");
    let ud = document.getElementById("UniqueDomains");
    let isp = document.getElementById("ISPs");
    let aoc = document.getElementById("AverageAgeOfContent");
    let rta = document.getElementById("ResponseTimeAnalysis");
    let hha = document.getElementById("HeaderAnalysis");
    let sm = document.getElementById("map");
    nou.style.display = "block";
    rms.style.display = "none";
    rss.style.display = "none";
    ud.style.display = "none";
    isp.style.display = "none";
    aoc.style.display = "none";
    rta.style.display = "none";
    hha.style.display = "none";
    sm.style.display = "none";
    $.ajax({
      type: "POST",
      url: "collect_data.php",
      data: {
        request: "number_of_users",
      },
      success: function (res) {
        document.getElementById("number_of_users").innerHTML = res;
      },
    });
  }
}

//This function runs when Request Method Statistics is selected from Side Menu
function RequestMethodStatistics() {
  if (document.getElementById("RequestMethodStatistics").style.display !== "block") {
    if (hasChild_status === true) {
      for (let i = 0; i < options_status.length; i++) {
        select_status.removeChild(el_status[i]);
      }
      hasChild_status = false;
    }
    if (hasChild_content === true) {
      for (let i = 0; i < options_content.length; i++) {
        select_content.removeChild(el_content[i]);
      }
      hasChild_content = false;
    }
    let nou = document.getElementById("NumberOfUsers");
    let rms = document.getElementById("RequestMethodStatistics");
    let rss = document.getElementById("ResponseStatusStatistics");
    let ud = document.getElementById("UniqueDomains");
    let isp = document.getElementById("ISPs");
    let aoc = document.getElementById("AverageAgeOfContent");
    let rta = document.getElementById("ResponseTimeAnalysis");
    let hha = document.getElementById("HeaderAnalysis");
    let sm = document.getElementById("map");
    nou.style.display = "none";
    rms.style.display = "block";
    rss.style.display = "none";
    ud.style.display = "none";
    isp.style.display = "none";
    aoc.style.display = "none";
    rta.style.display = "none";
    hha.style.display = "none";
    sm.style.display = "none";

    $.ajax({
      type: "POST",
      url: "collect_data.php",
      data: {
        request: "request_method_statistics",
      },
      success: function (res) {
        const [nop, nog, noh, nopu, nod, noc, noo, notr] = res.split("+");
        document.getElementById("nop").innerHTML = nop;
        document.getElementById("nog").innerHTML = nog;
        document.getElementById("noh").innerHTML = noh;
        document.getElementById("nopu").innerHTML = nopu;
        document.getElementById("nod").innerHTML = nod;
        document.getElementById("noc").innerHTML = noc;
        document.getElementById("noo").innerHTML = noo;
        document.getElementById("notr").innerHTML = notr;
      },
    });
  }
}

//This function runs when Response Status Statistics is selected from Side Menu
function ResponseStatusStatistics() {
  if (document.getElementById("ResponseStatusStatistics").style.display !== "block") {
    if (hasChild_content === true) {
      for (let i = 0; i < options_content.length; i++) {
        select_content.removeChild(el_content[i]);
      }
      hasChild_content = false;
    }
    document.getElementById("occur").innerHTML = "-";
    let nou = document.getElementById("NumberOfUsers");
    let rms = document.getElementById("RequestMethodStatistics");
    let rss = document.getElementById("ResponseStatusStatistics");
    let ud = document.getElementById("UniqueDomains");
    let isp = document.getElementById("ISPs");
    let aoc = document.getElementById("AverageAgeOfContent");
    let rta = document.getElementById("ResponseTimeAnalysis");
    let hha = document.getElementById("HeaderAnalysis");
    let sm = document.getElementById("map");
    nou.style.display = "none";
    rms.style.display = "none";
    rss.style.display = "block";
    ud.style.display = "none";
    isp.style.display = "none";
    aoc.style.display = "none";
    rta.style.display = "none";
    hha.style.display = "none";
    sm.style.display = "none";

    select_status = document.getElementById("selectStatus");

    $.ajax({
      type: "POST",
      url: "collect_data.php",
      data: {
        request: "request_number_of_response_statuses",
        request_type: "element",
      },
      success: function (res) {
        options_status = JSON.parse(res);
        for (let i = 0; i < options_status.length; i++) {
          opt_status = options_status[i];
          el_status[i] = document.createElement("option");
          el_status[i].textContent = opt_status;
          el_status[i].value = opt_status;
          select_status.appendChild(el_status[i]);
        }
        hasChild_status = true;
      },
    });
  }
}

//This is for the drop down menu on Response Status Statistics
const selectElementStatus = document.querySelector("#selectStatus");

selectElementStatus.addEventListener("change", (event) => {
  if (event.target.value === "Choose Response Status") {
    document.getElementById("occur").innerHTML = "-";
  } else {
    $.ajax({
      type: "POST",
      url: "collect_data.php",
      data: {
        request: "request_number_of_response_statuses",
        request_type: "value",
        value_name: event.target.value,
      },
      success: function (res) {
        document.getElementById("occur").innerHTML = res;
      },
    });
  }
});

//This function runs when Unique Domains is selected from Side Menu
function UniqueDomains() {
  if (document.getElementById("UniqueDomains").style.display !== "block") {
    if (hasChild_status === true) {
      for (let i = 0; i < options_status.length; i++) {
        select_status.removeChild(el_status[i]);
      }
      hasChild_status = false;
    }
    if (hasChild_content === true) {
      for (let i = 0; i < options_content.length; i++) {
        select_content.removeChild(el_content[i]);
      }
      hasChild_content = false;
    }
    let nou = document.getElementById("NumberOfUsers");
    let rms = document.getElementById("RequestMethodStatistics");
    let rss = document.getElementById("ResponseStatusStatistics");
    let ud = document.getElementById("UniqueDomains");
    let isp = document.getElementById("ISPs");
    let aoc = document.getElementById("AverageAgeOfContent");
    let rta = document.getElementById("ResponseTimeAnalysis");
    let hha = document.getElementById("HeaderAnalysis");
    let sm = document.getElementById("map");
    nou.style.display = "none";
    rms.style.display = "none";
    rss.style.display = "none";
    ud.style.display = "block";
    isp.style.display = "none";
    aoc.style.display = "none";
    rta.style.display = "none";
    hha.style.display = "none";
    sm.style.display = "none";

    $.ajax({
      type: "POST",
      url: "collect_data.php",
      data: {
        request: "request_number_of_unique_domains",
      },
      success: function (res) {
        document.getElementById("noud").innerHTML = res;
      },
    });
  }
}

//This function runs when ISPs is selected from Side Menu
function ISPs() {
  if (document.getElementById("ISPs").style.display !== "block") {
    if (hasChild_status === true) {
      for (let i = 0; i < options_status.length; i++) {
        select_status.removeChild(el_status[i]);
      }
      hasChild_status = false;
    }
    if (hasChild_content === true) {
      for (let i = 0; i < options_content.length; i++) {
        select_content.removeChild(el_content[i]);
      }
      hasChild_content = false;
    }
    let nou = document.getElementById("NumberOfUsers");
    let rms = document.getElementById("RequestMethodStatistics");
    let rss = document.getElementById("ResponseStatusStatistics");
    let ud = document.getElementById("UniqueDomains");
    let isp = document.getElementById("ISPs");
    let aoc = document.getElementById("AverageAgeOfContent");
    let rta = document.getElementById("ResponseTimeAnalysis");
    let hha = document.getElementById("HeaderAnalysis");
    let sm = document.getElementById("map");
    nou.style.display = "none";
    rms.style.display = "none";
    rss.style.display = "none";
    ud.style.display = "none";
    isp.style.display = "block";
    aoc.style.display = "none";
    rta.style.display = "none";
    hha.style.display = "none";
    sm.style.display = "none";

    $.ajax({
      type: "POST",
      url: "collect_data.php",
      data: {
        request: "request_number_of_unique_isps",
      },
      success: function (res) {
        document.getElementById("noisp").innerHTML = res;
      },
    });
  }
}

//This function runs when Average Age Of Content is selected from Side Menu
function AverageAgeOfContent() {
  if (document.getElementById("AverageAgeOfContent").style.display !== "block") {
    if (hasChild_status === true) {
      for (let i = 0; i < options_status.length; i++) {
        select_status.removeChild(el_status[i]);
      }
      hasChild_status = false;
    }
    document.getElementById("aaoc").innerHTML = "-";
    let nou = document.getElementById("NumberOfUsers");
    let rms = document.getElementById("RequestMethodStatistics");
    let rss = document.getElementById("ResponseStatusStatistics");
    let ud = document.getElementById("UniqueDomains");
    let isp = document.getElementById("ISPs");
    let aoc = document.getElementById("AverageAgeOfContent");
    let rta = document.getElementById("ResponseTimeAnalysis");
    let hha = document.getElementById("HeaderAnalysis");
    let sm = document.getElementById("map");
    nou.style.display = "none";
    rms.style.display = "none";
    rss.style.display = "none";
    ud.style.display = "none";
    isp.style.display = "none";
    aoc.style.display = "block";
    rta.style.display = "none";
    hha.style.display = "none";
    sm.style.display = "none";

    select_content = document.getElementById("selectContentType");

    $.ajax({
      type: "POST",
      url: "collect_data.php",
      data: {
        request: "request_content_type_info",
        request_type: "content_type",
      },
      success: function (res) {
        options_content = JSON.parse(res);
        for (let i = 0; i < options_content.length; i++) {
          opt_content = options_content[i];
          el_content[i] = document.createElement("option");
          el_content[i].textContent = opt_content;
          el_content[i].value = opt_content;
          select_content.appendChild(el_content[i]);
        }
        hasChild_content = true;
      },
    });
  }
}

//This is for the drop down menu on Average Age of Content
const selectElementContent = document.querySelector("#selectContentType");

selectElementContent.addEventListener("change", (event) => {
  if (event.target.value === "Choose Content-Type") {
    document.getElementById("aaoc").innerHTML = "-";
  } else {
    $.ajax({
      type: "POST",
      url: "collect_data.php",
      data: {
        request: "request_content_type_info",
        request_type: "average_age",
        value_name_content: event.target.value,
      },
      success: function (res) {
        document.getElementById("aaoc").innerHTML = res;
      },
    });
  }
});

function ResponseTimeAnalysis() {
  if (document.getElementById("ResponseTimeAnalysis").style.display !== "block") {
    if (hasChild_status === true) {
      for (let i = 0; i < options_status.length; i++) {
        select_status.removeChild(el_status[i]);
      }
      hasChild_status = false;
    }
    if (hasChild_content === true) {
      for (let i = 0; i < options_content.length; i++) {
        select_content.removeChild(el_content[i]);
      }
      hasChild_content = false;
    }
    let nou = document.getElementById("NumberOfUsers");
    let rms = document.getElementById("RequestMethodStatistics");
    let rss = document.getElementById("ResponseStatusStatistics");
    let ud = document.getElementById("UniqueDomains");
    let isp = document.getElementById("ISPs");
    let aoc = document.getElementById("AverageAgeOfContent");
    let rta = document.getElementById("ResponseTimeAnalysis");
    let hha = document.getElementById("HeaderAnalysis");
    let sm = document.getElementById("map");
    nou.style.display = "none";
    rms.style.display = "none";
    rss.style.display = "none";
    ud.style.display = "none";
    isp.style.display = "none";
    aoc.style.display = "none";
    rta.style.display = "block";
    hha.style.display = "none";
    sm.style.display = "none";
  }
}

let checkbox_filters = document.querySelectorAll("input[type='checkbox']");
for (let i = 0; i < checkbox_filters.length; i++) {
  checkbox_filters[i].addEventListener("click", display_check);
}

function display_check(event) {
  if (event.target.checked) {
    if (event.target.value === "Content-Type") {
      document.getElementById("ct-filter-wrapper").style.display = "block";
      select_filter[0] = document.getElementById("ct-filter");

      $.ajax({
        type: "POST",
        url: "collect_data.php",
        data: {
          request: "request_content_type_info",
          request_type: "content_type",
        },
        success: function (res) {
          options_filter[0] = [];
          options_filter[0] = JSON.parse(res);
          for (let i = 0; i < options_filter[0].length; i++) {
            opt_filter[0] = options_filter[0][i];
            el_filter[0].push(document.createElement("option"));
            el_filter[0][i].textContent = opt_filter[0];
            el_filter[0][i].value = opt_filter[0];
            select_filter[0].appendChild(el_filter[0][i]);
          }
          $("#ct-filter").multiSelect({
            afterSelect: function (values) {
              if (values[0] === "All Content-Types") {
                for (let i = 0; i < options_filter[0].length; i++) {
                  $("#ct-filter").multiSelect("deselect", options_filter[0][i]);
                }
                chosen_ct_filters = [];
                chosen_ct_filters.push(values[0]);
              }
              if (values[0] !== "All Content-Types") {
                $("#ct-filter").multiSelect("deselect", ["All Content-Types"]);
                if (chosen_ct_filters[0] === "All Content-Types") {
                  chosen_ct_filters.shift();
                }
                chosen_ct_filters.push(values[0]);
              }
              draw_chart("response_time_analysis");
            },
            afterDeselect: function (values) {
              for (let i = 0; i < chosen_ct_filters.length; i++) {
                if (values[0] === chosen_ct_filters[i]) {
                  chosen_ct_filters.splice(i, 1);
                }
              }
              draw_chart("response_time_analysis");
            },
          });
        },
      });
    } else if (event.target.value === "Day of the Week Chart") {
      document.getElementById("dotw-filter-wrapper").style.display = "block";
      $("#dotw-filter").multiSelect({
        afterSelect: function (values) {
          if (values[0] === "All Days") {
            $("#dotw-filter").multiSelect("deselect", ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
            chosen_dotw_filters = [];
            chosen_dotw_filters.push(values[0]);
          }
          if (values[0] !== "All Days") {
            $("#dotw-filter").multiSelect("deselect", ["All Days"]);
            if (chosen_dotw_filters[0] === "All Days") {
              chosen_dotw_filters.shift();
            }
            chosen_dotw_filters.push(values[0]);
          }
          draw_chart("response_time_analysis");
        },
        afterDeselect: function (values) {
          for (let i = 0; i < chosen_dotw_filters.length; i++) {
            if (values[0] === chosen_dotw_filters[i]) {
              chosen_dotw_filters.splice(i, 1);
            }
          }
          draw_chart("response_time_analysis");
        },
      });
    } else if (event.target.value === "HTTP Method") {
      document.getElementById("http-filter-wrapper").style.display = "block";
      select_filter[1] = document.getElementById("http-filter");

      $.ajax({
        type: "POST",
        url: "collect_data.php",
        data: {
          request: "request_distinct_http_methods",
        },
        success: function (res) {
          options_filter[1] = [];
          options_filter[1] = JSON.parse(res);
          for (let i = 0; i < options_filter[1].length; i++) {
            opt_filter[1] = options_filter[1][i];
            el_filter[1].push(document.createElement("option"));
            el_filter[1][i].textContent = opt_filter[1];
            el_filter[1][i].value = opt_filter[1];
            select_filter[1].appendChild(el_filter[1][i]);
          }
          $("#http-filter").multiSelect({
            afterSelect: function (values) {
              if (values[0] === "All HTTP Methods") {
                for (let i = 0; i < options_filter[1].length; i++) {
                  $("#http-filter").multiSelect("deselect", options_filter[1][i]);
                }
                chosen_http_filters = [];
                chosen_http_filters.push(values[0]);
              }
              if (values[0] !== "All HTTP Methods") {
                $("#http-filter").multiSelect("deselect", ["All HTTP Methods"]);
                if (chosen_http_filters[0] === "All HTTP Methods") {
                  chosen_http_filters.shift();
                }
                chosen_http_filters.push(values[0]);
              }
              draw_chart("response_time_analysis");
            },
            afterDeselect: function (values) {
              for (let i = 0; i < chosen_http_filters.length; i++) {
                if (values[0] === chosen_http_filters[i]) {
                  chosen_http_filters.splice(i, 1);
                }
              }
              draw_chart("response_time_analysis");
            },
          });
        },
      });
    } else if (event.target.value === "ISP") {
      document.getElementById("isp-filter-wrapper").style.display = "block";
      select_filter[2] = document.getElementById("isp-filter");

      $.ajax({
        type: "POST",
        url: "collect_data.php",
        data: {
          request: "request_distinct_isps",
        },
        success: function (res) {
          options_filter[2] = [];
          options_filter[2] = JSON.parse(res);
          for (let i = 0; i < options_filter[2].length; i++) {
            opt_filter[2] = options_filter[2][i];
            el_filter[2].push(document.createElement("option"));
            el_filter[2][i].textContent = opt_filter[2];
            el_filter[2][i].value = opt_filter[2];
            select_filter[2].appendChild(el_filter[2][i]);
          }
          $("#isp-filter").multiSelect({
            afterSelect: function (values) {
              if (values[0] === "All ISPs") {
                for (let i = 0; i < options_filter[2].length; i++) {
                  $("#isp-filter").multiSelect("deselect", options_filter[2][i]);
                }
                chosen_isp_filters = [];
                chosen_isp_filters.push(values[0]);
              }
              if (values[0] !== "All ISPs") {
                $("#isp-filter").multiSelect("deselect", ["All ISPs"]);
                if (chosen_isp_filters[0] === "All ISPs") {
                  chosen_isp_filters.shift();
                }
                chosen_isp_filters.push(values[0]);
              }
              draw_chart("response_time_analysis");
            },
            afterDeselect: function (values) {
              for (let i = 0; i < chosen_isp_filters.length; i++) {
                if (values[0] === chosen_isp_filters[i]) {
                  chosen_isp_filters.splice(i, 1);
                }
              }
              draw_chart("response_time_analysis");
            },
          });
        },
      });
    } else if (event.target.value === "TTL Content-Type") {
      document.getElementById("ttl-ct-filter-wrapper").style.display = "block";
      select_filter[3] = document.getElementById("ttl-ct-filter");

      $.ajax({
        type: "POST",
        url: "collect_data.php",
        data: {
          request: "request_content_type_info",
          request_type: "content_type",
        },
        success: function (res) {
          options_filter[3] = [];
          options_filter[3] = JSON.parse(res);
          for (let i = 0; i < options_filter[3].length; i++) {
            opt_filter[3] = options_filter[3][i];
            el_filter[3].push(document.createElement("option"));
            el_filter[3][i].textContent = opt_filter[3];
            el_filter[3][i].value = opt_filter[3];
            select_filter[3].appendChild(el_filter[3][i]);
          }
          $("#ttl-ct-filter").multiSelect({
            afterSelect: function (values) {
              if (values[0] === "All Content-Types") {
                for (let i = 0; i < options_filter[3].length; i++) {
                  $("#ttl-ct-filter").multiSelect("deselect", options_filter[3][i]);
                }
                chosen_ttl_ct_filters = [];
                chosen_ttl_ct_filters.push(values[0]);
              }
              if (values[0] !== "All Content-Types") {
                $("#ttl-ct-filter").multiSelect("deselect", ["All Content-Types"]);
                if (chosen_ttl_ct_filters[0] === "All Content-Types") {
                  chosen_ttl_ct_filters.shift();
                }
                chosen_ttl_ct_filters.push(values[0]);
              }
              draw_chart("header_analysis_histogram");
            },
            afterDeselect: function (values) {
              for (let i = 0; i < chosen_ttl_ct_filters.length; i++) {
                if (values[0] === chosen_ttl_ct_filters[i]) {
                  chosen_ttl_ct_filters.splice(i, 1);
                }
              }
              draw_chart("header_analysis_histogram");
            },
          });
        },
      });
    } else if (event.target.value === "HA ISP") {
      document.getElementById("ha-isp-filter-wrapper").style.display = "block";
      select_filter[4] = document.getElementById("ha-isp-filter");

      $.ajax({
        type: "POST",
        url: "collect_data.php",
        data: {
          request: "request_distinct_isps",
        },
        success: function (res) {
          options_filter[4] = [];
          options_filter[4] = JSON.parse(res);
          for (let i = 0; i < options_filter[4].length; i++) {
            opt_filter[4] = options_filter[4][i];
            el_filter[4].push(document.createElement("option"));
            el_filter[4][i].textContent = opt_filter[4];
            el_filter[4][i].value = opt_filter[4];
            select_filter[4].appendChild(el_filter[4][i]);
          }
          $("#ha-isp-filter").multiSelect({
            afterSelect: function (values) {
              if (values[0] === "All ISPs") {
                for (let i = 0; i < options_filter[4].length; i++) {
                  $("#ha-isp-filter").multiSelect("deselect", options_filter[4][i]);
                }
                chosen_ha_isp_filters = [];
                chosen_ha_isp_filters.push(values[0]);
              }
              if (values[0] !== "All ISPs") {
                $("#ha-isp-filter").multiSelect("deselect", ["All ISPs"]);
                if (chosen_ha_isp_filters[0] === "All ISPs") {
                  chosen_ha_isp_filters.shift();
                }
                chosen_ha_isp_filters.push(values[0]);
              }
              draw_chart("header_analysis_histogram");
            },
            afterDeselect: function (values) {
              for (let i = 0; i < chosen_ha_isp_filters.length; i++) {
                if (values[0] === chosen_ha_isp_filters[i]) {
                  chosen_ha_isp_filters.splice(i, 1);
                }
              }
              draw_chart("header_analysis_histogram");
            },
          });
        },
      });
    } else if (event.target.value === "MSMF Content-Type") {
      document.getElementById("msmf-ct-filter-wrapper").style.display = "block";
      select_filter[5] = document.getElementById("msmf-ct-filter");

      $.ajax({
        type: "POST",
        url: "collect_data.php",
        data: {
          request: "request_content_type_info",
          request_type: "content_type",
        },
        success: function (res) {
          options_filter[5] = [];
          options_filter[5] = JSON.parse(res);
          for (let i = 0; i < options_filter[5].length; i++) {
            opt_filter[5] = options_filter[5][i];
            el_filter[5].push(document.createElement("option"));
            el_filter[5][i].textContent = opt_filter[5];
            el_filter[5][i].value = opt_filter[5];
            select_filter[5].appendChild(el_filter[5][i]);
          }
          $("#msmf-ct-filter").multiSelect({
            afterSelect: function (values) {
              if (values[0] === "All Content-Types") {
                for (let i = 0; i < options_filter[5].length; i++) {
                  $("#msmf-ct-filter").multiSelect("deselect", options_filter[5][i]);
                }
                chosen_msmf_ct_filters = [];
                chosen_msmf_ct_filters.push(values[0]);
              }
              if (values[0] !== "All Content-Types") {
                $("#msmf-ct-filter").multiSelect("deselect", ["All Content-Types"]);
                if (chosen_msmf_ct_filters[0] === "All Content-Types") {
                  chosen_msmf_ct_filters.shift();
                }
                chosen_msmf_ct_filters.push(values[0]);
              }
              fill_table("msmf");
            },
            afterDeselect: function (values) {
              for (let i = 0; i < chosen_msmf_ct_filters.length; i++) {
                if (values[0] === chosen_msmf_ct_filters[i]) {
                  chosen_msmf_ct_filters.splice(i, 1);
                }
              }
              fill_table("msmf");
            },
          });
        },
      });
    } else if (event.target.value === "MSMF ISP") {
      document.getElementById("msmf-isp-filter-wrapper").style.display = "block";
      select_filter[6] = document.getElementById("msmf-isp-filter");

      $.ajax({
        type: "POST",
        url: "collect_data.php",
        data: {
          request: "request_distinct_isps",
        },
        success: function (res) {
          options_filter[6] = [];
          options_filter[6] = JSON.parse(res);
          for (let i = 0; i < options_filter[6].length; i++) {
            opt_filter[6] = options_filter[6][i];
            el_filter[6].push(document.createElement("option"));
            el_filter[6][i].textContent = opt_filter[6];
            el_filter[6][i].value = opt_filter[6];
            select_filter[6].appendChild(el_filter[6][i]);
          }
          $("#msmf-isp-filter").multiSelect({
            afterSelect: function (values) {
              if (values[0] === "All ISPs") {
                for (let i = 0; i < options_filter[6].length; i++) {
                  $("#msmf-isp-filter").multiSelect("deselect", options_filter[6][i]);
                }
                chosen_msmf_isp_filters = [];
                chosen_msmf_isp_filters.push(values[0]);
              }
              if (values[0] !== "All ISPs") {
                $("#msmf-isp-filter").multiSelect("deselect", ["All ISPs"]);
                if (chosen_msmf_isp_filters[0] === "All ISPs") {
                  chosen_msmf_isp_filters.shift();
                }
                chosen_msmf_isp_filters.push(values[0]);
              }
              fill_table("msmf");
            },
            afterDeselect: function (values) {
              for (let i = 0; i < chosen_msmf_isp_filters.length; i++) {
                if (values[0] === chosen_msmf_isp_filters[i]) {
                  chosen_msmf_isp_filters.splice(i, 1);
                }
              }
              fill_table("msmf");
            },
          });
        },
      });
    } else if (event.target.value === "CD Content-Type") {
      document.getElementById("cd-ct-filter-wrapper").style.display = "block";
      select_filter[7] = document.getElementById("cd-ct-filter");

      $.ajax({
        type: "POST",
        url: "collect_data.php",
        data: {
          request: "request_content_type_info",
          request_type: "content_type",
        },
        success: function (res) {
          options_filter[7] = [];
          options_filter[7] = JSON.parse(res);
          for (let i = 0; i < options_filter[7].length; i++) {
            opt_filter[7] = options_filter[7][i];
            el_filter[7].push(document.createElement("option"));
            el_filter[7][i].textContent = opt_filter[7];
            el_filter[7][i].value = opt_filter[7];
            select_filter[7].appendChild(el_filter[7][i]);
          }
          $("#cd-ct-filter").multiSelect({
            afterSelect: function (values) {
              if (values[0] === "All Content-Types") {
                for (let i = 0; i < options_filter[7].length; i++) {
                  $("#cd-ct-filter").multiSelect("deselect", options_filter[7][i]);
                }
                chosen_cd_ct_filters = [];
                chosen_cd_ct_filters.push(values[0]);
              }
              if (values[0] !== "All Content-Types") {
                $("#cd-ct-filter").multiSelect("deselect", ["All Content-Types"]);
                if (chosen_cd_ct_filters[0] === "All Content-Types") {
                  chosen_cd_ct_filters.shift();
                }
                chosen_cd_ct_filters.push(values[0]);
              }
              fill_table("cd");
            },
            afterDeselect: function (values) {
              for (let i = 0; i < chosen_cd_ct_filters.length; i++) {
                if (values[0] === chosen_cd_ct_filters[i]) {
                  chosen_cd_ct_filters.splice(i, 1);
                }
              }
              fill_table("cd");
            },
          });
        },
      });
    } else if (event.target.value === "CD ISP") {
      document.getElementById("cd-isp-filter-wrapper").style.display = "block";
      select_filter[8] = document.getElementById("cd-isp-filter");

      $.ajax({
        type: "POST",
        url: "collect_data.php",
        data: {
          request: "request_distinct_isps",
        },
        success: function (res) {
          options_filter[8] = [];
          options_filter[8] = JSON.parse(res);
          for (let i = 0; i < options_filter[8].length; i++) {
            opt_filter[8] = options_filter[8][i];
            el_filter[8].push(document.createElement("option"));
            el_filter[8][i].textContent = opt_filter[8];
            el_filter[8][i].value = opt_filter[8];
            select_filter[8].appendChild(el_filter[8][i]);
          }
          $("#cd-isp-filter").multiSelect({
            afterSelect: function (values) {
              if (values[0] === "All ISPs") {
                for (let i = 0; i < options_filter[8].length; i++) {
                  $("#cd-isp-filter").multiSelect("deselect", options_filter[8][i]);
                }
                chosen_cd_isp_filters = [];
                chosen_cd_isp_filters.push(values[0]);
              }
              if (values[0] !== "All ISPs") {
                $("#cd-isp-filter").multiSelect("deselect", ["All ISPs"]);
                if (chosen_cd_isp_filters[0] === "All ISPs") {
                  chosen_cd_isp_filters.shift();
                }
                chosen_cd_isp_filters.push(values[0]);
              }
              fill_table("cd");
            },
            afterDeselect: function (values) {
              for (let i = 0; i < chosen_cd_isp_filters.length; i++) {
                if (values[0] === chosen_cd_isp_filters[i]) {
                  chosen_cd_isp_filters.splice(i, 1);
                }
              }
              fill_table("cd");
            },
          });
        },
      });
    }
  } else if (!event.target.checked) {
    if (event.target.value === "Content-Type") {
      document.getElementById("ct-filter-wrapper").style.display = "none";
    } else if (event.target.value === "Day of the Week Chart") {
      document.getElementById("dotw-filter-wrapper").style.display = "none";
    } else if (event.target.value === "HTTP Method") {
      document.getElementById("http-filter-wrapper").style.display = "none";
    } else if (event.target.value === "ISP") {
      document.getElementById("isp-filter-wrapper").style.display = "none";
    } else if (event.target.value === "TTL Content-Type") {
      document.getElementById("ttl-ct-filter-wrapper").style.display = "none";
    } else if (event.target.value === "HA ISP") {
      document.getElementById("ha-isp-filter-wrapper").style.display = "none";
    } else if (event.target.value === "MSMF Content-Type") {
      document.getElementById("msmf-ct-filter-wrapper").style.display = "none";
    } else if (event.target.value === "MSMF ISP") {
      document.getElementById("msmf-isp-filter-wrapper").style.display = "none";
    } else if (event.target.value === "CD Content-Type") {
      document.getElementById("cd-ct-filter-wrapper").style.display = "none";
    } else if (event.target.value === "CD ISP") {
      document.getElementById("cd-isp-filter-wrapper").style.display = "none";
    }
  }
}

function HeaderAnalysis() {
  if (document.getElementById("HeaderAnalysis").style.display !== "block") {
    if (hasChild_status === true) {
      for (let i = 0; i < options_status.length; i++) {
        select_status.removeChild(el_status[i]);
      }
      hasChild_status = false;
    }
    if (hasChild_content === true) {
      for (let i = 0; i < options_content.length; i++) {
        select_content.removeChild(el_content[i]);
      }
      hasChild_content = false;
    }
    let nou = document.getElementById("NumberOfUsers");
    let rms = document.getElementById("RequestMethodStatistics");
    let rss = document.getElementById("ResponseStatusStatistics");
    let ud = document.getElementById("UniqueDomains");
    let isp = document.getElementById("ISPs");
    let aoc = document.getElementById("AverageAgeOfContent");
    let rta = document.getElementById("ResponseTimeAnalysis");
    let hha = document.getElementById("HeaderAnalysis");
    let sm = document.getElementById("map");
    nou.style.display = "none";
    rms.style.display = "none";
    rss.style.display = "none";
    ud.style.display = "none";
    isp.style.display = "none";
    aoc.style.display = "none";
    rta.style.display = "none";
    hha.style.display = "block";
    sm.style.display = "none";

    $.ajax({
      type: "POST",
      url: "collect_data.php",
      data: {
        request: "request_method_statistics",
      },
      success: function (res) {
        const [nop, nog, noh, nopu, nod, noc, noo, notr] = res.split("+");
        document.getElementById("nop").innerHTML = nop;
        document.getElementById("nog").innerHTML = nog;
        document.getElementById("noh").innerHTML = noh;
        document.getElementById("nopu").innerHTML = nopu;
        document.getElementById("nod").innerHTML = nod;
        document.getElementById("noc").innerHTML = noc;
        document.getElementById("noo").innerHTML = noo;
        document.getElementById("notr").innerHTML = notr;
      },
    });
  }
}

//This function runs when Show Map is selected from Side Menu
function showMap() {
  if (document.getElementById("map").style.display !== "block") {
    if (hasChild_status === true) {
      for (let i = 0; i < options_status.length; i++) {
        select_status.removeChild(el_status[i]);
      }
      hasChild_status = false;
    }
    if (hasChild_content === true) {
      for (let i = 0; i < options_content.length; i++) {
        select_content.removeChild(el_content[i]);
      }
      hasChild_content = false;
    }
    let nou = document.getElementById("NumberOfUsers");
    let rms = document.getElementById("RequestMethodStatistics");
    let rss = document.getElementById("ResponseStatusStatistics");
    let ud = document.getElementById("UniqueDomains");
    let isp = document.getElementById("ISPs");
    let aoc = document.getElementById("AverageAgeOfContent");
    let rta = document.getElementById("ResponseTimeAnalysis");
    let hha = document.getElementById("HeaderAnalysis");
    let sm = document.getElementById("map");
    nou.style.display = "none";
    rms.style.display = "none";
    rss.style.display = "none";
    ud.style.display = "none";
    isp.style.display = "none";
    aoc.style.display = "none";
    rta.style.display = "none";
    hha.style.display = "none";
    sm.style.display = "block";
    sm.style.visibility = "visible";
  }
}

// Creating map options
async function make_map() {
  let map_data = await set_coordinates();
  let max_count;
  for (let i = 0; i < map_data.length; i++) {
    if (i === 0) {
      max_count = map_data[i][4];
    } else if (i > 0 && map_data[i][4] > max_count) {
      max_count = map_data[i][4];
    }
  }
  function normalize(enteredValue, minEntry, maxEntry, normalizedMin, normalizedMax) {
    var mx = (enteredValue - minEntry) / (maxEntry - minEntry);
    var preshiftNormalized = mx * (normalizedMax - normalizedMin);
    var shiftedNormalized = preshiftNormalized + normalizedMin;

    return shiftedNormalized;
  }

  var red_icon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  var map = L.map("map").setView([51.505, -10], 1);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  var curvedPath = [];
  for (let i = 0; i < map_data.length; i++) {
    L.marker([map_data[i][0], map_data[i][1]], { icon: red_icon }).bindTooltip("User Location").addTo(map);
    L.marker([map_data[i][2], map_data[i][3]]).bindTooltip("HTTP Request Location").addTo(map);
    var offsetX = map_data[i][3] - map_data[i][1],
      offsetY = map_data[i][2] - map_data[i][0];

    var r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2)),
      theta = Math.atan2(offsetY, offsetX);

    var thetaOffset = 3.14 / 10;

    var r2 = r / 2 / Math.cos(thetaOffset),
      theta2 = theta + thetaOffset;

    var midpointX = r2 * Math.cos(theta2) + map_data[i][1],
      midpointY = r2 * Math.sin(theta2) + map_data[i][0];

    var midpointLatLng = [midpointY, midpointX];
    var pathOptions = {
      color: "#023047",
      weight: normalize(map_data[i][4], 1, max_count, 1, 7),
    };

    curvedPath[i] = L.curve(["M", [map_data[i][0], map_data[i][1]], "Q", midpointLatLng, [map_data[i][2], map_data[i][3]]], pathOptions).addTo(map);
  }
}

make_map();

setTimeout(function () {
  let nor = document.getElementById("loader");
  nor.style.display = "none";
  var x = document.getElementById("content");
  x.style.visibility = "visible";
}, 1400);

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function draw_chart(chart_type) {
  if (chart_type === "response_time_analysis") {
    $.ajax({
      type: "POST",
      url: "collect_data.php",
      data: {
        request: "request_filtered_data",
        chosen_ct_filters: JSON.stringify(chosen_ct_filters),
        chosen_dotw_filters: JSON.stringify(chosen_dotw_filters),
        chosen_http_filters: JSON.stringify(chosen_http_filters),
        chosen_isp_filters: JSON.stringify(chosen_isp_filters),
      },
      success: function (res) {
        if (rtaChart) {
          rtaChart.destroy();
        }
        rtaChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: [
              "0:00",
              "1:00",
              "2:00",
              "3:00",
              "4:00",
              "5:00",
              "6:00",
              "7:00",
              "8:00",
              "9:00",
              "10:00",
              "11:00",
              "12:00",
              "13:00",
              "14:00",
              "15:00",
              "16:00",
              "17:00",
              "18:00",
              "19:00",
              "20:00",
              "21:00",
              "22:00",
              "23:00",
            ],
            datasets: [
              {
                label: "Response Time",
                data: JSON.parse(res),
                backgroundColor: color_array,
                borderColor: color_array,
                borderWidth: 2,
                hoverBorderColor: "#b5b5b5",
              },
            ],
          },
          options: {
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                  },
                },
              ],
              xAxes: [
                {
                  barPercentage: 0.7,
                  categoryPercentage: 0.55,
                },
              ],
            },
          },
        });
      },
    });
  } else if (chart_type === "header_analysis_histogram") {
    $.ajax({
      type: "POST",
      url: "collect_data.php",
      data: {
        request: "request_histogram_data",
        chosen_ttl_ct_filters: JSON.stringify(chosen_ttl_ct_filters),
        chosen_ha_isp_filters: JSON.stringify(chosen_ha_isp_filters),
      },
      success: function (res) {
        let temp_max_ages = [];
        let max_ages = [];
        let lowest_max_age;
        let highest_max_age;
        let count = -1;
        let result = [];
        let delta;
        let ranges_counter = [];
        temp_max_ages = JSON.parse(res);
        for (let i = 0; i < temp_max_ages.length; i++) {
          if (temp_max_ages[i] !== null && parseFloat(temp_max_ages[i]) >= 0) {
            count++;
            max_ages.push(parseFloat(temp_max_ages[i]));
            if (count === 0) {
              lowest_max_age = max_ages[count];
              highest_max_age = max_ages[count];
            } else if (count > 0) {
              if (max_ages[count] > highest_max_age) {
                highest_max_age = max_ages[count];
              } else if (max_ages[count] < lowest_max_age) {
                lowest_max_age = max_ages[count];
              }
            }
          }
        }
        if (lowest_max_age === highest_max_age) {
          lowest_max_age = 0;
        }
        delta = (highest_max_age - lowest_max_age) / 10;
        while (lowest_max_age < highest_max_age) {
          result.push(lowest_max_age);
          lowest_max_age += delta;
        }
        result.push(highest_max_age);
        if (result[1] - result[0] < delta) {
          result.splice(0, 1);
        }
        for (let i = 0; i < 10; i++) {
          ranges_counter[i] = 0;
        }
        for (let i = 0; i < max_ages.length; i++) {
          for (let j = 0; j < result.length; j++) {
            if (j < result.length - 1) {
              if (max_ages[i] >= result[j] && max_ages[i] <= result[j + 1]) {
                ranges_counter[j]++;
                break;
              }
            }
          }
        }
        if (haChart) {
          haChart.destroy();
        }
        haChart = new Chart(hac, {
          type: "bar",
          data: {
            labels: result,
            datasets: [
              {
                label: "number of max-ages",
                data: ranges_counter,
                backgroundColor: color_array,
                borderColor: color_array,
                borderWidth: 2,
                hoverBorderColor: "#b5b5b5",
              },
            ],
          },
          options: {
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                  },
                },
              ],
              xAxes: [
                {
                  display: false,
                  barPercentage: 1.3,
                  ticks: {
                    max: result[result.length - 2],
                  },
                },
                {
                  display: true,
                  ticks: {
                    autoSkip: false,
                    max: result[result.length - 1],
                  },
                },
              ],
            },
          },
        });
      },
    });
  }
}

function fill_table(table_type) {
  if (table_type === "msmf") {
    $.ajax({
      type: "POST",
      url: "collect_data.php",
      data: {
        request: "request_msmf_data",
        chosen_msmf_ct_filters: JSON.stringify(chosen_msmf_ct_filters),
        chosen_msmf_isp_filters: JSON.stringify(chosen_msmf_isp_filters),
      },
      success: function (res) {
        document.getElementById("msd").innerHTML = JSON.parse(res)[0];
        document.getElementById("mfd").innerHTML = JSON.parse(res)[1];
      },
    });
  } else if (table_type === "cd") {
    $.ajax({
      type: "POST",
      url: "collect_data.php",
      data: {
        request: "request_cd_data",
        chosen_cd_ct_filters: JSON.stringify(chosen_cd_ct_filters),
        chosen_cd_isp_filters: JSON.stringify(chosen_cd_isp_filters),
      },
      success: function (res) {
        document.getElementById("pud").innerHTML = JSON.parse(res)[0];
        document.getElementById("prd").innerHTML = JSON.parse(res)[1];
        document.getElementById("ncd").innerHTML = JSON.parse(res)[2];
        document.getElementById("nsd").innerHTML = JSON.parse(res)[3];
      },
    });
  }
}
