//For ecoreleve only if you use it in another application please implements TODO
define([
    'jquery', 'lodash', 'backbone',
    'backbone-forms'
], function($, _, Backbone) {
    return Backbone.Form.editors.Select.extend({
        events: {
            'change': 'applyConfiguration'
        },

        renderOptions: function(options) {
            Backbone.Form.editors.Select.prototype.renderOptions.call(this, options);
            //store options used for building select in object for used it 
            this.myOptionsResult = options;
        },

        applyConfiguration: function(e) {
            //option is selected
            //we automaticaly set property : name, childForm, childFormName
            //TODO use context and check ObjectPickerEditor for some clue on embed configuration
            if (e && 'delegateTarget' in e && 'selectedOptions' in e.delegateTarget && e.delegateTarget.selectedOptions[0]) {
                var value = e.delegateTarget.selectedOptions[0].value
                var filteredOption =  this.myOptionsResult.filter(function(item) { return item.val == value});

                if (filteredOption.length == 1 ) {
                    //set value to store
                    var updateObj = {
                        name : filteredOption[0].val,
                        childForm : filteredOption[0].id,
                        childFormName : filteredOption[0].val
                    }
                    //update model with value
                    this.model.set(
                    updateObj,
                    { trigger: false });
                }

                //from here model will not be updated 
                if( filteredOption.length == 0  ) {
                    //impossible case it's same ''datasource'' so if you select one value you have at least one value 
                    console.warn("IMPOSSIBRU")

                }
                if( filteredOption.length > 1 ) {
                    console.warn("You have more than one result that's not good")
                    console.warn("You should have only one protocol with this name (check your database): ",value)
                }
                
                }
             else {
                console.warn("hum something wrong with event send")
              }
        }
    });
});
