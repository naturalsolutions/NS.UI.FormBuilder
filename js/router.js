var formBuilder = (function(app) {
    
    app.Router = Backbone.Router.extend({
        
        routes : {
            "" : 'home',
            'saveprotocol' : 'saveProtocol',
            'setting/:id' : 'modelSetting',
            'generate' : 'generate'
        },

        initialize : function() {
            //  Init current protocol object
            app.instances.currentForm = new app.collections.Form( {}, { name: "My protocol" });

            //  Init main view
            app.instances.mainView = new app.views.MainView({
                el      : '#formBuilder',
                form    : app.instances.currentForm
            });


        },
        
        home : function() {            
            app.instances.navbar.setActions (app.instances.mainView.getActions());
            i18n.init(function(t) {
                // translate nav
                $("body").i18n();
            });
        },
        
        saveProtocol : function (options) {
        },
        
        modelSetting : function(modelID) {
            if (app.instances.currentForm.length === 1) {
                window.location.hash = '';
            } else {          

                
                if (app.instances.settingView === undefined) {

                    //  Create new edit view
                    app.instances.settingView = new app.views.BaseEditView({
                        el: $('.settings'), 
                        model : app.instances.currentForm.models[modelID]
                    });
                    app.instances.settingView.render();

                } else {
                    app.instances.settingView.changeModel( app.instances.currentForm.models[modelID] );
                }
                
                app.instances.navbar.setActions (app.instances.settingView.getActions());
            }
        }
        
    });
    
    return app;
    
})(formBuilder);