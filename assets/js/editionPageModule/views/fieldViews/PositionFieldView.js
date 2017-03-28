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

            var callbackWSCallHttp = function(data){
                $('#position' + that.model.get('id')).autocompTree({
                    source: data['children'],
                    startId: startID,
                    inputValue: item.val(),
                    onItemClick: function (event, data){console.log("test 02", event, data);},
                    display: {
                        isDisplayDifferent: true
                    },
                    WsParams: {
                        ProfMin: item.attr('profmin') ? item.attr('profmin') : null,
                        ProfMax: item.attr('profmax') ? item.attr('profmax') : null,
                        ForLeafs: item.attr('forleafs') ? item.attr('forleafs') : null,
                        NotDisplayOutOfMax: item.attr('notdisplayoutofmax') ? item.attr('notdisplayoutofmax') : null
                    }
                });
            };

            var callbackWSCallOther = function(data){
                $('#position' + that.model.get('id')).autocompTree({
                    source: data['d'],
                    startId: startID,
                    inputValue: item.val(),
                    onItemClick: function (event, data){console.log("test 03", event, data);},
                    display: {
                        isDisplayDifferent: true
                    },
                    WsParams: {
                        ProfMin: item.attr('profmin') ? item.attr('profmin') : null,
                        ProfMax: item.attr('profmax') ? item.attr('profmax') : null,
                        ForLeafs: item.attr('forleafs') ? item.attr('forleafs') : null,
                        NotDisplayOutOfMax: item.attr('notdisplayoutofmax') ? item.attr('notdisplayoutofmax') : null
                    }
                });
            };

            require(['jquery-ui', 'autocompTree'], _.bind(function() {
                if (that.model.get('webServiceURL').substring(0, 5) == 'http:') {
                    if (window.trees[that.model.get('webServiceURL')]) {
                        callbackWSCallHttp(window.trees[that.model.get('webServiceURL')]);
                    }
                    else {
                        if (startID == "")
                        {
                            startID = AppConfig.config.startID.position[window.context];
                            if (!startID)
                                startID = AppConfig.config.startID.position.default;
                        }
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
                                callbackWSCallHttp(data);
                            }, this)
                        });
                    }
                }
                else {
                    if (window.trees[that.model.get('webServiceURL')]) {
                        callbackWSCallOther(window.trees[that.model.get('webServiceURL')]);
                    }
                    else {
                        $.getJSON(that.model.get('webServiceURL'), _.bind(function (data) {
                            callbackWSCallOther(data);
                        }, this)).error(function (a, b, c) {
                            alert("can't load ressources !");
                        });
                    }
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
                    $('#position' + that.model.get('id')).autocompTree('getTree').reload({
                        children : children
                    });
                } else {
                    var arr = [];
                    arr[0] = data.node;
                    that.$el.first('.positionField').autocompTree('getTree').reload(arr);
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