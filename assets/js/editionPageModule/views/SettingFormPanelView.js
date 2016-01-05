define([
    'jquery',
    'marionette',
    'text!../templates/SettingFormPanelView.html',
    'backbone.radio',
    '../../Translater',
    'jquery-ui',
        'i18n',
    'bootstrap-select',
    'slimScroll'
], function($, Marionette, SettingFormPanelViewTemplate, Radio, Translater) {

    /**
     * Setting view
     * This view display form (generated with backbone-forms) to edit form or field properties
     *
     * See collection/FieldCollection to see form schema
     * See models/Fields to see form schema for each field type like text field, number, etc ...
     */
    var SettingFormPanelView = Backbone.Marionette.ItemView.extend({

        /**
        * jQuery event triggered by the view
        * @type {Object}
        */
        events : {
            'click #cancel'               : 'cancel',
            'click #saveChange'           : 'saveChange',
            'change .checkboxField input' : 'checkboxChange',
            'change .form-control'        : 'formControlChange',
            'click #saveTemplate'         : 'saveTemplate'
        },


        /**
        * Setting view template initialization
        */
        template : _.template(SettingFormPanelViewTemplate),


        /**
        * View constructor, init grid channel
        */
        initialize : function(options) {

            this.URLOptions = options.URLOptions;
            this.formToEdit = options.formToEdit;
            this.form       = null;

            this.hasFieldsChanged = false;

            // I don't know why but i have to specify a model otherwise i've an error on serializeModel callback
            // It's weird bacause i havn't to do this in SettingFieldPanelView
            this.model = new Backbone.Model({})

            //  Init backbone radio channel
            this.initMainChannel();

            _.bindAll(this, 'template', 'generateForm');

            this.translater = Translater.getTranslater();
        },


        /**
        * Init main radio channel for communicate in the editionPageModule
        */
        initMainChannel : function() {
            //  The edition channel is the main channel ONLY in the editionPageModule
            this.mainChannel = Backbone.Radio.channel('edition');
        },


        /**
         * Remove last form and clean html content
         */
        removeForm : function() {
            //  I know it's bad but it works for the moment ;)
            setTimeout(_.bind(function() {
                this.$el.find('#form').html('');
                this.form.undelegateEvents();
                this.form.$el.removeData().unbind();
                this.form.remove();
                Backbone.View.prototype.remove.call(this.form);

                //  Update scrollBar
                this.$el.find('.scroll').slimScroll({scrollTo : 0});

                this.form = null;
            }, this), 300);
        },

        /**
        * View rendering callbak
        */
        onRender : function() {
            this.$el.i18n();
            //this.$el.find('.scroll').slimScroll({
            //    height : '100%'
            //});

            this.generateForm(this.formToEdit);

        },

        initScrollBar : function() {
            this.$el.find('.scroll').slimScroll({
                height        : '80%',
                railVisible   : true,
                alwaysVisible : true,
                railColor     : "#111",
                disableFadeOut: true
            });
            this.$el.find('.scroll').slimScroll({scrollTo: "0px"});
            setTimeout(_.bind(function(){
                this.$el.find('.scroll').scrollTop(0);
            }, this), 100);
        },

        /**
        * Send an event on form channel when user wants to clear current form
        */
        cancel : function(){

            var self = this;
            var cancelSettingPanel = function(){
                self.removeForm();
                self.mainChannel.trigger('formCancel');
            };

            if (this.hasFieldsChanged){
                swal({
                    title: this.translater.getValueFromKey('configuration.cancel.yousure') || "Vraiment ?",
                    text: this.translater.getValueFromKey('configuration.cancel.unsavedchanges') || "Vous avez effectué de changements !",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: this.translater.getValueFromKey('configuration.cancel.yescancel') || "Oui, quitter !",
                    cancelButtonText: this.translater.getValueFromKey('configuration.cancel.stay') || "Non, continuer.",
                    closeOnConfirm: false }, function(){cancelSettingPanel();
                    $(".sweet-alert").find("button").trigger("click");});
            }
            else {
                cancelSettingPanel();
            }
        },


        /**
        * Check generated form values and send events if all is good
        * This function concerns generated form for field AND main form
        */
        saveChange : function() {
            var formValidation = this.form.validate();
            //console.log("007 ------------");
            //console.log(formValidation);

            if (formValidation === null) {
                this.mainChannel.trigger('editionDone', this.form.getValue());
                //console.log("009 ------------");
                //console.log(this);
                this.removeForm();
            } else {
                //console.log("012 ------------");
                //console.log("FAIL !!!");
                if ((_.size(this.form.fields) - 1) == _.size(formValidation)) {
                    //console.log("014 ------------");
                    //console.log(this.form.fields);
                    //  We display a main information
                    this.$el.find('.general-error').html(
                        '   <h2>' + this.translater.getValueFromKey('error.general') + '</h2>' +
                        '   <p>' + this.translater.getValueFromKey('error.message') + '</p>'
                    ).show();
                } else {
                    $(this.form.el).find('p[data-error]').show();
                    this.$el.find('.general-error').html('').hide();
                }
            }
        },


        /**
        * Change a checkbox state
        */
        checkboxChange : function(e) {
            $('label[for="' + $(e.target).prop('id') + '"]').toggleClass('selected')
        },

        /**
         * Remember form value has changed
         */
        formControlChange : function(e) {
            this.hasFieldsChanged = true;
        },

        initChildForms : function() {
            $.ajax({
                data: {},
                type: 'GET',
                url: this.URLOptions.childforms + "/" + this.formToEdit.id,
                contentType: 'application/json',
                crossDomain: true,
                success: _.bind(function (data) {
                    data = JSON.parse(data);

                    $(data).each(function(){
                        $(".childFormsList").show();
                        if ($("#childform"+this.id).length == 0)
                            $(".childList").append("<div id='childform"+this.id+"'><a target=_blank href='#form/"+this.id+"'>"+this.name+"</a></div>");
                    });
                }, this),
                error: _.bind(function (xhr, ajaxOptions, thrownError) {
                    console.log("Ajax Error: " + xhr);
                }, this)
            });
        },

        /**
        * Generate form for edit main form object properties
        *
        * @param  {Object} formSchema main form object schema
        */
        generateForm : function(formToEdit) {

            require(['backbone-forms'], _.bind(function() {
                if (this.form !== null) {
                    //  Remove last form and create new with new model
                    this.removeForm()
                }

                //
                //  We need to pass keyword value from data to the schema
                //  Because the pillbox-editor i use get value directly from the schema
                //

                var datas               = formToEdit.getAttributesValues(),
                    keywordFr           = [],
                    keywordEn           = [],
                    schemaDefinition    = formToEdit.schemaDefinition;

                _.each(datas.keywordsEn, function(el, idx) {
                    keywordEn.push( typeof el == 'object' ? el : { key : el, value : el });
                });

                _.each(datas.keywordsFr, function(el, idx) {
                    keywordFr.push( typeof el == 'object' ? el : { key : el, value : el });
                });

                schemaDefinition.keywordsFr.value = keywordFr;
                schemaDefinition.keywordsEn.value = keywordEn;

                this.form = new Backbone.Form({
                    schema: schemaDefinition,
                    data  : datas
                }).render();

                //  Init linked field
                this.initChildForms();

                this.$el.find('#form').append(this.form.el);
                this.$el.find('#getField').hide();

                this.initScrollBar();

                this.mainChannel.trigger('formCreated');

            }, this));

        },

        /**
         * Send event to EditionPageController for save current form as template form
         */
        saveTemplate : function() {

            var formValidation = this.form.validate();

            if (formValidation === null) {
                var values = this.form.getValue();
                values['isTemplate'] = true;
                this.mainChannel.trigger('saveTemplate', values);
            }
        }

    });

    return SettingFormPanelView;

});
