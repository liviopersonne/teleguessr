/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "8k2giuryx9yaqq7",
    "created": "2024-08-26 08:52:38.110Z",
    "updated": "2024-08-26 08:52:38.110Z",
    "name": "image",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "65xu9ede",
        "name": "image",
        "type": "file",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "mimeTypes": [],
          "thumbs": [],
          "maxSelect": 1,
          "maxSize": 5242880,
          "protected": false
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
  const collection = dao.findCollectionByNameOrId("8k2giuryx9yaqq7");

  return dao.deleteCollection(collection);
})
