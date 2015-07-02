define([
    'marionette',
    'text!../templates/EditionPageLayout.html',
    '../views/FormPanelView',
    '../views/WidgetPanelView',
    '../views/SettingFieldPanelView',
    '../views/SettingFormPanelView',
    'backbone.radio'
], function(Marionette, EditionPageLayoutTemplate, FormPanelView, WidgetPanelView, SettingFieldPanelView, SettingFormPanelView, Radio ) {


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
            settingPanel    : '#settingPanel'
        },


        /**
         * Layout constructor
         *
         * @param  {Object} options configuration parameters
         */
        initialize : function(options) {
            this.fieldCollection = options.fieldCollection;
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
        },


        /**
         * Init main channel ONLY for this module and listen some events
         */
        initMainChannel : function() {
            this.mainChannel = Backbone.Radio.channel('edition');

            //  Event sent from setting view when backbone forms generation is finished
            //  Run an animation for hide panel view and display setting view, I love jQuery !
            this.mainChannel.on('formCreated', this.displaySettingPanel, this);

            //  Event sent from setting view when field changed are saved
            //  and the data are correct
            //  Run an animation for hide setting view and display panel view
            this.mainChannel.on('formCommit', this.closeSettingPanelAndResetURL, this);

            //  Event receive from setting view panel when user save form changed attributes
            //  Close setting panel and rest some components
            this.mainChannel.on('editionDone', this.closeSettingPanelAndResetURL, this);

            //  Event sent from setting view when modifications are cancelled
            //  Run an animation for hide setting view and display panel view
            this.mainChannel.on('formCancel', this.closeSettingPanelAndResetURL, this)
        },

        /**
         * Display setting panel view when user wants to edit field properties
         *
         * @param  {Object} Model to edit and some options send by editionPageController like pre configurated field and linked fields
         */
        initFieldSetting : function(options) {
            this.settingPanel.show(new SettingFieldPanelView(options));
        },

        /**
         * Display setting panel to edit form properties
         *
         * @param  {Object} formToEdit form to edit
         */
        formSetting : function(formToEdit) {
            if (this.settingPanel === undefined) {
                this.addRegion('settingPanel', '#settingPanel');
                this.settingPanel = this.getRegion('settingPanel');
            }
            this.settingPanel.show(new SettingFormPanelView({
                URLOptions : this.URLOptions,
                formToEdit : formToEdit
            }));
        },

        /**
         * Remove and re-add new region
         */
        clearFormSettingView : function() {
            //  Destroy view and his html content
            this.$el.find('#settingPanel').html('');
            this.settingPanel.currentView.destroy();

            //  Re add new region
            this.addRegion('settingPanel', '#settingPanel');
            this.settingPanel = this.getRegion('settingPanel');
        },


        /**
         * Show the setting view
         */
        displaySettingPanel : function() {
            if ($('#widgetPanel').hasClass('col-md-1')) {
                $('#formPanel').switchClass('col-md-11', 'col-md-7 col-md-pull-1', 500);
            } else {
                $('#formPanel').switchClass('col-md-8', 'col-md-7', 500);
                $('#widgetPanel').animate({
                    marginLeft : '-33.33333333%'
                }, 500)
            }
        },


        /**
         * Render callbacks
         * Display ItemView like settingPanel
         */
        onRender : function() {
            this.centerPanel.show( new FormPanelView({
                fieldCollection : this.fieldCollection
            }));

            this.leftPanel.show( new WidgetPanelView({

            }));
        },

        onDestroy : function() {
        },


        /**
         * Animate widget panel to put it in small size
         */
        minimizeWidgetPanel : function() {
            $('#formPanel').switchClass('col-md-8', 'col-md-11', 300);
            $('#widgetPanel').switchClass('col-md-4', 'col-md-1', 300);
            $('#widgetPanel #features').fadeOut(200);
            $('#toggle').switchClass('open', 'closed');
        },


        /**
        * Animate widget panel to put it in large size
         */
        maximizeWidgetPanel : function() {
            $('#formPanel').switchClass('col-md-11', 'col-md-8', 300);
            $('#widgetPanel').switchClass('col-md-1', 'col-md-4', 300, function() {
                $('#widgetPanel #features').fadeIn(200);
                $('#toggle').switchClass('closed', 'open');
            });

        },


        /**
        * Close setting panel
        */
        closeSettingPanel : function() {
            if ($('#widgetPanel').hasClass('col-md-1')) {
                $('#formPanel').switchClass('col-md-7 col-md-pull-1', 'col-md-8', 500);
                $('#widgetPanel').switchClass('col-md-1', 'col-md-4', 500, _.bind(function() {
                    this.clearFormSettingView();
                }, this));

                $('#widgetPanel #features').fadeIn(200);
                $('#toggle span').switchClass('closed', 'open');
            } else {
                $('#formPanel').switchClass('col-md-7', 'col-md-8', 500);
                $('#widgetPanel').animate({
                    marginLeft : 0
                }, 500, _.bind(function() {
                    this.clearFormSettingView();
                }, this))
            }
        },


        /**
         * Callback launch when setting panel needs to be closed
         */
        closeSettingPanelAndResetURL : function() {
            this.closeSettingPanel();
        }

    });

    return EditionPageLayout;

});
