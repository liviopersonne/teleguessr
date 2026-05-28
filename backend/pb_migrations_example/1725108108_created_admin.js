/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "970goykfh7n1f3e",
    "created": "2024-08-31 12:41:48.280Z",
    "updated": "2024-08-31 12:41:48.280Z",
    "name": "admin",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "gkagkt76",
        "name": "users",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": null,
          "displayFields": null
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("970goykfh7n1f3e");

  return dao.deleteCollection(collection);
})
