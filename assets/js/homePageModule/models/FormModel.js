define([
    'jquery', 'underscore', 'backbone', '../../Translater', 'app-config'
], function($, _, Backbone,Translater, AppConfig) {

    var translater = Translater.getTranslater();
    /**
     * Main model for homepage layout representing a form
     */
    var Form = Backbone.Model.extend({

        /**
         * Attributes default values
         * @type {Object}
         */
        defaults: {
            name             : translater.getValueFromKey('form.new'),
            labelFr          : '',
            labelEn          : '',
            creationDate     : new Date(),
            modificationDate : null,
            curStatus        : 1,
            descriptionFr    : '',
            descriptionEn    : '',
            keywordsFr       : [],
            keywordsEn       : [],
            schema           : {},
            fieldsets        : [],
            tag              : '',
            obsolete         : false,
            propagate        : false,
            isTemplate       : false,
            context          : window.context || "",
            schtroudel: "salamanca !",

            // display attributes
            creationDateDisplay : "",
            modificationDateDisplay : ""
        },

        /**
         * Model constructor
         */
        initialize  : function(options) {
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

            if (this.defaults.context = "" && window.context)
                this.defaults.context = window.context;

            this.updateKeywords();
        },

        updateKeywords : function() {
            var keywordsFr = [], keywordsEn = [];

            _.each(this.get('keywordsFr'), function(el, idx){
                keywordsFr.push(el.name);
            });

            _.each(this.get('keywordsEn'), function(el, idx){
                keywordsEn.push(el.name);
            });

            this.set('keywordsFr', keywordsFr);
            this.set('keywordsEn', keywordsEn);
        },

        toJSON : function() {

            var schema = this.get('schema');

            _.map(schema, function(el, idx) {
                el.validators = [];
                if (el.readonly) {
                    el.validators.push('readonly')
                }
                if (el.required) {
                    el.validators.push('required')
                }

                return el;
            });

            this.set('schema', schema);

            return {
                id                         : this.get('id'),
                name                       : this.get('name'),
                labelFr                    : this.get('labelFr'),
                labelEn                    : this.get('labelEn'),
                creationDate               : this.get('creationDate'),
                modificationDate           : this.get('modificationDate'),
                curStatus                  : this.get('curStatus'),
                descriptionEn              : this.get('descriptionEn'),
                descriptionFr              : this.get('descriptionFr'),
                keywordsFr                 : this.get('keywordsFr'),
                keywordsEn                 : this.get('keywordsEn'),
                schema                     : this.get('schema'),
                fieldsets                  : this.get('fieldsets'),
                tag                        : this.get('tag'),
                isTemplate                 : this.get('isTemplate'),
                obsolete                   : this.get('obsolete'),
                propagate                  : this.get('propagate'),
                context                    : this.get('context')
            }
        }

    });

    return Form;

});
