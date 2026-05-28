/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3r9bocgpw9v59w8")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "lagufr1x",
    "name": "rotateDeg",
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
  const collection = dao.findCollectionByNameOrId("3r9bocgpw9v59w8")

  // remove
  collection.schema.removeField("lagufr1x")

  return dao.saveCollection(collection)
})
