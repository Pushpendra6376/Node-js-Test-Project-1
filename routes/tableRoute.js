const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/tableController");

router.get("/list", ctrl.listTables);  //tables ki list 
router.post("/create", ctrl.createTable); // table ka creation
router.get("/:table/details", ctrl.tableDetails); //tables ki details like kya kya columns hai 
router.post("/:table/insert", ctrl.insertRecord);  // adding data into the table
router.delete("/:table/:id", ctrl.deleteRecord);  //data ko delete krne ke liye

module.exports = router;
