/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "h2j7rqk2pal7vyv",
    "created": "2024-08-23 20:55:23.427Z",
    "updated": "2024-08-23 20:55:23.427Z",
    "name": "link",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "cakcd7pk",
        "name": "heading",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "80xdcrzz",
        "name": "field",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "px8nx5rnmcr87re",
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
  const collection = dao.findCollectionByNameOrId("h2j7rqk2pal7vyv");

  return dao.deleteCollection(collection);
})
