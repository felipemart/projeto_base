
import 'https://unpkg.com/@popperjs/core@2/dist/umd/popper.js';
import 'https://code.jquery.com/jquery-3.7.1.min.js';
import 'https://cdn.datatables.net/2.1.8/js/dataTables.js';
import './../plugins/bootstrap/js/bootstrap.js'
import './../plugins/fontawesome/js/all.min.js';
import './../plugins/popper.min.js';
import './../plugins/chart.js/chart.min.js';



'use strict';

/* ===== Enable Bootstrap Popover (on element  ====== */
const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))

/* ==== Enable Bootstrap Alert ====== */
//var alertList = document.querySelectorAll('.alert')
//alertList.forEach(function (alert) {
//  new bootstrap.Alert(alert)
//});

const alertList = document.querySelectorAll('.alert')
const alerts = [...alertList].map(element => new bootstrap.Alert(element))


/* ===== Responsive Sidepanel ====== */
const sidePanelToggler = document.getElementById('sidepanel-toggler');
const sidePanel = document.getElementById('app-sidepanel');
const sidePanelDrop = document.getElementById('sidepanel-drop');
const sidePanelClose = document.getElementById('sidepanel-close');

window.addEventListener('load', function () {
    responsiveSidePanel();
});

window.addEventListener('resize', function () {
    responsiveSidePanel();
});


function responsiveSidePanel() {
    let w = window.innerWidth;
    if (w >= 1200) {
        // if larger
        //console.log('larger');
        sidePanel.classList.remove('sidepanel-hidden');
        sidePanel.classList.add('sidepanel-visible');

    } else {
        // if smaller
        //console.log('smaller');
        sidePanel.classList.remove('sidepanel-visible');
        sidePanel.classList.add('sidepanel-hidden');
    }
};

sidePanelToggler.addEventListener('click', () => {
    if (sidePanel.classList.contains('sidepanel-visible')) {
        console.log('visible');
        sidePanel.classList.remove('sidepanel-visible');
        sidePanel.classList.add('sidepanel-hidden');

    } else {
        console.log('hidden');
        sidePanel.classList.remove('sidepanel-hidden');
        sidePanel.classList.add('sidepanel-visible');
    }
});


sidePanelClose.addEventListener('click', (e) => {
    e.preventDefault();
    sidePanelToggler.click();
});

sidePanelDrop.addEventListener('click', (e) => {
    sidePanelToggler.click();
});


/* ====== Mobile search ======= */
const searchMobileTrigger = document.querySelector('.search-mobile-trigger');
const searchBox = document.querySelector('.app-search-box');

searchMobileTrigger.addEventListener('click', () => {

    searchBox.classList.toggle('is-visible');

    let searchMobileTriggerIcon = document.querySelector('.search-mobile-trigger-icon');

    if (searchMobileTriggerIcon.classList.contains('fa-magnifying-glass')) {
        searchMobileTriggerIcon.classList.remove('fa-magnifying-glass');
        searchMobileTriggerIcon.classList.add('fa-xmark');
    } else {
        searchMobileTriggerIcon.classList.remove('fa-xmark');
        searchMobileTriggerIcon.classList.add('fa-magnifying-glass');
    }


});





//
// Pipelining function for DataTables. To be used to the `ajax` option of DataTables
//
DataTable.pipeline = function (opts) {
    // Configuration options
    var conf = Object.assign(
        {
            pages: 5, // number of pages to cache
            url: 'teste.json', // script url
            data: null, // function or object with parameters to send to the server
            // matching how `ajax.data` works in DataTables
            method: 'GET' // Ajax HTTP method
        },
        opts
    );

    // Private variables for storing the cache
    var cacheLower = -1;
    var cacheUpper = null;
    var cacheLastRequest = null;
    var cacheLastJson = null;

    return async function (request, drawCallback, settings) {
        var ajax = false;
        var requestStart = request.start;
        var drawStart = request.start;
        var requestLength = request.length;
        var requestEnd = requestStart + requestLength;

        if (settings.clearCache) {
            // API requested that the cache be cleared
            ajax = true;
            settings.clearCache = false;
        }
        else if (
            cacheLower < 0 ||
            requestStart < cacheLower ||
            requestEnd > cacheUpper
        ) {
            // outside cached data - need to make a request
            ajax = true;
        }
        else if (
            JSON.stringify(request.order) !==
            JSON.stringify(cacheLastRequest.order) ||
            JSON.stringify(request.columns) !==
            JSON.stringify(cacheLastRequest.columns) ||
            JSON.stringify(request.search) !==
            JSON.stringify(cacheLastRequest.search)
        ) {
            // properties changed (ordering, columns, searching)
            ajax = true;
        }

        // Store the request for checking next time around
        cacheLastRequest = JSON.parse(JSON.stringify(request));

        if (ajax) {
            // Need data from the server
            if (requestStart < cacheLower) {
                requestStart = requestStart - requestLength * (conf.pages - 1);

                if (requestStart < 0) {
                    requestStart = 0;
                }
            }

            cacheLower = requestStart;
            cacheUpper = requestStart + requestLength * conf.pages;

            request.start = requestStart;
            request.length = requestLength * conf.pages;

            // Provide the same `data` options as DataTables.
            if (typeof conf.data === 'function') {
                // As a function it is executed with the data object as an arg
                // for manipulation. If an object is returned, it is used as the
                // data object to submit
                var d = conf.data(request);
                if (d) {
                    Object.assign(request, d);
                }
            }
            else if (conf.data) {
                // As an object, the data given extends the default
                Object.assign(request, conf.data);
            }

            // Use `fetch` to make Ajax request
            let response = await fetch(
                conf.url + '?json=' + JSON.stringify(request),
                {
                    method: conf.method
                }
            );

            let json = await response.json();

            cacheLastJson = JSON.parse(JSON.stringify(json));

            if (cacheLower != drawStart) {
                json.data.splice(0, drawStart - cacheLower);
            }
            if (requestLength >= -1) {
                json.data.splice(requestLength, json.data.length);
            }

            drawCallback(json);
        }
        else {
            json = JSON.parse(JSON.stringify(cacheLastJson));
            json.draw = request.draw; // Update the echo for each response
            json.data.splice(0, requestStart - cacheLower);
            json.data.splice(requestLength, json.data.length);

            drawCallback(json);
        }
    };
};
// $(document).ready(function () {
//     var table = $('.data-table').DataTable({
//         processing: true,
//         serverSide: true,
//         ajax: "/dados",
//         columns: [
//             {data: 'id', name: 'id'},
//             {data: 'name', name: 'name'},
//             {data: 'email', name: 'email'},
//             {data: 'action', name: 'action', orderable: false, searchable: false},
//         ]
//     });
// });
