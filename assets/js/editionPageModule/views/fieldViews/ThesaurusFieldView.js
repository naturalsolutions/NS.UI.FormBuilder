define([
    'jquery',
    'lodash',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/thesaurusFieldView.html',
    'text!editionPageModule/templates/fields/readonly/thesaurusFieldView.html',
    'backbone.radio',
    'tools'
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO, Radio, tools) {

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

            this.rendered = false;
            this.savedDefaultNode = undefined;
            this.savedFullpath = undefined;
        },

        initGlobalChannel : function() {
            this.globalChannel = Backbone.Radio.channel('global');

            this.globalChannel.on('nodeSelected' + this.model.get('id'), this.updateTreeView, this);
            this.globalChannel.on('nodeReset' + this.model.get('id'), this.resetTreeView, this);
            this.globalChannel.on('resetSavedValues', this.resetSavedValues, this);
        },

        initConfigChannel : function() {
            this.configChannel = Backbone.Radio.channel('config');

            this.configChannel.on('get:startID', _.bind(this.displayTreeView, this));
        },

        displayTreeView : function(startID) {
            var that = this;
            var item = $('#thesaurus' + that.model.get('id'));

            if (startID == "")
                startID = tools.getContextConfig(window.context, "thesaurusStartId");

            var callbackWSCallHttp = function(data){

                if (that.savedDefaultNode == startID)
                {
                    item.attr("placeholder", that.savedFullpath);
                    that.model.set('defaultNode', that.savedDefaultNode);
                    that.model.set('fullpath', that.savedFullpath);
                }

                item.autocompTree({
                    source: data['children'],
                    startId: startID,
                    inputValue: item.val(),
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

                if (that.savedDefaultNode == startID)
                {
                    item.attr("placeholder", that.savedFullpath);
                    that.model.set('defaultNode', that.savedDefaultNode);
                    that.model.set('fullpath', that.savedFullpath);
                }

                item.autocompTree({
                    source: data['d'],
                    startId: startID,
                    inputValue: item.val(),
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

            require(['autocompTree'], _.bind(function() {
                if (that.model.get('webServiceURL').substring(0, 5) == 'http:') {
                    if (window.trees[that.model.get('webServiceURL')]) {
                        callbackWSCallHttp(window.trees[that.model.get('webServiceURL')]);
                    }
                    else {
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
                        }, this)).error(function () {
                            alert("can't load ressources !");
                        });
                    }
                }
            }), this);
        },

        updateTreeView : function(data) {
            var that = this;
            var item = $('#thesaurus' + that.model.get('id'));

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

            var reloadFieldInList = function(){
                if (children !== null) {
                    item.autocompTree('getTree').reload({
                        children : children
                    });
                    item.attr("placeholder", nodeFullpath);
                }
            };

            if (!that.savedDefaultNode)
            {
                that.resetSavedValues();
            }

            this.model.set('defaultNode', startID);
            this.model.set('fullpath', nodeFullpath);

            reloadFieldInList();

            $('input[name="defaultNode"]').val(startID);
            $('input[name="defaultNode"]').attr("value", startID);
            $('input[name="fullpath"]').val(nodeFullpath);
        },

        resetTreeView : function()
        {
            var that = this;
            this.displayTreeView(that.savedDefaultNode);
        },

        resetSavedValues : function()
        {
            this.savedDefaultNode = this.model.get('defaultNode');
            this.savedFullpath = this.model.get('fullpath');
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

    return TreeViewFieldView;

});