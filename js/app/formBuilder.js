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

    formBuild = {
        init: function() {
                $("#formBuilder").html(
                    '<div class="row-fluid content">' +
                        '<div class="span3 widgetsPanel nano"></div>' +
                        '<div class="span9 dropArea"></div>' +
                        '<div class="settings span5"></div>' +
                    '</div>'
                );

                this.form = new formBuild.Form({}, {
                    name: "My form"
                });

                this.panelView = new formBuild.PanelView({
                    el: $('.widgetsPanel'),
                    collection: this.form,
                });
                this.panelView.render();

                this.formView = new formBuild.FormView({
                    collection: this.form,
                    el: $('.dropArea')
                });
                this.formView.render();

                this.settingsView = new formBuild.SettingView({
                    el: $('.settings')
                });
                this.settingsView.render();
        },
        clear : function() {
            this.form.clearAll();
        }
    };

    return formBuild;

})(formBuilder);