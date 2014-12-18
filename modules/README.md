# Modules
This folder contains modules that are custom built for this project. Your modules should be named with the following pattern: `projectname_modulename`.

Custom modules are features should not be placed in this directory, but should instead live in `modules/features/projectname_feature_featurename/` directories.

To enable a module in this project, add the feature folder to this directory, and add the feature to the modules array in `site.settings.php`:

```
conf['master_modules'] = array(                                                   
  'base' => array(                                                                 
                                                                                   
    // Core modules...                                                                                                                               
                                                                                   
    // Contrib modules...                                                        
                                                                     
    // Custom modules... 
    'projetname_modulename'                                                           
                                                                                   
    // Feature modules...                                                         
                                                                                   
  ),
  ```
  
## NOTE:
Do not place contrib modules in this directory. Those should be added to the modules array in `site.settings.php`, just as custom modules, but under the `// Contrib Modules.` section.