# Back end connection

Currently the Formbuilder can works only on the client-side but some functionnalities like save a form on a database require a back end.
We developped a back end for the formbuilder.

See [back end repo](https://github.com/NaturalSolutions/NS.Server.FormBuilder)

## URL

To connect fron and back end you have to specify these URL.

### autocompleteURL

URL for autocomplete ressources

**default value** : ressources/autocomplete/

### translationURL

i18n traduction URL

**default value ** : ressources/locales/

### keywordAutocomplete

Form keywords list URL

**default value** : ressources/autocomplete/keywords.json

### protocolAutocomplete

Form list autocomplete URL

**default value** : ressources/autocomplete/protocols.json

### unitURL

Unity list url provider

**default value** : ressources/autocomplete/units.json

### preConfiguredField

pre-configurated provider URL.

A configurated field is a field saved by use for a future use.

For example user create a firstName field because it will be present in many forms.

**default value** : ressources/fieldConfiguration/preConfiguredField.json

### fieldConfigurationURL

Wich to send pre-configurated field. Send a POST request so in client side mode (without back end connection) it won't work.

**default value** : configurationSaved

### linkedFields

Return all linked fields

**default value** : ressources/linkedFields/linkedFields.json

back to [summary](index.md)
