define(['jquery'], function ($) {
    return {
        loadFormData: function(form, urls, lang) {
            if (form.fields.unity) {
                this.loadUnits(form.fields.unity, urls.unities + "/track/" + lang);
            }
        },

        loadUnits: function(field, url) {
            $.ajax({
                type        : 'GET',
                url         : url,
                contentType : 'application/json',
                crossDomain : true,
                success: function(data) {
                    var jsondata = JSON.parse(data);
                    var units = [];
                    $.each(jsondata.unities, function (index, value) {
                        units.push(value);
                    });
                    field.editor.setOptions(units);
                },
                error: function (xhr) {
                    console.log(xhr);
                }
            });
        }
    };
});
