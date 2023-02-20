<?php

session_start();

$jsonString = file_get_contents('php://input');
$data = json_decode($jsonString, true);

if ($data['request'] == "request_username") {
    echo $_SESSION["username"];
} else if ($data['request'] == "user_status") {
    if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
        echo "false";
    } else if ($_SESSION["role"] == "admin") {
        echo "admin";
    }
} else if ($data["request"] == "username_change" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true) {
    require_once "old_config.php";
    $new_username = $data['username'];

    $sql = "SELECT username FROM user WHERE username = ?";

    if ($stmt = mysqli_prepare($conn, $sql)) {
        mysqli_stmt_bind_param($stmt, "s", $new_username);

        if (mysqli_stmt_execute($stmt)) {
            mysqli_stmt_store_result($stmt);
            if (mysqli_stmt_num_rows($stmt) == 1) {
                echo "Username Unavailable!";
                mysqli_stmt_close($stmt);
            } else {
                mysqli_stmt_close($stmt);

                $sql = "SELECT id, username, password, role FROM user WHERE username = ?";
                if ($stmt = mysqli_prepare($conn, $sql)) {
                    mysqli_stmt_bind_param($stmt, "s", $_SESSION['username']);

                    if (mysqli_stmt_execute($stmt)) {
                        mysqli_stmt_store_result($stmt);
                        if (mysqli_stmt_num_rows($stmt) == 1) {
                            mysqli_stmt_bind_result($stmt, $id, $username, $hashed_password, $role);
                            if (mysqli_stmt_fetch($stmt)) {
                                if (password_verify($data['password'], $hashed_password)) {
                                    mysqli_stmt_close($stmt);

                                    $sql = "UPDATE user SET username = ? WHERE id = ?";

                                    if ($stmt = mysqli_prepare($conn, $sql)) {
                                        // Bind variables to the prepared statement as parameters
                                        mysqli_stmt_bind_param($stmt, "si", $data['username'], $_SESSION['id']);
                                        // Attempt to execute the prepared statement
                                        if (mysqli_stmt_execute($stmt)) {
                                            // Username updated successfully. Destroy the session, and redirect to login page
                                            $_SESSION["username"] = $data['username'];
                                            echo "Success";
                                        } else {
                                            echo "Oops! Something went wrong. Please try again later.";
                                        }
                                        // Close statement
                                        mysqli_stmt_close($stmt);
                                    }
                                } else {
                                    echo "Incorrect Password!";
                                }
                            }
                        }
                    }
                }
            }
        } else {
            echo "Oops! Something went wrong. Please try again later.";
        }

        // Close statement
        mysqli_close($conn);
    }
} else if ($data["request"] == "password_change" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true) {
    require_once "old_config.php";

    $sql = "SELECT password FROM user WHERE username = ?";

    if ($stmt = mysqli_prepare($conn, $sql)) {
        mysqli_stmt_bind_param($stmt, "s", $_SESSION['username']);

        if (mysqli_stmt_execute($stmt)) {
            mysqli_stmt_store_result($stmt);
            if (mysqli_stmt_num_rows($stmt) == 1) {
                mysqli_stmt_bind_result($stmt, $hashed_password);
                if (mysqli_stmt_fetch($stmt)) {
                    if (password_verify($data['current_password'], $hashed_password)) {
                        mysqli_stmt_close($stmt);
                        $sql = "UPDATE user SET password = ? WHERE id = ?";
                        if ($stmt = mysqli_prepare($conn, $sql)) {
                            mysqli_stmt_bind_param($stmt, "si", $param_password, $_SESSION['id']);
                            $param_password = password_hash($data["new_password"], PASSWORD_DEFAULT);
                            if (mysqli_stmt_execute($stmt)) {
                                echo "Success";
                            } else {
                                echo "Oops! Something went wrong. Please try again later.";
                            }
                            // Close statement
                            mysqli_stmt_close($stmt);
                        }
                    } else {
                        echo "Incorrect Password!";
                    }
                }
            }
        }
    } else {
        echo "Oops! Something went wrong. Please try again later.";
    }

    // Close statement
    mysqli_close($conn);
} else if ($data['request'] == "upload_post_data" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true) {
    require_once "new_config.php";
    $post_text = $data['question'];
    $poll_type = $data['poll_choice'];
    date_default_timezone_set('Europe/Athens');
    $param_date = date('Y/m/d H:i:s', time());

    if ($poll_type == "yes-no") {
        $param_poll_type = 1;
    } elseif ($poll_type == "rating") {
        $param_poll_type = 2;
    } elseif ($poll_type == "approval") {
        $param_poll_type = 3;
    } elseif ($poll_type == "ranking") {
        $param_poll_type = 4;
    }
    if ($data['time_limiter'] == "") {
        $data['time_limiter'] = null;
    }
    if (!isset($data['event_lat'])) {
        $data['event_lat'] = null;
        $data['event_long'] = null;
    }

    if (count($data['poll_choices_options']) > 0) {
        $poll_choices_options = $data['poll_choices_options'];
        for ($i = 0; $i < 20; $i++) {
            if ($i + 1 > count($data['poll_choices_options'])) {
                array_push($poll_choices_options, null);
            }
        }
        $stmt = $conn->prepare("INSERT INTO posts (user_id, poll_type, post_category, post_text, post_date, post_expiration_date, event_lat, event_long, event_radius,
        choice_one_name, choice_two_name, choice_three_name, choice_four_name, choice_five_name, choice_six_name, choice_seven_name, choice_eight_name, choice_nine_name,
        choice_ten_name, choice_eleven_name, choice_twelve_name, choice_thirteen_name, choice_fourteen_name, choice_fifteen_name, choice_sixteen_name, 
        choice_seventeen_name, choice_eighteen_name, choice_nineteen_name, choice_twenty_name) 
        VALUES (:users_id, :poll_type, :post_category, :post_text, :post_date, :post_expiration_date, :event_lat, :event_long, :event_radius, :choice_one, :choice_two,
        :choice_three, :choice_four, :choice_five, :choice_six, :choice_seven, :choice_eight, :choice_nine, :choice_ten, :choice_eleven, :choice_twelve, :choice_thirteen,
        :choice_fourteen, :choice_fifteen, :choice_sixteen, :choice_seventeen, :choice_eighteen, :choice_nineteen, :choice_twenty)");
        $stmt->execute([
            ":users_id" => $_SESSION["id"], ":poll_type" => $param_poll_type, ":post_category" => $data['post_category'], ":post_text" => $post_text,
            ":post_date" => $param_date, ":post_expiration_date" => $data['time_limiter'], ":event_lat" => $data['event_lat'], ":event_long" => $data['event_long'],
            ":event_radius" => $data['event_rad'], ":choice_one" => $poll_choices_options[0], ":choice_two" => $poll_choices_options[1],
            ":choice_three" => $poll_choices_options[2], ":choice_four" => $poll_choices_options[3], ":choice_five" => $poll_choices_options[4],
            ":choice_six" => $poll_choices_options[5], ":choice_seven" => $poll_choices_options[6], ":choice_eight" => $poll_choices_options[7],
            ":choice_nine" => $poll_choices_options[8], ":choice_ten" => $poll_choices_options[9], ":choice_eleven" => $poll_choices_options[10],
            ":choice_twelve" => $poll_choices_options[11], ":choice_thirteen" => $poll_choices_options[12], ":choice_fourteen" => $poll_choices_options[13],
            ":choice_fifteen" => $poll_choices_options[14], ":choice_sixteen" => $poll_choices_options[15], ":choice_seventeen" => $poll_choices_options[16],
            ":choice_eighteen" => $poll_choices_options[17], ":choice_nineteen" => $poll_choices_options[18], ":choice_twenty" => $poll_choices_options[19]
        ]);
    } else {
        $stmt = $conn->prepare("INSERT INTO posts (user_id, poll_type, post_category, post_text, post_date, post_expiration_date, event_lat, event_long, event_radius) 
        VALUES (:users_id, :poll_type, :post_category, :post_text, :post_date, :post_expiration_date, :event_lat, :event_long, :event_radius)");
        $stmt->execute([
            ":users_id" => $_SESSION["id"], ":poll_type" => $param_poll_type, ":post_category" => $data['post_category'], ":post_text" => $post_text,
            ":post_date" => $param_date, ":post_expiration_date" => $data['time_limiter'], ":event_lat" => $data['event_lat'], ":event_long" => $data['event_long'],
            ":event_radius" => $data['event_rad']
        ]);
    }

    $stmt = $conn->prepare("SELECT posts.post_number AS post_number, user.username AS username, polls.poll_id AS poll_id, categories.category_name AS category_name,
                    posts.post_text AS post_text, sum(chevron_vote.chevron_result) AS chevron_result, posts.post_date AS post_date, 
                    COALESCE((SELECT chevron_vote.chevron_result FROM chevron_vote WHERE chevron_vote.user_id=:id AND chevron_vote.post_id=posts.post_number),0) AS user_chevron_result,
                    COALESCE((SELECT yes_no.answer_yes FROM yes_no WHERE yes_no.user_id=:id AND yes_no.post_id=posts.post_number),0) AS user_yes_answer,
                    COALESCE((SELECT yes_no.answer_no FROM yes_no WHERE yes_no.user_id=:id AND yes_no.post_id=posts.post_number),0) AS user_no_answer,
                    COALESCE((SELECT bookmarks.user_bookmark FROM bookmarks WHERE bookmarks.user_id=:id AND bookmarks.post_id=posts.post_number),0) AS user_bookmark,
                    posts.post_expiration_date AS post_expiration_date, posts.event_lat AS event_lat, posts.event_long AS event_long, posts.event_radius AS event_radius,
                    (posts_yes_no_info.number_of_yes-posts_yes_no_info.number_of_no) AS post_vote_result
                    FROM posts join user on posts.user_id = user.id join polls on posts.poll_type = polls.poll_id join categories
                    on posts.post_category = categories.category_id join chevron_vote ON posts.post_number = chevron_vote.post_id 
                    join posts_yes_no_info ON posts.post_number=posts_yes_no_info.post_number
                    WHERE posts.user_id = :id AND posts.post_date = :post_date");

    $stmt->execute([":id" => $_SESSION["id"], "post_date" => $param_date]);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $new_data =
            array(
                $row["post_number"], $row["username"], $row["poll_id"], $row["category_name"], $row["post_text"], $row["chevron_result"],
                $row["post_date"], $row["user_chevron_result"], $row["user_yes_answer"], $row["user_no_answer"], $row["user_bookmark"], $row["post_expiration_date"],
                $row["event_lat"], $row["event_long"], $row["event_radius"], $row["post_vote_result"], $_SESSION["username"]
            );
    }
    echo json_encode($new_data);
} else if ($data['request'] == "get_post_data") {
    require "new_config.php";
    $post_data = array();

    if (!isset($data["user_search"])) {
        $user_search = "%";
    } else {
        $user_search = str_replace(["=", "%", "_"], ["==", "=%", "=_"], $data["user_search"]);
    }

    if (!isset($data["filter_preferred_categories"])) {
        $filter_preferred_categories = ".";
    } else {
        for ($i = 0; $i < count($data["filter_preferred_categories"]); $i++) {
            if ($i == 0) {
                $filter_preferred_categories = $data["filter_preferred_categories"][$i];
            } else {
                $filter_preferred_categories .= "|" . $data["filter_preferred_categories"][$i];
            }
        }
    }

    if (!isset($data["filter_search"])) {
        $filter_search = "%";
    } else {
        $filter_search = str_replace(["=", "%", "_"], ["==", "=%", "=_"], $data["filter_search"]);
        $filter_search = "%" . $filter_search . "%";
    }

    if (!isset($data["filter_filter"][0])) {
        $filter_filter_time = array("2020-01-01 00:00", "2090-01-01 00:00");
    } else {
        $filter_filter_time = explode(",", $data["filter_filter"][0]);
    }

    if (!isset($data["filter_filter"][1])) {
        $filter_filter_poll_type = ".";
    } else {
        for ($i = 0; $i < count($data["filter_filter"][1]); $i++) {
            if ($i == 0) {
                $filter_filter_poll_type = $data["filter_filter"][1][$i];
            } else {
                $filter_filter_poll_type .= "|" . $data["filter_filter"][1][$i];
            }
        }
    }

    if (!isset($data["filter_filter"][2])) {
        $filter_filter_user = "%";
    } else {
        $filter_filter_user = str_replace(["=", "%", "_"], ["==", "=%", "=_"], $data["filter_filter"][2]);
        $filter_filter_user = "%" .  $filter_filter_user . "%";
    }

    date_default_timezone_set('Europe/Athens');
    $current_datetime = date('Y-m-d H:i:s', time());
    if (!isset($data["filter_filter"][3])) {
        $filter_filter_poll_status = "1=1";
    } else if ($data["filter_filter"][3] == "1") {
        $filter_filter_poll_status = "(posts.post_expiration_date IS NULL OR posts.post_expiration_date > " . "'" . $current_datetime . "')";
    } else if ($data["filter_filter"][3] == "2") {
        $filter_filter_poll_status = "posts.post_expiration_date < " . "'" . $current_datetime . "'";
    }

    if (!isset($data["radius_filter"])) {
        $filter_radius_filter = "1=1";
    } else {
        $filter_radius_filter = "(posts.event_radius IS NULL OR FLOOR(ST_Distance_Sphere(point(:user_long, :user_lat),point(posts.event_long, posts.event_lat)))<=posts.event_radius)";
    }

    if (!isset($data["posts_in_region_filter"])) {
        $posts_in_region_filter = ".";
    } else {
        if (count($data["posts_in_region_filter"]) == 0) {
            $posts_in_region_filter = "zero";
        } else if (count($data["posts_in_region_filter"]) > 0) {
            $posts_in_region_filter = "";
            for ($i = 0; $i < count($data["posts_in_region_filter"]); $i++) {
                if (count($data["posts_in_region_filter"]) == 1) {
                    $posts_in_region_filter .= "[[:<:]]" . $data["posts_in_region_filter"][$i] . "[[:>:]]";
                } else if (count($data["posts_in_region_filter"]) > 1 && $i < count($data["posts_in_region_filter"]) - 1) {
                    $posts_in_region_filter .= "[[:<:]]" . $data["posts_in_region_filter"][$i] . "[[:>:]]|";
                } else if (count($data["posts_in_region_filter"]) > 1 && $i == count($data["posts_in_region_filter"]) - 1) {
                    $posts_in_region_filter .= "[[:<:]]" . $data["posts_in_region_filter"][$i] . "[[:>:]]";
                }
            }
        }
    }

    if (isset($_SESSION['id'])) {
        if ($data["bookmarks_only"] == false) {
            if (isset($data["filter_hot"]) && $data["filter_hot"] == "hot") {
                $stmt = $conn->prepare("SELECT posts.post_number AS post_number, user.username AS username, polls.poll_id AS poll_id, categories.category_name AS category_name,
                    posts.post_text AS post_text, (SELECT sum(chevron_vote.chevron_result) FROM chevron_vote WHERE chevron_vote.post_id=posts.post_number) AS chevron_result,
                    posts.post_date AS post_date, 
                    COALESCE((SELECT chevron_vote.chevron_result FROM chevron_vote WHERE chevron_vote.user_id=:id AND chevron_vote.post_id=posts.post_number),0) AS user_chevron_result,
                    COALESCE((SELECT yes_no.answer_yes FROM yes_no WHERE yes_no.user_id=:id AND yes_no.post_id=posts.post_number),0) AS user_yes_answer,
                    COALESCE((SELECT yes_no.answer_no FROM yes_no WHERE yes_no.user_id=:id AND yes_no.post_id=posts.post_number),0) AS user_no_answer,
                    COALESCE((SELECT bookmarks.user_bookmark FROM bookmarks WHERE bookmarks.user_id=:id AND bookmarks.post_id=posts.post_number),0) AS user_bookmark,
                    posts.post_expiration_date AS post_expiration_date, posts.event_lat AS event_lat, posts.event_long AS event_long, posts.event_radius AS event_radius,
                    (posts_yes_no_info.number_of_yes-posts_yes_no_info.number_of_no) AS post_vote_result
                    FROM posts join user on posts.user_id = user.id join polls on posts.poll_type = polls.poll_id join categories
                    on posts.post_category = categories.category_id join chevron_vote ON posts.post_number = chevron_vote.post_id 
                    join posts_yes_no_info ON posts.post_number=posts_yes_no_info.post_number
                    WHERE user.username LIKE :username ESCAPE '=' AND categories.category_name RLIKE :category_name AND posts.post_text LIKE :filter_search ESCAPE '=' 
                    AND (posts.post_date BETWEEN :first_date AND :second_date) AND polls.poll_id RLIKE :filter_poll_type AND user.username LIKE :filter_username ESCAPE '=' 
                    AND $filter_filter_poll_status AND $filter_radius_filter AND posts.post_number RLIKE :posts_in_region_filter
                    GROUP BY posts.post_number ORDER BY chevron_result DESC, posts.post_date DESC");
            } else {
                $stmt = $conn->prepare("SELECT posts.post_number AS post_number, user.username AS username, polls.poll_id AS poll_id, categories.category_name AS category_name,
                    posts.post_text AS post_text, (SELECT sum(chevron_vote.chevron_result) FROM chevron_vote WHERE chevron_vote.post_id=posts.post_number) AS chevron_result, 
                    posts.post_date AS post_date, 
                    COALESCE((SELECT chevron_vote.chevron_result FROM chevron_vote WHERE chevron_vote.user_id=:id AND chevron_vote.post_id=posts.post_number),0) AS user_chevron_result,
                    COALESCE((SELECT yes_no.answer_yes FROM yes_no WHERE yes_no.user_id=:id AND yes_no.post_id=posts.post_number),0) AS user_yes_answer,
                    COALESCE((SELECT yes_no.answer_no FROM yes_no WHERE yes_no.user_id=:id AND yes_no.post_id=posts.post_number),0) AS user_no_answer,
                    COALESCE((SELECT bookmarks.user_bookmark FROM bookmarks WHERE bookmarks.user_id=:id AND bookmarks.post_id=posts.post_number),0) AS user_bookmark,
                    posts.post_expiration_date AS post_expiration_date, posts.event_lat AS event_lat, posts.event_long AS event_long, posts.event_radius AS event_radius,
                    (posts_yes_no_info.number_of_yes-posts_yes_no_info.number_of_no) AS post_vote_result
                    FROM posts join user on posts.user_id = user.id join polls on posts.poll_type = polls.poll_id join categories
                    on posts.post_category = categories.category_id join chevron_vote ON posts.post_number = chevron_vote.post_id 
                    join posts_yes_no_info ON posts.post_number=posts_yes_no_info.post_number
                    WHERE user.username LIKE :username ESCAPE '=' AND categories.category_name RLIKE :category_name AND posts.post_text LIKE :filter_search ESCAPE '=' 
                    AND (posts.post_date BETWEEN :first_date AND :second_date) AND polls.poll_id RLIKE :filter_poll_type AND user.username LIKE :filter_username ESCAPE '=' 
                    AND $filter_filter_poll_status AND $filter_radius_filter AND posts.post_number RLIKE :posts_in_region_filter
                    GROUP BY posts.post_number ORDER BY posts.post_date DESC");
            }
        } else if ($data["bookmarks_only"] == true) {
            if (isset($data["filter_hot"]) && $data["filter_hot"] == "hot") {
                $stmt = $conn->prepare("SELECT posts.post_number AS post_number, user.username AS username, polls.poll_id AS poll_id, categories.category_name AS category_name,
                    posts.post_text AS post_text, (SELECT sum(chevron_vote.chevron_result) FROM chevron_vote WHERE chevron_vote.post_id=posts.post_number) AS chevron_result,
                    posts.post_date AS post_date, 
                    COALESCE((SELECT chevron_vote.chevron_result FROM chevron_vote WHERE chevron_vote.user_id=:id AND chevron_vote.post_id=posts.post_number),0) AS user_chevron_result,
                    COALESCE((SELECT yes_no.answer_yes FROM yes_no WHERE yes_no.user_id=:id AND yes_no.post_id=posts.post_number),0) AS user_yes_answer,
                    COALESCE((SELECT yes_no.answer_no FROM yes_no WHERE yes_no.user_id=:id AND yes_no.post_id=posts.post_number),0) AS user_no_answer,
                    COALESCE((SELECT bookmarks.user_bookmark FROM bookmarks WHERE bookmarks.user_id=:id AND bookmarks.post_id=posts.post_number),0) AS user_bookmark,
                    posts.post_expiration_date AS post_expiration_date, posts.event_lat AS event_lat, posts.event_long AS event_long, posts.event_radius AS event_radius,
                    (posts_yes_no_info.number_of_yes-posts_yes_no_info.number_of_no) AS post_vote_result
                    FROM posts join user on posts.user_id = user.id join polls on posts.poll_type = polls.poll_id join categories 
                    on posts.post_category = categories.category_id join chevron_vote ON posts.post_number = chevron_vote.post_id
                    join posts_yes_no_info ON posts.post_number=posts_yes_no_info.post_number
                    WHERE COALESCE((SELECT bookmarks.user_bookmark FROM bookmarks WHERE bookmarks.user_id=:id AND bookmarks.post_id=posts.post_number),0) = 1 
                    AND user.username LIKE :username ESCAPE '=' AND categories.category_name RLIKE :category_name AND posts.post_text LIKE :filter_search ESCAPE '=' 
                    AND (posts.post_date BETWEEN :first_date AND :second_date) AND polls.poll_id RLIKE :filter_poll_type AND user.username LIKE :filter_username ESCAPE '=' 
                    AND $filter_filter_poll_status AND $filter_radius_filter AND posts.post_number RLIKE :posts_in_region_filter
                    GROUP BY posts.post_number ORDER BY chevron_result DESC, posts.post_date DESC");
            } else {
                $stmt = $conn->prepare("SELECT posts.post_number AS post_number, user.username AS username, polls.poll_id AS poll_id, categories.category_name AS category_name,
                    posts.post_text AS post_text, (SELECT sum(chevron_vote.chevron_result) FROM chevron_vote WHERE chevron_vote.post_id=posts.post_number) AS chevron_result,
                    posts.post_date AS post_date, 
                    COALESCE((SELECT chevron_vote.chevron_result FROM chevron_vote WHERE chevron_vote.user_id=:id AND chevron_vote.post_id=posts.post_number),0) AS user_chevron_result,
                    COALESCE((SELECT yes_no.answer_yes FROM yes_no WHERE yes_no.user_id=:id AND yes_no.post_id=posts.post_number),0) AS user_yes_answer,
                    COALESCE((SELECT yes_no.answer_no FROM yes_no WHERE yes_no.user_id=:id AND yes_no.post_id=posts.post_number),0) AS user_no_answer,
                    COALESCE((SELECT bookmarks.user_bookmark FROM bookmarks WHERE bookmarks.user_id=:id AND bookmarks.post_id=posts.post_number),0) AS user_bookmark,
                    posts.post_expiration_date AS post_expiration_date, posts.event_lat AS event_lat, posts.event_long AS event_long, posts.event_radius AS event_radius,
                    (posts_yes_no_info.number_of_yes-posts_yes_no_info.number_of_no) AS post_vote_result
                    FROM posts join user on posts.user_id = user.id join polls on posts.poll_type = polls.poll_id join categories 
                    on posts.post_category = categories.category_id join chevron_vote ON posts.post_number = chevron_vote.post_id
                    join posts_yes_no_info ON posts.post_number=posts_yes_no_info.post_number
                    WHERE COALESCE((SELECT bookmarks.user_bookmark FROM bookmarks WHERE bookmarks.user_id=:id AND bookmarks.post_id=posts.post_number),0) = 1 
                    AND user.username LIKE :username ESCAPE '=' AND categories.category_name RLIKE :category_name AND posts.post_text LIKE :filter_search ESCAPE '=' 
                    AND (posts.post_date BETWEEN :first_date AND :second_date) AND polls.poll_id RLIKE :filter_poll_type AND user.username LIKE :filter_username ESCAPE '=' 
                    AND $filter_filter_poll_status AND $filter_radius_filter AND posts.post_number RLIKE :posts_in_region_filter
                    GROUP BY posts.post_number ORDER BY posts.post_date DESC");
            }
        }

        if (!isset($data["radius_filter"])) {
            $stmt->execute([
                ":id" => $_SESSION["id"], ":username" => $user_search, ":category_name" => $filter_preferred_categories, ":filter_search" => $filter_search,
                ":first_date" => $filter_filter_time[0], ":second_date" => $filter_filter_time[1], ":filter_poll_type" => $filter_filter_poll_type,
                ":filter_username" => $filter_filter_user, ":posts_in_region_filter" => $posts_in_region_filter
            ]);
        } else {
            $stmt->execute([
                ":id" => $_SESSION["id"], ":username" => $user_search, ":category_name" => $filter_preferred_categories, ":filter_search" => $filter_search,
                ":first_date" => $filter_filter_time[0], ":second_date" => $filter_filter_time[1], ":filter_poll_type" => $filter_filter_poll_type,
                ":filter_username" => $filter_filter_user, ":user_long" => $data["radius_filter"][0], ":user_lat" => $data["radius_filter"][1],
                ":posts_in_region_filter" => $posts_in_region_filter
            ]);
        }
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tmp = array(
                $row["post_number"], $row["username"], $row["poll_id"], $row["category_name"], $row["post_text"], $row["chevron_result"],
                $row["post_date"], $row["user_chevron_result"], $row["user_yes_answer"], $row["user_no_answer"], $row["user_bookmark"], $row["post_expiration_date"],
                $row["event_lat"], $row["event_long"], $row["event_radius"], $row["post_vote_result"], $_SESSION["username"]
            );
            array_push($post_data, $tmp);
        }
        echo json_encode($post_data);
    } else {
        if (isset($data["filter_hot"]) && $data["filter_hot"] == "hot") {
            $stmt = $conn->prepare("SELECT posts_info.post_number AS post_number,posts_info.username AS username,poll_id,posts_info.category_name AS category_name,
            posts_info.post_text AS post_text,chevron_result,posts_info.post_date AS post_date,posts_info.post_expiration_date, 
            (posts_yes_no_info.number_of_yes-posts_yes_no_info.number_of_no) AS post_vote_result, posts.event_lat AS event_lat, posts.event_long AS event_long, 
            posts.event_radius AS event_radius
            FROM posts_info INNER JOIN posts_yes_no_info ON posts_info.post_number=posts_yes_no_info.post_number INNER JOIN posts ON posts_info.post_number=posts.post_number
            WHERE posts_info.username LIKE :username ESCAPE '=' AND posts_info.category_name RLIKE :category_name AND posts_info.post_text LIKE :filter_search ESCAPE '=' 
            AND (posts_info.post_date BETWEEN :first_date AND :second_date) AND poll_id RLIKE :filter_poll_type AND posts_info.username LIKE :filter_username ESCAPE '=' 
            AND $filter_filter_poll_status AND $filter_radius_filter AND posts.post_number RLIKE :posts_in_region_filter ORDER BY chevron_result DESC, posts.post_date DESC");
        } else {
            $stmt = $conn->prepare("SELECT posts_info.post_number AS post_number,posts_info.username AS username,poll_id,posts_info.category_name AS category_name,
            posts_info.post_text AS post_text,chevron_result,posts_info.post_date AS post_date,posts_info.post_expiration_date, 
            (posts_yes_no_info.number_of_yes-posts_yes_no_info.number_of_no) AS post_vote_result, posts.event_lat AS event_lat, posts.event_long AS event_long, 
            posts.event_radius AS event_radius
            FROM posts_info INNER JOIN posts_yes_no_info ON posts_info.post_number=posts_yes_no_info.post_number INNER JOIN posts ON posts_info.post_number=posts.post_number
            WHERE posts_info.username LIKE :username ESCAPE '=' AND posts_info.category_name RLIKE :category_name AND posts_info.post_text LIKE :filter_search ESCAPE '=' 
            AND (posts_info.post_date BETWEEN :first_date AND :second_date) AND poll_id RLIKE :filter_poll_type AND posts_info.username LIKE :filter_username ESCAPE '=' 
            AND $filter_filter_poll_status AND $filter_radius_filter AND posts.post_number RLIKE :posts_in_region_filter ORDER BY posts.post_date DESC");
        }

        if (!isset($data["radius_filter"])) {
            $stmt->execute([
                ":username" => $user_search, ":category_name" => $filter_preferred_categories, ":filter_search" => $filter_search,
                ":first_date" => $filter_filter_time[0], ":second_date" => $filter_filter_time[1], ":filter_poll_type" => $filter_filter_poll_type,
                ":filter_username" => $filter_filter_user, ":posts_in_region_filter" => $posts_in_region_filter
            ]);
        } else {
            $stmt->execute([
                ":username" => $user_search, ":category_name" => $filter_preferred_categories, ":filter_search" => $filter_search,
                ":first_date" => $filter_filter_time[0], ":second_date" => $filter_filter_time[1], ":filter_poll_type" => $filter_filter_poll_type,
                ":filter_username" => $filter_filter_user, ":user_long" => $data["radius_filter"][0], ":user_lat" => $data["radius_filter"][1],
                ":posts_in_region_filter" => $posts_in_region_filter
            ]);
        }
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tmp = array(
                $row["post_number"], $row["username"], $row["poll_id"], $row["category_name"], $row["post_text"], $row["chevron_result"], $row["post_date"], $row["post_expiration_date"],
                $row["post_vote_result"], $row["event_lat"], $row["event_long"], $row["event_radius"]
            );
            array_push($post_data, $tmp);
        }
        echo json_encode($post_data);
    }
} else if ($data['request'] == "chevron_vote" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true) {
    require_once "new_config.php";

    if ($data['direction'] == "up" && $data['previous_vote'] == "up") {
        $stmt = $conn->prepare("UPDATE chevron_vote SET chevron_result = 0 WHERE post_id=:post_id AND user_id=:id");
        $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
        echo "Success";
    } else if ($data['direction'] == "up" && $data['previous_vote'] == "down") {
        $stmt = $conn->prepare("UPDATE chevron_vote SET chevron_result = 1 WHERE post_id=:post_id AND user_id=:id");
        $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
        echo "Success";
    } else if ($data['direction'] == "up" && $data['previous_vote'] == "no") {
        $stmt = $conn->prepare("SELECT post_id,user_id FROM chevron_vote WHERE post_id=:post_id AND user_id=:id");
        $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
        if ($stmt->rowCount() > 0) {
            $stmt = $conn->prepare("UPDATE chevron_vote SET chevron_result = 1 WHERE post_id=:post_id AND user_id=:id");
            $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
            echo "Success";
        } else if ($stmt->rowCount() == 0) {
            $stmt = $conn->prepare("INSERT INTO chevron_vote(post_id,user_id,chevron_result) VALUES (:post_id,:id,1)");
            $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
            echo "Success";
        }
    } else if ($data['direction'] == "down" && $data['previous_vote'] == "down") {
        $stmt = $conn->prepare("UPDATE chevron_vote SET chevron_result = 0 WHERE post_id=:post_id AND user_id=:id");
        $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
        echo "Success";
    } else if ($data['direction'] == "down" && $data['previous_vote'] == "up") {
        $stmt = $conn->prepare("UPDATE chevron_vote SET chevron_result = -1 WHERE post_id=:post_id AND user_id=:id");
        $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
        echo "Success";
    } else if ($data['direction'] == "down" && $data['previous_vote'] == "no") {
        $stmt = $conn->prepare("SELECT post_id,user_id FROM chevron_vote WHERE post_id=:post_id AND user_id=:id");
        $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
        if ($stmt->rowCount() > 0) {
            $stmt = $conn->prepare("UPDATE chevron_vote SET chevron_result = -1 WHERE post_id=:post_id AND user_id=:id");
            $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
            echo "Success";
        } else if ($stmt->rowCount() == 0) {
            $stmt = $conn->prepare("INSERT INTO chevron_vote(post_id,user_id,chevron_result) VALUES (:post_id,:id,-1)");
            $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
            echo "Success";
        }
    }
} else if ($data['request'] == "yes_no_vote" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true) {
    require_once "new_config.php";

    if ($data['current_vote'] == "yes" && $data['previous_vote'] == "yes") {
        $stmt = $conn->prepare("UPDATE yes_no SET answer_yes = 0 WHERE post_id=:post_id AND user_id=:id");
        $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
        $stmt = $conn->prepare("SELECT number_of_yes, number_of_no FROM posts_yes_no_info WHERE post_number=:post_id");
        $stmt->execute([":post_id" => $data["post_id"]]);
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $yes_no_tmp = array($row["number_of_yes"], $row["number_of_no"], "Success");
        }
        echo json_encode($yes_no_tmp);
    } else if ($data['current_vote'] == "yes" && $data['previous_vote'] == "no") {
        $stmt = $conn->prepare("UPDATE yes_no SET answer_yes = 1, answer_no=0 WHERE post_id=:post_id AND user_id=:id");
        $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
        $stmt = $conn->prepare("SELECT number_of_yes, number_of_no FROM posts_yes_no_info WHERE post_number=:post_id");
        $stmt->execute([":post_id" => $data["post_id"]]);
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $yes_no_tmp = array($row["number_of_yes"], $row["number_of_no"], "Success");
        }
        echo json_encode($yes_no_tmp);
    } else if ($data['current_vote'] == "yes" && $data['previous_vote'] == "nothing") {
        $stmt = $conn->prepare("SELECT post_id,user_id FROM yes_no WHERE post_id=:post_id AND user_id=:id");
        $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
        if ($stmt->rowCount() > 0) {
            $stmt = $conn->prepare("UPDATE yes_no SET answer_yes = 1 WHERE post_id=:post_id AND user_id=:id");
            $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
            $stmt = $conn->prepare("SELECT number_of_yes, number_of_no FROM posts_yes_no_info WHERE post_number=:post_id");
            $stmt->execute([":post_id" => $data["post_id"]]);
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $yes_no_tmp = array($row["number_of_yes"], $row["number_of_no"], "Success");
            }
            echo json_encode($yes_no_tmp);
        } else if ($stmt->rowCount() == 0) {
            $stmt = $conn->prepare("INSERT INTO yes_no(post_id,user_id,poll_type,answer_yes,answer_no) VALUES (:post_id,:id,1,1,0)");
            $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
            $stmt = $conn->prepare("SELECT number_of_yes, number_of_no FROM posts_yes_no_info WHERE post_number=:post_id");
            $stmt->execute([":post_id" => $data["post_id"]]);
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $yes_no_tmp = array($row["number_of_yes"], $row["number_of_no"], "Success");
            }
            echo json_encode($yes_no_tmp);
        }
    } else if ($data['current_vote'] == "no" && $data['previous_vote'] == "no") {
        $stmt = $conn->prepare("UPDATE yes_no SET answer_no = 0 WHERE post_id=:post_id AND user_id=:id");
        $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
        $stmt = $conn->prepare("SELECT number_of_yes, number_of_no FROM posts_yes_no_info WHERE post_number=:post_id");
        $stmt->execute([":post_id" => $data["post_id"]]);
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $yes_no_tmp = array($row["number_of_yes"], $row["number_of_no"], "Success");
        }
        echo json_encode($yes_no_tmp);
    } else if ($data['current_vote'] == "no" && $data['previous_vote'] == "yes") {
        $stmt = $conn->prepare("UPDATE yes_no SET answer_yes = 0, answer_no=1 WHERE post_id=:post_id AND user_id=:id");
        $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
        $stmt = $conn->prepare("SELECT number_of_yes, number_of_no FROM posts_yes_no_info WHERE post_number=:post_id");
        $stmt->execute([":post_id" => $data["post_id"]]);
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $yes_no_tmp = array($row["number_of_yes"], $row["number_of_no"], "Success");
        }
        echo json_encode($yes_no_tmp);
    } else if ($data['current_vote'] == "no" && $data['previous_vote'] == "nothing") {
        $stmt = $conn->prepare("SELECT post_id,user_id FROM yes_no WHERE post_id=:post_id AND user_id=:id");
        $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
        if ($stmt->rowCount() > 0) {
            $stmt = $conn->prepare("UPDATE yes_no SET answer_no = 1 WHERE post_id=:post_id AND user_id=:id");
            $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
            $stmt = $conn->prepare("SELECT number_of_yes, number_of_no FROM posts_yes_no_info WHERE post_number=:post_id");
            $stmt->execute([":post_id" => $data["post_id"]]);
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $yes_no_tmp = array($row["number_of_yes"], $row["number_of_no"], "Success");
            }
            echo json_encode($yes_no_tmp);
        } else if ($stmt->rowCount() == 0) {
            $stmt = $conn->prepare("INSERT INTO yes_no(post_id,user_id,poll_type,answer_yes,answer_no) VALUES (:post_id,:id,1,0,1)");
            $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
            $stmt = $conn->prepare("SELECT number_of_yes, number_of_no FROM posts_yes_no_info WHERE post_number=:post_id");
            $stmt->execute([":post_id" => $data["post_id"]]);
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $yes_no_tmp = array($row["number_of_yes"], $row["number_of_no"], "Success");
            }
            echo json_encode($yes_no_tmp);
        }
    }
} else if ($data['request'] == "bookmark" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true) {
    require_once "new_config.php";

    if ($data['current_state'] == "checked" && $data['previous_state'] == "checked") {
        $stmt = $conn->prepare("UPDATE bookmarks SET user_bookmark = 0 WHERE post_id=:post_id AND user_id=:id");
        $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
        echo "Success";
    } else if ($data['current_state'] == "checked" && $data['previous_state'] == "not_checked") {
        $stmt = $conn->prepare("SELECT post_id,user_id FROM bookmarks WHERE post_id=:post_id AND user_id=:id");
        $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
        if ($stmt->rowCount() > 0) {
            $stmt = $conn->prepare("UPDATE bookmarks SET user_bookmark = 1 WHERE post_id=:post_id AND user_id=:id");
            $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
            echo "Success";
        } else if ($stmt->rowCount() == 0) {
            $stmt = $conn->prepare("INSERT INTO bookmarks(post_id,user_id,user_bookmark) VALUES (:post_id,:id,1)");
            $stmt->execute([":post_id" => $data["post_id"], ":id" => $_SESSION["id"]]);
            echo "Success";
        }
    }
} else if ($data['request'] == "yes_no_data") {
    require_once "new_config.php";

    $stmt = $conn->prepare("SELECT number_of_yes,number_of_no FROM posts_yes_no_info WHERE post_number=:post_id");
    $stmt->execute([":post_id" => $data["post_id"]]);
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tmp = array($row["number_of_yes"], $row["number_of_no"]);
        }
    }
    echo json_encode($tmp);
} else if ($data['request'] == "location_responses_data") {
    require_once "new_config.php";

    $location_responses_data = array();
    $post_ids_string = "";

    if (!isset($data["post_ids"])) {
        $post_ids_string = ".";
    } else {
        if (count($data["post_ids"]) == 0) {
            $post_ids_string = "zero";
        } else if (count($data["post_ids"]) > 0) {
            $post_ids_string = "";
            for ($i = 0; $i < count($data["post_ids"]); $i++) {
                if (count($data["post_ids"]) == 1) {
                    $post_ids_string .= "[[:<:]]" . $data["post_ids"][$i] . "[[:>:]]";
                } else if (count($data["post_ids"]) > 1 && $i < count($data["post_ids"]) - 1) {
                    $post_ids_string .= "[[:<:]]" . $data["post_ids"][$i] . "[[:>:]]|";
                } else if (count($data["post_ids"]) > 1 && $i == count($data["post_ids"]) - 1) {
                    $post_ids_string .= "[[:<:]]" . $data["post_ids"][$i] . "[[:>:]]";
                }
            }
        }
    }

    $stmt = $conn->prepare("SELECT posts.post_loc_lat AS post_latitude, posts.post_loc_long AS post_longitude, (SELECT COUNT(post_number) FROM posts WHERE posts.post_loc_lat=post_latitude 
    AND post_loc_long=post_longitude AND posts.post_number RLIKE :post_ids GROUP BY post_loc_lat,post_loc_long) AS number_of_posts_in_location,(SELECT COUNT(yes_no.post_id) FROM yes_no 
    INNER JOIN posts ON yes_no.post_id=posts.post_number WHERE (yes_no.answer_yes=1 OR yes_no.answer_no=1) AND posts.post_loc_lat=post_latitude 
    AND posts.post_loc_long=post_longitude AND posts.post_number RLIKE :post_ids) + (SELECT COUNT(rating.post_id) FROM rating 
    INNER JOIN posts ON rating.post_id=posts.post_number WHERE (rating.choice_one IS NOT NULL OR rating.choice_two IS NOT NULL OR rating.choice_three IS NOT NULL 
    OR rating.choice_four IS NOT NULL OR rating.choice_five IS NOT NULL) AND posts.post_loc_lat=post_latitude 
    AND posts.post_loc_long=post_longitude AND posts.post_number RLIKE :post_ids) + (SELECT COUNT(approval.post_id) FROM approval 
    INNER JOIN posts ON approval.post_id=posts.post_number WHERE (approval.choice_one IS NOT NULL OR approval.choice_two IS NOT NULL OR approval.choice_three IS NOT NULL 
    OR approval.choice_four IS NOT NULL OR approval.choice_five IS NOT NULL) AND posts.post_loc_lat=post_latitude 
    AND posts.post_loc_long=post_longitude AND posts.post_number RLIKE :post_ids) AS number_of_responses_in_location 
    FROM posts INNER JOIN yes_no ON posts.post_number=yes_no.post_id WHERE posts.post_number RLIKE :post_ids GROUP BY post_loc_lat,post_loc_long");
    $stmt->execute([":post_ids" => $post_ids_string]);
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tmp = array($row["post_latitude"], $row["post_longitude"], $row["number_of_posts_in_location"], $row["number_of_responses_in_location"]);
            array_push($location_responses_data, $tmp);
        }
    }
    echo json_encode($location_responses_data);
} else if ($data['request'] == "get_admin_analytics_data" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true) {
    require_once "new_config.php";

    $admin_chart_data = array();

    if (!isset($data["admin_time_filter"])) {
        $admin_time_filter = array("2020-01-01 00:00", "2090-01-01 00:00");
        $stmt = $conn->prepare("SELECT COUNT(post_number) AS number_of_posts, CAST(post_date AS DATE) AS date_only FROM posts 
        WHERE post_date BETWEEN :first_date AND :second_date GROUP BY date_only");
        $stmt->execute([":first_date" => $admin_time_filter[0], ":second_date" => $admin_time_filter[1]]);
        if ($stmt->rowCount() > 0) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $tmp = array($row["number_of_posts"], $row["date_only"]);
                array_push($admin_chart_data, $tmp);
            }
        }
        echo json_encode($admin_chart_data);
    } else if (strpos($data["admin_time_filter"], ",") == true && $data["filter_type"] == "different_days_with_range") {
        $admin_time_filter = explode(",", $data["admin_time_filter"]);
        $stmt = $conn->prepare("SELECT COUNT(post_number) AS number_of_posts, CAST(post_date AS DATE) AS date_only FROM posts 
        WHERE post_date BETWEEN :first_date AND :second_date GROUP BY date_only");
        $stmt->execute([":first_date" => $admin_time_filter[0], ":second_date" => $admin_time_filter[1]]);
        if ($stmt->rowCount() > 0) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $tmp = array("different_days_with_range", $row["number_of_posts"], $row["date_only"]);
                array_push($admin_chart_data, $tmp);
            }
        }
        echo json_encode($admin_chart_data);
    } else if (strpos($data["admin_time_filter"], ",") == true && $data["filter_type"] == "same_day_with_range") {
        $admin_time_filter = explode(",", $data["admin_time_filter"]);
        $stmt = $conn->prepare("SELECT CAST(post_date AS TIME) AS time_only FROM posts WHERE post_date BETWEEN :first_date AND :second_date");
        $stmt->execute([":first_date" => $admin_time_filter[0], ":second_date" => $admin_time_filter[1]]);
        if ($stmt->rowCount() > 0) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $tmp = array("same_day_with_range", $row["time_only"]);
                array_push($admin_chart_data, $tmp);
            }
        }
        echo json_encode($admin_chart_data);
    }
} else if ($data['request'] == "get_geolocation_data") {
    require_once "new_config.php";

    $ipaddress = '';
    if (isset($_SERVER['HTTP_CLIENT_IP'])) {
        $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
    } else if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else if (isset($_SERVER['HTTP_X_FORWARDED'])) {
        $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
    } else if (isset($_SERVER['HTTP_FORWARDED_FOR'])) {
        $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
    } else if (isset($_SERVER['HTTP_FORWARDED'])) {
        $ipaddress = $_SERVER['HTTP_FORWARDED'];
    } else if (isset($_SERVER['REMOTE_ADDR'])) {
        $ipaddress = $_SERVER['REMOTE_ADDR'];
    } else {
        $ipaddress = 'UNKNOWN';
    }

    //Only on localhost DONT COPY ON site
    if ($ipaddress == "::1") {
        $ipaddress = "94.65.182.224";
    }

    $url = 'https://ipinfo.io/' . $ipaddress . '?token=ffc97ce1d646e9';
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    $data = curl_exec($ch);
    curl_close($ch);

    echo json_encode($data);
} else if ($data['request'] == "user_rating_vote_data" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true) {
    require_once "new_config.php";

    $stmt = $conn->prepare("SELECT choice_one_name, choice_two_name, choice_three_name, choice_four_name,choice_five_name,
    choice_six_name, choice_seven_name, choice_eight_name, choice_nine_name,choice_ten_name,
    choice_eleven_name, choice_twelve_name, choice_thirteen_name, choice_fourteen_name,choice_fifteen_name,
    choice_sixteen_name, choice_seventeen_name, choice_eighteen_name, choice_nineteen_name,choice_twenty_name,
    COALESCE((SELECT rating.choice_one FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_one,
    COALESCE((SELECT rating.choice_two FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_two,
    COALESCE((SELECT rating.choice_three FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_three,
    COALESCE((SELECT rating.choice_four FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_four,
    COALESCE((SELECT rating.choice_five FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_five,
    COALESCE((SELECT rating.choice_six FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_six,
    COALESCE((SELECT rating.choice_seven FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_seven,
    COALESCE((SELECT rating.choice_eight FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_eight,
    COALESCE((SELECT rating.choice_nine FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_nine,
    COALESCE((SELECT rating.choice_ten FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_ten,
    COALESCE((SELECT rating.choice_eleven FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_eleven,
    COALESCE((SELECT rating.choice_twelve FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_twelve,
    COALESCE((SELECT rating.choice_thirteen FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_thirteen,
    COALESCE((SELECT rating.choice_fourteen FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_fourteen,
    COALESCE((SELECT rating.choice_fifteen FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_fifteen,
    COALESCE((SELECT rating.choice_sixteen FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_sixteen,
    COALESCE((SELECT rating.choice_seventeen FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_seventeen,
    COALESCE((SELECT rating.choice_eighteen FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_eighteen,
    COALESCE((SELECT rating.choice_nineteen FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_nineteen,
    COALESCE((SELECT rating.choice_twenty FROM rating WHERE rating.user_id=:id AND rating.post_id=:post_id),NULL) AS rating_choice_twenty
    FROM posts INNER JOIN rating ON posts.post_number=rating.post_id WHERE posts.post_number=:post_id");
    $stmt->execute([":id" => $_SESSION["id"], ":post_id" => $data["post_id"]]);
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tmp = array(
                $row["choice_one_name"], $row["choice_two_name"], $row["choice_three_name"], $row["choice_four_name"],
                $row["choice_five_name"], $row["choice_six_name"], $row["choice_seven_name"], $row["choice_eight_name"], $row["choice_nine_name"],
                $row["choice_ten_name"], $row["choice_eleven_name"], $row["choice_twelve_name"], $row["choice_thirteen_name"], $row["choice_fourteen_name"],
                $row["choice_fifteen_name"], $row["choice_sixteen_name"], $row["choice_seventeen_name"], $row["choice_eighteen_name"], $row["choice_nineteen_name"],
                $row["choice_twenty_name"],
                $row["rating_choice_one"], $row["rating_choice_two"], $row["rating_choice_three"], $row["rating_choice_four"],
                $row["rating_choice_five"], $row["rating_choice_six"], $row["rating_choice_seven"], $row["rating_choice_eight"], $row["rating_choice_nine"],
                $row["rating_choice_ten"], $row["rating_choice_eleven"], $row["rating_choice_twelve"], $row["rating_choice_thirteen"], $row["rating_choice_fourteen"],
                $row["rating_choice_fifteen"], $row["rating_choice_sixteen"], $row["rating_choice_seventeen"], $row["rating_choice_eighteen"], $row["rating_choice_nineteen"],
                $row["rating_choice_twenty"],
            );
        }
    }
    echo json_encode($tmp);
} else if ($data['request'] == "rating_vote" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true) {
    require_once "new_config.php";

    $stmt = $conn->prepare("SELECT user_id FROM rating WHERE user_id=:id");
    $stmt->execute([":id" => $_SESSION["id"]]);
    if ($stmt->rowCount() > 0) {
        $stmt = $conn->prepare("UPDATE rating SET choice_one = :choice_one, choice_two = :choice_two, choice_three = :choice_three,
        choice_four = :choice_four, choice_five = :choice_five, choice_six = :choice_six, choice_seven = :choice_seven, choice_eight = :choice_eight,
        choice_nine = :choice_nine, choice_ten = :choice_ten, choice_eleven = :choice_eleven, choice_twelve = :choice_twelve, choice_thirteen = :choice_thirteen,
        choice_fourteen = :choice_fourteen, choice_fifteen = :choice_fifteen, choice_sixteen = :choice_sixteen, choice_seventeen = :choice_seventeen, 
        choice_eighteen = :choice_eighteen, choice_nineteen = :choice_nineteen, choice_twenty = :choice_twenty
        WHERE post_id=:post_id AND user_id=:id");
        $stmt->execute([
            ":post_id" => $data["post_id"], ":id" => $_SESSION["id"], ":choice_one" => $data["votes"][0], ":choice_two" => $data["votes"][1],
            ":choice_three" => $data["votes"][2], ":choice_four" => $data["votes"][3], ":choice_five" => $data["votes"][4], ":choice_six" => $data["votes"][5],
            ":choice_seven" => $data["votes"][6], ":choice_eight" => $data["votes"][7], ":choice_nine" => $data["votes"][8], ":choice_ten" => $data["votes"][9],
            ":choice_eleven" => $data["votes"][10], ":choice_twelve" => $data["votes"][11], ":choice_thirteen" => $data["votes"][12], ":choice_fourteen" => $data["votes"][13],
            ":choice_fifteen" => $data["votes"][14], ":choice_sixteen" => $data["votes"][15], ":choice_seventeen" => $data["votes"][16], ":choice_eighteen" => $data["votes"][17],
            ":choice_nineteen" => $data["votes"][18], ":choice_twenty" => $data["votes"][19]
        ]);
    }
    $stmt = $conn->prepare("INSERT IGNORE INTO rating(post_id,user_id,poll_type,choice_one,choice_two,choice_three,choice_four,choice_five,
    choice_six,choice_seven,choice_eight,choice_nine,choice_ten,choice_eleven,choice_twelve,choice_thirteen,choice_fourteen,choice_fifteen,choice_sixteen,choice_seventeen,
    choice_eighteen,choice_nineteen,choice_twenty) 
            VALUES(:post_id,:id,2,:choice_one,:choice_two,:choice_three,:choice_four,:choice_five,:choice_six,:choice_seven,:choice_eight,:choice_nine,:choice_ten,
            :choice_eleven,:choice_twelve,:choice_thirteen,:choice_fourteen,:choice_fifteen,:choice_sixteen,:choice_seventeen,
            :choice_eighteen,:choice_nineteen,:choice_twenty)");
    $stmt->execute([
        ":post_id" => $data["post_id"], ":id" => $_SESSION["id"], ":choice_one" => $data["votes"][0], ":choice_two" => $data["votes"][1],
        ":choice_three" => $data["votes"][2], ":choice_four" => $data["votes"][3], ":choice_five" => $data["votes"][4], ":choice_six" => $data["votes"][5],
        ":choice_seven" => $data["votes"][6], ":choice_eight" => $data["votes"][7], ":choice_nine" => $data["votes"][8], ":choice_ten" => $data["votes"][9],
        ":choice_eleven" => $data["votes"][10], ":choice_twelve" => $data["votes"][11], ":choice_thirteen" => $data["votes"][12], ":choice_fourteen" => $data["votes"][13],
        ":choice_fifteen" => $data["votes"][14], ":choice_sixteen" => $data["votes"][15], ":choice_seventeen" => $data["votes"][16], ":choice_eighteen" => $data["votes"][17],
        ":choice_nineteen" => $data["votes"][18], ":choice_twenty" => $data["votes"][19]
    ]);

    $stmt = $conn->prepare("SELECT rating_choice_one_avg, rating_choice_two_avg, rating_choice_three_avg, rating_choice_four_avg, rating_choice_five_avg,
    rating_choice_six_avg, rating_choice_seven_avg, rating_choice_eight_avg, rating_choice_nine_avg, rating_choice_ten_avg, rating_choice_eleven_avg,
    rating_choice_twelve_avg, rating_choice_thirteen_avg, rating_choice_fourteen_avg, rating_choice_fifteen_avg, rating_choice_sixteen_avg, rating_choice_seventeen_avg,
    rating_choice_eighteen_avg, rating_choice_nineteen_avg, rating_choice_twenty_avg, choice_one_name, choice_two_name, choice_three_name, choice_four_name,choice_five_name,
    choice_six_name, choice_seven_name, choice_eight_name, choice_nine_name,choice_ten_name, choice_eleven_name, choice_twelve_name, choice_thirteen_name, 
    choice_fourteen_name,choice_fifteen_name, choice_sixteen_name, choice_seventeen_name, choice_eighteen_name, choice_nineteen_name,choice_twenty_name
    FROM posts_rating_info INNER JOIN posts ON posts_rating_info.rating_post_id=posts.post_number WHERE rating_post_id=:post_id");
    $stmt->execute([":post_id" => $data["post_id"]]);
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tmp = array(
                $data["votes"][0], $data["votes"][1], $data["votes"][2], $data["votes"][3], $data["votes"][4],
                $data["votes"][5], $data["votes"][6], $data["votes"][7], $data["votes"][8], $data["votes"][9],
                $data["votes"][10], $data["votes"][11], $data["votes"][12], $data["votes"][13], $data["votes"][14],
                $data["votes"][15], $data["votes"][16], $data["votes"][17], $data["votes"][18], $data["votes"][19],
                $row["rating_choice_one_avg"], $row["rating_choice_two_avg"], $row["rating_choice_three_avg"], $row["rating_choice_four_avg"],
                $row["rating_choice_five_avg"], $row["rating_choice_six_avg"], $row["rating_choice_seven_avg"], $row["rating_choice_eight_avg"],
                $row["rating_choice_nine_avg"], $row["rating_choice_ten_avg"], $row["rating_choice_eleven_avg"], $row["rating_choice_twelve_avg"],
                $row["rating_choice_thirteen_avg"], $row["rating_choice_fourteen_avg"], $row["rating_choice_fifteen_avg"], $row["rating_choice_sixteen_avg"],
                $row["rating_choice_seventeen_avg"], $row["rating_choice_eighteen_avg"], $row["rating_choice_nineteen_avg"], $row["rating_choice_twenty_avg"],
                $row["choice_one_name"], $row["choice_two_name"], $row["choice_three_name"], $row["choice_four_name"],
                $row["choice_five_name"], $row["choice_six_name"], $row["choice_seven_name"], $row["choice_eight_name"], $row["choice_nine_name"],
                $row["choice_ten_name"], $row["choice_eleven_name"], $row["choice_twelve_name"], $row["choice_thirteen_name"], $row["choice_fourteen_name"],
                $row["choice_fifteen_name"], $row["choice_sixteen_name"], $row["choice_seventeen_name"], $row["choice_eighteen_name"], $row["choice_nineteen_name"],
                $row["choice_twenty_name"]
            );
        }
    }
    $stmt = $conn->prepare(
        "SELECT COUNT(user_id) AS total_votes FROM rating WHERE post_id=:post_id AND 
    (choice_one IS NOT NULL OR choice_two IS NOT NULL OR choice_three IS NOT NULL OR choice_four IS NOT NULL OR choice_five IS NOT NULL 
    OR choice_six IS NOT NULL OR choice_seven IS NOT NULL OR choice_eight IS NOT NULL OR choice_nine IS NOT NULL OR choice_ten IS NOT NULL 
    OR choice_eleven IS NOT NULL OR choice_twelve IS NOT NULL OR choice_thirteen IS NOT NULL OR choice_fourteen IS NOT NULL OR choice_fifteen IS NOT NULL 
    OR choice_sixteen IS NOT NULL OR choice_seventeen IS NOT NULL OR choice_eighteen IS NOT NULL OR choice_nineteen IS NOT NULL OR choice_twenty IS NOT NULL)"
    );
    $stmt->execute([":post_id" => $data["post_id"]]);
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($tmp, $row["total_votes"], "Success");
        }
    }
    echo json_encode($tmp);
} else if ($data['request'] == "user_approval_vote_data" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true) {
    require_once "new_config.php";

    $stmt = $conn->prepare("SELECT choice_one_name, choice_two_name, choice_three_name, choice_four_name,choice_five_name,
    choice_six_name, choice_seven_name, choice_eight_name, choice_nine_name,choice_ten_name,
    choice_eleven_name, choice_twelve_name, choice_thirteen_name, choice_fourteen_name,choice_fifteen_name,
    choice_sixteen_name, choice_seventeen_name, choice_eighteen_name, choice_nineteen_name,choice_twenty_name,
    COALESCE((SELECT approval.choice_one FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_one,
    COALESCE((SELECT approval.choice_two FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_two,
    COALESCE((SELECT approval.choice_three FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_three,
    COALESCE((SELECT approval.choice_four FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_four,
    COALESCE((SELECT approval.choice_five FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_five,
    COALESCE((SELECT approval.choice_six FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_six,
    COALESCE((SELECT approval.choice_seven FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_seven,
    COALESCE((SELECT approval.choice_eight FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_eight,
    COALESCE((SELECT approval.choice_nine FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_nine,
    COALESCE((SELECT approval.choice_ten FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_ten,
    COALESCE((SELECT approval.choice_eleven FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_eleven,
    COALESCE((SELECT approval.choice_twelve FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_twelve,
    COALESCE((SELECT approval.choice_thirteen FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_thirteen,
    COALESCE((SELECT approval.choice_fourteen FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_fourteen,
    COALESCE((SELECT approval.choice_fifteen FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_fifteen,
    COALESCE((SELECT approval.choice_sixteen FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_sixteen,
    COALESCE((SELECT approval.choice_seventeen FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_seventeen,
    COALESCE((SELECT approval.choice_eighteen FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_eighteen,
    COALESCE((SELECT approval.choice_nineteen FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_nineteen,
    COALESCE((SELECT approval.choice_twenty FROM approval WHERE approval.user_id=:id AND approval.post_id=:post_id),NULL) AS approval_choice_twenty
    FROM posts INNER JOIN approval ON posts.post_number=approval.post_id WHERE posts.post_number=:post_id");
    $stmt->execute([":id" => $_SESSION["id"], ":post_id" => $data["post_id"]]);
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tmp = array(
                $row["choice_one_name"], $row["choice_two_name"], $row["choice_three_name"], $row["choice_four_name"],
                $row["choice_five_name"], $row["choice_six_name"], $row["choice_seven_name"], $row["choice_eight_name"], $row["choice_nine_name"],
                $row["choice_ten_name"], $row["choice_eleven_name"], $row["choice_twelve_name"], $row["choice_thirteen_name"], $row["choice_fourteen_name"],
                $row["choice_fifteen_name"], $row["choice_sixteen_name"], $row["choice_seventeen_name"], $row["choice_eighteen_name"], $row["choice_nineteen_name"],
                $row["choice_twenty_name"],
                $row["approval_choice_one"], $row["approval_choice_two"], $row["approval_choice_three"], $row["approval_choice_four"],
                $row["approval_choice_five"], $row["approval_choice_six"], $row["approval_choice_seven"], $row["approval_choice_eight"], $row["approval_choice_nine"],
                $row["approval_choice_ten"], $row["approval_choice_eleven"], $row["approval_choice_twelve"], $row["approval_choice_thirteen"], $row["approval_choice_fourteen"],
                $row["approval_choice_fifteen"], $row["approval_choice_sixteen"], $row["approval_choice_seventeen"], $row["approval_choice_eighteen"], $row["approval_choice_nineteen"],
                $row["approval_choice_twenty"],
            );
        }
    }
    echo json_encode($tmp);
} else if ($data['request'] == "average_rating_data") {
    require_once "new_config.php";

    $stmt = $conn->prepare("SELECT rating_choice_one_avg, rating_choice_two_avg, rating_choice_three_avg, rating_choice_four_avg, rating_choice_five_avg,
    rating_choice_six_avg, rating_choice_seven_avg, rating_choice_eight_avg, rating_choice_nine_avg, rating_choice_ten_avg, rating_choice_eleven_avg,
    rating_choice_twelve_avg, rating_choice_thirteen_avg, rating_choice_fourteen_avg, rating_choice_fifteen_avg, rating_choice_sixteen_avg, rating_choice_seventeen_avg,
    rating_choice_eighteen_avg, rating_choice_nineteen_avg, rating_choice_twenty_avg,
    choice_one_name, choice_two_name, choice_three_name, choice_four_name,choice_five_name, choice_six_name, choice_seven_name, choice_eight_name, choice_nine_name,
    choice_ten_name, choice_eleven_name, choice_twelve_name, choice_thirteen_name, choice_fourteen_name,choice_fifteen_name, choice_sixteen_name, choice_seventeen_name, 
    choice_eighteen_name, choice_nineteen_name,choice_twenty_name
    FROM posts_rating_info INNER JOIN posts ON posts_rating_info.rating_post_id=posts.post_number WHERE rating_post_id=:post_id");
    $stmt->execute([":post_id" => $data["post_id"]]);
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tmp = array(
                $row["rating_choice_one_avg"], $row["rating_choice_two_avg"], $row["rating_choice_three_avg"], $row["rating_choice_four_avg"],
                $row["rating_choice_five_avg"], $row["rating_choice_six_avg"], $row["rating_choice_seven_avg"], $row["rating_choice_eight_avg"],
                $row["rating_choice_nine_avg"], $row["rating_choice_ten_avg"], $row["rating_choice_eleven_avg"], $row["rating_choice_twelve_avg"],
                $row["rating_choice_thirteen_avg"], $row["rating_choice_fourteen_avg"], $row["rating_choice_fifteen_avg"], $row["rating_choice_sixteen_avg"],
                $row["rating_choice_seventeen_avg"], $row["rating_choice_eighteen_avg"], $row["rating_choice_nineteen_avg"], $row["rating_choice_twenty_avg"],
                $row["choice_one_name"], $row["choice_two_name"], $row["choice_three_name"], $row["choice_four_name"],
                $row["choice_five_name"], $row["choice_six_name"], $row["choice_seven_name"], $row["choice_eight_name"], $row["choice_nine_name"],
                $row["choice_ten_name"], $row["choice_eleven_name"], $row["choice_twelve_name"], $row["choice_thirteen_name"], $row["choice_fourteen_name"],
                $row["choice_fifteen_name"], $row["choice_sixteen_name"], $row["choice_seventeen_name"], $row["choice_eighteen_name"], $row["choice_nineteen_name"],
                $row["choice_twenty_name"]
            );
        }
    }
    $stmt = $conn->prepare(
        "SELECT COUNT(user_id) AS total_votes FROM rating WHERE post_id=:post_id AND 
    (choice_one IS NOT NULL OR choice_two IS NOT NULL OR choice_three IS NOT NULL OR choice_four IS NOT NULL OR choice_five IS NOT NULL 
    OR choice_six IS NOT NULL OR choice_seven IS NOT NULL OR choice_eight IS NOT NULL OR choice_nine IS NOT NULL OR choice_ten IS NOT NULL 
    OR choice_eleven IS NOT NULL OR choice_twelve IS NOT NULL OR choice_thirteen IS NOT NULL OR choice_fourteen IS NOT NULL OR choice_fifteen IS NOT NULL 
    OR choice_sixteen IS NOT NULL OR choice_seventeen IS NOT NULL OR choice_eighteen IS NOT NULL OR choice_nineteen IS NOT NULL OR choice_twenty IS NOT NULL)"
    );
    $stmt->execute([":post_id" => $data["post_id"]]);
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($tmp, $row["total_votes"]);
        }
    }
    echo json_encode($tmp);
} else if ($data['request'] == "approval_vote" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true) {
    require_once "new_config.php";

    $stmt = $conn->prepare("SELECT user_id FROM approval WHERE user_id=:id");
    $stmt->execute([":id" => $_SESSION["id"]]);
    if ($stmt->rowCount() > 0) {
        $stmt = $conn->prepare("UPDATE approval SET choice_one = :choice_one, choice_two = :choice_two, choice_three = :choice_three,
        choice_four = :choice_four, choice_five = :choice_five, choice_six = :choice_six, choice_seven = :choice_seven, choice_eight = :choice_eight,
        choice_nine = :choice_nine, choice_ten = :choice_ten, choice_eleven = :choice_eleven, choice_twelve = :choice_twelve, choice_thirteen = :choice_thirteen,
        choice_fourteen = :choice_fourteen, choice_fifteen = :choice_fifteen, choice_sixteen = :choice_sixteen, choice_seventeen = :choice_seventeen, 
        choice_eighteen = :choice_eighteen, choice_nineteen = :choice_nineteen, choice_twenty = :choice_twenty WHERE post_id=:post_id AND user_id=:id");
        $stmt->execute([
            ":post_id" => $data["post_id"], ":id" => $_SESSION["id"], ":choice_one" => $data["votes"][0], ":choice_two" => $data["votes"][1],
            ":choice_three" => $data["votes"][2], ":choice_four" => $data["votes"][3], ":choice_five" => $data["votes"][4], ":choice_six" => $data["votes"][5],
            ":choice_seven" => $data["votes"][6], ":choice_eight" => $data["votes"][7], ":choice_nine" => $data["votes"][8], ":choice_ten" => $data["votes"][9],
            ":choice_eleven" => $data["votes"][10], ":choice_twelve" => $data["votes"][11], ":choice_thirteen" => $data["votes"][12], ":choice_fourteen" => $data["votes"][13],
            ":choice_fifteen" => $data["votes"][14], ":choice_sixteen" => $data["votes"][15], ":choice_seventeen" => $data["votes"][16], ":choice_eighteen" => $data["votes"][17],
            ":choice_nineteen" => $data["votes"][18], ":choice_twenty" => $data["votes"][19]
        ]);
    }
    $stmt = $conn->prepare("INSERT IGNORE INTO approval(post_id,user_id,poll_type,choice_one,choice_two,choice_three,choice_four,choice_five,
    choice_six,choice_seven,choice_eight,choice_nine,choice_ten,choice_eleven,choice_twelve,choice_thirteen,choice_fourteen,choice_fifteen,choice_sixteen,choice_seventeen,
    choice_eighteen,choice_nineteen,choice_twenty) 
            VALUES(:post_id,:id,3,:choice_one,:choice_two,:choice_three,:choice_four,:choice_five,:choice_six,:choice_seven,:choice_eight,:choice_nine,:choice_ten,
            :choice_eleven,:choice_twelve,:choice_thirteen,:choice_fourteen,:choice_fifteen,:choice_sixteen,:choice_seventeen,
            :choice_eighteen,:choice_nineteen,:choice_twenty)");
    $stmt->execute([
        ":post_id" => $data["post_id"], ":id" => $_SESSION["id"], ":choice_one" => $data["votes"][0], ":choice_two" => $data["votes"][1],
        ":choice_three" => $data["votes"][2], ":choice_four" => $data["votes"][3], ":choice_five" => $data["votes"][4], ":choice_six" => $data["votes"][5],
        ":choice_seven" => $data["votes"][6], ":choice_eight" => $data["votes"][7], ":choice_nine" => $data["votes"][8], ":choice_ten" => $data["votes"][9],
        ":choice_eleven" => $data["votes"][10], ":choice_twelve" => $data["votes"][11], ":choice_thirteen" => $data["votes"][12], ":choice_fourteen" => $data["votes"][13],
        ":choice_fifteen" => $data["votes"][14], ":choice_sixteen" => $data["votes"][15], ":choice_seventeen" => $data["votes"][16], ":choice_eighteen" => $data["votes"][17],
        ":choice_nineteen" => $data["votes"][18], ":choice_twenty" => $data["votes"][19]
    ]);

    $stmt = $conn->prepare("SELECT approval_choice_one, approval_choice_two, approval_choice_three, approval_choice_four, approval_choice_five,
    approval_choice_six, approval_choice_seven, approval_choice_eight, approval_choice_nine, approval_choice_ten, approval_choice_eleven, approval_choice_twelve,
    approval_choice_thirteen, approval_choice_fourteen, approval_choice_fifteen, approval_choice_sixteen, approval_choice_seventeen, approval_choice_eighteen,
    approval_choice_nineteen, approval_choice_twenty, choice_one_name, choice_two_name, choice_three_name, choice_four_name,choice_five_name,
    choice_six_name, choice_seven_name, choice_eight_name, choice_nine_name,choice_ten_name, choice_eleven_name, choice_twelve_name, choice_thirteen_name, 
    choice_fourteen_name,choice_fifteen_name, choice_sixteen_name, choice_seventeen_name, choice_eighteen_name, choice_nineteen_name,choice_twenty_name
    FROM posts_approval_info INNER JOIN posts ON posts_approval_info.approval_post_id=posts.post_number WHERE approval_post_id=:post_id");
    $stmt->execute([":post_id" => $data["post_id"]]);
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tmp = array(
                $data["votes"][0], $data["votes"][1], $data["votes"][2], $data["votes"][3], $data["votes"][4],
                $data["votes"][5], $data["votes"][6], $data["votes"][7], $data["votes"][8], $data["votes"][9],
                $data["votes"][10], $data["votes"][11], $data["votes"][12], $data["votes"][13], $data["votes"][14],
                $data["votes"][15], $data["votes"][16], $data["votes"][17], $data["votes"][18], $data["votes"][19],
                $row["approval_choice_one"], $row["approval_choice_two"], $row["approval_choice_three"], $row["approval_choice_four"],
                $row["approval_choice_five"], $row["approval_choice_six"], $row["approval_choice_seven"], $row["approval_choice_eight"],
                $row["approval_choice_nine"], $row["approval_choice_ten"], $row["approval_choice_eleven"], $row["approval_choice_twelve"],
                $row["approval_choice_thirteen"], $row["approval_choice_fourteen"], $row["approval_choice_fifteen"], $row["approval_choice_sixteen"],
                $row["approval_choice_seventeen"], $row["approval_choice_eighteen"], $row["approval_choice_nineteen"], $row["approval_choice_twenty"],
                $row["choice_one_name"], $row["choice_two_name"], $row["choice_three_name"], $row["choice_four_name"],
                $row["choice_five_name"], $row["choice_six_name"], $row["choice_seven_name"], $row["choice_eight_name"], $row["choice_nine_name"],
                $row["choice_ten_name"], $row["choice_eleven_name"], $row["choice_twelve_name"], $row["choice_thirteen_name"], $row["choice_fourteen_name"],
                $row["choice_fifteen_name"], $row["choice_sixteen_name"], $row["choice_seventeen_name"], $row["choice_eighteen_name"], $row["choice_nineteen_name"],
                $row["choice_twenty_name"],
                "Success"
            );
        }
    }
    echo json_encode($tmp);
} else if ($data['request'] == "approval_data") {
    require_once "new_config.php";

    $stmt = $conn->prepare("SELECT approval_choice_one, approval_choice_two, approval_choice_three, approval_choice_four, approval_choice_five,
    approval_choice_six, approval_choice_seven, approval_choice_eight, approval_choice_nine, approval_choice_ten, approval_choice_eleven, approval_choice_twelve,
    approval_choice_thirteen, approval_choice_fourteen, approval_choice_fifteen, approval_choice_sixteen, approval_choice_seventeen, approval_choice_eighteen,
    approval_choice_nineteen, approval_choice_twenty,
    choice_one_name, choice_two_name, choice_three_name, choice_four_name,choice_five_name, choice_six_name, choice_seven_name, choice_eight_name, choice_nine_name,
    choice_ten_name, choice_eleven_name, choice_twelve_name, choice_thirteen_name, choice_fourteen_name,choice_fifteen_name, choice_sixteen_name, choice_seventeen_name, 
    choice_eighteen_name, choice_nineteen_name,choice_twenty_name
    FROM posts_approval_info INNER JOIN posts ON posts_approval_info.approval_post_id=posts.post_number WHERE approval_post_id=:post_id");
    $stmt->execute([":post_id" => $data["post_id"]]);
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tmp = array(
                $row["approval_choice_one"], $row["approval_choice_two"], $row["approval_choice_three"], $row["approval_choice_four"],
                $row["approval_choice_five"], $row["approval_choice_six"], $row["approval_choice_seven"], $row["approval_choice_eight"],
                $row["approval_choice_nine"], $row["approval_choice_ten"], $row["approval_choice_eleven"], $row["approval_choice_twelve"],
                $row["approval_choice_thirteen"], $row["approval_choice_fourteen"], $row["approval_choice_fifteen"], $row["approval_choice_sixteen"],
                $row["approval_choice_seventeen"], $row["approval_choice_eighteen"], $row["approval_choice_nineteen"], $row["approval_choice_twenty"],
                $row["choice_one_name"], $row["choice_two_name"], $row["choice_three_name"], $row["choice_four_name"],
                $row["choice_five_name"], $row["choice_six_name"], $row["choice_seven_name"], $row["choice_eight_name"], $row["choice_nine_name"],
                $row["choice_ten_name"], $row["choice_eleven_name"], $row["choice_twelve_name"], $row["choice_thirteen_name"], $row["choice_fourteen_name"],
                $row["choice_fifteen_name"], $row["choice_sixteen_name"], $row["choice_seventeen_name"], $row["choice_eighteen_name"], $row["choice_nineteen_name"],
                $row["choice_twenty_name"]
            );
        }
    }
    echo json_encode($tmp);
} else if ($data['request'] == "posts_per_location_data") {
    require_once "new_config.php";

    $posts_per_location_data = array();

    if (!isset($data["post_ids"])) {
        $post_ids_string = ".";
    } else {
        if (count($data["post_ids"]) == 0) {
            $post_ids_string = "zero";
        } else if (count($data["post_ids"]) > 0) {
            $post_ids_string = "";
            for ($i = 0; $i < count($data["post_ids"]); $i++) {
                if (count($data["post_ids"]) == 1) {
                    $post_ids_string .= "[[:<:]]" . $data["post_ids"][$i] . "[[:>:]]";
                } else if (count($data["post_ids"]) > 1 && $i < count($data["post_ids"]) - 1) {
                    $post_ids_string .= "[[:<:]]" . $data["post_ids"][$i] . "[[:>:]]|";
                } else if (count($data["post_ids"]) > 1 && $i == count($data["post_ids"]) - 1) {
                    $post_ids_string .= "[[:<:]]" . $data["post_ids"][$i] . "[[:>:]]";
                }
            }
        }
    }

    $stmt = $conn->prepare("SELECT post_number, posts.post_loc_lat AS post_latitude, posts.post_loc_long AS post_longitude FROM posts WHERE posts.post_number RLIKE :post_ids");
    $stmt->execute([":post_ids" => $post_ids_string]);
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tmp = array($row["post_number"], $row["post_latitude"], $row["post_longitude"]);
            array_push($posts_per_location_data, $tmp);
        }
    }
    echo json_encode($posts_per_location_data);
} else if ($data['request'] == "delete_post" && isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true) {
    require_once "new_config.php";

    $stmt = $conn->prepare("SELECT * FROM posts WHERE user_id=:id AND post_number=:post_id");
    $stmt->execute([":id" => $_SESSION["id"], ":post_id" => $data["post_id"]]);
    if ($stmt->rowCount() > 0) {
        $stmt = $conn->prepare("DELETE FROM posts WHERE user_id=:id AND post_number=:post_id");
        $stmt->execute([":id" => $_SESSION["id"], ":post_id" => $data["post_id"]]);
        echo "Success";
    }
} else if ($data['request'] == "general_info_data") {
    require_once "new_config.php";
    $general_info = array();

    date_default_timezone_set('Europe/Athens');
    $current_datetime = date('Y-m-d H:i:s', time());

    $stmt = $conn->prepare("SELECT COUNT(user.id) AS registered_users FROM user 
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_active_posts FROM posts WHERE posts.post_expiration_date IS NULL OR posts.post_expiration_date>:date_now");
    $stmt->execute([":date_now" => $current_datetime]);
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($general_info, $row["registered_users"]);
        }
    }
    echo json_encode($general_info);
} else if ($data['request'] == "total_posts_per_poll_type_data") {
    require_once "new_config.php";
    $total_posts_per_poll_type = array();

    $stmt = $conn->prepare("SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE poll_type = 1
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE poll_type = 2
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE poll_type = 3
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE poll_type = 4");
    $stmt->execute();
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($total_posts_per_poll_type, $row["number_of_posts"]);
        }
    }
    echo json_encode($total_posts_per_poll_type);
} else if ($data['request'] == "active_posts_per_poll_type_data") {
    require_once "new_config.php";
    $active_posts_per_poll_type = array();

    date_default_timezone_set('Europe/Athens');
    $current_datetime = date('Y-m-d H:i:s', time());

    $stmt = $conn->prepare(
        "SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE poll_type = 1 AND (posts.post_expiration_date IS NULL OR posts.post_expiration_date>:date_now)
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE poll_type = 2 AND (posts.post_expiration_date IS NULL OR posts.post_expiration_date>:date_now)
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE poll_type = 3 AND (posts.post_expiration_date IS NULL OR posts.post_expiration_date>:date_now)
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE poll_type = 4 AND (posts.post_expiration_date IS NULL OR posts.post_expiration_date>:date_now)"
    );
    $stmt->execute([":date_now" => $current_datetime]);
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($active_posts_per_poll_type, $row["number_of_posts"]);
        }
    }
    echo json_encode($active_posts_per_poll_type);
} else if ($data['request'] == "total_posts_per_category_data") {
    require_once "new_config.php";
    $total_posts_per_category = array();

    $stmt = $conn->prepare("SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 1
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 2
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 3
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 4
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 5
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 6
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 7
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 8
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 9
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 10");
    $stmt->execute();
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($total_posts_per_category, $row["number_of_posts"]);
        }
    }
    echo json_encode($total_posts_per_category);
} else if ($data['request'] == "active_posts_per_category_data") {
    require_once "new_config.php";
    $active_posts_per_category = array();

    date_default_timezone_set('Europe/Athens');
    $current_datetime = date('Y-m-d H:i:s', time());

    $stmt = $conn->prepare("SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 1 AND (posts.post_expiration_date IS NULL OR posts.post_expiration_date>:date_now)
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 2 AND (posts.post_expiration_date IS NULL OR posts.post_expiration_date>:date_now)
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 3 AND (posts.post_expiration_date IS NULL OR posts.post_expiration_date>:date_now)
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 4 AND (posts.post_expiration_date IS NULL OR posts.post_expiration_date>:date_now)
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 5 AND (posts.post_expiration_date IS NULL OR posts.post_expiration_date>:date_now)
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 6 AND (posts.post_expiration_date IS NULL OR posts.post_expiration_date>:date_now)
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 7 AND (posts.post_expiration_date IS NULL OR posts.post_expiration_date>:date_now)
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 8 AND (posts.post_expiration_date IS NULL OR posts.post_expiration_date>:date_now)
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 9 AND (posts.post_expiration_date IS NULL OR posts.post_expiration_date>:date_now)
                UNION ALL
                SELECT COUNT(posts.post_number) AS number_of_posts FROM posts WHERE post_category = 10 AND (posts.post_expiration_date IS NULL OR posts.post_expiration_date>:date_now)");
    $stmt->execute([":date_now" => $current_datetime]);
    if ($stmt->rowCount() > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($active_posts_per_category, $row["number_of_posts"]);
        }
    }
    echo json_encode($active_posts_per_category);
}
