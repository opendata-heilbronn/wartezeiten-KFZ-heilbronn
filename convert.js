//TODO: Visitors noch verwenden
//TODO: Über ticketnummer abgearbeite Visitots checken

var fs = require('fs');
var momentLibrary = require('moment');
var async = require('async');

var serverSource = "/var/opt/wartezeiten_lk";

var openingHours = { '0': {'from': 7, 'to': 15},
                     '1': {'from': 7, 'to': 15},
                     '2': {'from': 7, 'to': 18},
                     '3': {'from': 7, 'to': 15},
                     '4': {'from': 7, 'to': 13}};
var data = {};
var files = fs.readdirSync(serverSource);
var jsonObjects = [];
var file;

var dateLimit = momentLibrary().day("Monday").subtract(7, 'weeks');

console.log("DateLimit: "+dateLimit.format());

function fill(v) {
    file = fs.readFileSync(serverSource+'/' + v, 'utf8');
    if(file)
        jsonObjects.push(JSON.parse(file));
}

files.forEach(fill);

function convert(v) {
    var lastUpdate = momentLibrary(v[0].lastupdate);
    if (lastUpdate.isBefore(dateLimit)) {
    	return;
    }

    var year = lastUpdate.year();
    var week = lastUpdate.week();
    var weekday = lastUpdate.isoWeekday() -1;
    var hour = lastUpdate.hour();

    var weekdayOpeningHours = openingHours[weekday];

    if(weekdayOpeningHours != null && hour >= weekdayOpeningHours.from && hour < weekdayOpeningHours.to)
    {
        var yearData = data[year];

        if (!yearData) {
            yearData = {};
            data[year] = yearData;
        }

        var weekData = yearData[week];

        if (!weekData) {
            weekData = {};
            yearData[week] = weekData;
        }

        var weekDayData = weekData[weekday];

        if (!weekDayData) {
            weekDayData = {};
            weekData[weekday] = weekDayData;
        }

        var hourData = weekDayData[hour];

        if (!hourData) {
            hourData = {};
            hourData["waitTimes"] = [];
            weekDayData[hour] = hourData;
        }

        hourData["waitTimes"].push(v[0].wait);
    }
}

jsonObjects.forEach(convert);

function aggregateWait(){
    for (var yearKey in data) {
        var year = data[yearKey];
        for (var weekKey in year) {
            var week = year[weekKey];
            for (var weekdayKey in week) {
                var weekday = week[weekdayKey];
                for (var hourKey in weekday) {

                    var hour = weekday[hourKey];
                    var waitTimes = hour["waitTimes"];
                    var sum = 0;
                    waitTimes.forEach(function(v){
                       sum += Number(v);
                    });
                    var average = Math.round(sum / waitTimes.length);
                    hour["average"] = average;
                    delete hour["waitTimes"];
                }
            }
        }
    }
}

aggregateWait();

fs.writeFileSync('data.json', JSON.stringify(data));

var dataAllExport = [];
var dataExport = {};

function prepareExport() {
    for (var yearKey in data) {
        var year = data[yearKey];
        for (var weekKey in year) {
            var week = year[weekKey];
            var dataKey = yearKey + "-" + (weekKey < 10?"0":"") + weekKey;
            var weekData = dataExport[dataKey];

            if(!weekData){
                weekData = [];
                dataExport[dataKey] = weekData;
            }

            for (var weekdayKey in week) {
                var weekday = week[weekdayKey];
                for (var hourKey in weekday) {
                    var hourData = weekday[hourKey];

                    var waitData = {};
                    waitData["year"] = Number(yearKey);
                    waitData["week"] = Number(weekKey);
                    waitData["weekday"] = Number(weekdayKey);
                    waitData["hour"] = Number(hourKey);
                    waitData["wait"] = hourData["average"];
                    weekData.push(waitData);
                    dataAllExport.push(waitData);
                }
            }
        }
    }
}

prepareExport();

fs.writeFileSync("dataAllExport.json", JSON.stringify(dataAllExport));

/*
for(var key in dataExport){
    fs.writeFileSync("data-"+key+".json", JSON.stringify(dataExport[key]));
}
*/
