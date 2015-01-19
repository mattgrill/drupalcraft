#Deployments
This folder contains subfolders that hold deployment options for your Drupal application. For instance, the defaul `server_app` folder holds a deployment tool that allows you to build a local Vagrant-controled VM that runs a build (output folder of `gulp build`) of application.

Each deployment folder should contain a js file that holds a gulp task that executes the deployment when given the context of a build.