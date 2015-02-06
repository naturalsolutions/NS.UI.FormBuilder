define([
    'marionette',
    'text!../templates/EditionPageLayout.html',
    '../views/FormPanelView',
    '../views/WidgetPanelView',
    '../views/SettingPanelView',
    'backbone.radio'
], function(Marionette, EditionPageLayoutTemplate, FormPanelView, WidgetPanelView, SettingPanelView, Radio ) {


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
         * jQuery event trigerred by the layout
         * @type {Object}
         */
        events : {
            'click #toggle span.open'   : 'minimizeWidgetPanel',
            'click #toggle span.closed' : 'maximizeWidgetPanel'
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
        },


        /**
         * Init main channel ONLY for this module and listen some events
         */
        initMainChannel : function() {
            this.mainChannel = Backbone.Radio.channel('edition');

            //  Event sent from setting view when backbone forms generation is finished
            //  Run an nimation for hide panel view and display setting view, I love jQuery !
            this.mainChannel.on('formCreated', this.displaySettingPanel, this)

            //  Event sent from setting view when field changed are saved
            //  and the data are correct
            //  Run an animation for hide setting view and display panel view
            this.mainChannel.on('formCommit', this.closeSettingPanelAndResetURL, this)

            //  Event receivre from setting view panel when user save form changed attributes
            //  Close setting panel and rest some components
            this.mainChannel.on('editionDone', this.closeSettingPanelAndResetURL, this);

            //  Event sent from setting view when modifications are cancelled
            //  Run an animation for hide setting view and display panel view
            this.mainChannel.on('formCancel', this.closeSettingPanelAndResetURL, this)
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

            this.settingPanel.show(new SettingPanelView({
                URLOptions : this.URLOptions
            }));
        },


        /**
         * Animate widget panel to put it in small size
         */
        minimizeWidgetPanel : function() {
            $('#formPanel').switchClass('col-md-8', 'col-md-11', 300);
            $('#widgetPanel').switchClass('col-md-4', 'col-md-1', 300);
            $('#widgetPanel #features').fadeOut(200);
            $('#toggle span').switchClass('open', 'closed')
        },


        /**
        * Animate widget panel to put it in large size
         */
        maximizeWidgetPanel : function() {
            $('#formPanel').switchClass('col-md-11', 'col-md-8', 300);
            $('#widgetPanel').switchClass('col-md-1', 'col-md-4', 300);
            $('#widgetPanel #features').fadeIn(200);
            $('#toggle span').switchClass('closed', 'open');
        },


        /**
        * Close setting panel
        */
        closeSettingPanel : function() {
            if ($('#widgetPanel').hasClass('col-md-1')) {
                $('#formPanel').switchClass('col-md-7 col-md-pull-1', 'col-md-8', 500);
                $('#widgetPanel').switchClass('col-md-1', 'col-md-4', 500);

                $('#widgetPanel #features').fadeIn(200);
                $('#toggle span').switchClass('closed', 'open');
            } else {
                $('#formPanel').switchClass('col-md-7', 'col-md-8', 500);
                $('#widgetPanel').animate({
                    marginLeft : 0
                }, 500)
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
