import { generate_posts, reset_poll_data, get_variables } from "./index.js";

let preferred_categories = "1=1";

document.getElementById("hot").addEventListener("click", function (e) {
  if (window.getComputedStyle(document.getElementById("preferred-categories-container")).display !== "none") {
    return false;
  }
  let search_text = document.forms["search-box-container"]["search-text"].value;
  if (search_text.replace(/\s/g, "") === "") {
    search_text = null;
  }
  if (window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip === "text") {
    null_style("fa-fire-flame-curved");
  } else {
    highlight_filter("fa-fire-flame-curved");
    null_style("fa-sun");
    null_style("fa-filter");
    $(".post").fadeOut(300, function () {});
    $(".post")
      .promise()
      .done(function () {
        $(".post").not(":first").remove();
        reset_poll_data();
        generate_posts(get_variables()[0], "hot", preferred_categories, null, search_text, get_variables()[1]);
      });
  }
});

document.getElementById("recent").addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("preferred-categories-container")).display !== "none") {
    return false;
  }
  let search_text = document.forms["search-box-container"]["search-text"].value;
  if (search_text.replace(/\s/g, "") === "") {
    search_text = null;
  }
  if (window.getComputedStyle(document.getElementsByClassName("fa-sun")[0]).backgroundClip === "text") {
    null_style("fa-sun");
  } else {
    highlight_filter("fa-sun");
    null_style("fa-fire-flame-curved");
    null_style("fa-filter");
    $(".post").fadeOut(300, function () {});
    $(".post")
      .promise()
      .done(function () {
        $(".post").not(":first").remove();
        reset_poll_data();
        generate_posts(get_variables()[0], null, preferred_categories, null, search_text, get_variables()[1]);
      });
  }
});

document.getElementById("preferred-categories").addEventListener("click", function () {
  highlight_filter("fa-table-list");
  $("#preferred-categories-container").fadeIn(300, function () {});
});

document.getElementById("filter").addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("preferred-categories-container")).display !== "none") {
    return false;
  }
  highlight_filter("fa-filter");
  null_style("fa-fire-flame-curved");
  null_style("fa-sun");
  null_style("fa-magnifying-glass");
});

document.getElementById("search").addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("preferred-categories-container")).display !== "none") {
    return false;
  }
  if (window.getComputedStyle(document.getElementsByClassName("fa-magnifying-glass")[0]).backgroundClip !== "text") {
    highlight_filter("fa-magnifying-glass");
    null_style("fa-filter");
    $("#search-box-container").fadeIn(300, function () {});
  } else {
    document.forms["search-box-container"]["search-text"].value = "";
    null_style("fa-magnifying-glass");
    $("#search-box-container").fadeOut(300, function () {});
  }
});

//used to change default radius for location restricted voting
document.getElementsByClassName("fa-circle-chevron-right")[0].addEventListener("click", function () {
  if (window.getComputedStyle(document.getElementById("preferred-categories-container")).display !== "none") {
    return false;
  }
  let search_text = document.forms["search-box-container"]["search-text"].value;
  if (search_text.replace(/\s/g, "") === "") {
    search_text = null;
  }
  $(".post").fadeOut(300, function () {});
  $(".post")
    .promise()
    .done(function () {
      $(".post").not(":first").remove();
      reset_poll_data();
      if (window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip === "text") {
        generate_posts(get_variables()[0], "hot", preferred_categories, null, search_text, get_variables()[1]);
      } else {
        generate_posts(get_variables()[0], null, preferred_categories, null, search_text, get_variables()[1]);
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

document.getElementsByClassName("nav-element")[0].addEventListener("click", function (e) {
  clear_filters();
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

document.getElementById("categories-container").addEventListener(
  "click",
  (e) => {
    if (
      e.target.id !== "category-button" &&
      e.target.id !== "categories-container" &&
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

document.getElementById("category-button").addEventListener("click", function () {
  let search_text = document.forms["search-box-container"]["search-text"].value;
  if (search_text.replace(/\s/g, "") === "") {
    search_text = null;
  }
  let categories_counter = 0;
  $("#preferred-categories-container").fadeOut(300, function () {
    document.querySelectorAll(".category").forEach((category) => {
      let target_category_icon = category.getElementsByTagName("i")[0].classList[1];
      if (window.getComputedStyle(document.getElementsByClassName(target_category_icon)[0]).backgroundClip === "text") {
        categories_counter++;
        if (categories_counter === 1) {
          preferred_categories = "category_name LIKE " + "'" + category.innerText.toLowerCase() + "'";
        } else if (categories_counter > 1) {
          preferred_categories = preferred_categories + " OR category_name LIKE " + "'" + category.innerText.toLowerCase() + "'";
        }
      }
    });
    preferred_categories = "(" + preferred_categories + ")";
    if (categories_counter === 0) {
      preferred_categories = "1=1";
      null_style("fa-table-list");
    }
    if (window.getComputedStyle(document.getElementsByClassName("fa-fire-flame-curved")[0]).backgroundClip === "text") {
      $(".post").fadeOut(300, function () {});
      $(".post")
        .promise()
        .done(function () {
          $(".post").not(":first").remove();
          reset_poll_data();
          generate_posts(get_variables()[0], "hot", preferred_categories, null, search_text, get_variables()[1]);
        });
    } else {
      $(".post").fadeOut(300, function () {});
      $(".post")
        .promise()
        .done(function () {
          $(".post").not(":first").remove();
          reset_poll_data();
          generate_posts(get_variables()[0], null, preferred_categories, null, search_text, get_variables()[1]);
        });
    }
  });
});

function clear_filters() {
  $("#search-box-container").fadeOut(300, function () {});
  $("#preferred-categories-container").fadeOut(300, function () {});
  document.forms["search-box-container"]["search-text"].value = "";
  document.querySelectorAll(".category").forEach((category) => {
    null_style(category.getElementsByTagName("i")[0].classList[1]);
  });
  preferred_categories = "1=1";
}

window.addEventListener("click", function (e) {
  if (
    !document.getElementById("preferred-categories-container").contains(e.target) &&
    window.getComputedStyle(document.getElementById("preferred-categories-container")).opacity === "1"
  ) {
    $("#preferred-categories-container").fadeOut(300, function () {
      document.querySelectorAll(".category").forEach((category) => {
        null_style(category.getElementsByTagName("i")[0].classList[1]);
      });
      null_style("fa-table-list");
    });
  }
});
