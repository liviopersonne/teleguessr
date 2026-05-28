/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("px8nx5rnmcr87re")

  // remove
  collection.schema.removeField("eatg4zx5")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("px8nx5rnmcr87re")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "eatg4zx5",
    "name": "links",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "h2j7rqk2pal7vyv",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
})
