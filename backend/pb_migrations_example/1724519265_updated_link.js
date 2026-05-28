/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("h2j7rqk2pal7vyv")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "hutk0bzj",
    "name": "name",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("h2j7rqk2pal7vyv")

  // remove
  collection.schema.removeField("hutk0bzj")

  return dao.saveCollection(collection)
})
