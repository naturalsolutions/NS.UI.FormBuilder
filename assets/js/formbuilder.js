/**
 * @fileOverview formbuilder.js
 *
 * This file init formbuilder application using require JS
 * Create and run backbone router
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

define(['backbone', 'router', 'models/collection', 'views/main/mainView', 'backbone.radio'], function(Backbone, Router, Collection, MainView, Radio){

    var formbuilder = {

        initialize : function(options) {

        	//	Init collection
            this.currentCollection = new Collection({}, {
                name: "My protocol"
            });

            //  Init main view
            this.mainView = new MainView({
                el         : options['el'],
                form       : this.currentCollection,
                URLOptions : options['URLOptions']
            });

            this.mainView.render();

            /*  ****************************************************    */
            /*  Init Backbone Radio channel
            /*  ****************************************************    */
            this.mainChannel = Backbone.Radio.channel('global');

            //  This channel allows to get a model with an ID
            this.mainChannel.on('getModel', _.bind(function(id) {
            	this.mainChannel.trigger('getModel:return', this.currentCollection.get(id));
            }, this));

            //  Allows to get JSON data from collection
            this.mainChannel.on('getJSON', _.bind(function() {
            	this.mainChannel.trigger('getJSON:return', this.currentCollection.getJSON());
            }, this));

            this.mainChannel.on('export', _.bind(function(datas) {

            	//	Set attribute with datas parameters
                this.currentCollection['description'] = datas['description'];
                this.currentCollection['keywords']    = datas['keywords'];
                this.currentCollection['name']        = datas['name'];
                this.currentCollection['comments']    = datas['comments'];

            	this.mainChannel.trigger('export:return', this.currentCollection.getJSON());
            }, this));

            //  Clear form, remove all fields
            this.mainChannel.on('clear', _.bind(function() {
            	this.mainView.clear();
            }, this))

            //  Update form with imported JSON data
            this.mainChannel.on('JSONUpdate', _.bind(function(JSONUpdate) {
            	this.currentCollection.updateWithJSON(JSONUpdate);
            }, this));

            //  Duplicate field
            this.mainChannel.on('copy', _.bind(function(modelID) {
                var modelToCopy     = this.currentCollection.get(modelID),
                    newModelAttr    = modelToCopy.toJSON();

                newModelAttr['id'] = this.currentCollection.length;
                this.currentCollection.addElement(modelToCopy.constructor.type + 'Field', newModelAttr);
            }, this));

            //  Init router
            this.router = new Router(options);
            Backbone.history.start();
        }
    };

  return formbuilder;

});