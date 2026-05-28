/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e8eh3bgo3v451ah")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "er59flrq",
    "name": "type",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "normal",
        "nomove",
        "nmpz"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e8eh3bgo3v451ah")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "er59flrq",
    "name": "options",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "normal",
        "nomove",
        "nmpz"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
