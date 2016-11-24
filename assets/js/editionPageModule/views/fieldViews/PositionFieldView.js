define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/PositionFieldView.html',
    'text!editionPageModule/templates/fields/readonly/PositionFieldView.html',
    'backbone.radio',
    'app-config'
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO, Radio, AppConfig) {

    var PositionFieldView = BaseView.extend({

        events: function() {
            return _.extend( {}, BaseView.prototype.events, {

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

            this.rendered = false;
        },

        initGlobalChannel : function() {
            this.globalChannel = Backbone.Radio.channel('global');

            this.globalChannel.on('nodeSelected' + this.model.get('id'), this.updateTreeView, this);
        },

        initConfigChannel : function() {
            this.configChannel = Backbone.Radio.channel('config');

            this.configChannel.on('get:startID', _.bind(this.displayTreeView, this));
        },

        displayTreeView : function(startID) {
            var that = this;
            if (startID == "")
            {
                startID = AppConfig.config.startID.position[window.context];
                if (!startID)
                    startID = AppConfig.config.startID.position.default;
            }

            require(['jquery-ui', 'fancytree'], _.bind(function() {
                if (that.model.get('webServiceURL').substring(0, 5) == 'http:') {
                    $.ajax({
                        data: JSON.stringify({StartNodeID: startID, lng: "fr"}),
                        type: 'POST',
                        url: that.model.get('webServiceURL'),
                        contentType: 'application/json',
                        //  If you run the server and the back separately but on the same server you need to use crossDomain option
                        //  The server is already configured to used it
                        crossDomain: true,

                        //  Trigger event with ajax result on the formView
                        success: _.bind(function (data) {
                            $('#position' + that.model.get('id')).fancytree({
                                source: data['children'],
                                checkbox: false,
                                selectMode: 2,
                                activeNode: startID,
                                click: function (event, data){/*console.log("-01**************", event, data);*/}
                            });
                        }, this),
                    });
                }
                else {
                    $.getJSON(that.model.get('webServiceURL'), _.bind(function (data) {

                        $('#position' + that.model.get('id')).fancytree({
                            source: data['d'],
                            checkbox: false,
                            selectMode: 2,
                            activeNode: startID,
                            click : _.bind(function(event, data) {
                                //console.log("03**************", event, data);
                            }, this)
                        });

                    }, this)).error(function (a,b,c) {
                        alert("can't load ressources !");
                    });
                }
            }), this);
        },

        updateTreeView : function(data) {
            var startID = "";
            var nodeFullpath = "";
            var children = null;

            if (data['node'])
            {
                startID = data['node']['key'] ;
                nodeFullpath = data['node']['data']['fullpath'];
                children = data['node']['children'];
            }
            else
            {
                startID = data['key'] ;
                nodeFullpath = data['fullpath'];
                children = data['children'];
            }

            var that = this;



            var reloadFieldInList = function(){
                if (children !== null) {
                    $('#position' + that.model.get('id')).fancytree('getTree').reload({
                        children : children
                    });
                } else {
                    var arr = [];
                    arr[0] = data.node;
                    that.$el.first('.positionField').fancytree('getTree').reload(arr);
                }
            };

            reloadFieldInList();

            this.model.set('defaultNode', startID);
            $('input[name="defaultNode"]').val(nodeFullpath);
            this.model.set('fullpath', nodeFullpath);
        },

        render : function() {
            if (!this.rendered) {
                BaseView.prototype.render.apply(this, arguments);
                this.rendered = true;
                this.displayTreeView(this.model.get("defaultNode"));
            }
            else
            {
                $('#dropField'+this.model.get('id')+' .field-label').text(this.model.get('labelFr'));
            }
        }

    });

	return PositionFieldView;

});