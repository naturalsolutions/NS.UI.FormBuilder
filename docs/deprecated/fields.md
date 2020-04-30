# How to add a new field type

The Formbuilder is built so that anybody can add a field type.

To add a new field you can follow these step :

## Step 1 : create the model class

All available field type are in [Field.js](https://github.com/NaturalSolutions/NS.UI.FormBuilder/blob/master/assets/js/editionPageModule/models/Fields.js) file.

If you want to add a field you hace to inerit from BaseField class :

    models.AwesomeField = models.BaseField.extend({
        ...
    });

## Step 2 : define schema for backbone forms

The formbuilder is based on backbone-forms and we use schema definiton to generate form, see [backbone-forms documentation](https://github.com/powmedia/backbone-forms).

For example for our Awesome field we have one properties **maximum characters size** so :

    models.AwesomeField = models.BaseField.extend({
        ...
        schema : function() {
            return _.extend( {}, models.BaseField.prototype.schema, {
                maxSize: {
                    type        : 'Integer',
                    title       : 'Max character size',
                    editorClass : 'form-control',
                    template    : fieldTemplate
                },
            });
        }
        ...
    });

Each field extend BaseField schema. We fixed some common properties like ID, name, required, etc ...

### Class properties

For each field we specify some class properties :

- **type** : the field type name for example awesome
- **section** : allow ro group field in semantic group for example : standard field, autocomplete field ...
- **i18n**   : allow to translate field label in the edition page left panel

So we have :

    models.AwesomeField = models.BaseField.extend({
        ...
    }, {
        type   : 'Awesome',
        section : 'standard',
        i18n   : 'awesome'
    });


**These properties are required.**

For more information about class properties with backbone see [extend documentation](http://backbonejs.org/#Model-extend)

## Step 3 : specify default value

Like schema properties you have to specify your field default value :

    models.AwesomeField = models.BaseField.extend({

        default : function() {
            return _.extend( {}, models.BaseField.prototype.default, {
                maxSize : 42
            });
        }

    });

## Step 4 : create a view for your field

Now your model is defined you have to create a view for represent graphicly your field.
First you have to create a field in [view/fieldViews folder](https://github.com/NaturalSolutions/NS.UI.FormBuilder/tree/master/assets/js/editionPageModule/views/fieldViews).
This file must be named (for our example) AwesomeFieldView.js.

Your view must inherit from [BaseView](https://github.com/NaturalSolutions/NS.UI.FormBuilder/blob/master/assets/js/editionPageModule/views/fieldViews/BaseView.js) :

    var AwesomeFieldView = BaseView.extend({
        initialize : function(options) {
            var opt = options;
            opt.template = viewTemplate;
            BaseView.prototype.initialize.apply(this, [opt]);
        },
        render : function() {
           BaseView.prototype.render.apply(this, arguments);
        }
    });

It's the minimal code for your view, after your can extens event like that :

    events: function() {
        return _.extend(BaseView.prototype.events, {
            'click button'     : 'callback',
        });
    }


## Step5 : create a template

Now you have to create a template for your view.
Your template must be placed in [templates/fields folder](https://github.com/NaturalSolutions/NS.UI.FormBuilder/tree/master/assets/js/editionPageModule/templates/fields) and
must be name like **AwesomeFieldView.html**.

For example we can create a simple template

    <div class="element padding5">
        <div class="row paddingBottom5">
            <label class="col-md-6">
                <i class="fa fa-arrows"></i>
                <%= labelFr %><% if (required === true) { %> (*) <% } %>
            </label>
            <div class="col-md-6 right actions">
                <a href="#" class="trash">
                    <span class="reneco trash"></span>
                </a>
                <a href="#copy/<%= id %>" class="copy">
                   <span class="reneco duplicate"></span>
               </a>
               <a href="#setting/<%= id %>" class="btn reneco gray">
                    <span data-i18n="field.action.edit">
                        Modifier
                    </span>
                    <div>
                        <span class="reneco settings"></span>
                    </div>
                </a>
            </div>
        </div>
        <div class="row">
            <div class="col-md-11 col11centered">
                <input type="text" class="form-control" maxlength="<%= maxSize %>" name="<%= name %>" id="<%= id%>"  />
            </div>
        </div>
    </div>


You awesome field is displayed as a text field with a maxlength :

    maxlength="<%= maxSize %>"

## Step 6 : translation

To finish you have to add your file in each translation files in [ressources/locales folder](https://github.com/NaturalSolutions/NS.UI.FormBuilder/tree/master/ressources/locales).

For example for our field we have to add

    "fields" : {
        ...
        "awesome" : "Awesome field"
    }

## Step 7 : enjoy !

Now if all is good your field appears in the left panel in the edition page (remember the section that you choose).

![in the widget panel](http://img4.hostingpics.net/pics/616810FormBuilderGoogleChrome3.jpg)

![Your view](http://img4.hostingpics.net/pics/703471FormBuilderGoogleChrome4.jpg)

## Get full code

If you want to add that awesome field on the application or get this code check [examples folder](https://github.com/NaturalSolutions/NS.UI.FormBuilder/tree/master/docs/examples)

back to [summary](index.md)