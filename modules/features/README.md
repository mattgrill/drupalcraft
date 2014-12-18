# Features
This folder contains feature modules that are custom built for this project. Your features should be named with the following pattern: `projectname_feature_featurename`.

Custom modules that are not features should not be placed in this directory, but should instead live in `modules/projectname_modulename/` directories.

To enable a feature in this project, add the feature folder to this directory, and add the feature to the modules array in `site.settings.php`:

```
conf['master_modules'] = array(                                                   
  'base' => array(                                                                 
                                                                                   
    // Core modules...                                                                                                                               
                                                                                   
    // Contrib modules...                                                        
                                                                     
    // Custom modules...                                                          
                                                                                   
    // Feature modules...
    'projetname_feature_featurename'                                                           
                                                                                   
  ),
  ```