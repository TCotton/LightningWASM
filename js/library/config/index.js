import jquery from "jquery";
window.$ = window.jQuery = jquery;
import Backbone from "backbone";
Backbone.$ = window.$;
import _ from 'underscore';
export const LIGHTNING = {
  Model: {},
  Collection: {},
  View: {}
};

LIGHTNING.Constants = {
  URL: window.URL || window.webkitURL,
  worker: new Worker('../../new_worker.js'),
  nonce: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
};

LIGHTNING.Mixings = {
  newTemplate: function (id) {
    return _.template(document.getElementById(id).textContent);
  },

  getImage: function (fileData, imageType) {
    let src, view, binary, i, l;
    if (imageType !== 0) {
      // if PNG object to data URI
      view = new Uint8Array(fileData);
      binary = '';
      for (i = 0, l = view.length; i < l; i += 1) {
        binary += String.fromCharCode(view[i]);
      }
      src = 'data:' + this.model.get('imageType') + ';base64,' + btoa(binary);
    } else {
      src = fileData;
    }

    // set to memory the size of the data URI
    this.model.set('dataURIsize', encodeURI(src).split(/%..|./).length - 1);
    // return the data URI
    return src;
  },

  stringToObject: function (value, classes) {
    const newElement = document.createElement('div');
    newElement.className = classes;
    newElement.innerHTML = value;
    return newElement;
  },

  resetHTML: function () {
    if (document.querySelector('.error')) {
      const error = document.querySelector('.error');
      error.parentNode.removeChild(error);
    }
    if (document.querySelector('.output')) {
      const output = document.querySelector('.output');
      output.parentNode.removeChild(output);
    }
  }
};
