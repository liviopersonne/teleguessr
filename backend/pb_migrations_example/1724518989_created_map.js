/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "e8eh3bgo3v451ah",
    "created": "2024-08-24 17:03:09.725Z",
    "updated": "2024-08-24 17:03:09.725Z",
    "name": "map",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ia05cf70",
        "name": "world",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "uamr5cnnujpaz1q",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
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
  const collection = dao.findCollectionByNameOrId("e8eh3bgo3v451ah");

  return dao.deleteCollection(collection);
})
