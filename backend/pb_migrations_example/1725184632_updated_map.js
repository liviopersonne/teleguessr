/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e8eh3bgo3v451ah")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ic1cw6hj",
    "name": "places",
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
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e8eh3bgo3v451ah")

  // remove
  collection.schema.removeField("ic1cw6hj")

  return dao.saveCollection(collection)
})
