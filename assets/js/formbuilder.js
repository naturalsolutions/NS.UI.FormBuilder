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

            //	Init radio channel
            this.mainChannel = Backbone.Radio.channel('global');
            this.mainChannel.on('getModel', _.bind(function(id) {
            	this.mainChannel.trigger('getModel:return', this.currentCollection.get(id));
            }, this));

            this.mainChannel.on('getJSON', _.bind(function(id) {
            	this.mainChannel.trigger('getJSON:return', this.currentCollection.getJSON());
            }, this));

            this.mainChannel.on('export', _.bind(function(datas) {

            	//	Set attribute with datas parameters
                this.currentCollection['description'] = datas['description'];
                this.currentCollection['keywords']    = datas['keywords'];
                this.currentCollection['name']        = datas['name'];
                this.currentCollection['comments']    = datas['comments'];

            	var collectionExport = this.currentCollection[datas['mode'] === 'json' ? 'getJSON' : 'getXML']();
            	this.mainChannel.trigger('export:return', collectionExport);
            }, this));

            this.mainChannel.on('clear', _.bind(function() {
            	this.mainView.clear();
            }, this))

            this.mainChannel.on('JSONUpdate', _.bind(function(JSONUpdate) {
            	this.currentCollection.updateWithJSON(JSONUpdate);
            }, this));

			this.mainChannel.on('XMLUpdate', _.bind(function(XMLUpdate) {
            	this.currentCollection.updateWithXML(XMLUpdate);
            }, this));

            //  Init router
            this.router = new Router(options);
            Backbone.history.start();
        }
    };

  return formbuilder;

});