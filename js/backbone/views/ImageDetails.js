import LIGHTNING from '../config/config';
import Backbone from "backbone";
import _ from 'underscore';
import imageCompression from 'browser-image-compression';

const jquery = require("jquery")
window.$ = window.jQuery = jquery;
Backbone.$ = window.$;
LIGHTNING.View.ImageDetails = Backbone.View.extend(
  _.extend({}, LIGHTNING.Constants, LIGHTNING.Mixings, {
    initialize: function () {
      this.template = this.newTemplate('outputWrapper');
      this.model.on('change:image', this.getImageDetails, this);
      //this.model.on('change:maxHeight', this.getImageDetails, this);
    },
    testing: function () {
      console.log('max-height');
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
          this.processImage(image);
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

    processImage: function (file) {
      console.log(this.model.get('maxHeight'));
      console.log(this.model.get('start'));
      console.log('here');
      const imageFile = file;
      console.log('originalFile instanceof Blob', imageFile instanceof Blob); // true
      console.log(`originalFile size ${imageFile.size} b`);

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      }
      imageCompression(imageFile, options)
        .then(function (compressedFile) {
          console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
          console.log(`compressedFile size ${compressedFile.size} b`); // smaller than maxSizeMB

          console.dir(compressedFile);
        })
        .catch(function (error) {
          console.log(error.message);
        });

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
      this.resetHTML();
      document.getElementById('wrapper').appendChild(this.stringToObject(this.template(this.model.toJSON()), 'output clearfix'));
      return this;
    }
  }));
