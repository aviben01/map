var token = "5a4b8472-b95b-4687-8179-0ccb621c7990";//localhost
// var token = "0fff9694-a045-4ede-b997-ee9927b0d56c";//govmap
// var token ='aafedfe5-8dfa-4fd5-9af9-8b95759447bd'; // my github

var defaultLocation;

var avaliableLayers = [
    "GASSTATIONS", 						// תחנות דלק
    "BUS_STOPS", 						// תחנות אוטובוס
    "MILESTONES",						// אבני ק"מ - כללי
    "CARPARKS",							// חניונים
    "NATAZ_KAYAM", 						// נת"צ קיים 
    "MASHLIMA2023",						// נתיבי העדפה
    "TRAFFIC_LIGHT_JUNCTION", 			// צמתים מרומזרים
    "TUNNELS", 							// מנהרות
    "TEMP_BRIDGE",						// גשרים - הטיטאנים 1735
    "122966",
    "a" // עוקף באג - שכבה לא קיימת - אחרת, אם כל השכבות מסומנות - מפסיק להציג הכל
];
var visibleLayers = [
    "GASSTATIONS", 						// תחנות דלק
    "TUNNELS", 							// מנהרות
    "TEMP_BRIDGE",						// גשרים - הטיטאנים 1735
    "122966",
];

function init_map(mapDivId, startLocationKeyword)
{
    govmap.createMap(mapDivId, 
        {
            token: token,
            visibleLayers: visibleLayers,  
            layers: avaliableLayers,
            showXY: true,  
            identifyOnClick:true,
            layersMode: 2,
            zoomButtons:true
        });
        defaultLocation = startLocationKeyword
        reset_map(); 
}

function reset_map()
{
    govmap.clearGeometriesByName(['origin', 'destination']);
    document.getElementById('originAddress').value = "";
    document.getElementById('destinationAddress').value = "";
    document.getElementById('truckHeight').value = "4.8";
    govmap.geocode({keyword: defaultLocation, type: govmap.geocodeType.AccuracyOnly}
    ).then(function(response){
        console.log(response)
        govmap.zoomToXY({ x: response.data[0].X, y: response.data[0].Y, level: 6, marker: false });
    }); 
    govmap.filterLayers(params ={ 
        layerName: 'TEMP_BRIDGE',
        whereClause: "VERT_GAP > -1",
        zoomToExtent: false
    }).then(function (response)  
    {  
        console.log(response);
    });
    // סגירת בועית אם היתה פתוחה
    govmap.closeBubble(); 
}

async function go() { 
    console.log("Filter by truck height " + document.getElementById('truckHeight').value + "m");
    govmap.filterLayers(params ={ 
        layerName: 'TEMP_BRIDGE',
        whereClause: "VERT_GAP <= " + document.getElementById('truckHeight').value,
        zoomToExtent: false
    }).then(function (response)  
    {  
        console.log(response);
    });
    govmap.clearGeometriesByName(['origin', 'destination']);


    govmap.geocode({keyword: document.getElementById('originAddress').value, type: govmap.geocodeType.AccuracyOnly}).then(function(response){
        console.log("origin: ", response)
        if (! response.data) {
            return;
        }
        let from = response.data[0]

        govmap.geocode({keyword: document.getElementById('destinationAddress').value, type: govmap.geocodeType.AccuracyOnly}).then(function(response){
            console.log("destination: ", response)
            if (! response.data) {
                return;
            }
            let to = response.data[0]
    
            console.log("display geopmetries: ", from, to);
            govmap.displayGeometries({
                wkts: ['POINT('+from.X+ ' '+ from.Y+')', 'POINT('+to.X+ ' '+ to.Y+')'],
                names: ['origin', 'destination'],
                geometryType: govmap.drawType.Point,
                defaultSymbol: { 'url':'https://www.waze.com/livemap/assets/pin-9ad4ceb21a2449b4d0bcacdcf464f015.png', 'width':35, 'height':38 },
                clearExisting: true,
                data: { 
                    tooltips: ["מוצא: " + from.ResultLable, "יעד: " + to.ResultLable],
                }
            }).then(function (e) {
            });

            console.log("zoom")
            center_x = (from.X + to.X)/2;
            center_y = (from.Y + to.Y)/2
            govmap.zoomToXY({ x: center_x, y: center_y,  level: calc_zoom_level(from, to), marker: false });

        });

    }); 

};

function calc_zoom_level(from, to) {
    radius = Math.floor(Math.max.apply(Math, [Math.abs(from.X - to.X), Math.abs(from.Y - to.Y)]))
    lvl = 7;    
    zoomLevelRadius = [220000, 100000, 50000, 25000, 10000, 5000, 1000];
    for (let i = 0; i < zoomLevelRadius.length; i++){
        if (radius > zoomLevelRadius[i]) {
            lvl = i;
            break;
        }
    }
    console.log(radius, lvl);
    return lvl;
}

