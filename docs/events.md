# Events documentation

We use backbone radio for communication between and inside module.

In this page we explain event sequences for an use case.

# User wants to delete form

These events use **homepage channel**.

* **delete form**
 * Send by CenterGridPanelView
 * Received by HomePageController
 * Data : ID of the form to remove
* **formDeleted**
 * Send by HomePageController
 * Received by CenterGridPanelView
 * Data : if form has been deleted

# User click on a row in the main panel grid

These events pass through **grid channel**.

* **rowClicked**
 * Send by ClickableRow (see CenterGridPanelView onRender method)
 * Received by CenterGridPanelView
 * Data : jQuery clicked element

# User use search form on the home page

These events pass through **grid channel**.

* **search**
 * Send by leftPanelView
 * Rceive by CenterGridPanelView
 * Data : searchData user typed data

# User exports a form

These events pass through **form channel**.

* **export**
 * Send by FormPanelView
 * Rceived by EditionPageController
 * Data filename for futur created file
* **exportFinished**
 * Send by EditionPageController
 * Send by FormPanelView
 * Data : if form has correcly been exported

# User imports a form

These events pass through **form, global** and **editionPage channels**.

The global chennel allow communication betweens module through formbuilder main app object.

* **formImported** : global channel
 * Send by CenterGridPanelView
 * Received by formbuilder
 * Data : JSON form parsed data


* **formImported** : editionPage channel
 * Send by : formbuilder
 * Received by : EditionPageRouter
 * Data : JSON form parsed data


* **import** : form channel
 * Send by : EditionPageRouter
 * Received by : EditionPageController
 * Data : JSON form parsed data


* **formToEdit** : form channel
 * Send by : EditionPageController
 * Rceived by : FormPanelView
 * Data : JSON form parsed data

# User wants to edit a form properties

These events pass through **form channel**.

* **editForm**
 * Send by : FormPanelView
 * Received by : EditionPageLayout
 * Data : form to edit

# User wants to edit a form field properties

These events pass through **form channel**.

* **editModel**
 * Send by : BaseView or herited view like TextFieldView
 * Received by : EditionPageController
 * Data : ID of model to edit


* **initFieldSetting**
 * Send by : EditionPageController
 * Received by : EditionPageLayout
 * Data : some data configuration to init setting view

# User wants to remove a field

These events pass through **form channel**.

* **remove**
 * Send by : BaseView or herited view like TextFieldView
 * Received by : FieldCollection
 * Data : ID of model to edit

This event trigger a simple backbone event. FormPanelView is listening **remove** FieldCollection event to update itself.



back to [summary](index.md)
