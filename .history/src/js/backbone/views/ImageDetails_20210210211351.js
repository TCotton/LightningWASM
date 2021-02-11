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
                //this.processImageNonPNG(image);

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
            this.resetHTML();
            document.getElementById('wrapper').appendChild(this.stringToObject(this.template(this.model.toJSON()), 'output clearfix'));
            return this;
        }
    }));
