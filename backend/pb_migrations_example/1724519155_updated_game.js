/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d1n1nxh0bzud18p")

  // remove
  collection.schema.removeField("4jnfpt0q")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "m98syoa7",
    "name": "map",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "e8eh3bgo3v451ah",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d1n1nxh0bzud18p")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "4jnfpt0q",
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
  }))

  // remove
  collection.schema.removeField("m98syoa7")

  return dao.saveCollection(collection)
})
