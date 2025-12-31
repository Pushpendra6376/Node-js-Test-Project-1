const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-collection");
const { QueryTypes } = require("sequelize");

/* List tables */
exports.listTables = async (req, res) => {
  const rows = await sequelize.query("SHOW TABLES", { type: QueryTypes.SHOWTABLES });
  res.json(rows);
};

/* Create table */
exports.createTable = async (req, res) => {
  try {
    const { tableName, fields } = req.body;

    if (!tableName || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ message: "Table name or fields missing" });
    }

    const schema = {};

    fields.forEach(field => {
      let type;

      switch (field.type.toUpperCase()) {
        case "INTEGER":
          type = DataTypes.INTEGER;
          break;
        case "STRING":
          type = DataTypes.STRING;
          break;
        case "BOOLEAN":
          type = DataTypes.BOOLEAN;
          break;
        case "JSON":
          type = DataTypes.JSON;
          break;
        case "DOUBLE":
          type = DataTypes.DOUBLE;
          break;
        default:
          type = DataTypes.STRING;
      }

      schema[field.name] = {
        type: type,
        allowNull: true
      };
    });

    const Table = sequelize.define(tableName, schema, {
      freezeTableName: true,
      timestamps: true
    });

    await Table.sync();
    res.json({ message: `${tableName} table is successfully created` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Table cannot be created" });
  }
};

/* Fetch columns & data */
exports.tableDetails = async (req, res) => {
  const table = req.params.table;

  const columns = await sequelize.query(`SHOW COLUMNS FROM ${table}`, {
    type: QueryTypes.SELECT
  });

  const rows = await sequelize.query(`SELECT * FROM ${table}`, {
    type: QueryTypes.SELECT
  });

  res.json({
    columns: columns.map(c => c.Field),
    rows
  });
};

/* Insert */
exports.insertRecord = async (req, res) => {
  try {
    console.log("Received payload:", req.body);
    console.log("Received table param:", req.params.table);

    const tableName = req.params.table;  

    const payload = { ...req.body }; // clone incoming body

    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).json({ message: "No data provided" });
    }

    const Table = sequelize.models[tableName];
    if (!Table) {
      return res.status(404).json({ message: `Table '${tableName}' not found` });
    }

    // auto fields remove
    delete payload.id;
    delete payload.createdAt;
    delete payload.updatedAt;

    const record = await Table.create(payload);
    res.json({ message: "Record inserted successfully", record });

  } catch (err) {
    console.log("Insert Error:", err);
    res.status(500).json({ message: "Record insert failed", error: err.message });
  }
};

/* Delete */
exports.deleteRecord = async (req, res) => {
  const { table, id } = req.params;
  await sequelize.query(`DELETE FROM ${table} WHERE id = ?`, { replacements: [id] });
  res.json({ message: "Deleted" });
};