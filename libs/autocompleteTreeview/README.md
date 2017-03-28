NS.UI.autocompTree
==================

## Autocomplete Treeview plugin

Permet l'affichage d'un arbre à autocomplétion.

Il se remplit via un webservice.

$(#id).autocompTree(); pour l'initialisation par defaut.
Les options possibles sont :
```
{
    //Les webservices doivent renvoyer une chaine au format JSON contenant au moins ces information:
    /*
    *   treeElt {
    *       title : string
    *       key : int
    *       lazy : false //L'autocomplete n'étant pas du tout efficace en lazy loading
    *       //Enfin toues les information qui seront utile a son utilisation
    *       //Notamment la valeur a afficher (et ou stocké si isDisplayDifferent = false)
    *       //Eventuellement la valeur à stocké (si isDisplayDifferent = true)
    *   }
    */
    //URL des webservices
    wsUrl: '',
    //Webservices pour un affichage en arborescence
    webservices: 'initTreeByIdWLanguageWithoutDeprecated',
    //si l'affichage est différent de la valeur renvoyée
    display: {
        isDisplayDifferent: true,
        //Stocke la valeur dans un input hidden d'id = _self.attr("id") + suffixeId
        suffixeId: '_value',
        //Nom des paramètres a récupéré dans les noeuds de l'arbre (renvoyer par le webservice, le nom doit correspondre)
        //Si isDisplayDifferent = false -> la valeur sera displayValueName
        //Affichage
        displayValueName: '',
        //Valeur cachée
        storedValueName: ''
    },
    //Si l'arbre utilise un langage différent
    language: {
        hasLanguage: false,
        //Préféré un majuscule en première lettre
        lng: "En"
    },
    //Si l'arbre possède déjà une valeur
    inputValue: '',
    //idServant à l'initialisation de l'arbre
    //TODO service de paramètrage dynamique ou tous les paramètres ainsi que leur valeur sont généré a la volée
    startId: '',
    //Fonction appelé a chaque fin d'éxécution
    callback: '',
    //Fonction s'éxecutant après un clique
    onItemClick: '',
    //Fonction s'éxécutant après le focus sur l'input
    onInputFocus: '',
    //Fonction s'éxécutant après la perte de focus de l'input et de l'arbre
    onInputBlur: '',
    //Fonction s'éxécutant après l'initialisation de l'objet autocompTree
    onInputInitialize: '',
    //Enregistrement de l'item en elle même
    thisItem : $(this)
}
```