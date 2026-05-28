/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d1n1nxh0bzud18p")

  collection.updateRule = "@request.auth.id = \"hcothlf28rs4bjt\""

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d1n1nxh0bzud18p")

  collection.updateRule = null

  return dao.saveCollection(collection)
})
