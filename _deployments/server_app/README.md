# Server App

Some basic notes.

Create an `app.config.json` file and place it in the same directory as `app.js`. Add your MySQL configuration. This user should have the appropriate permissions to create users and databases.

```json
{
  "database" : {
    "host" : "myhost",
    "user" : "myusername",
    "password" : "mypassword"
  }
}
```
