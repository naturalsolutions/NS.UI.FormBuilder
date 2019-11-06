define([
    'jquery', 'lodash', 'text!../templates/FieldActivityController.html',
    'backbone', 'backbone.radio', 'tools', '../../Translater',
    './loaders/ContextLoader', 'i18n'
], function($, _, Template, Backbone, Radio, tools, translater, ContextLoader) {

    
    return Backbone.View.extend({

        tagName : 'div',
        className : 'fieldsActivity',
        template: _.template(Template),

        events : {
            'change #fieldActivityListInput': 'StoreIdFieldActivity',
            'click button.js_remove_proto' : 'removeProtocol',
            'click button.js_toggleDisplayList' : 'showHideProtocole'
        },

        initialize : function(options) {

            this.ListId = [];
            this.fieldActivityCollectionREF = [];
            this.fieldActivityProtocoleTypeCollectionREF = [];
            this.protocolTypeCollectionREF = []
            this.fieldActivityProtocoleTypeToDisplay = []
            this.fieldActivityProtocoleTypeToDelete = []
            this.MyProto = {}
            this.nameProtoFB = options.nameProtoFB 
            this.fetchAllDatas();



        },

        fetchAllDatas : function() {
            var _this = this;
            this.fetchFieldActivityCollection()
            .done( function(data) {
                _this.fieldActivityCollectionREF = data
                _this.render();
            })
            .fail(function(error){
                console.log('sniffffff',error)
            });

            this.fetchFieldActivityProtocoleTypeCollection()
            .done( function(data) {
                _this.fieldActivityProtocoleTypeCollectionREF = data
                
                _this.filterFieldActivityProtocoleTypeCollection()

                _this.render();
            })
            .fail(function(error){
                console.log('sniffffff',error)
            });

            this.fetchProtocoleTypeCollection()
            .done( function(data) {
                _this.ProtocolTypeCollectionREF = data
                _this.findMyProto()
            })
            .fail(function(error){
                console.log('sniffffff',error)
            });

        },
        findMyProto: function() {

            for( var i = 0 ; i < this.ProtocolTypeCollectionREF.length; i++)  {
                var curProto = this.ProtocolTypeCollectionREF[i]
                if (curProto == this.nameProtoFB) {
                    return this.ProtocolTypeCollectionREF[i]
                }

            }

            return {}
        },

        fetchProtocoleTypeCollection : function() {
            return  $.ajax({
                url: 'http://localhost/ecoReleve-Core/formbuilder/ProtocoleType',
                type: 'GET',
                contentType: 'application/json',
                crossDomain: true,
                async: false
            });
        },

        fetchFieldActivityProtocoleTypeCollection: function() {
            return  $.ajax({
                url: 'http://localhost/ecoReleve-Core/formbuilder/FieldActivity_ProtocoleType',
                type: 'GET',
                contentType: 'application/json',
                crossDomain: true,
                async: false
            });
        },

        filterFieldActivityProtocoleTypeCollection: function(){
            
            for (var i = 0; i < this.fieldActivityProtocoleTypeCollectionREF.length; i++){

                var curFieldActivityProtocoleType = this.fieldActivityProtocoleTypeCollectionREF[i]
                for(var j =0; j < curFieldActivityProtocoleType.Protocols.length; j++){
                    var protocol = curFieldActivityProtocoleType.Protocols[j];
                    if (protocol.Name == this.nameProtoFB) {          
                        curFieldActivityProtocoleType["FieldActivity_ProtocoleType"] = protocol["FieldActivity_ProtocoleType"]
                        this.fieldActivityProtocoleTypeToDisplay.push(curFieldActivityProtocoleType)
                    }
                }
            }
       
        },

        fetchFieldActivityCollection: function(){
           return  $.ajax({
                url: 'http://localhost/ecoReleve-Core/formbuilder/FieldActivity',
                type: 'GET',
                contentType: 'application/json',
                crossDomain: true,
                async: false
            });
        },

         removeProtocol : function(event) {
            
            var selectedId = parseInt(event.currentTarget.value)

            if(!this.fieldActivityProtocoleTypeToDelete.includes(selectedId)){
                this.fieldActivityProtocoleTypeToDelete.push(selectedId)
            }

            this.DeleteFieldActivity(selectedId);

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


            // debugger
            // if(event.currentTarget.parentElement.parentElement.children['fieldActivity_div'].classList.contains('hideList')){
            //     event.currentTarget.value = '<'
            //     event.currentTarget.parentElement.parentElement.children['fieldActivity_div'].classList.remove('hideList')
            //     return;

            // }
            // else{
            //     event.currentTarget.value = '>'
            //     event.currentTarget.parentElement.parentElement.children['fieldActivity_div'].classList.add('hideList')
            // }

        },

        StoreIdFieldActivity : function(event) {

            console.log(event)

            var selectedId = parseInt(event.currentTarget.value)

            if(!this.ListId.includes(selectedId)){
                this.ListId.push(selectedId)
                this.addNewFieldActivity(selectedId)
            }

        },

        DeleteFieldActivity : function(selectedId) {
            
            var isPresent = false
            for (var i = 0 ; i < this.fieldActivityProtocoleTypeToDisplay.length  && !isPresent; i++) {
        
                var protocols = this.fieldActivityProtocoleTypeToDisplay[i].Protocols
                for (var j = 0 ; j < protocols.length && !isPresent; j++) {
                    
                    if(selectedId == protocols[j].FieldActivity_ProtocoleType.ID){
                        isPresent = true
                        this.fieldActivityProtocoleTypeToDisplay.splice(i,1)
                    }

                }
            }

            this.render();

        },

        addNewFieldActivity : function(selectedID) {
            for (var i = 0 ; i < this.fieldActivityProtocoleTypeCollectionREF.length ; i++) {
                var obj = {

                }
                var fieldActivity = this.fieldActivityProtocoleTypeCollectionREF[i].FieldActivity
                // var protocols = this.fieldActivityProtocoleTypeCollectionREF[i].Protocols
                var protocols = _.cloneDeep(this.fieldActivityProtocoleTypeCollectionREF[i].Protocols)

                if  ( fieldActivity.ID == selectedID ) {
                    protocols.push( {
                        'FieldActivity_ProtocoleType' : { 'ID': -1 },
                        'ID': -10000,
                        'Name' : 'lenomduproto'
                    })
                    this.fieldActivityProtocoleTypeToDisplay.push({
                        'FieldActivity_ProtocoleType' : { 'ID': -1 },
                        'FieldActivity' : fieldActivity,
                        'Protocols' : protocols,
                    })
                }
            }

            this.render();
        },
        addSortable: function() {



            for( var i = 0 ; i <this.fieldActivityProtocoleTypeToDisplay.length ; i++) {
                //ajoute le sortable

                this.$el.find('#fieldActivitySortable_'+String(i)).sortable({
                    axis: "y",
                    classes: {
                        "ui-sortable": "highlight"
                      },
                    cursor: 'grab'
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
              fieldActivityCollection: this.fieldActivityCollectionREF,
              fieldActivityProtocoleTypeToDisplay: this.fieldActivityProtocoleTypeToDisplay
            };
          }


    });
});
