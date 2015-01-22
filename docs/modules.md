# Application structure

The application is composed of two modules built with MarionetteJS based on the same architecture :

- A router with routes and controllers action matching
- A controller
- A layout split in regions
     - A view for each region
- A model collection
- One or many models

**Each module follows this folder architecture**

- collection
- controller
- layout
- modals (modals view)
- models
- router
- templates (underscore templates)
- view (Marionette views)

## Homepage module

The homepage module contains a grid with all forms list and a search form for
apply some filter on the grid.

![homepage](http://img4.hostingpics.net/pics/865244FormBuilderGoogleChrome.jpg)

## Edition page module

The edition page module allow to edit a form and save or export it.

**If you want to use only the edition module see our [edition-only](https://github.com/NaturalSolutions/NS.UI.FormBuilder/tree/edition-only) branch.**

![editionPage](http://img4.hostingpics.net/pics/463955FormBuilderGoogleChrome2.jpg)

back to [summary](index.md)
