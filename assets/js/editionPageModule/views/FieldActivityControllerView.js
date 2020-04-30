define([
    '../models/M_ProtocoleType',
    '../models/M_FieldActivity',
    'app-config',
    'jquery',
    'lodash',
    'text!../templates/FieldActivityController.html',
    'backbone',
    'tools'
    ],
    function(
        protocoleTypeModel,
        fieldActivityModel,
        AppConfig,
        $,
        _,
        Template,
        Backbone,
        tools
        ) {

        return Backbone.View.extend({

            tagName : 'div',
            className : 'fieldsActivity',
            template: _.template(Template),

            events : {
                'change #fieldActivityListInput': 'addProtocoleToFieldActivity',
                'click button.js_remove_proto' : 'removeProtocol',
                'click button.js_toggleDisplayList' : 'showHideProtocole',
                'click button.js_reload' : 'reload',
                'click button.js_save' : 'save'
            },

            initialize : function(options) {
                this.options = options;
                this.errorFetching = true;
                this.ListId = [];
                this.fieldActivityProtocoleTypeToDisplay = []
                this.MyProto = {}
                this.nameProtoFB = options.nameProtoFB
                this.listFieldActiviesWhereProtoIn = []
                this.protoID = null;
                this.initCollections();
                this.fetchAllCollections();
            },

            reload: function() {
                this.initialize(this.options)
            },

            initCollections: function() {
                var protocoleTypes = Backbone.Collection.extend({
                    model: protocoleTypeModel,
                    url : AppConfig.ecoReleveURL + 'ProtocoleType'
                });

                var fieldActivities = Backbone.Collection.extend({
                    model: fieldActivityModel,
                    url : AppConfig.ecoReleveURL + 'FieldActivity'
                })

                this.protocoleTypesCollection = new protocoleTypes();
                this.fieldActivitiesCollection = new fieldActivities();
            },

            buildJSONPatch : function() {
                var toRet = []

                for( var i=0; i < this.fieldActivitiesCollection.length; i++) {
                    var curModelOrigin = this.fieldActivitiesCollection.models[i];
                    var curFieldActivityId = curModelOrigin.get('ID');
                    var arrayProtoOrigin  = curModelOrigin.get('Protocoles')
                    var existInDisplay = false;
                    var arrayProtoDisplay = []
                    for (var j=0; j < this.fieldActivityProtocoleTypeToDisplay.length; j++) {
                        var curModelDisplay = this.fieldActivityProtocoleTypeToDisplay[j];
                        if (curFieldActivityId == curModelDisplay.get('ID')) {
                            existInDisplay = true;
                            arrayProtoDisplay = curModelDisplay.get('Protocoles')
                            break;
                        }
                    }
                    var protoWasPresentInOrigin = false

                    for (var k=0; k < arrayProtoOrigin.length; k++){
                        if(arrayProtoOrigin[k]['ID'] == this.protoID) {
                            protoWasPresentInOrigin=true;
                            break;
                        }
                    }

                    if (!existInDisplay && protoWasPresentInOrigin) {
                        toRet.push({
                            "op": "remove",
                            "path": "/"+String(curFieldActivityId)+"/Protocoles/"+String(this.protoID)
                        })
                    }
                    if (existInDisplay && protoWasPresentInOrigin) {
                        for (var l=0; l < arrayProtoDisplay.length; l++){
                            if(arrayProtoDisplay[l]['ID'] != arrayProtoOrigin[l]['ID']) {
                                toRet.push({
                                    "op": "replace",
                                    "path": "/"+String(curFieldActivityId)+"/Protocoles/"+String(arrayProtoDisplay[l]['ID'])+"/Order",
                                    "value": arrayProtoDisplay[l]['Order']
                                })
                            }
                        }
                    }
                    if (existInDisplay && !protoWasPresentInOrigin) {
                        arrayProtoOrigin.push({ID:this.protoID, Order: arrayProtoOrigin.length+1}) //add temporary new proto in fielactivity collection origin
                        for (var l=0; l < arrayProtoDisplay.length; l++){
                            if(arrayProtoDisplay[l]['ID']==this.protoID) {
                                toRet.push({
                                    "op": "add",
                                    "path": "/"+String(curFieldActivityId)+"/Protocoles/",
                                    "value": {ID : this.protoID , Order : arrayProtoDisplay[l]['Order'] }
                                })
                            }
                            else if(arrayProtoDisplay[l]['ID'] != arrayProtoOrigin[l]['ID']) {
                                toRet.push({
                                    "op": "replace",
                                    "path": "/"+String(curFieldActivityId)+"/Protocoles/"+String(arrayProtoDisplay[l]['ID'])+"/Order",
                                    "value": arrayProtoDisplay[l]['Order']
                                })
                            }
                        }
                        arrayProtoOrigin.pop()//remove temporary proto
                    }
                }

                return toRet;
            },

            save: function() {
                var data = this.buildJSONPatch()
                var _this = this;

                if (data.length == 0) {
                    tools.swal(
                        "warning",
                        "configuration.save.noChanges.fieldActivities"
                        );
                }
                else {
                    $.ajax({
                        data: JSON.stringify(data),
                        type: 'PATCH',
                        url:  AppConfig.ecoReleveURL + 'FieldActivity',
                        contentType: 'application/json',
                        crossDomain: true,
                        async: false,
                        success: function(data) {
                            tools.swal(
                                "success",
                                "modal.save.fieldActivitiesSuccessStatus",
                                "modal.save.fieldActivitiesSuccessMsg"
                                )
                            _this.reload()
                        },
                        error: function(a,b,c,d,e) {
                            tools.swal(
                                "error",
                                "modal.save.fieldActivitiesErrorStatus",
                                "modal.save.fieldActivitiesErrorMsg"
                                )
                        }
                    });
                }
            },

            fetchAllCollections : function(){
                var _this = this;
                $.when(
                this.protocoleTypesCollection.fetch(),
                this.fieldActivitiesCollection.fetch()
                ).done(function(protocolTypesResp, fieldActivitiesResp) {
                    _this.errorFetching = false
                    var tmp = _this.findAndStoreCurrentProtocoleType()
                    if (tmp === undefined) {
                        _this.protoID = null;
                    }
                    else {
                        _this.protoID = tmp.get('ID');
                    }

                    var listIdFieldActiviesToDisplay = _this.findFieldActivitiesWhereProto()
                    _this.buildFieldActivityToDisplay(listIdFieldActiviesToDisplay)
                    _this.render()
                }).fail(function(a,b,c,d,e) {
                    _this.errorFetching = true
                    _this.render()
                    tools.swal(
                        "error",
                        "fetch.ecoreleve.fieldActivity"
                        );
                })
            },

            buildFieldActivityToDisplay: function(listId) {

                var _this = this;
                this.listFieldActiviesWhereProtoIn = []
                this.fieldActivityProtocoleTypeToDisplay = []
                for(var i=0; i < listId.length; i++) {
                    this.listFieldActiviesWhereProtoIn.push(listId[i])
                    var tmpItem = this.fieldActivitiesCollection.get(listId[i])
                    this.fieldActivityProtocoleTypeToDisplay.push(new fieldActivityModel(_.cloneDeep(tmpItem.toJSON())))
                }

            },

            findAndStoreCurrentProtocoleType : function() {
                return this.protocoleTypesCollection.findWhere({ Name : this.nameProtoFB })
            },

            findFieldActivitiesWhereProto :  function() {

                var curProto = this.protocoleTypesCollection.get(this.protoID)
                var listIdFieldActivities = curProto.get('FieldActivities').map(function(item) { return item['ID']})

                return listIdFieldActivities
            },

            removeProtocol : function(event) {

                var fieldActivityID = parseInt(event.currentTarget.value)
                this.deleteFieldActivity(fieldActivityID);

            },

            showHideProtocole : function(event) {
                var valueBtn = event.currentTarget.value
                var val = valueBtn.replace('id_','')
                var elemContainer = this.$el.find('#js_FieldActivityContainer_'+String(val))

                if (elemContainer.hasClass('hideList')) {
                    elemContainer.removeClass('hideList')
                    elemContainer.addClass('displayList')
                }
                else if (elemContainer.hasClass('displayList') ) {
                    elemContainer.removeClass('displayList')
                    elemContainer.addClass('hideList')
                }
            },

            addProtocoleToFieldActivity : function(event) {
                var fieldActivityID = parseInt(event.currentTarget.value);
                this.addNewFieldActivity(fieldActivityID);
            },

            deleteFieldActivity : function(selectedId) {

                for (var i = 0 ; i < this.fieldActivityProtocoleTypeToDisplay.length; i++) {
                    if(selectedId == this.fieldActivityProtocoleTypeToDisplay[i].get('ID')) {
                        this.fieldActivityProtocoleTypeToDisplay.splice(i,1);
                        break;
                    }
                }
                var indexFAinList = this.listFieldActiviesWhereProtoIn.indexOf(selectedId);
                if (indexFAinList > -1 ) {
                    this.listFieldActiviesWhereProtoIn.splice(indexFAinList,1)
                }
                this.render();
            },

            addNewFieldActivity : function(selectedID) {
                var tmpItem = this.fieldActivitiesCollection.get(selectedID)
                var curFieldActivity = new fieldActivityModel(_.cloneDeep(tmpItem.toJSON()))
                var refArrayProto = curFieldActivity.get('Protocoles')
                var itemToAdd = {
                    ID: this.protoID,
                    Name: this.nameProtoFB,
                    Order : refArrayProto[refArrayProto.length-1].Order + 1
                }
                refArrayProto.push(itemToAdd)
                this.listFieldActiviesWhereProtoIn.push(selectedID)
                this.fieldActivityProtocoleTypeToDisplay.push(curFieldActivity)
                this.render();
            },

            addSortable: function() {
                var _this = this;

                for( var i = 0 ; i < this.fieldActivityProtocoleTypeToDisplay.length ; i++) {
                    //ajoute le sortable

                    this.$el.find('#fieldActivitySortable_'+String(i)).sortable({
                        axis: "y",
                        classes: {
                            "ui-sortable": "highlight"
                        },
                        cursor: 'grab',
                        update : function(event,ui) {
                            var parentUL = event.target;
                            var indexFieldActivity = Number(parentUL.id.split('_')[1]);
                            var arrayLI = Array.from(parentUL.children);
                            var newOrderProtocoles = arrayLI.map(function(item,index){
                                return {
                                    ID: item.value,
                                    Name: item.innerText,
                                    Order : index + 1
                                }
                            });
                            _this.fieldActivityProtocoleTypeToDisplay[indexFieldActivity].set(
                                'Protocoles',
                                newOrderProtocoles,
                                {silent:true}
                                );
                        }
                    });
                    //desactive la selection

                    this.$el.find('#fieldActivitySortable_'+String(i)).disableSelection();
                }

            },

            render: function() {
                this.$el.html(this.template(this.serialize())).i18n();

                this.addSortable();
                return this;

            },

            serialize : function() {
                return {
                    errorFetching : this.errorFetching,
                    fieldActivitiesCollection: this.fieldActivitiesCollection,
                    listFieldActiviesWhereProtoIn: this.listFieldActiviesWhereProtoIn,
                    fieldActivityProtocoleTypeToDisplay: this.fieldActivityProtocoleTypeToDisplay
                };
            }

        });
});
