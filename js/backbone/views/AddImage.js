import LIGHTNING from '../config/config';
import Backbone from "backbone";
import _ from 'underscore';
LIGHTNING.View.AddImage = Backbone.View.extend(
    _.extend({}, LIGHTNING.Constants, LIGHTNING.Mixings, {
        el: '#wrapper',
        events: {
            'change #input': 'submitImage',
            'dragover #input': 'dragoverMethod',
            'dragenter #input': 'dragenterMethod',
            'drop #input': 'dropEvent',
            'mouseover p.last': 'displayMessage',
            'click #nopng': 'checkboxSettings'
        },

        initialize: function () {
            this.template = this.newTemplate('errorWrapper');
            document.getElementById('input').setAttribute('data-nonce', this.nonce);
            this.checkboxSettingsPageLoad();
        },

        checkboxSettings: function () {
            const checkBox = document.querySelector('.checked-slider p');
            if (document.getElementById("nopng").checked) {
                checkBox.childNodes[0].nodeValue = 'Turn on PngCrush';
                localStorage.setItem('png', 'no');
            } else {
                checkBox.childNodes[0].nodeValue = 'Turn off PngCrush';
                localStorage.setItem('png', 'yes');
            }
        },

        checkboxSettingsPageLoad: function () {
            if (localStorage.getItem('png')) {
                let checkBox = document.querySelector('.checked-slider p'),
                    pngSettings = localStorage.getItem('png'),
                    nonpngID = document.getElementById('nopng');
                if (pngSettings === 'yes') {
                    checkBox.childNodes[0].nodeValue = 'Turn off PngCrush';
                    nonpngID.removeAttribute('checked');
                } else {
                    checkBox.childNodes[0].nodeValue = 'Turn on PngCrush';
                    nonpngID.setAttribute('checked','checked');
                }
            }
        },

        displayMessage: function () {
            document.querySelector('p.last-hidden').style.display = 'block';
        },

        dragoverMethod: function (e) {
            e = e.originalEvent;
            e.preventDefault();
            e.stopPropagation();
            e.dropEffect = 'copy';
        },

        dragenterMethod: function (e) {
            e = e.originalEvent;
            e.preventDefault();
            e.stopPropagation();
        },

        dropEvent: function (e) {
            e = e.originalEvent;
            e.preventDefault();
            e.stopPropagation();
            this.submitImage(e, e.dataTransfer);
        },

        submitImage: function (e, dataTransfer) {
            "use strict";
            let file, error, nonce;
            // added nonce for CRSF protection
            nonce = document.getElementById('input').getAttribute('data-nonce');
            if (nonce !== this.nonce) return;
            //this.el.setAttribute('disabled', 'disabled');

            // remove previous html and return model to its default values
            this.model.clear().set(this.model.defaults);
            if (e.type === 'drop') {
                file = dataTransfer.files[0];
            }
            if (e.type === 'change') {
                file = e.currentTarget.files[0];
            }
            if (file == null) return;
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
            this.resetHTML();
            document.getElementById('wrapper').appendChild(this.stringToObject(this.template(this.model.toJSON()), 'error'));
            return this;
        }
    }));
