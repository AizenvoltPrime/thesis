<?php
// Initialize the session
session_start();

// Check if the user is logged in, if not then redirect to login page
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: ../login/login.php");
    exit;
}
if(isset($_SESSION["role"]) && $_SESSION["role"]!="admin")
{
    header("location: ../welcome.php");
}

// Include config file
require_once "../config.php";
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Users Info</title>
    <link rel="stylesheet" type="text/css" href="../style.css">
    <link rel="stylesheet" type="text/css" href="../user-profile/user_profile.css">
    <link rel="stylesheet" type="text/css" href="./users_info.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
    integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
    crossorigin=""/>
    <script src = "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"></script> 
    <script src = " https://cdnjs.cloudflare.com/ajax/libs/google-palette/1.1.0/palette.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/multi-select/0.9.12/js/jquery.multi-select.js"></script>
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
    integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
    crossorigin=""></script>
    <script src="https://elfalem.github.io/Leaflet.curve/src/leaflet.curve.js"></script>
</head>
<style>

p{
    font-weight: normal;
}

.form-group{
    padding:1%;
}

.menu-space{
    padding:10%;
}

</style>
<body>
    <div id="content">
        <img class="resize" src="../images/logo-header.png" alt="Logo"/>
            <br style="clear:both">
            <div class="topnav">
                <a href="http://localhost/project/welcome.php">Home</a>
                <a href="http://localhost/project/user-profile/user_profile.php">User Profile</a>
                <a class="active" href="http://localhost/project/users-info/users_info.php">Users Info</a>
                <a href="http://localhost/project/logout.php">Logout</a>
            </div>
        <hr class="solid"/>
            <div class="side_nav">
                <button class="nav_btn" id="nu" onclick="NumberOfUsers()">Number of Users</button>
                <button class="nav_btn" id="rms" onclick="RequestMethodStatistics()">Request Method Statistics</button>
                <button class="nav_btn" id="rss" onclick="ResponseStatusStatistics()">Response Status Statistics</button>
                <button class="nav_btn" id="ud" onclick="UniqueDomains()">Unique Domains</button>
                <button class="nav_btn" id="isp" onclick="ISPs()">ISPs</button>
                <button class="nav_btn" id="aa" onclick="AverageAgeOfContent()">Average Age of Content-Types</button>
                <button class="nav_btn" id="rta" onclick="ResponseTimeAnalysis()">Response Time Analysis</button>
                <button class="nav_btn" id="hha" onclick="HeaderAnalysis()">HTTP Header Analysis</button>
                <button class="nav_btn" id="sm" onclick="showMap()">HTTP Request Locations of Users</button>
            </div>
        <div class="flex-container">
            <div id = "map" style = "width: 850px; height: 470px"></div>
            <div id="NumberOfUsers">
                <div class="menu-space"></div>
                <table id="content-table">
                    <thead>
                        <tr> 
                            <th>Number of Registered Users</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td id="number_of_users"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div id="RequestMethodStatistics">
                <table id="content-table">
                    <thead>
                        <tr> 
                            <th>Method Type</th>
                            <th>Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>POST</td>
                            <td id="nop"></td>
                        </tr>
                        <tr>
                            <td>GET</td>
                            <td id="nog"></td>
                        </tr>
                        <tr>
                            <td>HEAD</td>
                            <td id="noh"></td>
                        </tr>
                        <tr>
                            <td>PUT</td>
                            <td id="nopu"></td>
                        </tr>
                        <tr>
                            <td>DELETE</td>
                            <td id="nod"></td>
                        </tr>
                        <tr>
                            <td>CONNECT</td>
                            <td id="noc"></td>
                        </tr>
                        <tr>
                            <td>OPTIONS</td>
                            <td id="noo"></td>
                        </tr>
                        <tr>
                            <td>TRACE</td>
                            <td id="notr"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div id="ResponseStatusStatistics">
                <div class="menu-space"></div>
                <table id="content-table-selector">
                    <thead>
                        <tr> 
                            <th>Response Status</th>
                            <th>Occurrences</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <select id="selectStatus">
                                    <option>Choose Response Status</option>
                                </select>
                            </td>
                            <td id="occur"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div id="UniqueDomains">
                <div class="menu-space"></div>
                <table id="content-table">
                    <thead>
                        <tr> 
                            <th>Number of Unique Domains</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td id="noud"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div id="ISPs">
                <div class="menu-space"></div>
                <table id="content-table">
                    <thead>
                        <tr> 
                            <th>Number of Unique ISPs</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td id="noisp"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div id="AverageAgeOfContent">
                <div class="menu-space"></div>
                <table id="content-table-selector">
                    <thead>
                        <tr> 
                            <th>Content-Type</th>
                            <th>Average Age</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <select id="selectContentType">
                                    <option>Choose Content-Type</option>
                                </select>
                            </td>
                            <td id="aaoc"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div id = "ResponseTimeAnalysis">
                <h2>Filters</h2>
                    <ul class="ulrta">
                        <li class="rta1">
                            <input type="checkbox" name="rt-filter" value="Content-Type">Content-Type<br>
                                <div id="ct-filter-wrapper">
                                    <select multiple="multiple" id="ct-filter">
                                        <option>All Content-Types</option>
                                    </select>
                                </div>
                                <br>
                            <input type="checkbox" name="rt-filter" value="Day of the Week Chart">Day of the Week<br>
                                <div id="dotw-filter-wrapper">
                                    <select multiple="multiple" id="dotw-filter">
                                        <option>All Days</option>
                                        <option>Monday</option>
                                        <option>Tuesday</option>
                                        <option>Wednesday</option>
                                        <option>Thursday</option>
                                        <option>Friday</option>
                                        <option>Saturday</option>
                                        <option>Sunday</option>
                                    </select>
                                </div>
                        </li>
                        <li class="rta2"><input type="checkbox" name="rt-filter" value="HTTP Method">HTTP Method<br>
                            <div id="http-filter-wrapper">
                                <select multiple="multiple" id="http-filter">
                                    <option>All HTTP Methods</option>
                                </select>
                            </div>
                            <br>
                            <input type="checkbox" name="rt-filter" value="ISP">ISP<br>
                                <div id="isp-filter-wrapper">
                                    <select multiple="multiple" id="isp-filter">
                                        <option>All ISPs</option>
                                    </select>
                                </div>
                        </li>
                        <canvas id = "rtaChart" width="700" height="400"></canvas>
                    </ul>
            </div>
            <div id = "HeaderAnalysis">
                <h2>Filters</h2>
                <ul class="ulrta">
                    <li class="rta1">
                        <input type="checkbox" name="rt-filter" value="TTL Content-Type">Content-Type<br>
                            <div id="ttl-ct-filter-wrapper">
                                <div style="margin-top:8%"></div>
                                <select multiple="multiple" id="ttl-ct-filter">
                                    <option>All Content-Types</option>
                                </select>
                            </div>
                    </li>
                    <li class="rta2">
                        <input type="checkbox" name="rt-filter" value="HA ISP">ISP<br>
                            <div id="ha-isp-filter-wrapper">
                                <div style="margin-top:8%"></div>
                                <select multiple="multiple" id="ha-isp-filter">
                                    <option>All ISPs</option>
                                </select>
                            </div>
                    </li>
                    <canvas id = "haChart" width="700" height="400" style="margin-top:30%"></canvas>
                    <div style="margin-top:8%"></div>
                </ul>
                <h2>Filters</h2>
                <ul class="ulrta">
                    <li class="rta1">
                        <input type="checkbox" name="rt-filter" value="MSMF Content-Type">Content-Type<br>
                            <div id="msmf-ct-filter-wrapper">
                                <div style="margin-top:8%"></div>
                                <select multiple="multiple" id="msmf-ct-filter">
                                    <option>All Content-Types</option>
                                </select>
                            </div>
                    </li>
                    <li class="rta2">
                        <input type="checkbox" name="rt-filter" value="MSMF ISP">ISP<br>
                            <div id="msmf-isp-filter-wrapper">
                                <div style="margin-top:8%"></div>
                                <select multiple="multiple" id="msmf-isp-filter">
                                    <option>All ISPs</option>
                                </select>
                            </div>
                    </li>
                </ul>
                <br style="clear:both">
                <table id="content-table">
                    <thead>
                        <tr> 
                            <th>Directive</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>max-stale</td>
                            <td id="msd"></td>
                        </tr>
                        <tr>
                            <td>min-fresh</td>
                            <td id="mfd"></td>
                        </tr>
                    </tbody>
                </table>
                <div style="margin-top:8%"></div>
                <h2>Filters</h2>
                <ul class="ulrta">
                    <li class="rta1">
                        <input type="checkbox" name="rt-filter" value="CD Content-Type">Content-Type<br>
                            <div id="cd-ct-filter-wrapper">
                                <div style="margin-top:8%"></div>
                                <select multiple="multiple" id="cd-ct-filter">
                                    <option>All Content-Types</option>
                                </select>
                            </div>
                    </li>
                    <li class="rta2">
                        <input type="checkbox" name="rt-filter" value="CD ISP">ISP<br>
                            <div id="cd-isp-filter-wrapper">
                                <div style="margin-top:8%"></div>
                                <select multiple="multiple" id="cd-isp-filter">
                                    <option>All ISPs</option>
                                </select>
                            </div>
                    </li>
                </ul>
                <br style="clear:both">
                <table id="content-table">
                    <thead>
                        <tr> 
                            <th>Cacheability Directive</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>public</td>
                            <td id="pud"></td>
                        </tr>
                        <tr>
                            <td>private</td>
                            <td id="prd"></td>
                        </tr>
                        <tr>
                            <td>no-cache</td>
                            <td id="ncd"></td>
                        </tr>
                        <tr>
                            <td>no-store</td>
                            <td id="nsd"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div id="loader">Loading...</div>
    <script src="users_info.js"></script>
</body>
</html>    


