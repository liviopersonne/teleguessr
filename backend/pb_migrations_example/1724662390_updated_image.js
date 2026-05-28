/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("8k2giuryx9yaqq7")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qp8zhatm",
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
  const collection = dao.findCollectionByNameOrId("8k2giuryx9yaqq7")

  // remove
  collection.schema.removeField("qp8zhatm")

  return dao.saveCollection(collection)
})
