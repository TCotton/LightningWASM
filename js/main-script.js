window.URL = window.URL || window.webkitURL;

var file;

var dropboxElement, consoleElement, outputElement;

var worker;

function initWorker() {

    worker = new Worker("worker.js");

    worker.onmessage = function (event) {

        var message = event.data;

        if (message.type == "stdout") {
            consoleElement.innerHTML += message.line + '\n';
        } else if (message.type == "start") {
            consoleElement.innerHTML = '';
        } else if (message.type == "done") {

            consoleElement.innerHTML += "Done!";

            var imageElement = getImage(message.data);

            outputElement.appendChild(imageElement);

            var downloadLinkElement = document.createElement('a');

            downloadLinkElement.className = 'download';
            downloadLinkElement.download = file.name;
            downloadLinkElement.href = imageElement.src;
            downloadLinkElement.innerHTML = 'Download';

            document.body.appendChild(downloadLinkElement);

            var cloneObject = document.getElementsByName('#wrapper');
            closeObject.parentNode.removeChild(document.getElementsByName('#wrapper'));
            document.body.appendChild(cloneObject);

        } else if (message.type == "ready") {
            consoleElement.innerHTML = "I'm ready! ..."
        }
    };
}


function getImage(fileData) {

    var blob = new Blob([fileData], {type: 'image/png'});

    var src = window.URL.createObjectURL(blob);

    var imageElement = document.createElement('img');

    imageElement.src = src;

    return imageElement;
}

document.addEventListener('DOMContentLoaded', function () {

    dropboxElement = document.getElementById("dropbox");
    consoleElement = document.getElementById("console");
    outputElement = document.getElementById("output").children[0];

    initWorker();

    function noopHandler(event) {
        event.preventDefault();
    }

    dropboxElement.addEventListener("dragenter", noopHandler, false);
    dropboxElement.addEventListener("dragexit", noopHandler, false);

    dropboxElement.addEventListener("dragover", function (event) {
        event.preventDefault();

        event.dataTransfer.dropEffect = 'copy';
    }, false);


    var inputElement = document.getElementById("input");
    inputElement.addEventListener("change", function (event) {

        var file = this.files[0];

        if (file.type !== "image/png") {

            alert('this is not a png image');

        }

        var fileReader = new FileReader();

        function onloadend(event) {

            var arrayBuffer = event.target.result;

            var data = new Uint8Array(arrayBuffer);

            worker.postMessage({
                'type': 'file',
                'data': data
            });

            worker.postMessage({
                'type': 'command',
                'command': 'go'
            });
        }

        if (fileReader.addEventListener) {
            fileReader.addEventListener('loadend', onloadend, false);
        } else {
            fileReader.onloadend = onloadend;
        }

        fileReader.readAsArrayBuffer(file);


        event.preventDefault();

    }, false);

    /*

     dropboxElement.addEventListener("drop", function (event) {

     event.preventDefault();

     if (dropboxElement.className == "disabled" || event.dataTransfer.files.length == 0) return; // TODO: Error message

     var files = event.dataTransfer.files;

     file = files[0];

     if (file.type != "image/png") return; // TODO: Error message


     dropboxElement.className = "disabled";

     var fileReader = new FileReader();

     function onloadend(event) {

     var arrayBuffer = event.target.result;

     var data = new Uint8Array(arrayBuffer);

     worker.postMessage({
     'type': 'file',
     'data': data
     });


     worker.postMessage({
     'type': 'command',
     'command': 'go'
     });
     }

     if (fileReader.addEventListener) {
     fileReader.addEventListener('loadend', onloadend, false);
     } else {
     fileReader.onloadend = onloadend;
     }

     fileReader.readAsArrayBuffer(file);
     }, false);
     */
});
