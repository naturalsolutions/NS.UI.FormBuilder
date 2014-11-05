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

        importedFields : {},

        initialize : function(options) {

        	//	Init collection
            this.currentCollection = new Collection({}, {
                name: "My protocol"
            });

            this.URLOptions = options['URLOptions'];

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
            this.mainChannel        = Backbone.Radio.channel('global');         // global application channel
            this.collectionChannel  = Backbone.Radio.channel('collection');     // channel for colleciton fonctionnalities

            this.collectionChannel.on('addSubView', _.bind(function(options){

                //  The event is send form a subformFieldView
                //  who want to create a subView
                var fieldViewType = options['field'].constructor.type + 'FieldView';

                require(['views/fieldViews/' + fieldViewType], _.bind(function(fieldView) {
                    var subView = new fieldView({
                        el : options['viewEl'],
                        model : options['field']
                    });

                    subView.render();
                    subView.$el.switchClass('span12', 'span10 offset1',0);
                    subView.$el.switchClass('dropField', 'subElement',0);

                    this.collectionChannel.trigger('subViewCreated/' + options['id'], subView);
                }, this));

            }, this));
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

            this.mainChannel.on('fieldConfiguration', _.bind(function(configuration) {
                $.post(this.URLOptions['configurationURL'], configuration).success(function() {
                    console.log ("on est bon")
                }).fail(function() {
                    console.log ("fail")
                })
            }, this))

            //  Init router
            this.router = new Router(options);
            Backbone.history.start();
        }
    };

  return formbuilder;

});