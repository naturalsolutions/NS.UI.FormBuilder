define(
    [
        'backbone'
    ],
    function(
        Backbone
        ) {

        return Backbone.Model.extend({
            defaults:{
                ID: null,
                Name: null,
                Protocoles: [
                    {
                        ID: null,
                        Name: null,
                        Order: null
                    }
                ]
            },
            idAttribute: "ID"
        })

    }
);