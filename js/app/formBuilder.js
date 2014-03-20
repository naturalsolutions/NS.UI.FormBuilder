var formBuilder = (function(app) {

    app = {
        init: function() {
                $("#formBuilder").html(
                    '<div class="row-fluid content">' +
                        '<div class="span3 widgetsPanel"></div>' +
                        '<div class="span9 dropArea"></div>' +
                        '<div class="settings span5"></div>' +
                    '</div>'
                );

                this.form = new app.Form({}, {
                    name: "My form"
                });

                this.panelView = new app.PanelView({
                    el: $('.widgetsPanel'),
                    collection: this.form,
                });
                this.panelView.render();

                this.formView = new app.FormView({
                    collection: this.form,
                    el: $('.dropArea')
                });
                this.formView.render();

                this.settingsView = new app.SettingView({
                    el: $('.settings')
                });
                this.settingsView.render();
        }
    };

    return app;

})(formBuilder);