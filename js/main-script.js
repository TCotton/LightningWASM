window.URL = window.URL || window.webkitURL;

let file;
let dropboxElement, consoleElement, outputElement;
let worker;

function initWorker() {
  worker = new Worker("worker.js");
   worker.onmessage = function (event) {
       const message = event.data;

       if (message.type === "stdout") {
           consoleElement.innerHTML += message.line + '\n';
       } else if (message.type === "start") {
           consoleElement.innerHTML = '';
       } else if (message.type === "done") {
           consoleElement.innerHTML += "Done!";
           const imageElement = getImage(message.data);
           outputElement.appendChild(imageElement);
           const downloadLinkElement = document.createElement('a');

           downloadLinkElement.className = 'download';
           downloadLinkElement.download = file.name;
           downloadLinkElement.href = imageElement.src;
           downloadLinkElement.innerHTML = 'Download';

           document.body.appendChild(downloadLinkElement);
           let cloneObject = document.getElementsByName('#wrapper');
           closeObject.parentNode.removeChild(document.getElementsByName('#wrapper'));
           document.body.appendChild(cloneObject);

       } else if (message.type === "ready") {
           consoleElement.innerHTML = "I'm ready! ..."
       }
   };
}

function newWorkers() {
  const worker = new Worker('./new_worker.js');
  worker.onmessage = e => {
    switch (e.data.type) {
      case 'log':
        log(e.data.msg);
        break;
      case 'logError':
        logError(e.data.msg);
        break;
      case 'result':
        showResult(e.data.result);
        break;
      case 'error':
        showErrorResult(e.data.error);
        break;
    }
  };
}

function getImage(fileData) {
  let blob = new Blob([fileData], {type: 'image/png'});
  let src = window.URL.createObjectURL(blob);
  let imageElement = document.createElement('img');
  imageElement.src = src;
  return imageElement;
}

document.addEventListener('DOMContentLoaded', function () {

  dropboxElement = document.getElementById("input");
  consoleElement = document.getElementById("console");
  outputElement = document.getElementById("output").children[0];
  newWorkers();
  function noopHandler(event) {
    event.preventDefault();
  }

  dropboxElement.addEventListener("dragenter", noopHandler, false);
  dropboxElement.addEventListener("dragexit", noopHandler, false);

  dropboxElement.addEventListener("dragover", function (event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, false);

  let inputElement = document.getElementById("input");
  inputElement.addEventListener("change", function (event) {
    let file = this.files[0];
    if (file.type !== "image/png") {
      alert('this is not a png image');
    }
    let fileReader = new FileReader();

    function onloadend(event) {
      let arrayBuffer = event.target.result;
      let data = new Uint8Array(arrayBuffer);
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
