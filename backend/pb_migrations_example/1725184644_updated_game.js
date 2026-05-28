/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d1n1nxh0bzud18p")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "41u7qvqi",
    "name": "round",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d1n1nxh0bzud18p")

  // remove
  collection.schema.removeField("41u7qvqi")

  return dao.saveCollection(collection)
})
