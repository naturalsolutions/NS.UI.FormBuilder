define([
    'marionette',
    'text!../templates/EditionPageLayout.html',
    '../views/FormPanelView',
    '../views/WidgetPanelView',
    '../views/SettingFieldPanelView',
    '../views/SettingFormPanelView',
    'backbone.radio',
    '../../Translater',
    'sweetalert'
], function(Marionette, EditionPageLayoutTemplate, FormPanelView, WidgetPanelView, SettingFieldPanelView,
            SettingFormPanelView, Radio, Translater, swal ) {

    var translater = Translater.getTranslater();

    /**
     * Main layout manages views in editionPageModule
     * contains widgetPanelView, FormPanelView and settingPanelView
     */
    var EditionPageLayout =  Backbone.Marionette.LayoutView.extend({


        /**
         * edition page layout HTML template initialization
         */
        template: EditionPageLayoutTemplate,


        /**
         * jQuery event triggered by the layout
         * @type {Object}
         */
        events : {
            'click #toggle.open'   : 'minimizeWidgetPanel',
            'click #toggle.closed' : 'maximizeWidgetPanel'
        },


        /**
         * Layout regions, one for each view
         */
        regions : {
            leftPanel       : '#widgetPanel',
            centerPanel     : '#formPanel',
            settingFormPanel    : '#settingFormPanel',
            settingFieldPanel    : '#settingFieldPanel'
        },


        /**
         * Layout constructor
         *
         * @param  {Object} options configuration parameters
         */
        initialize : function(options) {
            this.fieldCollection = options.fieldCollection;
            this.testCollection = options.fieldCollection;
            this.URLOptions = options.URLOptions;

            this.initMainChannel();
            this.initFormChannel();
        },

        /**
         * Init form channel
         */
        initFormChannel : function() {
            this.formChannel = Backbone.Radio.channel('form');

            //  Send by EditionPageController when user wants to edit field properties
            this.formChannel.on('initFieldSetting', this.initFieldSetting, this);

            //  edit form properties
            this.formChannel.on('editForm', this.formSetting, this);

            //  edit form properties
            this.formChannel.on('exitingFormEditing', this.exitFormEdition, this);
        },

        /**
         * Init main channel ONLY for this module and listen some events
         */
        initMainChannel : function() {
            this.mainChannel = Backbone.Radio.channel('edition');

            //  Event sent from setting view when backbone forms generation is finished
            //  Run an animation for hide panel view and display setting view, I love jQuery !
            //this.mainChannel.on('formCreated', this.displaySettingPanel, this);

            //  Event sent from setting view when field changed are saved
            //  and the data are correct
            //  Run an animation for hide setting view and display panel view
            this.mainChannel.on('formCommit', this.closeSettingPanelAndCommit, this);

            //  Event receive from setting view panel when user save form changed attributes
            //  Close setting panel and rest some components
            this.mainChannel.on('editionDone', this.closeSettingPanelAndSuccess, this);

            //  Event sent from setting view when modifications are cancelled
            //  Run an animation for hide setting view and display panel view
            this.mainChannel.on('formCancel', this.closeSettingPanelDefault, this)
        },

        /**
         * Display setting panel view when user wants to edit field properties
         *
         * @param  {Object} Model to edit and some options send by editionPageController like pre configurated field and linked fields
         */
        initFieldSetting : function(options) {
            if (this.settingFieldPanel == undefined)
            {
                this.addRegion('settingFieldPanel', '#settingFieldPanel');
                this.settingFieldPanel =  this.getRegion('settingFieldPanel');
            }
            if ($('#widgetPanel').hasClass('col-md-1')) {
                $('#formPanel').switchClass('col-md-8', 'col-md-6', 500);
            }

            if ($('#settingFieldPanel').hasClass('col-md-0')) {
                $('#settingFieldPanel').switchClass('col-md-0', 'col-md-3', 500);
                $('#widgetPanel').hide();
            }

            this.settingFieldPanel.show(new SettingFieldPanelView(options));
        },

        /**
         * Display setting panel to edit form properties
         *
         * @param  {Object} formToEdit form to edit
         */
        formSetting : function(formToEdit) {
            if (this.savedFTE)
            {
                if (this.savedFTE.name == formToEdit.name)
                {
                    return;
                }
                else
                {
                    delete this;
                    return;
                }
            }

            this.savedFTE = formToEdit;

            if (this.settingFormPanel == undefined) {
                this.addRegion('settingFormPanel', '#settingFormPanel');
                this.settingFormPanel = this.getRegion('settingFormPanel');
            }

            var that = this;

            if (that.testCollection)
            {
                if (that.testCollection.name.toLowerCase() == "new form" && that.testCollection.id != 0)
                    that.testCollection.id = 0;
            }

            var newformPanel = new SettingFormPanelView({
                URLOptions : that.URLOptions,
                formToEdit : that.testCollection || formToEdit
            });

            that.settingFormPanel.show(newformPanel);

            if (that.formPanel)
                delete that.formPanel;

            that.formPanel = newformPanel;

            delete that.testCollection;
        },

        /**
         * Remove and re-add new region
         */
        clearFormSettingView : function() {
            //  Destroy view and his html content
            this.$el.find('#settingFormPanel').html('');
            this.settingFormPanel.currentView.destroy();

            //  Re add new region
            this.addRegion('settingFormPanel', '#settingFormPanel');
            this.settingFormPanel = this.getRegion('settingFormPanel');
        },


        /**
         * Show the setting view
         */
        displaySettingPanel : function() {
            if ($('#widgetPanel').hasClass('col-md-1')) {
                //$('#formPanel').switchClass('col-md-8 col-md-offset-3', 'col-md-6 col-md-offset-6', 500);
            } else {
                //$('#formPanel').switchClass('col-md-6 col-md-offset-6', 'col-md-6 col-md-offset-6', 500);
            }
        },


        /**
         * Render callbacks
         * Display ItemView like settingPanel
         */
        onRender : function() {
            this.centerPanel.show(new FormPanelView({
                fieldCollection : this.fieldCollection,
                URLOptions : this.URLOptions
            }, Backbone.Radio.channel('global').readonly));

            if (!Backbone.Radio.channel('global').readonly)
                this.leftPanel.show( new WidgetPanelView({}));
        },

        onDestroy : function() {
            delete this.formChannel;
            delete this.mainChannel;
            delete this.settingFieldPanel;
            delete this.settingFormPanel;
            delete this;
        },

        exitFormEdition : function() {
            console.log("exitFormEdition called");
        },

        /**
         * Animate widget panel to put it in small size
         */
        minimizeWidgetPanel : function() {
            /*
            $('#formPanel').switchClass('col-md-8', 'col-md-11', 300);
            $('#widgetPanel').switchClass('col-md-4', 'col-md-1', 300);
            $('#widgetPanel #features').fadeOut(200);
            $('#widgetPanel #smallFeatures').fadeIn(200);
            $('#toggle').switchClass('open', 'closed');
            */
        },


        /**
        * Animate widget panel to put it in large size
         */
        maximizeWidgetPanel : function() {
            /*
            $('#formPanel').switchClass('col-md-11', 'col-md-8', 300);
            $('#widgetPanel').switchClass('col-md-1', 'col-md-4', 300, function() {
                $('#widgetPanel #features').fadeIn(200);
                $('#widgetPanel #smallFeatures').fadeOut(200);
                $('#toggle').switchClass('closed', 'open');
            });
            */
        },


        /**
        * Close setting panel
        */
        closeSettingPanel : function() {
            if ($('#widgetPanel').hasClass('col-md-1')) {
                $('#formPanel').switchClass('col-md-6', 'col-md-8', 500);
            } else {
                //$('#formPanel').switchClass('col-md-6 col-md-offset-6', 'col-md-6 col-md-offset-6', 500);
                $('#widgetPanel').animate({
                    marginRight : 0
                }, 500, _.bind(function() {
                    this.clearFormSettingView();
                }, this))
            }

            if ($('#settingFieldPanel').hasClass('col-md-3')) {
                $('#settingFieldPanel').switchClass('col-md-3', 'col-md-0', 500);
                $('#widgetPanel').show();
            }
        },


        /**
         * Callback launch when setting panel needs to be closed
         */
        closeSettingPanelDefault : function(form) {
            if (form)
            {
                //console.log(form);
            }
            this.closeSettingPanel();
        },

        closeSettingPanelAndSuccess : function(form) {

            this.closeSettingPanelDefault(form);
            swal(
                translater.getValueFromKey('modal.save.success') || "Sauvé !",
                translater.getValueFromKey('modal.save.successMsgTmp') || "Sauvegardé !",
                "success"
            )
        },

        closeSettingPanelAndCommit : function(form) {

            this.closeSettingPanelDefault(form);
        }
    });

    return EditionPageLayout;

});
