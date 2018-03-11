"use strict";
exports.__esModule = true;
var express = require("express");
var needle = require("needle");
var app = express();
app.set("view engine", "ejs");
// Metadata
var nomadlistUser = "krausefx";
// Cache
var currentCityText = "";
var currentLat = null;
var currentLng = null;
var nextCityText = null;
var nextCityDate = null;
// Refresher methods
function updateNomadListData() {
    var nomadlistUrl = "https://nomadlist.com/@" + nomadlistUser + ".json";
    needle.get(nomadlistUrl, function (error, response, body) {
        if (error) {
            console.log(error);
        }
        else if (response.statusCode == 200) {
            var parsedNomadListData = JSON.parse(body);
            var now = parsedNomadListData["location"]["now"];
            var next = parsedNomadListData["location"]["next"];
            currentCityText = now["city"] + ", " + now["country"];
            currentLat = now["latitude"];
            currentLng = now["longitude"];
            nextCityText = next["city"] + ", " + next["country"];
            nextCityDate = next["date_start"];
            console.log("Successfully loaded nomadlist data");
        }
    });
}
function allDataLoaded() {
    if (currentCityText == null || nextCityText == null || nextCityDate == null) {
        return false;
    }
    return true;
}
setInterval(updateNomadListData, 60000);
updateNomadListData();
// Web server
app.get("/", function (req, res) {
    // Because we're using the free Heroku tier for now
    // this means the server might just have started up
    // if that's the case, we'll have to wait until all data
    // is fetched
    if (allDataLoaded()) {
        res.render("pages/index", {
            currentCityText: currentCityText,
            nextCityText: nextCityText,
            nextCityDate: nextCityDate
        });
    }
    else {
        res.render("pages/loading");
    }
});
var port = process.env.PORT || 8080;
app.listen(port);
console.log("server live on port " + port);
