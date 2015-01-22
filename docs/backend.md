# Back end connection

Currently the Formbuilder can works only on the client-side but some functionnalities like save a form on a database require a back end.
We developped a back end for the formbuilder.

See [back end repo](https://github.com/NaturalSolutions/NS.Server.FormBuilder)

## URL

To connect fron and back end you have to specify these URL.
We used JSON file for client side mode so some

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

pre-configurated provider URL

**default value** : ressources/fieldConfiguration/preConfiguredField.json

### fieldConfigurationURL

wich to send pre-configurated field

**default value** : configurationSaved

### el

HTML parent element for formbuilder application

**default value** : #formbuilder

back to [summary](index.md)
