var formBuilder = (function(app) {

    //  Model 
    app.models.FullNameField = app.models.BaseField.extend({
        defaults : {
            required : true,
            label : 'Your fullname',
            firstName : {
                defaultValue: "",
                hint        : "Write your name",
                size        : 255  
            },
            lastName : {
                defaultValue: "",
                hint        : "Write your firstname",
                size        : 255  
            }
        },
        
        initialize : function(options) {
            app.models.BaseField.prototype.initialize.apply(this, arguments);
            _.extend(this.constructor.schema, app.models.BaseField.schema);
        },
        
        getXML : function() {
            var xml = app.models.BaseField.prototype.getXML.apply(this, arguments);
            return xml +    '<firstName>' + 
                            '   <defaultValue>'    + this.get('firstName')['defaultValue']  + '</defaultValue>' +
                            '   <hint>'            + this.get('firstName')['hint']          + '</hint>' +
                            '   <size>'            + this.get('firstName')['size']          + '</size>' +
                            '</name>'+
                            '<lastName>' + 
                            '   <defaultValue>'    + this.get('lastName')['defaultValue']  + '</defaultValue>' +
                            '   <hint>'            + this.get('lastName')['hint']          + '</hint>' +
                            '   <size>'            + this.get('lastName')['size']          + '</size>' +
                            '</firstName>'
        }
    }, {
        type    : "FullName",
        xmlTag  : 'field_fullName',
        schema : {
            firstName : {
                defaultValue: { type : "string", display: "Default value", section : "advanced" },
                hint        : { type : "string" },
                size        : { type : "integer"}
            },
            lastName : {
                defaultValue: { type : "string", display: "Default value", section : "advanced" },
                hint        : { type : "string" },
                size        : { type : "integer"}
            }
            
        }
    });
    
    _.defaults(app.models.FullNameField.prototype.defaults,          app.models.BaseField.prototype.defaults);
    
    //  View
    app.views.FullNameFieldView = app.views.BaseView.extend({
        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events);
        },
        render : function() {
           app.views.BaseView.prototype.render.apply(this, arguments);
       },        
    }, {
        templateSrc:    '<div class="element"><div class="row" style="margin-left : 10px;">' + 
                        '   <label class="span4">' + 
                        '       <i class="fa fa-arrows" style="color : #09C"></i>' + 
                        '       <% if (required === true) { %> * <% } %> <%= label %></label> '+
                        '   <div class="span8 right hide">'+
                        '       <a href="#" class="trash">'+
                        '           <i class="fa fa-trash-o"></i>Supprimer'+
                        '       </a>'+ 
                        '       <a href="#setting/<%= id %>" class="wrench">'+
                        '           <i class="fa fa-wrench"></i>Modifier'+
                        '       </a>'+ 
                        '       <a href="#" class="copy">&nbsp;<i class="fa fa-copy"></i> Dupliquer</a>'+
                        '   </div>'+
                        '</div>' +
                        '<div class="row" style="margin-left : 10px;">' + 
                        '   <input type="text" class="span6" name="firstName" id="<%= id %>" placeholder="<%= firstName["hint"] %>" value="<%= firstName["defaultValue"] %>" /> '+
                        '   <input type="text" class="span6 marginLeft10" name="lastName" id="<%= id %>" placeholder="<%= lastName["hint"] %>" value="<%= lastName["defaultValue"] %>" /> '+
                        '</div></div>'
    });
    
    //  setting view
    app.views.FullNameFieldEditView = Backbone.View.extend({        
        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
        },        
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        }        
    }, {
        templateSrc :   '<% _.each(["firstName", "lastName"], function(el){ var obj = eval(el); %>' + 
                        '   <% _.each(["defaultValue", "hint", "size"], function(subEl) { %>' +
                        '       <div >' +
                        '           <div class="row-fluid">'+
                        '               <label class="span10 offset1"><%= el + " " + subEl %></label>' +
                        '           </div>' +
                        '           <div class="row-fluid">' +
                        '               <input class="span10 offset1 property" type="text" data-attr="<%= el+"["+subEl+"]" %>" placeholder="<%= el + " " + subEl %>" value="<%= obj[subEl] %>" />' +
                        '           </div>' +
                        '       </div> ' +
                        '   <% }) %>'+
                        '<% }); %>'
    });
    
    return app;

})(formBuilder);