define(['jquery'], function ($) {
    return {
        loadFormData: function(form, urls, lang) {
            if (form.fields.unity) {
                if (lang !== 'fr') {
                    // todo the way units are handled, language specific units cannot work:
                    // localized value is stored in database, we cannot match translations
                    console.warn("disregarding language for fetching units, not implemented (forced 'fr')");
                    lang = 'fr';
                }
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
