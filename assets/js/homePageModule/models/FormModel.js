define([
    'jquery', 'lodash', 'backbone', '../../Translater'
], function($, _, Backbone, translater) {
    return Backbone.Model.extend({

        /**
         * Attributes default values
         * @type {Object}
         */
        defaults: {
            name             : translater.getValueFromKey('form.new'),
            creationDate     : new Date(),
            modificationDate : null,
            curStatus        : 1,
            editStatus       : '',
            translations     : {},
            schema           : {},
            tag              : '',
            obsolete         : false,
            propagate        : false,
            isTemplate       : false,
            context          : window.context || "",
            state            : 1,
            originalID       : null,
            initialID        : null,
            readonly         : false,

            // display attributes
            creationDateDisplay : "",
            modificationDateDisplay : ""
        },

        /**
         * Model constructor
         */
        initialize  : function() {
            _.bindAll(this, 'toJSON');

            var creationDate     = this.get('creationDate'),
                modificationDate = this.get('modificationDate');

            if (creationDate != null) {
                creationDate = creationDate.toString();
                this.set('creationDateDisplay', creationDate.substring(0, creationDate.length - 11));
            }
            if (modificationDate != null) {
                modificationDate = modificationDate.toString();
                this.set('modificationDateDisplay', modificationDate.substring(0, modificationDate.length - 11));
            }
            this.set('editStatus', creationDate == modificationDate ? 'created': 'modified');

            if (this.defaults.context = "" && window.context)
                this.defaults.context = window.context;
            this.set('context',window.context);
        },

        toJSON : function() {
            var schema = this.get('schema');
            _.map(schema, function(el) {
                el.validators = [];
                return el;
            });
            this.set('schema', schema);

            // todo send this.attributes.toJSON()?
            return {
                id                         : this.get('id'),
                name                       : this.get('name'),
                creationDate               : this.get('creationDate'),
                modificationDate           : this.get('modificationDate'),
                curStatus                  : this.get('curStatus'),
                translations               : this.get('translations'),
                schema                     : this.get('schema'),
                tag                        : this.get('tag'),
                isTemplate                 : this.get('isTemplate'),
                obsolete                   : this.get('obsolete'),
                propagate                  : this.get('propagate'),
                context                    : this.get('context'),
                state                      : this.get('state'),
                originalID                 : this.get('originalID'),
                initialID                  : this.get('initialID'),
                readonly                   : this.get('readonly')
            }
        }
    });
});
