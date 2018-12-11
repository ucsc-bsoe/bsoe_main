# How to use gulp with this project

1. Install node.js if you haven't already
https://nodejs.org/en/download/

2. Install gulp globally (optional - we will install gulp as part
the npm install - but it's nice to have global)``sudo npm install --global gulp``

3. Run `` npm install `` to install all the needed packages

4. From the theme directory (same one as this file) type ``gulp``

NOTE: Leave normalize.scss and variables.scss in the main components 
folder, so they are added first.

Gulp will watch any file with the ending .css or .js and add them
to a minified file that the theme uses.