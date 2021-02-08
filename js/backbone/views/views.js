import LIGHTNING from '../config/config';
const jquery = require("jquery")
window.$ = window.jQuery = jquery;
import Backbone from "backbone";
Backbone.$ = window.$;
import _ from 'underscore';
LIGHTNING.View.AddImage = Backbone.View.extend(
  _.extend({}, LIGHTNING.Constants, LIGHTNING.Mixings, {
    el: '#input',
    events: {
      'change': 'submitImage'
    },
    initialize: function () {
      this.template = this.newTemplate('errorWrapper');
    },
    submitImage: function (e) {
      let file, error, output;
      // remove previous html and return model to its default values
      this.model.clear().set(this.model.defaults);
      if (document.querySelector('.error')) {
        error = document.querySelector('.error');
        error.parentNode.removeChild(error);
      }
      if (document.querySelector('.output')) {
        output = document.querySelector('.output');
        output.parentNode.removeChild(output);
      }
      file = e.currentTarget.files[0];
      // validate uploaded file to see if it is the correct image type
      // if not then render the error template
      this.model.set('file', file.type, {
        validate: true
      });
      if (this.model.set('file').validationError !== null) {
        this.model.set('error', this.model.set('file').validationError);
        this.render();
      } else {
        this.model.set('image', file);
        this.model.set('start', new Date().getTime());
      }
      e.preventDefault();
    },

    render: function () {
      document.getElementById('wrapper').appendChild(this.stringToObject(this.template(this.model.toJSON()), 'error'));
      return this;
    }

  }));



LIGHTNING.View.Worker = Backbone.View.extend(
  _.extend({}, LIGHTNING.Constants, LIGHTNING.Mixings, {

    initialize: function () {
      this.template = this.newTemplate('outputWrapper');
      this.webWorker();
      this.model.on('change:image', this.runWebWorker, this);
    },

    runWebWorker: function () {
      // if PNG file then run the web worker and user the FileReader API
      "use strict";
      if (this.model.get('image') == null) return;
      if (this.model.get('image') !== null && this.model.get('image').type !== 'image/png') return;
      let fileReader = new FileReader();
      let onloadend = function (event) {
        let data = new Uint8Array(event.target.result);
        this.worker.postMessage({
          'type': 'file',
          'data': data
        });
        this.worker.postMessage({
          'type': 'command',
          'command': 'go'
        });
      }.bind(this);

      if (fileReader.addEventListener) {
        fileReader.addEventListener('loadend', onloadend, false);
      } else {
        fileReader.onloadend = onloadend;
      }

      fileReader.readAsArrayBuffer(this.model.get('image'));

    },

    webWorker: function () {
      this.worker.onmessage = function (event) {
        let message = event.data;
        switch (message.type) {
          case 'stdout':
            if (message.line.indexOf('filesize reduction') !== -1) {
              this.model.set('fileSizeReduction', message.line.trim().replace(/\((.+)\)/g, "$1"));
            }
            break;
          case 'start':
            //consoleElement.innerHTML = '';
            console.log('start');
            break;
          case 'done':
            this.model.set('dataURI', this.getImage(message.data));
            this.render();
            break;
          default:
            console.log('I am ready');
        }
      }.bind(this);
    },

    render: function () {
      this.model.set('end', new Date().getTime());
      document.getElementById('wrapper').appendChild(this.stringToObject(this.template(this.model.toJSON()), 'output clearfix'));
      return this;
    }
  }));


LIGHTNING.View.ImageDetails = Backbone.View.extend(
  _.extend({}, LIGHTNING.Constants, LIGHTNING.Mixings, {

    initialize: function () {
      this.template = this.newTemplate('outputWrapper');
      this.model.on('change:image', this.getImageDetails, this);
    },

    getImageDetails: function () {
      let image = this.model.get('image');
      if (image == null) return;
      // set model defaults based on image
      switch (image.type) {
        case 'image/png':
          this.model.set('originalImageSize', image.size);
          this.model.set('imageType', image.type);
          this.model.set('imageName', image.name);
          break;
        case 'image/jpeg':
        case 'image/jpg':
          this.model.set('originalImageSize', image.size);
          this.model.set('imageType', image.type);
          this.model.set('imageName', image.name);
          this.processImageNonPNG(image);
          break;
        case 'image/gif':
          this.model.set('originalImageSize', image.size);
          this.model.set('imageType', image.type);
          this.model.set('imageName', image.name);
          this.processImageNonPNG(image);
          break;
        default:
          console.log('only jpegs, gifs or pngs');
      }
    },

    processImageNonPNG: function () {
      // create data URI if the image is a JPEG or GIF
      let Reader = new FileReader();
      Reader.onload = function (readerEvent) {
        this.model.set('dataURI', this.getImage(readerEvent.target.result, 0));
        this.render();
      }.bind(this);
      Reader.readAsDataURL(this.model.get('image'));
    },

    render: function () {
      this.model.set('end', new Date().getTime());
      document.getElementById('wrapper').appendChild(this.stringToObject(this.template(this.model.toJSON()), 'output clearfix'));
      return this;
    }

  }));
