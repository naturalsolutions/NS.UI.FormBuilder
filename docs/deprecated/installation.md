# Get the formbuilder rocks

First you need to clone our repo (we'll publish on bower shortly):

    git clone https://github.com/NaturalSolutions/NS.UI.FormBuilder.git

Install npm developpement tools

    (sudo) npm install

Now you've to install library dependancies with bower

    bower install

And to finish you can clean library folder with bower_clean task

    grunt bower_clean


## Compile style file

Toget production style file run this grunt tash

    grunt less

## Compile JavaScript file

If you want to compile JavaScript file you can use RequireJS optimizer like this

    rjs -o build/build.js


back to [summary](index.md)
