import jquery from "jquery";
window.$ = window.jQuery = jquery;
import Backbone from "backbone";
import _ from 'underscore';
import {LIGHTNING} from '../config';
Backbone.$ = window.$;
import imageCompression from 'browser-image-compression';
LIGHTNING.View.ProcessImage = Backbone.View.extend(
  _.extend({}, LIGHTNING.Constants, LIGHTNING.Mixings, {
    initialize: function () {
      this.template = this.newTemplate('outputWrapper');
      this.model.on('change:image', this.getImageDetails, this);
    },

    getImageDetails: function () {
      if (this.model.get('image') == null) return;
      if (this.model.get('image') !== null && this.model.get('image').type !== 'image/png') return;
      let fileReader = new FileReader();
      this.params = {
        maxWidthOrHeight: null,
      }
      let onloadend = function (event) {
        const result = event.target.result;
        let data = new Uint8Array(result);
        this.currentTask = {};
        this.findImageDimensions(data, this.model.get('image').type);
      }.bind(this);

      if (fileReader.addEventListener) {
        fileReader.addEventListener('loadend', onloadend, false);
      } else {
        fileReader.onloadend = onloadend;
      }
      fileReader.readAsArrayBuffer(this.model.get('image'));
    },

    findImageDimensions: function (img, imageFormat) {
      const i = new Image;

      const loaded = new Promise((resolve) => {
        i.onload = () => {
          this.params.maxWidthOrHeight = Math.max(i.naturalHeight, i.naturalWidth);
          resolve();
        }
      })

      loaded.then(() => {
        this.imageCompress(this.model.get('image'));
      });
      i.src = window.URL.createObjectURL(new Blob([img], {type: imageFormat}));
    },

    imageCompress: function(data) {
      const imageFile = data;
      console.log('originalFile instanceof Blob', imageFile instanceof Blob); // true
      console.log(`originalFile size ${imageFile.size} bytes`);

      const options = {
        maxSizeMB: imageFile.size / 1024 / 1024,
        maxWidthOrHeight: this.params.maxWidthOrHeight,
        useWebWorker: true,
      }
      imageCompression(imageFile, options)
        .then(function (compressedFile) {
          console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
          console.log(`compressedFile size ${compressedFile.size} bytes`); // smaller than maxSizeMB

          console.dir(compressedFile);
        })
        .catch(function (error) {
          console.log(error.message);
        });
    },

    render: function () {
      this.model.set('end', new Date().getTime());
      this.resetHTML();
      document.getElementById('wrapper').appendChild(this.stringToObject(this.template(this.model.toJSON()), 'output clearfix'));
      return this;
    }

  }));
