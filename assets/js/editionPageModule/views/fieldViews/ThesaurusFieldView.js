define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/thesaurusFieldView.html',
    'text!editionPageModule/templates/fields/readonly/thesaurusFieldView.html',
    'backbone.radio'
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO, Radio) {

    var TreeViewFieldView = BaseView.extend({

        events: function() {
            return _.extend({}, BaseView.prototype.events, {
            });
        },

        initialize : function(options, readonly) {
            var opt = options;
            opt.template = viewTemplate;
            if (readonly)
                opt.template = viewTemplateRO;
            BaseView.prototype.initialize.apply(this, [opt]);

            this.initGlobalChannel();
            this.initConfigChannel();
        },

        initGlobalChannel : function() {
            this.globalChannel = Backbone.Radio.channel('global');

            this.globalChannel.on('nodeSelected' + this.model.get('id'), this.updateTreeView, this);
        },

        initConfigChannel : function() {
            this.configChannel = Backbone.Radio.channel('config');
        },

        updateTreeView : function(data) {


            console.log('UpdateTreeView',data,data['key'])

            var startID = data['node']['key'] ;
            if (false && this.model.get('webServiceURL').substring(0,5) == 'http:' ) {
                        var data ;
                        console.log(' YES WebService' );
                        $.ajax({
                            data        : JSON.stringify({StartNodeID: startID, lng: "fr"}),
                            type        : 'POST',
                            url         : this.model.get('webServiceURL'),
                            contentType : 'application/json',
                            //  If you run the server and the back separately but on the same server you need to use crossDomain option
                            //  The server is already configured to used it
                            crossDomain : true,

                            //  Trigger event with ajax result on the formView
                            success: _.bind(function(data) {
                                console.log(' YES Thes&aurus' );
                                console.log(data,data['children']) ;
                               $('#thesaurus' + this.model.get('id')).fancytree({
                                source     : data['children'],
                                checkbox   : false,
                                selectMode : 2,
                                activeNode :startID
                            });
                            }, this),
                        });



                    }
                    else {
                        if (data['node']['children'] !== null) {
                            $('#thesaurus' + this.model.get('id')).fancytree('getTree').reload({
                                children : data['node']['children']
                            });
                        } else {
                            var arr = [];
                            arr[0] = data.node;
                            this.$el.first('.thesaurusField').fancytree('getTree').reload(arr);
                        }
                    }
        },

        render : function() {
            BaseView.prototype.render.apply(this, arguments);

            this.configChannel.on('get:startID', _.bind(function(startID) {

                require(['jquery-ui', 'fancytree'], _.bind(function() {
                    if (this.model.get('webServiceURL').substring(0,5) == 'http:' ) {
                        var data ;
                        console.log(' YES WebService' );
                        $.ajax({
                            data        : JSON.stringify({StartNodeID: startID, lng: "fr"}),
                            type        : 'POST',
                            url         : this.model.get('webServiceURL'),
                            contentType : 'application/json',
                            //  If you run the server and the back separately but on the same server you need to use crossDomain option
                            //  The server is already configured to used it
                            crossDomain : true,

                            //  Trigger event with ajax result on the formView
                            success: _.bind(function(data) {
                                console.log(' YES Thes&aurus' );
                               $('#thesaurus' + this.model.get('id')).fancytree({
                                source     : data['children'],
                                checkbox   : false,
                                selectMode : 2,
                                activeNode :startID
                            });
                            }, this),
                        });



                    }
                    else {
                        $.getJSON(this.model.get('webServiceURL'), _.bind(function(data) {

                            $('#thesaurus' + this.model.get('id')).fancytree({
                                source     : data['d'],
                                checkbox   : false,
                                selectMode : 2,
                                activeNode :startID
                            });

                        }, this)).error(function(a,b , c) {
                            alert ("can't load ressources !");
                        });
                    }
                }, this));

            }, this));

            this.configChannel.trigger('get', 'startID');
        }
    });

	return TreeViewFieldView;

});