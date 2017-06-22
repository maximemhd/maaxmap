const remote = require('electron').remote;
const {
    dialog
} = require('electron').remote
const {
    webContents
} = require('electron').remote
const fs = require('fs');

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
