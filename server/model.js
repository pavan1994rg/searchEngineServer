const mongoose = require("mongoose");

const eduSchema = new mongoose.Schema({
  docName: String,
  docType: String,
  docUrl: String,
  docContent: String,
});

const eduDocs = mongoose.model("eduDocs", eduSchema);

exports.eduDocs = eduDocs;
