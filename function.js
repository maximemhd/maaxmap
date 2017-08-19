const remote = require('electron').remote;
const {
    dialog
} = require('electron').remote
const {
    webContents
} = require('electron').remote
const fs = require('fs');
const async = require('async');

document.getElementById("min-btn").addEventListener("click", function(e) {
    var window = remote.getCurrentWindow();
    window.minimize();
});

document.getElementById("max-btn").addEventListener("click", function(e) {
    var window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
        window.maximize();
    } else {
        window.unmaximize();
    }
});

document.getElementById("close-btn").addEventListener("click", function(e) {
    var window = remote.getCurrentWindow();
    window.close();
});

var strava = require('strava-v3');

function strava_login(){
  strava.athlete.get({},function(err,payload,limits) {
      //do something with your payload, track rate limits
      if(!err) {
          console.log(payload);
          strava.athletes.stats({id:payload.id},function(err,payloadstats,limits) {
              if(!err) {
                  console.log(payload);
                  //console.log(payload.all_ride_totals);
                  var nbr_activities = payloadstats.all_ride_totals.count + payloadstats.all_run_totals.count;
                  console.log(nbr_activities);
                  get_all_activities(nbr_activities);
              }
              else {
                  console.log(err);
              }
          });
      }
      else {
          console.log(err);
      }
  });
}



function get_all_activities(nbr_activities){
    var nbr_pages = parseInt(nbr_activities/200)+1;
    console.log(nbr_pages);
    //var total = 0;
    var per_page = 200;
  //  var activities = [] ;
   var polylines = [] ;
    async.times(nbr_pages, function(i, next){
      console.log(i);
      if(i==nbr_pages-1){
        per_page = nbr_activities - (i)*per_page;
      }
      strava.athlete.listActivities({ 'page':i
        , 'per_page':per_page},function(err,payload,limits) { //200
          //do something with your payload, track rate limits
          if(!err) {
            //console.log(payload);
              for(var j=0; j<payload.length; j++){
                //  activities[j+i*200] = payload[j].id; //200
                polylines[j+i*200] = {
                  'line': payload[j].map.summary_polyline, //200
                  'type': payload[j].type
                }
                //  total++; //debug
              }
               next(err);
          }
          else {
              console.log(err);
          }
      });
      },
      function (err) {
          // Here when all four calls are done
        //console.log(activities);
        //console.log(total);
        //draw_all_activities(activities);
        display_polylines(polylines);
  });
}
var decodePolyline = require('@mapbox/polyline');

function display_polylines(polylines){

  for (var i = 0; i<polylines.length; i++){

    // returns an array of lat, lon pairs
    if(polylines[i].line){
      var trace = decodePolyline.decode(polylines[i].line);
      if(polylines[i].type == "Run"){
        var polyline = L.polyline(trace, {color: 'rgb(119, 177, 214)'}).addTo(map); //, dashArray: [1,4]
      }
      else{
        var polyline = L.polyline(trace, {color: 'rgb(155, 119, 214)'}).addTo(map); //, dashArray: [1,4]
      }

    }


  }
}

function draw_all_activities(activities){

  for (var i = 0; i<activities.length; i++){
    strava.streams.activity({id:activities[i],types:"latlng"},function(err,payload,limits) {
        //do something with your payload, track rate limits
        if(!err) {
            console.log(payload);
            var polyline = L.polyline(payload[0].data, {color: 'rgb(119, 177, 214)'}).addTo(map);
        }
        else {
            console.log(err);
        }
    });
  }
}

function open_explorer_map() {
    var files = [];
    dialog.showOpenDialog({
        filters: [

            {
                name: 'gpx',
                extensions: ['gpx']
            }

        ],
        properties: ['multiSelections']
    }, function(fileNames) {
        if (fileNames === undefined) return;
        // document.getElementById('drag-file-pane').innerHTML ='<h3>Loading... </h3>';
        var fileName = fileNames[0];
        //files.push(fileNames);
        if (fileNames.length <= 500) {
            init_map(fileNames);
            console.log("ok");
        } else {
            alert('Veuillez choisir moins de 500 fichiers.')
        }
    });

}

function open_explorer_ign() {
    var files = [];
    dialog.showOpenDialog({
        filters: [
            {
                name: 'gpx',
                extensions: ['gpx']
            }
        ],
        properties: ['multiSelections'] //
    }, function(fileNames) {
        if (fileNames === undefined) return;
        // document.getElementById('drag-file-pane').innerHTML ='<h3>Loading... </h3>';
        var fileName = fileNames[0];
        //files.push(fileNames);
        if (fileNames.length <= 500) {
          for(var i=0; i<fileNames.length ; i++){
            // Add the Layer with the GPX Track
            var layerGPS = new ol.layer.Vector({
                source: new ol.source.Vector({
                  url: fileNames[i],
                  format: new ol.format.GPX()
                }),
                style: function(feature) {
                  return style[feature.getGeometry().getType()];
                }
              });
            map.addLayer(layerGPS);
              console.log("ok");
          }
        } else {
            alert('Veuillez choisir moins de 500 fichiers.')
        }
    });

}

function init_map(path) {
    for (var i = 0; i < path.length; i++) {
        var runLayer = omnivore.gpx(path[i]).on('ready', function() {}).addTo(map);

        if (i == path.length - 1) {
            var runLayer = omnivore.gpx(path[i]).on('ready', function() {
                map.fitBounds(runLayer.getBounds());
                //document.getElementById('drag-file-pane').innerHTML = '<img src="images/cloud.PNG"></img><h3>Drag your GPX <br> file here</h3>'
            }).addTo(map);
        }

    }

}

var win = remote.getCurrentWindow();

function printpdf() {

    dialog.showSaveDialog({
        title: 'map',
        defaultPath: '~/map.pdf'
    }, function(fileName) {
        if (fileName) {
            win.webContents.printToPDF({
                landscape: true,
                pageSize: "A4",
                marginsType: 1
            }, (error, data) => {
                if (error) throw error
                //console.log(data);
                fs.writeFile(fileName, data, (error) => {
                    if (error) throw error
                    //console.log('Write PDF successfully.')
                    alert('Write PDF successfully.');
                })
            })
        }
    });
}

function printpage() {
    win.webContents.print();
}

function A4size() {
    win.setSize(3508, 2480);
}

function quatreA4size() {
    win.setSize(14032, 9920);
}
