/**
 * Created by David on 22/12/2015.
 */

define(['jquery'], function ($) {
    var TrackStatics = {
        staticInputs: {
            "Individual": {
                "id": 0,
                "validators": [],
                "labelFr": "Individu",
                "labelEn": "Individual",
                "name": "Individual",
                "editMode": 3,
                "editorClass": "",
                "fieldClassEdit": "",
                "fieldClassDisplay": "",
                "atBeginingOfLine": true,
                "fieldSize": "6",
                "linkedFieldset": "",
                "linkedFieldTable": null,
                "linkedField": null,
                "defaultValue": "",
                "help": "Bird ring",
                "triggerlength": 2,
                "url": "",
                "isSQL": false,
                "order": 0,
                "type": "Autocomplete"
            },
            "Egg": {
                "id": 0,
                "validators": [],
                "labelFr": "Oeuf",
                "labelEn": "Egg",
                "name": "Egg",
                "editMode": 3,
                "editorClass": "",
                "fieldClassEdit": "",
                "fieldClassDisplay": "",
                "atBeginingOfLine": true,
                "fieldSize": "6",
                "linkedFieldset": "",
                "linkedFieldTable": "",
                "linkedField": "",
                "defaultValue": "",
                "help": "Egg ring",
                "triggerlength": 3,
                "url": "unknowWebService",
                "isSQL": false,
                "order": 0,
                "type": "Autocomplete"
            },
            "UserReadonly": {
                "id": 0,
                "validators": [],
                "labelFr": "Utilisateur",
                "labelEn": "User",
                "name": "UserReadonly",
                "editMode": 1,
                "editorClass": "",
                "fieldClassEdit": "",
                "fieldClassDisplay": "",
                "atBeginingOfLine": true,
                "fieldSize": "6",
                "linkedFieldset": "",
                "linkedFieldTable": "",
                "linkedField": "",
                "defaultValue": "",
                "isDefaultSQL": true,
                "help": "",
                "valuesize": "0;255",
                "order": 1,
                "type": "Text"
            },
            "eventDate": {
                "id": 0,
                "validators": [],
                "labelFr": "Date de saisie",
                "labelEn": "Event date",
                "name": "eventDate",
                "editMode": 3,
                "editorClass": "",
                "fieldClassEdit": "",
                "fieldClassDisplay": "",
                "atBeginingOfLine": true,
                "fieldSize": 6,
                "linkedFieldset": "",
                "linkedFieldTable": "",
                "linkedField": "",
                "defaultValue": "",
                "isDefaultSQL": false,
                "help": "",
                "valuesize": "0;20",
                "format": "dd/mm/yyyy",
                "order": 2,
                "type": "Date"
            },
            "TSai_PK_ID": {
                "id": 0,
                "validators": [],
                "labelFr": "TSai_PK_ID",
                "labelEn": "TSai_PK_ID",
                "name": "TSai_PK_ID",
                "editMode": 5,
                "editorClass": "",
                "fieldClassEdit": "",
                "fieldClassDisplay": "",
                "atBeginingOfLine": true,
                "fieldSize": "6",
                "linkedFieldset": "",
                "linkedFieldTable": "",
                "linkedField": "",
                "defaultValue": "",
                "isDefaultSQL": true,
                "help": "",
                "valuesize": "0;20",
                "order": 3,
                "type": "Text"
            }
        },

        compulsoryInputs: [
            "Individual",
            "Egg",
            "UserReadonly",
            "eventDate",
            "TSai_PK_ID"
        ],

        getStaticInputs: function() {
            var toret = TrackStatics.staticInputs;
            $.each(toret, function(index, value){
                if (!value.id)
                    value.id = 0;
            });
            return toret;
        },

        getCompulsoryInputs: function() {
            return TrackStatics.compulsoryInputs;
        },

        applyRules: function(form, json) {
            var savedSchema = json.schema;
            var toret = json;
            var toadd = [];

            delete toret.schema;

            $.each(savedSchema, function(index, value){
                if (!(value.name.toLowerCase() == "egg" && json.typeIndividus.toLowerCase().indexOf("oeuf") == -1)
                && !(value.name.toLowerCase() == "individual" && json.typeIndividus.toLowerCase().indexOf("oeuf") != -1)
                && !(json.groupe.toLowerCase() == "null" && (value.name.toLowerCase() == "egg" || value.name.toLowerCase() == "individual")))
                {
                    toadd.push(index);
                }
            });

            toret.schema = {};

            $.each(toadd, function(index, value){
                if (index + 1 != savedSchema[value].order)
                    savedSchema[value].order -= 1;
                toret.schema[value] = savedSchema[value];
            });

            return toret;
        },

        initializeStatics: function () {
            return true;
        }
    };

    return TrackStatics;
});