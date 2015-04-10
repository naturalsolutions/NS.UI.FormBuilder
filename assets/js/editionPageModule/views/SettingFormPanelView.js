define([
    'jquery',
    'marionette',
    'text!../templates/SettingFormPanelView.html',
    'backbone.radio',
    'jquery-ui',
        'i18n',
    'bootstrap-select',
    'slimScroll',
    'fuelux'
], function($, Marionette, SettingFormPanelViewTemplate, Radio) {

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
            'change .checkboxField input' : 'checkboxChange'
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

            // I don't know why but i have to specify a model otherwise i've an error on serializeModel callback
            // It's weird bacause i havn't to do this in SettingFieldPanelView
            this.model = new Backbone.Model({})

            //  Init backbone radio channel
            this.initMainChannel();

            _.bindAll(this, 'template', 'generateForm');
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
            //  My prefered music for developpement
            //  https://www.youtube.com/watch?v=YKhNbKplIYA
        },

        /**
        * View rendering callbak
        */
        onRender : function() {
            this.$el.i18n();
            this.$el.find('.scroll').slimScroll({
                height : '100%'
            });
            this.generateForm(this.formToEdit);
        },

        /**
        * Send an event on form channel when user wants to clear current form
        */
        cancel : function(){
            this.removeForm();
            this.mainChannel.trigger('formCancel')
        },


        /**
        * Check generated form values and send events if all is good
        * This function concerns generated form for field AND main form
        */
        saveChange : function() {
            var formValidation = this.form.validate();
            if (formValidation === null) {
                var values      = this.form.getValue(),
                    keywordsFr  = $('#pillboxkeywordsFr').pillbox('items'),
                    keywordsEn  = $('#pillboxkeywordsEn').pillbox('items');

                values['keywordsFr'] = _.map(keywordsFr, function(num){
                    return num['value'];
                });

                values['keywordsEn'] = _.map(keywordsEn, function(num){
                    return num['value'];
                });

                this.mainChannel.trigger('editionDone', values);

                this.removeForm();
            } else {
                if ((_.size(this.form.fields) - 1) == _.size(formValidation)) {
                    //  We display a main information
                    this.$el.find('.general-error').html(
                        '   <h2>Erreur générale</h2>' +
                        '   <p>Un ou plusieurs champs ne sont pas renseigné</p>'
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

                this.form = new Backbone.Form({
                    schema: formToEdit.schema,
                    data : formToEdit.getAttributesValues()
                }).render();

                this.$el.find('#form').append(this.form.el)
                this.$el.find('#getField').hide();

                //  Add pillbow for form keywords
                this.$el.find('.field-keywords input[type="text"]').pillbox();

                _.each(formToEdit.keywordsFr, _.bind(function(el, idx) {
                    this.$el.find('#pillboxkeywordsFr').pillbox('addItems', idx, [{text : el, value : el}])
                }, this));

                _.each(formToEdit.keywordsEn, _.bind(function(el, idx) {
                    this.$el.find('#pillboxkeywordsEn').pillbox('addItems', idx, [{text : el, value : el}])
                }, this));

                $('.glyphicon-close').prop('class', 'reneco close');

                this.$el.find('#pillboxkeywordsFr').find('input[type="text"]').prop('placeholder', $.t('form.keywords.action'))
                this.$el.find('#pillboxkeywordsEn').find('input[type="text"]').prop('placeholder', $.t('form.keywords.action'))

                $.getJSON(this.URLOptions['protocolAutocomplete'], _.bind(function(data) {

                    this.$el.find('.field-name input[type="text"]').autocomplete({
                        minLength    : 1,
                        scrollHeight : 220,
                        appendTo     : '.field-name',
                        source       : data.options
                    });

                }, this));

                $.getJSON(this.URLOptions['keywordAutocomplete'], _.bind(function(data) {

                    //  Init french keyword pillbox
                    this.$el.find('#pillboxkeywordsFr input[type="text"]').autocomplete({
                        minLength : 1,
                        scrollHeight: 220,
                        appendTo : '#pillboxkeywordsFr',
                        source : data.options
                    });

                    //  Init english keyword pillbox
                    this.$el.find('#pillboxkeywordsEn input[type="text"]').autocomplete({
                        minLength : 1,
                        scrollHeight: 220,
                        appendTo : '#pillboxkeywordsEn',
                        source : data.options
                    });
                }, this));
                

                this.$el.find('#pillboxkeywordsFr, #pillboxkeywordsEn').on('added.fu.pillbox', _.bind(function (evt, item) {
                    $('.glyphicon-close').replaceWith('<span class="reneco close" data-parent="' + item['text'] + '"></span>');
                }, this));

                this.$el.find('#pillboxkeywordsFr, #pillboxkeywordsEn').on('click', '.reneco', function(evt) {
                    $(this).parents('div.pillbox').pillbox('removeByText', $(this).data('parent'));
                });

                this.mainChannel.trigger('formCreated');

            }, this));

        }

    });

    return SettingFormPanelView;

});
