define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {

    /**
     * Main model for homepage layout representing a form
     */
    var Form = Backbone.Model.extend({

        /**
         * Attributes default values
         * @type {Object}
         */
        defaults: {
            id               : 1,
            name             : 'Form',
            labelFr          : 'Formulaire',
            labelEn          : 'Form',
            creationDate     : new Date(),
            modificationDate : null,
            curStatus        : 1,
            descriptionEn    : 'A form',
            descriptionFr    : 'Un formulaire',
            keywordsFr       : ['formulaire'],
            keywordsEn       : ['form'],

            // display attributes
            creationDateDisplay : "",
            modificationDateDisplay : ""
        },

        /**
         * Model constructor
         */
        initialize  : function(options) {
            this.set('modificationDateDisplay', this.formatDateForDisplay(this.get('modificationDate')) );
            this.set('creationDateDisplay',     this.formatDateForDisplay(this.get('creationDate'))     );

            this.set('creationDate',        new Date(this.get('creationDate'))      );
            this.set('modificationDate',    new Date(this.get('modificationDate'))  );
        },

        /**
         * Format date object in string
         * @param {string} dateStringToDisplay attribute value to convert in formatted string like 19/06/2014 - 18:10
         */
        formatDateForDisplay : function(dateStringToDisplay) {
            var newDate         = new Date(dateStringToDisplay),
                newDateDay      = newDate.getDate(),
                newDateMonth    = newDate.getMonth() + 1,
                newDateYear     = newDate.getFullYear(),
                newDateHours    = newDate.getHours() + 1,
                newDateMinutes  = newDate.getMinutes();

            //  Add zero before text
            newDateDay      = newDateDay        < 10    ? '0' + newDateDay      : newDateDay;
            newDateMonth    = newDateMonth      < 10    ? '0' + newDateMonth    : newDateMonth;
            newDateHours    = newDateHours      < 10    ? '0' + newDateHours    : newDateHours;
            newDateMinutes  = newDateMinutes    < 10    ? '0' + newDateMinutes  : newDateMinutes;

            return newDateDay + '/' + newDateMonth + '/' + newDateYear + ' - ' + newDateHours + ':' + newDateMinutes;
        }

    });

    return Form;

});
