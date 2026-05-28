/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d1n1nxh0bzud18p")

  collection.listRule = ""
  collection.viewRule = ""
  collection.createRule = null

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d1n1nxh0bzud18p")

  collection.listRule = null
  collection.viewRule = null
  collection.createRule = ""

  return dao.saveCollection(collection)
})
