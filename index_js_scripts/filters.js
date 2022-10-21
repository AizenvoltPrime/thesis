import { generate_posts, reset_poll_data, get_variables } from "./index.js";

document.getElementById("hot").addEventListener("click", function () {
  let search_text = document.forms["search-box-container"]["search-text"].value;
  if (window.getComputedStyle(document.getElementsByClassName("fa-magnifying-glass")[0]).backgroundClip === "text") {
    if (window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip === "text") {
      null_style("fa-fire-flame-curved");
    } else {
      highlight_filter("fa-fire-flame-curved");
      null_style("fa-sun");
      null_style("fa-table-list");
      null_style("fa-filter");

      $(".post").fadeOut(300, function () {});
      $(".post")
        .promise()
        .done(function () {
          $(".post").fadeOut(300, function () {});
          $(".post").not(":first").remove();
          reset_poll_data();
          if (get_variables()[0] === true) {
            generate_posts(true, "hot", null, null, search_text);
          } else if (get_variables()[0] === false) {
            generate_posts(false, "hot", null, null, search_text);
          }
        });
    }
  } else if (window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip === "text") {
    null_style("fa-fire-flame-curved");
  } else {
    highlight_filter("fa-fire-flame-curved");
    null_style("fa-sun");
    null_style("fa-table-list");
    null_style("fa-filter");
    $(".post").fadeOut(300, function () {});
    $(".post")
      .promise()
      .done(function () {
        $(".post").fadeOut(300, function () {});
        $(".post").not(":first").remove();
        reset_poll_data();
        if (get_variables()[0] === true) {
          generate_posts(true, "hot");
        } else {
          generate_posts(false, "hot");
        }
      });
  }
});

document.getElementById("recent").addEventListener("click", function () {
  let search_text = document.forms["search-box-container"]["search-text"].value;
  if (window.getComputedStyle(document.getElementsByClassName("fa-magnifying-glass")[0]).backgroundClip === "text") {
    if (window.getComputedStyle(document.getElementsByClassName("fa-sun")[0]).backgroundClip === "text") {
      null_style("fa-sun");
    } else {
      highlight_filter("fa-sun");
      null_style("fa-fire-flame-curved");
      null_style("fa-table-list");
      null_style("fa-filter");

      $(".post").fadeOut(300, function () {});
      $(".post")
        .promise()
        .done(function () {
          $(".post").fadeOut(300, function () {});
          $(".post").not(":first").remove();
          reset_poll_data();
          if (get_variables()[0] === true) {
            generate_posts(true, null, null, null, search_text);
          } else if (get_variables()[0] === false) {
            generate_posts(false, null, null, null, search_text);
          }
        });
    }
  } else if (window.getComputedStyle(document.getElementsByClassName("fa-sun")[0]).backgroundClip === "text") {
    null_style("fa-sun");
  } else {
    highlight_filter("fa-sun");
    null_style("fa-fire-flame-curved");
    null_style("fa-table-list");
    null_style("fa-filter");
    $(".post").fadeOut(300, function () {});
    $(".post")
      .promise()
      .done(function () {
        $(".post").fadeOut(300, function () {});
        $(".post").not(":first").remove();
        reset_poll_data();
        if (get_variables()[0] === true) {
          generate_posts(true);
        } else {
          generate_posts(false);
        }
      });
  }
});

document.getElementById("preferred-categories").addEventListener("click", function () {
  highlight_filter("fa-table-list");
  null_style("fa-fire-flame-curved");
  null_style("fa-sun");
  null_style("fa-filter");
  null_style("fa-magnifying-glass");
});

document.getElementById("filter").addEventListener("click", function () {
  highlight_filter("fa-filter");
  null_style("fa-fire-flame-curved");
  null_style("fa-sun");
  null_style("fa-table-list");
  null_style("fa-magnifying-glass");
});

document.getElementById("search").addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementsByClassName("fa-magnifying-glass")[0]).backgroundClip !== "text") {
    highlight_filter("fa-magnifying-glass");
    null_style("fa-filter");
    null_style("fa-table-list");
    $("#search-box-container").fadeIn(300, function () {});
  } else {
    null_style("fa-magnifying-glass");
    $("#search-box-container").fadeOut(300, function () {});
  }
});

//used to change default radius for location restricted voting
document.getElementsByClassName("fa-circle-chevron-right")[0].addEventListener("click", function () {
  let search_text = document.forms["search-box-container"]["search-text"].value;
  $(".post").fadeOut(300, function () {});
  $(".post")
    .promise()
    .done(function () {
      $(".post").fadeOut(300, function () {});
      $(".post").not(":first").remove();
      reset_poll_data();
      if (
        get_variables()[0] === true &&
        window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip === "text"
      ) {
        generate_posts(true, "hot", null, null, search_text);
      } else if (
        get_variables()[0] === true &&
        window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip !== "text"
      ) {
        generate_posts(true, null, null, null, search_text);
      } else if (
        get_variables()[0] === false &&
        window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip === "text"
      ) {
        generate_posts(false, "hot", null, null, search_text);
      } else if (
        get_variables()[0] === false &&
        window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip !== "text"
      ) {
        generate_posts(false, null, null, null, search_text);
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

document.getElementsByClassName("nav-element")[0].addEventListener("click", function () {
  $("#search-box-container").fadeOut(300, function () {});
});

document.getElementsByClassName("nav-element")[3].addEventListener("click", function () {
  $("#search-box-container").fadeOut(300, function () {});
});

document.getElementsByClassName("nav-element")[4].addEventListener("click", function () {
  $("#search-box-container").fadeOut(300, function () {});
});

document.getElementsByClassName("nav-element")[5].addEventListener("click", function () {
  $("#search-box-container").fadeOut(300, function () {});
});

document.getElementsByClassName("nav-element")[6].addEventListener("click", function () {
  $("#search-box-container").fadeOut(300, function () {});
});

document.getElementById("add-post-icon").addEventListener("click", function () {
  $("#search-box-container").fadeOut(300, function () {});
});
