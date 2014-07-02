/**
 * @fileOverview formBuilder.js
 * Implemente main formbuilder object
 *
 * Depandencies :   undersoore
 *                  jquery
 *                  backbone
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */
var formBuilder = (function(formBuild) {

    //  Fix me
    formBuild = {};
    
    formBuild.MainView = Backbone.View.extend({
        
        initialize : function(options) {
            
            $(this.el).append(
                '<div class="row-fluid content">'+
                '   <div class="span3 widgetsPanel nano"></div>'+
                '   <div class="span9 dropArea"></div>'+
                '   <div class="settings span5"></div>'+
                '</div>'
            );
            this.form = new formBuild.Form({}, {
                name: "My form"
            });

            this.panelView = new formBuild.PanelView({
                el: $('.widgetsPanel'),
                collection: this.form,
            });

            this.formView = new formBuild.FormView({
                collection: this.form,
                el: $('.dropArea')
            });            
            
            this.panelView.render();
            this.formView.render();
        },
        
        clear: function() {
            this.form.clearAll();
        },
        
        getFormXML : function() {
            return this.formView.getXML();
        },
        
        downloadXML : function() {
            return this.formView.downloadXML();
        },
        
        importXML : function() {
            return this.formView.importXML();
        }
    });   

    return formBuild;

})(formBuilder);