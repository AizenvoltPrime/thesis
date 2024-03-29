import { generate_posts, reset_poll_data, null_all_styles, conn, get_variables } from "./index.js";
import { null_style, highlight_filter, clear_map } from "./filters.js";
import { admin_analytics_map, admin_layerControl, admin_all_geojson, admin_analytics_all_markers, clear_admin_map } from "./admin_analytics.js";
import { set_admin_map_bool } from "./update_data.js";

//This is for when the user clicks the left navbar icon for it to appear.
document.getElementById("sidenav-icon").addEventListener("click", function () {
  document.getElementById("sidenav").style.width = "18.75em";
  document.getElementById("sidenav-icon").style.visibility = "hidden";
});

//This is for when the user clicks the left navbar close icon for the navbar to disappear.
document.getElementsByClassName("closebtn")[0].addEventListener("click", function () {
  document.getElementById("sidenav").style.width = "0";
  document.getElementById("sidenav-icon").style.visibility = "visible";
});

//This is for the 2 navbars to close when user clicks outside them when they are open.
function handleMousePos(event) {
  var mouseClickWidth = event.clientX;
  if (mouseClickWidth >= 300) {
    document.getElementById("sidenav").style.width = "0";
    document.getElementById("sidenav-icon").style.visibility = "visible";
  }
  if (mouseClickWidth <= window.innerWidth - 300) {
    document.getElementById("user-nav").style.width = "0";
    document.getElementById("profile-icon").style.visibility = "visible";
  }
}

document.addEventListener("click", handleMousePos);

//This is for when the user clicks the right navbar icon for it to appear.
document.getElementById("profile-icon").addEventListener("click", function () {
  fetch("process_data.php", {
    method: "POST",
    body: JSON.stringify({ request: "user_status" }),
  })
    .then((res) => res.text())
    .then((response) => {
      if (response === "false") {
        document.getElementsByClassName("nav-element")[5].style.display = "none";
        document.getElementsByClassName("nav-element")[6].style.display = "none";
        document.getElementsByClassName("nav-element")[7].style.display = "none";
        document.getElementsByClassName("nav-element")[9].style.display = "none";
        document.getElementsByClassName("fa-solid fa-info")[0].style.paddingRight = "0.55em";
      } else {
        document.getElementsByClassName("nav-element")[3].style.display = "none";
        document.getElementsByClassName("nav-element")[4].style.display = "none";
        document.getElementsByClassName("nav-element")[5].style.cursor = "pointer";
        document.getElementsByClassName("fa-solid fa-bookmark fa-1x")[0].style.paddingRight = "0.35em";
        document.getElementsByClassName("fa-solid fa-chart-simple")[0].style.paddingRight = "0.35em";
        document.getElementsByClassName("fa-solid fa-info")[0].style.paddingRight = "0.85em";
        document.getElementsByClassName("fa-solid fa-arrow-right-from-bracket")[0].style.paddingRight = "0.15em";
        document.getElementsByClassName("fa-solid fa-user fa-1x")[0].style.paddingRight = "0.25em";
        document.getElementsByClassName("fa-solid fa-lock fa-1x")[0].style.paddingRight = "0.25em";
        document.getElementsByClassName("fa-solid fa-globe fa-1x")[0].style.paddingRight = "0.18em";
      }
    });
  $("#language").fadeOut(1, function () {
    document.querySelectorAll(".user-nav a")[5].style.borderBottom = "0.0625em solid black";
  });
  $("#language")
    .promise()
    .done(function () {
      document.getElementById("user-nav").style.width = "18.75em";
      document.getElementById("profile-icon").style.visibility = "hidden";
    });
});

//This is for when the user clicks the right navbar close icon for the navbar to disappear.
document.getElementsByClassName("closeuserbtn")[0].addEventListener("click", function () {
  document.getElementById("user-nav").style.width = "0";
  document.getElementById("profile-icon").style.visibility = "visible";
});

//This is for when the user clicks "Bookmarks" on the user navabar.
document.getElementsByClassName("nav-element")[5].addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("all-filters")).display === "none") {
    null_all_styles();
    clear_screen();
    if (window.getComputedStyle(document.getElementById("username-change-form")).display !== "none") {
      document.getElementById("user-nav").style.width = "0";
      document.getElementById("profile-icon").style.visibility = "visible";
      $("#username-change-form").fadeOut(300, function () {
        $("#add-post-icon").fadeIn(300, function () {});
        $("#app-title-container").fadeIn(300, function () {});
        $("#all-filters").fadeIn(300, function () {});
        generate_posts(true);
      });
    } else if (window.getComputedStyle(document.getElementById("password-change-form")).display !== "none") {
      document.getElementById("user-nav").style.width = "0";
      document.getElementById("profile-icon").style.visibility = "visible";
      $("#password-change-form").fadeOut(300, function () {
        $("#add-post-icon").fadeIn(300, function () {});
        $("#app-title-container").fadeIn(300, function () {});
        $("#all-filters").fadeIn(300, function () {});
        generate_posts(true);
      });
    } else if (window.getComputedStyle(document.getElementById("analytics-container")).display !== "none") {
      document.getElementById("user-nav").style.width = "0";
      document.getElementById("profile-icon").style.visibility = "visible";
      $("#admin-analytics-chart-filters-container").fadeOut(300, function () {});
      $("#general-info-table-outside-container").fadeOut(300, function () {});
      $("#total-active-posts-outside-container").fadeOut(300, function () {});
      $("#total-active-posts-per-category-outside-container").fadeOut(300, function () {});
      $("#analytics-container").fadeOut(300, function () {
        clear_map(admin_analytics_map, admin_layerControl, admin_all_geojson, admin_analytics_all_markers);
        null_style("fa-solid fa-map");
        conn.send(JSON.stringify(["admin_map_status", false]));
        set_admin_map_bool(false);
        $("#add-post-icon").fadeIn(300, function () {});
        $("#app-title-container").fadeIn(300, function () {});
        $("#all-filters").fadeIn(300, function () {});
        generate_posts(true);
      });
    } else if (window.getComputedStyle(document.getElementById("about-container")).display !== "none") {
      document.getElementById("user-nav").style.width = "0";
      document.getElementById("profile-icon").style.visibility = "visible";
      $("#about-container").fadeOut(300, function () {
        $("#add-post-icon").fadeIn(300, function () {});
        $("#app-title-container").fadeIn(300, function () {});
        $("#all-filters").fadeIn(300, function () {});
        generate_posts(true);
      });
    } else if (window.getComputedStyle(document.getElementById("next-step")).display !== "none") {
      document.getElementById("user-nav").style.width = "0";
      document.getElementById("profile-icon").style.visibility = "visible";
      $("#next-step").fadeOut(300, function () {
        $("#add-post-icon").fadeIn(300, function () {});
        $("#app-title-container").fadeIn(300, function () {});
        $("#all-filters").fadeIn(300, function () {});
        generate_posts(true);
      });
    }
  } else {
    document.getElementById("user-nav").style.width = "0";
    document.getElementById("profile-icon").style.visibility = "visible";
    $("#add-post-icon").fadeOut(300, function () {});
    $("#app-title-container").fadeOut(300, function () {});
    $("#all-filters").fadeOut(300, function () {});
    if (window.getComputedStyle(document.getElementById("username-change-form")).display !== "none") {
      $("#username-change-form").fadeOut(300, function () {});
    }
    if (window.getComputedStyle(document.getElementById("password-change-form")).display !== "none") {
      $("#password-change-form").fadeOut(300, function () {});
    }
    $(".post").fadeOut(300, function () {});
    $("#notification-container").fadeOut(300, function () {});
    $("#delete-notification-container").fadeOut(300, function () {});
    $(".post")
      .promise()
      .done(function () {
        $(".post").not(":first").remove();
        null_all_styles();
        reset_poll_data();
        generate_posts(true);
      });
  }
});

//This is for when the user clicks "Home" on the left navbar.
document.getElementsByClassName("nav-element")[0].addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("all-filters")).display === "none") {
    null_all_styles();
    clear_screen();
    if (window.getComputedStyle(document.getElementById("username-change-form")).display !== "none") {
      document.getElementById("sidenav").style.width = "0";
      document.getElementById("sidenav-icon").style.visibility = "visible";
      $("#username-change-form").fadeOut(300, function () {
        $("#add-post-icon").fadeIn(300, function () {});
        $("#app-title-container").fadeIn(300, function () {});
        $("#all-filters").fadeIn(300, function () {});
        generate_posts(false);
      });
    } else if (window.getComputedStyle(document.getElementById("password-change-form")).display !== "none") {
      document.getElementById("sidenav").style.width = "0";
      document.getElementById("sidenav-icon").style.visibility = "visible";
      $("#password-change-form").fadeOut(300, function () {
        $("#add-post-icon").fadeIn(300, function () {});
        $("#app-title-container").fadeIn(300, function () {});
        $("#all-filters").fadeIn(300, function () {});
        generate_posts(false);
      });
    } else if (window.getComputedStyle(document.getElementById("analytics-container")).display !== "none") {
      document.getElementById("sidenav").style.width = "0";
      document.getElementById("sidenav-icon").style.visibility = "visible";
      $("#admin-analytics-chart-filters-container").fadeOut(300, function () {});
      $("#general-info-table-outside-container").fadeOut(300, function () {});
      $("#total-active-posts-outside-container").fadeOut(300, function () {});
      $("#total-active-posts-per-category-outside-container").fadeOut(300, function () {});
      $("#analytics-container").fadeOut(300, function () {
        clear_map(admin_analytics_map, admin_layerControl, admin_all_geojson, admin_analytics_all_markers);
        null_style("fa-solid fa-map");
        conn.send(JSON.stringify(["admin_map_status", false]));
        set_admin_map_bool(false);
        $("#add-post-icon").fadeIn(300, function () {});
        $("#app-title-container").fadeIn(300, function () {});
        $("#all-filters").fadeIn(300, function () {});
        generate_posts(false);
      });
    } else if (window.getComputedStyle(document.getElementById("about-container")).display !== "none") {
      document.getElementById("sidenav").style.width = "0";
      document.getElementById("sidenav-icon").style.visibility = "visible";
      $("#about-container").fadeOut(300, function () {
        $("#add-post-icon").fadeIn(300, function () {});
        $("#app-title-container").fadeIn(300, function () {});
        $("#all-filters").fadeIn(300, function () {});
        generate_posts(false);
      });
    } else if (window.getComputedStyle(document.getElementById("next-step")).display !== "none") {
      document.getElementById("sidenav").style.width = "0";
      document.getElementById("sidenav-icon").style.visibility = "visible";
      $("#next-step").fadeOut(300, function () {
        $("#add-post-icon").fadeIn(300, function () {});
        $("#app-title-container").fadeIn(300, function () {});
        $("#all-filters").fadeIn(300, function () {});
        generate_posts(false);
      });
    }
  } else {
    document.getElementById("sidenav").style.width = "0";
    document.getElementById("sidenav-icon").style.visibility = "visible";
    $("#add-post-icon").fadeOut(300, function () {});
    $("#app-title-container").fadeOut(300, function () {});
    $("#all-filters").fadeOut(300, function () {});
    if (window.getComputedStyle(document.getElementById("username-change-form")).display !== "none") {
      $("#username-change-form").fadeOut(300, function () {});
    }
    if (window.getComputedStyle(document.getElementById("password-change-form")).display !== "none") {
      $("#password-change-form").fadeOut(300, function () {});
    }
    $(".post").fadeOut(300, function () {});
    $("#notification-container").fadeOut(300, function () {});
    $("#delete-notification-container").fadeOut(300, function () {});
    $(".post")
      .promise()
      .done(function () {
        $(".post").not(":first").remove();
        null_all_styles();
        reset_poll_data();
        generate_posts(false);
      });
  }
});

//This is for when the user clicks "Change Username" on the user navbar.
document.getElementsByClassName("nav-element")[6].addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("all-filters")).display === "none") {
    clear_screen();
    if (window.getComputedStyle(document.getElementById("password-change-form")).display !== "none") {
      document.getElementById("user-nav").style.width = "0";
      document.getElementById("profile-icon").style.visibility = "visible";
      $("#password-change-form").fadeOut(300, function () {
        $("#username-change-form").fadeIn(300, function () {});
      });
    } else if (window.getComputedStyle(document.getElementById("analytics-container")).display !== "none") {
      document.getElementById("user-nav").style.width = "0";
      document.getElementById("profile-icon").style.visibility = "visible";
      $("#admin-analytics-chart-filters-container").fadeOut(300, function () {});
      $("#general-info-table-outside-container").fadeOut(300, function () {});
      $("#total-active-posts-outside-container").fadeOut(300, function () {});
      $("#total-active-posts-per-category-outside-container").fadeOut(300, function () {});
      $("#analytics-container").fadeOut(300, function () {
        clear_map(admin_analytics_map, admin_layerControl, admin_all_geojson, admin_analytics_all_markers);
        null_style("fa-solid fa-map");
        conn.send(JSON.stringify(["admin_map_status", false]));
        set_admin_map_bool(false);
        $("#username-change-form").fadeIn(300, function () {});
      });
    } else if (window.getComputedStyle(document.getElementById("about-container")).display !== "none") {
      document.getElementById("user-nav").style.width = "0";
      document.getElementById("profile-icon").style.visibility = "visible";
      $("#about-container").fadeOut(300, function () {
        $("#username-change-form").fadeIn(300, function () {});
      });
    } else if (window.getComputedStyle(document.getElementById("next-step")).display !== "none") {
      document.getElementById("user-nav").style.width = "0";
      document.getElementById("profile-icon").style.visibility = "visible";
      $("#next-step").fadeOut(300, function () {
        $("#username-change-form").fadeIn(300, function () {});
      });
    }
  } else {
    document.getElementById("user-nav").style.width = "0";
    document.getElementById("profile-icon").style.visibility = "visible";
    $("#add-post-icon").fadeOut(300, function () {});
    $("#app-title-container").fadeOut(300, function () {});
    $("#all-filters").fadeOut(300, function () {});
    $(".post").fadeOut(300, function () {});
    $("#notification-container").fadeOut(300, function () {});
    $("#delete-notification-container").fadeOut(300, function () {});
    $(".post")
      .promise()
      .done(function () {
        $(".post").fadeOut(300, function () {});
        $(".post").not(":first").remove();
        reset_poll_data();
        $("#username-change-form").fadeIn(300, function () {});
      });
  }
});

//This is for when the user submits the form data to change Username.
document.getElementById("username-change").addEventListener("click", function () {
  let new_username = document.forms["username-change-form"]["username"].value;
  let upass = document.forms["username-change-form"]["password"].value;

  if (new_username === "") {
    if (localStorage.getItem("language") === "el") {
      document.getElementById("user-help").innerText = "Το όνομα χρήστη δεν έχει συμπληρωθεί";
    } else {
      document.getElementById("user-help").innerText = "Username field is empty";
    }
    document.getElementById("pass-help").innerText = "";
  } else if (new_username.length < 6 || new_username.length > 16) {
    if (localStorage.getItem("language") === "el") {
      document.getElementById("user-help").innerText = "Το όνομα χρήστη πρέπει να έχει από 6 έως 16 χαρακτήρες";
    } else {
      document.getElementById("user-help").innerText = "Username must be between 6 and 16 characters";
    }
    document.getElementById("pass-help").innerText = "";
  } else if (new_username.indexOf(" ") > 0) {
    if (localStorage.getItem("language") === "el") {
      document.getElementById("user-help").innerText = "Το όνομα χρήστη δε πρέπει να έχει κενά";
    } else {
      document.getElementById("user-help").innerText = "Username must not have spaces";
    }
    document.getElementById("pass-help").innerText = "";
  } else if (upass === "") {
    document.getElementById("user-help").innerText = "";
    if (localStorage.getItem("language") === "el") {
      document.getElementById("pass-help").innerText = "Ο κωδικός χρήστη δεν έχει συμπληρωθεί";
    } else {
      document.getElementById("pass-help").innerText = "Password field is empty";
    }
  } else {
    document.getElementById("user-help").innerText = "";
    document.getElementById("pass-help").innerText = "";
    fetch("process_data.php", {
      method: "POST",
      body: JSON.stringify({ request: "username_change", username: new_username, password: upass }),
    })
      .then((res) => res.text())
      .then((response) => {
        if (response.trim() == "Username Unavailable!") {
          if (localStorage.getItem("language") === "el") {
            document.getElementById("user-help").innerText = "Το όνομα χρήστη δεν είναι διαθέσιμο";
          } else {
            document.getElementById("user-help").innerText = "Username Unavailable";
          }
          document.getElementById("pass-help").innerText = "";
        } else if (response.trim() == "Incorrect Password!") {
          document.getElementById("user-help").innerText = "";
          if (localStorage.getItem("language") === "el") {
            document.getElementById("pass-help").innerText = "Ο κωδικός είναι λάθος";
          } else {
            document.getElementById("pass-help").innerText = "Incorrect Password";
          }
        } else if (response.trim() == "Success") {
          document.getElementById("user-help").innerText = "";
          document.getElementById("pass-help").innerText = "";
          $("#username-change-form").fadeOut(300, function () {});
          $("#username-change-form")
            .promise()
            .done(function () {
              document.getElementsByClassName("logged-form-control")[0].value = "";
              document.getElementsByClassName("logged-form-control")[1].value = "";
              $("#add-post-icon").fadeIn(300, function () {});
              $("#app-title-container").fadeIn(300, function () {});
              $("#all-filters").fadeIn(300, function () {});
              generate_posts(false);
            });
        }
      });
  }
});

//This is for when the user clicks "Change Password" on the user navbar.
document.getElementsByClassName("nav-element")[7].addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("all-filters")).display === "none") {
    clear_screen();
    if (window.getComputedStyle(document.getElementById("username-change-form")).display !== "none") {
      document.getElementById("user-nav").style.width = "0";
      document.getElementById("profile-icon").style.visibility = "visible";
      $("#username-change-form").fadeOut(300, function () {
        $("#password-change-form").fadeIn(300, function () {});
      });
    } else if (window.getComputedStyle(document.getElementById("analytics-container")).display !== "none") {
      document.getElementById("user-nav").style.width = "0";
      document.getElementById("profile-icon").style.visibility = "visible";
      $("#admin-analytics-chart-filters-container").fadeOut(300, function () {});
      $("#general-info-table-outside-container").fadeOut(300, function () {});
      $("#total-active-posts-outside-container").fadeOut(300, function () {});
      $("#total-active-posts-per-category-outside-container").fadeOut(300, function () {});
      $("#analytics-container").fadeOut(300, function () {
        clear_map(admin_analytics_map, admin_layerControl, admin_all_geojson, admin_analytics_all_markers);
        null_style("fa-solid fa-map");
        conn.send(JSON.stringify(["admin_map_status", false]));
        set_admin_map_bool(false);
        $("#password-change-form").fadeIn(300, function () {});
      });
    } else if (window.getComputedStyle(document.getElementById("about-container")).display !== "none") {
      document.getElementById("user-nav").style.width = "0";
      document.getElementById("profile-icon").style.visibility = "visible";
      $("#about-container").fadeOut(300, function () {
        $("#password-change-form").fadeIn(300, function () {});
      });
    } else if (window.getComputedStyle(document.getElementById("next-step")).display !== "none") {
      document.getElementById("user-nav").style.width = "0";
      document.getElementById("profile-icon").style.visibility = "visible";
      $("#next-step").fadeOut(300, function () {
        $("#password-change-form").fadeIn(300, function () {});
      });
    }
  } else {
    document.getElementById("user-nav").style.width = "0";
    document.getElementById("profile-icon").style.visibility = "visible";
    $("#add-post-icon").fadeOut(300, function () {});
    $("#app-title-container").fadeOut(300, function () {});
    $("#all-filters").fadeOut(300, function () {});
    $(".post").fadeOut(300, function () {});
    $("#notification-container").fadeOut(300, function () {});
    $("#delete-notification-container").fadeOut(300, function () {});
    $(".post")
      .promise()
      .done(function () {
        $(".post").fadeOut(300, function () {});
        $(".post").not(":first").remove();
        reset_poll_data();
        $("#password-change-form").fadeIn(300, function () {});
      });
  }
});

//This is for when the user submits the form data to change Password.
document.getElementById("password-change").addEventListener("click", function () {
  let current_password = document.forms["password-change-form"]["current-password"].value;
  let new_pass = document.forms["password-change-form"]["new-password"].value;
  let conf_pass = document.forms["password-change-form"]["repeat-new-password"].value;

  if (new_pass === "" || conf_pass === "" || current_password === "") {
    if (localStorage.getItem("language") === "el") {
      document.getElementById("password-help").innerText = "Ένα από τα πεδία κωδικών δεν έχει συμπληρωθεί";
    } else {
      document.getElementById("password-help").innerText = "One of the password fields is empty";
    }
    document.getElementById("passc-help").innerText = "";
  } else if (new_pass !== conf_pass) {
    document.getElementById("password-help").innerText = "";
    if (localStorage.getItem("language") === "el") {
      document.getElementById("passc-help").innerText = "Οι κωδικοί πρέπει να ταιριάζουν";
    } else {
      document.getElementById("passc-help").innerText = "Passwords must match";
    }
  } else if (new_pass.length < 8) {
    document.getElementById("password-help").innerText = "";
    if (localStorage.getItem("language") === "el") {
      document.getElementById("passc-help").innerText = "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες";
    } else {
      document.getElementById("passc-help").innerText = "Password must be at least 8 characters";
    }
  } else if (new_pass.indexOf(" ") > 0) {
    document.getElementById("password-help").innerText = "";
    document.getElementById("passc-help").innerText = "Password must not have spaces";
  } else if (!/[A-Z]/g.test(new_pass) || !/[0-9]/g.test(new_pass) || !/[.!@#$&*]/g.test(new_pass)) {
    document.getElementById("password-help").innerText = "";
    if (localStorage.getItem("language") === "el") {
      document.getElementById("passc-help").innerText =
        "Ο κωδικός πρέπει να περιέχει τουλάχιστον 8 χαρακτήρες και πρέπει επίσης να περιέχει τουλάχιστον ένα κεφαλαίο γράμμα, ένα ψηφίο και ένα από τα παρακάτω σύμβολα(π.χ. .!#$*&@)";
    } else {
      document.getElementById("passc-help").innerText =
        "Password must contain at least 8 character and must also contain, at least one capital letter, a digit and one of these symbols (e.g. .!#$*&@)";
    }
  } else {
    fetch("process_data.php", {
      method: "POST",
      body: JSON.stringify({
        request: "password_change",
        current_password: current_password,
        new_password: new_pass,
      }),
    })
      .then((res) => res.text())
      .then((response) => {
        if (response.trim() == "Incorrect Password!") {
          if (localStorage.getItem("language") === "el") {
            document.getElementById("password-help").innerText = "Λάθος Κωδικός";
          } else {
            document.getElementById("password-help").innerText = "Incorrect Password";
          }
          document.getElementById("passc-help").innerText = "";
        } else if (response.trim() == "Success") {
          document.getElementById("password-help").innerText = "";
          document.getElementById("passc-help").innerText = "";
          $("#password-change-form").fadeOut(300, function () {});
          $("#password-change-form")
            .promise()
            .done(function () {
              document.getElementsByClassName("logged-form-control")[2].value = "";
              document.getElementsByClassName("logged-form-control")[3].value = "";
              document.getElementsByClassName("logged-form-control")[4].value = "";
              $("#add-post-icon").fadeIn(300, function () {});
              $("#app-title-container").fadeIn(300, function () {});
              $("#all-filters").fadeIn(300, function () {});
              generate_posts(false);
            });
        }
      });
  }
});

//This is for when the user clicks "Analytics" on the user navbar.
document.getElementsByClassName("nav-element")[1].addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("all-filters")).display === "none") {
    clear_screen();
    if (window.getComputedStyle(document.getElementById("username-change-form")).display !== "none") {
      document.getElementById("sidenav").style.width = "0";
      document.getElementById("sidenav-icon").style.visibility = "visible";
      $("#username-change-form").fadeOut(300, function () {
        null_style("fa-chart-column");
        null_style("fa-solid fa-circle-info");
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.background = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.backgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.webkitBackgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.webkitTextFillColor = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.background = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.backgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.webkitBackgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.webkitTextFillColor = null;
        highlight_filter("fa-solid fa-map");
        document.getElementById("admin-analytics-map").style.display = "block";
        $("#analytics-container").fadeIn(300, function () {
          clear_admin_map();
          if (get_variables().length === 3) {
            conn.send(JSON.stringify(["admin_analytics_map", get_variables()[2], true]));
          } else {
            conn.send(JSON.stringify(["admin_analytics_map", get_variables()[3][0][16], true]));
          }
          set_admin_map_bool(true);
          admin_analytics_map.invalidateSize();
        });
      });
    } else if (window.getComputedStyle(document.getElementById("password-change-form")).display !== "none") {
      document.getElementById("sidenav").style.width = "0";
      document.getElementById("sidenav-icon").style.visibility = "visible";
      $("#password-change-form").fadeOut(300, function () {
        null_style("fa-chart-column");
        null_style("fa-solid fa-circle-info");
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.background = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.backgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.webkitBackgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.webkitTextFillColor = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.background = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.backgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.webkitBackgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.webkitTextFillColor = null;
        highlight_filter("fa-solid fa-map");
        document.getElementById("admin-analytics-map").style.display = "block";
        $("#analytics-container").fadeIn(300, function () {
          clear_admin_map();
          if (get_variables().length === 3) {
            conn.send(JSON.stringify(["admin_analytics_map", get_variables()[2], true]));
          } else {
            conn.send(JSON.stringify(["admin_analytics_map", get_variables()[3][0][16], true]));
          }
          set_admin_map_bool(true);
          admin_analytics_map.invalidateSize();
        });
      });
    } else if (window.getComputedStyle(document.getElementById("about-container")).display !== "none") {
      document.getElementById("sidenav").style.width = "0";
      document.getElementById("sidenav-icon").style.visibility = "visible";
      $("#about-container").fadeOut(300, function () {
        null_style("fa-chart-column");
        null_style("fa-solid fa-circle-info");
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.background = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.backgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.webkitBackgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.webkitTextFillColor = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.background = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.backgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.webkitBackgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.webkitTextFillColor = null;
        highlight_filter("fa-solid fa-map");
        document.getElementById("admin-analytics-map").style.display = "block";
        $("#analytics-container").fadeIn(300, function () {
          clear_admin_map();
          if (get_variables().length === 3) {
            conn.send(JSON.stringify(["admin_analytics_map", get_variables()[2], true]));
          } else {
            conn.send(JSON.stringify(["admin_analytics_map", get_variables()[3][0][16], true]));
          }
          set_admin_map_bool(true);
          admin_analytics_map.invalidateSize();
        });
      });
    } else if (window.getComputedStyle(document.getElementById("next-step")).display !== "none") {
      document.getElementById("sidenav").style.width = "0";
      document.getElementById("sidenav-icon").style.visibility = "visible";
      $("#next-step").fadeOut(300, function () {
        null_style("fa-chart-column");
        null_style("fa-solid fa-circle-info");
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.background = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.backgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.webkitBackgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.webkitTextFillColor = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.background = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.backgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.webkitBackgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.webkitTextFillColor = null;
        highlight_filter("fa-solid fa-map");
        document.getElementById("admin-analytics-map").style.display = "block";
        $("#analytics-container").fadeIn(300, function () {
          clear_admin_map();
          if (get_variables().length === 3) {
            conn.send(JSON.stringify(["admin_analytics_map", get_variables()[2], true]));
          } else {
            conn.send(JSON.stringify(["admin_analytics_map", get_variables()[3][0][16], true]));
          }
          set_admin_map_bool(true);
          admin_analytics_map.invalidateSize();
        });
      });
    }
  } else {
    document.getElementById("sidenav").style.width = "0";
    document.getElementById("sidenav-icon").style.visibility = "visible";
    $("#add-post-icon").fadeOut(300, function () {});
    $("#app-title-container").fadeOut(300, function () {});
    $("#all-filters").fadeOut(300, function () {});
    $(".post").fadeOut(300, function () {});
    $("#notification-container").fadeOut(300, function () {});
    $("#delete-notification-container").fadeOut(300, function () {});
    $(".post")
      .promise()
      .done(function () {
        $(".post").fadeOut(300, function () {});
        $(".post").not(":first").remove();
        reset_poll_data();
        null_style("fa-chart-column");
        null_style("fa-solid fa-circle-info");
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.background = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.backgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.webkitBackgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[0].style.webkitTextFillColor = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.background = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.backgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.webkitBackgroundClip = null;
        document.getElementsByClassName("fa-solid fa-chart-pie")[1].style.webkitTextFillColor = null;
        highlight_filter("fa-solid fa-map");
        document.getElementById("admin-analytics-map").style.display = "block";
        $("#analytics-container").fadeIn(300, function () {
          clear_admin_map();
          if (get_variables().length === 3) {
            conn.send(JSON.stringify(["admin_analytics_map", get_variables()[2], true]));
          } else {
            conn.send(JSON.stringify(["admin_analytics_map", get_variables()[3][0][16], true]));
          }
          set_admin_map_bool(true);
          admin_analytics_map.invalidateSize();
        });
      });
  }
});

//This is for when the user clicks "About" on the user navbar.
document.getElementsByClassName("nav-element")[2].addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("all-filters")).display === "none") {
    clear_screen();
    if (window.getComputedStyle(document.getElementById("username-change-form")).display !== "none") {
      document.getElementById("sidenav").style.width = "0";
      document.getElementById("sidenav-icon").style.visibility = "visible";
      $("#username-change-form").fadeOut(300, function () {
        document.getElementById("short-app-description").style.display = "block";
        document.getElementById("detailed-app-description").style.display = "none";
        $("#about-container").fadeIn(300, function () {});
      });
    } else if (window.getComputedStyle(document.getElementById("password-change-form")).display !== "none") {
      document.getElementById("sidenav").style.width = "0";
      document.getElementById("sidenav-icon").style.visibility = "visible";
      $("#password-change-form").fadeOut(300, function () {
        document.getElementById("short-app-description").style.display = "block";
        document.getElementById("detailed-app-description").style.display = "none";
        $("#about-container").fadeIn(300, function () {});
      });
    } else if (window.getComputedStyle(document.getElementById("analytics-container")).display !== "none") {
      document.getElementById("sidenav").style.width = "0";
      document.getElementById("sidenav-icon").style.visibility = "visible";
      $("#admin-analytics-chart-filters-container").fadeOut(300, function () {});
      $("#general-info-table-outside-container").fadeOut(300, function () {});
      $("#total-active-posts-outside-container").fadeOut(300, function () {});
      $("#total-active-posts-per-category-outside-container").fadeOut(300, function () {});
      $("#analytics-container").fadeOut(300, function () {
        clear_map(admin_analytics_map, admin_layerControl, admin_all_geojson, admin_analytics_all_markers);
        null_style("fa-solid fa-map");
        conn.send(JSON.stringify(["admin_map_status", false]));
        set_admin_map_bool(false);
        document.getElementById("short-app-description").style.display = "block";
        document.getElementById("detailed-app-description").style.display = "none";
        $("#about-container").fadeIn(300, function () {});
      });
    } else if (window.getComputedStyle(document.getElementById("next-step")).display !== "none") {
      document.getElementById("sidenav").style.width = "0";
      document.getElementById("sidenav-icon").style.visibility = "visible";
      $("#next-step").fadeOut(300, function () {
        document.getElementById("short-app-description").style.display = "block";
        document.getElementById("detailed-app-description").style.display = "none";
        $("#about-container").fadeIn(300, function () {});
      });
    }
  } else {
    document.getElementById("sidenav").style.width = "0";
    document.getElementById("sidenav-icon").style.visibility = "visible";
    $("#add-post-icon").fadeOut(300, function () {});
    $("#app-title-container").fadeOut(300, function () {});
    $("#all-filters").fadeOut(300, function () {});
    $(".post").fadeOut(300, function () {});
    $("#notification-container").fadeOut(300, function () {});
    $("#delete-notification-container").fadeOut(300, function () {});
    $(".post")
      .promise()
      .done(function () {
        $(".post").fadeOut(300, function () {});
        $(".post").not(":first").remove();
        reset_poll_data();
        document.getElementById("short-app-description").style.display = "block";
        document.getElementById("detailed-app-description").style.display = "none";
        $("#about-container").fadeIn(300, function () {});
      });
  }
});

function clear_screen() {
  $("#warning-nothing-selected").fadeOut(300, function () {});
  $("#warning-empty-text-area").fadeOut(300, function () {});
  $("#warning-no-time-limit-choice").fadeOut(300, function () {});
  $("#warning-no-time-limit").fadeOut(300, function () {});
  $("#warning-no-location-restriction-choice").fadeOut(300, function () {});
  $("#warning-no-location-selected").fadeOut(300, function () {});
  $("#warning-radius-too-small").fadeOut(300, function () {});
  $("#warning-no-category-selected").fadeOut(300, function () {});
  $("#warning-no-poll-choice-number-selected").fadeOut(300, function () {});
  $("#warning-no-input-poll-choices").fadeOut(300, function () {});
  $("#poll-selection").fadeOut(300, function () {});
  $("#poll-question").fadeOut(300, function () {});
  $("#poll-template-time-choice").fadeOut(300, function () {});
  $("#time-choice").fadeOut(300, function () {});
  $("#poll-template-location-restriction").fadeOut(300, function () {});
  $("#location-choice").fadeOut(300, function () {});
  $("#post-category-container").fadeOut(300, function () {});
  $("#poll-choices-number-container").fadeOut(300, function () {});
  $("#input-poll-choices").fadeOut(300, function () {
    document.getElementById("input-poll-choices").innerHTML = "";
  });
}
