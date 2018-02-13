//
//  Configuration file
//
//  This configuration file specifies some rules for the app.
//  Each rule is executed when a user try to save or import a form.
//  Each rule must have an error object with a title and a content. You can have as many rules as you want.
//


define([], function() {

    var AppConfiguration = {
        portalAuth: false,                             // Authentification via NS portal?
        username: 'Utilisateur',                       // Username if !portalAuth
        language: 'fr',                                // language if !portalAuth
        portalURL: 'http://localhost/nsportal/front/', // Portal local URL
        securityKey: '',                               // JWT security secret word key (protip: just put anything there)

        // URL to track protocol, #originalID# will be replaced in code by actual Form.originalID
        trackFormURL: 'http://track/Intranet/TRACK/App_Pages/ViewForm_from_fb.aspx?iTPro_PK_Id=#originalID#&IsNew=True',

        paths: {
            // Path to the thesaurus Web Services
            thesaurusWSPath: 'http://localhost/ThesaurusCore/api/thesaurus/fastInitForCompleteTree',
            // POST(@lng, @StartNodeId)
            positionWSPath: 'http://localhost/positionCore/api/PositionAction/GetTree'
        },

        config: {
            options: {

                // Specify URL for formBuilder configuration
                // Replace this URL with your own

                URLOptions: {
                    // ***********************************************************************
                    // The app needs the following nodes to have a proper path to the server :
                    // ***********************************************************************

                    form: '/FormbuilderWS/form',                            // use this to fetch a single form
                    forms: '/FormbuilderWS/forms',                          // use this to fetch all forms for a context with appending /<context>

                    formAutocomplete: '/FormbuilderWS/autocomplete/forms',
                    makeObsolete: '/FormbuilderWS/makeObsolete',
                    allforms: '/FormbuilderWS/forms/allforms',
                    formSaveURL: '/FormbuilderWS/forms',                    //  Get all form name for autocomplete, does not work if you are in client side mode only
                    preConfiguredField: '/FormbuilderWS/configurations',    //  Returns all pre-configurated fields, they are fields saved by use for a future use ex: an user create a firstName field because it will be present in many forms
                    fieldConfigurationURL: '/FormbuilderWS/configurations', //  Allow to send a pre-configurated field to the server. Send a POST request, won't work on client side, you need the back-end
                    childforms: '/FormbuilderWS/childforms',                // Child forms can get selected passing a parent form ID
                    sqlAutocomplete: '/FormbuilderWS/sqlAutocomplete',      // Used to get values for autocomplete field
                    unities: '/FormBuilderWS/unities',                      // Get all unities for autocomplete

                    // ***********************************************************************
                    // RENECO Specific Paths :
                    // ***********************************************************************

                    security: '/FormbuilderWS/Security',                    // Used for security chekings purpose (jwt among others ?)
                    track: '/FormbuilderWS/Track',                          // Used for track data linking
                    trackTypes: '/FormbuilderWS/TrackTypes',                // Used to get track types (THIS PATH SHOULD BE TEMPORARY)
                    trackFormWeight: '/FormbuilderWS/Track/FormWeight',     // Used to get forms weight from track records
                    trackInputWeight: '/FormbuilderWS/Track/InputWeight',   // Used to get input weight from track records

                    // ************************************************
                    // Still don't know what those nodes are used for :
                    // ************************************************

                    autocompleteURL: 'ressources/autocomplete/',                  //  Allow to get some topic for autocomplete functionnalities
                    translationURL: 'ressources/locales/__lng__/__ns__.json',     //  Allows to get translation ressources (use i18nnext : http://i18next.com/ )
                    keywordAutocomplete: 'ressources/autocomplete/keywords.json', //  Get form keywords autocomplete values
                    usersAutocomplete: 'ressources/autocomplete/users.json',
                    linkedFields: 'ressources/linkedFields/linkedFields.json',    //  Allow to get linked fields list
                    templateUrl: 'ressources/templates/templates.json'            //  URL for form templates
                },

                //  Wich parent HTML element for the application
                el: '#formBuilder'
            }
        },

        topcontext: 'reneco',

        /* list of all available input types
            inputTypes: [
                "Autocomplete",
                "AutocompleteTreeView",
                "CheckBox",
                "ChildForm",
                "Date",
                "Decimal",
                "File",
                "Number",
                "NumericRange",
                "ObjectPicker",
                "Pattern",
                "Position",
                "Radio",
                "Select",
                "SubFormGrid",
                "TextArea",
                "Text",
                "Thesaurus",
                "TreeView"
            ]
        */

        // default values for context options, if none is specified in
        // contexts.context, defaults from here are used.
        defaults: {
            editColumns: [
                "name",
                "defaultValue",
                "linkedFieldTable",
                "linkedField",
                "linkedFieldset",
                "appearance",
                "editMode"
            ],
            inputTypes: [
                'Text',
                'TextArea',
                'Date',
                'Number',
                'Decimal',
                'CheckBox',
                'Select',
                'File',
                'ChildForm',
                'SubFormGrid',
                'Autocomplete',
                'ObjectPicker',
                'Thesaurus',
                'Position'
            ],
            allowedConvert: [
                ['Text', 'TextArea', 'Date', 'Pattern'],
                ['Number', 'Decimal', 'NumericRange'],
                ['Select', 'CheckBox', 'Radio']
            ],
            thesaurusStartId: 0,
            positionStartId: 0
        },

        // available contexts + specific config item
        // if sub-element is not specified it will be taken from defaults above
        contexts: {
            ecoreleve: {
                inputTypes: [
                    'Autocomplete',
                    'Text',
                    'TextArea',
                    'Date',
                    'Number',
                    'Decimal',
                    'Select',
                    'Thesaurus',
                    'CheckBox',
                    'ChildForm',
                    'ObjectPicker',
                    'SubFormGrid'
                ]
            },
            track: {
                inputTypes: [
                    'Autocomplete',
                    'Text',
                    'TextArea',
                    'Date',
                    'File',
                    'Number',
                    'Decimal',
                    'CheckBox',
                    'ChildForm',
                    'Thesaurus',
                    'Position'
                ]
            },
            ecollection: {
                inputTypes: [
                    'Autocomplete',
                    'Text',
                    'Date',
                    'TextArea',
                    'Number',
                    'Decimal',
                    'Select',
                    'Thesaurus',
                    'CheckBox',
                    'ChildForm'
                ]
            },
            position: {
                inputTypes: [
                    'Autocomplete',
                    'Text',
                    'TextArea',
                    'Date',
                    'Number',
                    'Decimal',
                    'CheckBox',
                    'Select',
                    'File',
                    'ChildForm',
                    'Thesaurus'
                ]
            }
        }
    };

    return AppConfiguration;
});
