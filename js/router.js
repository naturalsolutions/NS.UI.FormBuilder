var formBuilder = (function(app) {
    
    app.Router = Backbone.Router.extend({
        
        routes : {
            "" : 'home',
            'saveprotocol' : 'saveProtocol',
            'setting/:id' : 'modelSetting'
        },
        
        home : function() {            
            if (app.instances.mainView  === undefined || app.instances.currentForm === undefined) {
                app.instances.currentForm = new app.collections.Form( {}, { name: "My protocol" });

                app.instances.mainView = new app.views.MainView({
                    el      : '#formBuilder',
                    form    : app.instances.currentForm
                });
            }
            
            app.instances.navbar.setActions (app.instances.mainView.getActions());            
        },
        
        saveProtocol : function (options) {
        },
        
        modelSetting : function(modelID) {
            if (app.instances.currentForm === undefined) {
                window.location.hash = '';
            } else {
                var edit = new app.views.BaseEditView({
                    el: $('.settings'),
                    model : app.instances.currentForm.models[modelID]
                });
                edit.render();
                app.instances.navbar.setActions (edit.getActions());
            }
        }
        
    });
    
    return app;
    
})(formBuilder);