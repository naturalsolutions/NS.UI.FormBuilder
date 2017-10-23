define(['jquery'], function ($) {
    var TrackLoader = {

        initializeLoader: function (form, URLoptions) {
            this.form = form;
            this.options = URLoptions;

            return(true);
        },

        loadFormDatas: function() {
            if (this.form.fields.unity) {
                this.loadUnities();
            }
            return(true);
        },

        loadUnities: function() {
            $.ajax({
                data        : "",
                type        : 'GET',
                url         : this.options.unities + "/" + window.context + "/fr",
                contentType : 'application/json',
                crossDomain : true,
                success: _.bind(function(data) {
                    var jsondata = JSON.parse(data);
                    var unityoptions = [];
                    $.each(jsondata.unities, function(index, value){
                        unityoptions.push(value);
                    });
                    this.form.fields.unity.editor.setOptions(unityoptions);
                }, this),
                error: _.bind(function (xhr) {
                    console.log(xhr);
                }, this)
            });
        },

        getThisLoader : function(){
            return (this);
        }
    };

    return TrackLoader.getThisLoader();
});
