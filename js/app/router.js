var formBuilder = (function(formBuild) {
    
    formBuild.router = Backbone.Router.extend({
        routes : {
            '' : 'home'
        },        
        home : function() {
            
        },        
    });
    
    Backbone.history.start({
        pushState : false
    });
    
    var r = new formBuild.router({});

    return formBuild;
    
})(formBuilder);