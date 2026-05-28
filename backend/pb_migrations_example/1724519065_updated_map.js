/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e8eh3bgo3v451ah")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "8dgkiras",
    "name": "durationSecondes",
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

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "er59flrq",
    "name": "options",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 2,
      "values": [
        "noLook",
        "noMove",
        "noPlane"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e8eh3bgo3v451ah")

  // remove
  collection.schema.removeField("8dgkiras")

  // remove
  collection.schema.removeField("er59flrq")

  return dao.saveCollection(collection)
})
