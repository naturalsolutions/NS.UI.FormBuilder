//For ecoreleve only if you use it in another application please implements TODO
define([
    'jquery', 'lodash', 'backbone',
    'backbone-forms'
], function($, _, Backbone) {
    return Backbone.Form.editors.Text.extend({
        events: {
            'change': 'applyEventRules',
            'blur': 'applyEventRules',
        },

        initialize: function(options) {
            var inputValue = options.model.get(options.key);
            var ruledValue = this.applyBeforeRules(inputValue);
            options.model.set(options.key, ruledValue, {silent: true});
            Backbone.Form.editors.Text.prototype.initialize.call(this, options);
        },
        applyBeforeRules: function(str){
            str = this.replaceSpace(str)
            str = this.titleIt(str);
            return str;
        },

        applyEventRules : function(e) {
            var value = e.currentTarget.value;
            var val = this.replaceSpace(value)
            val = this.titleIt(value);
            this.model.set(this.key, val);
        },



        replaceSpace: function(str) {
            str = str.trim();               //remove leading and trailing space
            str = str.replace(/\s+/g, " "); //remove consecutive space and replace it by one space
            if(str) {
                return str.split(' ').join('_'); //replace remaining space by _
            }
            else {
                return str
            }
        },

        titleIt: function(str) {
            if (str) {
                if(str.length == 1 ) {
                    str = str.charAt(0).toUpperCase();
                }
                else if (str.length > 1) {
                    str = str.charAt(0).toUpperCase() + str.slice(1);
                }    
            }
            return str;
        }
    });
});
