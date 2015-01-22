# Events documentation

We use backbone radio for communication between and inside module.

In this page you can see all events line inside and out modules.

For each event we specify the sender, which data is sent and which callback is executed by the receiver.

## Edition page modules events

On this section we explain for each object what events it listent or send for the edition page module


- [Edition page controller](https://github.com/NaturalSolutions/NS.UI.FormBuilder/blob/master/assets/js/editionPageModule/controller/EditionPageController.js)
    - **addElement** : receive when user wants to add a field on the form
        - Sender : [Vidget panel view](https://github.com/NaturalSolutions/NS.UI.FormBuilder/blob/master/assets/js/editionPageModule/views/WidgetPanelView.js)
        - Data : new field class name like TextField
        - Callback : addElementToCollection
    - **export** : reveive when user wants to export a form as JSON file
        - Sender : [Form Panel view](https://github.com/NaturalSolutions/NS.UI.FormBuilder/blob/master/assets/js/editionPageModule/views/FormPanelView.js)
        - Data : new JSON file name
        - Callback : exportFormAsFile
    - **edition** : receive when an user wants to edit a field properties
    - **import** : receive when an user want to import a form with JSON file


- [Form Panel View](https://github.com/NaturalSolutions/NS.UI.FormBuilder/blob/master/assets/js/editionPageModule/views/FormPanelView.js)
    - **formToEdit** : send when an user want import or choose a form on the grid for edit it
        - Sender : [Edition page controller](https://github.com/NaturalSolutions/NS.UI.FormBuilder/blob/master/assets/js/editionPageModule/controller/EditionPageController.js)
        - Data : collection imported or choosen as JSON data
        - Callback : formToEdit


- [Setting panel view](https://github.com/NaturalSolutions/NS.UI.FormBuilder/blob/master/assets/js/editionPageModule/views/SettingPanelView.js)
    - **modelToEdit** : receive when user want to edit a field properties
        - Sender : [Edition page controller](https://github.com/NaturalSolutions/NS.UI.FormBuilder/blob/master/assets/js/editionPageModule/controller/EditionPageController.js)
        - Data : Field to edit
        - Callback : displayModelForm


- [Field collection](https://github.com/NaturalSolutions/NS.UI.FormBuilder/blob/master/assets/js/editionPageModule/collection/FieldCollection.js)
    - **remove** : event receive when user wants to remove a field
        - Sender : [BaseView](https://github.com/NaturalSolutions/NS.UI.FormBuilder/blob/master/assets/js/editionPageModule/views/fieldViews/BaseView.js) or an herited view from BaseView
        - Data : model to remove ID
        - Callback : removeElement

back to [summary](index.md)
