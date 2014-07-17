# NS.UI.FormBuilder

## Screenshoots

![formBuilder](https://bfc338e5d0f8ee39c10a706464e4731eb4bd4d7a.googledrive.com/host/0B363_4UXLoNhUWhTOWhCbXlQQ2s/form.jpg)

## Features

* Graphical form definition
* Export form as XML
* Import a form with an XML file
* Drag'n drop field position ajustement

## Technologies used

* [NS.UI.Notification](https://github.com/NaturalSolutions/NS.UI.Notification)
* [NS.UI.Navbar](https://github.com/NaturalSolutions/NS.UI.NavBar)
* Backbone JS
* jQuery / jQuery UI
* Bootstrap 2.3.2
* fancy-tree
* font-awesome
* nanoScroller
* jsdifflib
* xmllint

## Demo

You can try the formBuilder on [this page](http://naturalsolutions.github.io/NS.UI.FormBuilder/)
That page is static, so some functionnalities like "save on the cloud" will not work completely

## Create a plugin

You can add your own field in the formBuilder.

You have to :  

* add your field XML definition in the XSD file
* Create a model herited from BaseField
* Create a view herited from BaseView
* And create an edit view herited from BaseEditView

### An example

We want to create a field with to text input, "an fullname field" : name + firstname. Let's GO !

#### The XML schema

We are lucky, our fullName field contains two simple TextField so first we create XML schema for this simple input : 

    <xs:complexType name="simpleTextType">
        <xs:sequence>
            <xs:element name="defaultValue" type="xs:string" />
            <xs:element name="hint"         type="xs:string" />
            <xs:element name="size"         type="xs:integer" />
        </xs:sequence>
    </xs:complexType>

And we create XML schema for our fullName field with simpleTextType : 
    
    <xs:complexType name="field_fullNameType">
        <xs:complexContent>
            <xs:extension base="fieldType">
                <xs:sequence>
                    <xs:element name="name" type="simpleTextType" />
                    <xs:element name="firstName" type="simpleTextType" />
                </xs:sequence>
            </xs:extension>
        </xs:complexContent>
    </xs:complexType>

#### The model

    app.models.FullNameField = app.models.BaseField.extend({
        defaults : {
            required : true,
            label : 'Your fullname',
            name : {
                defaultValue: "",
                hint        : "Write your name",
                size        : 255  
            },
            firstName : {
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
            return xml +    '<name>' + 
                            '  <defaultValue>' + this.get('name')['defaultValue'] + '</defaultValue>' +
                            '  <hint>' + this.get('name')['hint'] + '</hint>' +
                            '  <size>' + this.get('name')['size'] + '</size>' +
                            '</name>'+
                            '<firstName>' + 
                            '  <defaultValue>'+this.get('firstName')['defaultValue']+'</defaultValue>' +
                            '   <hint>' + this.get('firstName')['hint'] + '</hint>' +
                            '   <size>' + this.get('firstName')['size'] + '</size>' +
                            '</firstName>'
        }
    }, {
        type    : "FullName",
        xmlTag  : 'field_fullName',
        schema : {
            name : {
                defaultValue: { type : "string", display: "Default value", section : "advanced" },
                hint        : { type : "string" },
                size        : { type : "integer"}
            },
            firstName : {
                defaultValue: { type : "string", display: "Default value", section : "advanced" },
                hint        : { type : "string" },
                size        : { type : "integer"}
            }            
        }
    });
    
    _.defaults(
        app.models.FullNameField.prototype.defaults,     app.models.BaseField.prototype.defaults
    );

Now you can see your field in the left panel : 

![fullNmae](https://bfc338e5d0f8ee39c10a706464e4731eb4bd4d7a.googledrive.com/host/0B363_4UXLoNhUWhTOWhCbXlQQ2s/fullname.jpg)

### The view

This view give an example of model representation

    app.views.FullNameFieldView = app.views.BaseView.extend({
        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events);
        },
        render : function() {
           app.views.BaseView.prototype.render.apply(this, arguments);
       },        
    }, {
        templateSrc: '<div class="element"><div class="row" style="margin-left : 10px;">' + 
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
                     '   <input type="text" class="span6" name="<%= name %>" id="<%= id %>" placeholder="<%= name["hint"] %>" value="<%= name["defaultValue"] %>" /> '+
                        '   <input type="text" class="span6 marginLeft10" name="<%= name %>" id="<%= id %>" placeholder="<%= firstName["hint"] %>" value="<%= firstName["defaultValue"] %>" /> '+
                        '</div></div>'
    });

Now if you try to add a fullName field on the form a view appears : 

![fullNameView](https://bfc338e5d0f8ee39c10a706464e4731eb4bd4d7a.googledrive.com/host/0B363_4UXLoNhUWhTOWhCbXlQQ2s/view.jpg)


### The edition view

This view allow to change model attributes.
In this example : with Unscore JS library, the view template is very simple.

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

And now if you click and modify on the view you can see your edit view : 

![fullNameEditView](https://bfc338e5d0f8ee39c10a706464e4731eb4bd4d7a.googledrive.com/host/0B363_4UXLoNhUWhTOWhCbXlQQ2s/settingV.jpg)

You can find all this code in puglings directory in fullNameField.js

## XML Export

You can export your current form definition as an XML file, for example with only a fullName field we cant have : 

    <?xml version="1.0"?>
    <form xmlns="http://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="test attribute" xsi:schemaLocation="http://www.w3schools.com note.xsd">
        <name>My protocol</name>
        <description>My first form</description>
        </keywords>
        <fields>
            <field_fullName id="1">
                <label>Your fullname</label>
                <name>   
                    <label lang="en">field</label>   
                    <display_label>undefined</display_label>
                </name>
                <required>true</required>
                <readOnly>false</readOnly>
                <firstName>   
                    <defaultValue/>   
                    <hint>Write your name</hint>   
                    <size>255</size>
                </firstName>
                <lastName>   
                    <defaultValue/>   
                    <hint>Write your firstname</hint>   
                    <size>255</size>
                </lastName>
            </field_fullName>
        </fields>
    </form>




