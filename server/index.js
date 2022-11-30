const express = require("express");
const body_parse = require("body-parser");
const mongoose = require("mongoose");
const { eduDocs } = require("./model");
const multer = require("multer");
var path = require("path");
var fs = require("fs");
var textract = require("textract");
const cors = require("cors");
const { ObjectId } = require("mongodb");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(req.headers);

    cb(null, "../Server/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname.replace(/ /g, ""));
  },
});
const upload = multer({ storage: storage });
const app = express();
app.use(body_parse.json());
app.use(cors());

mongoose
  .connect("mongodb://localhost:27017/searchEdu")
  .then((result) => {
    console.log("Success connected");
    // console.log(result);
  })
  .catch((err) => {
    console.log("Error in connecting");
    // console.log(err);
  });

app.get("/getData", function (req, res) {
  eduDocs
    .find({})
    .then((result) => {
      res.send(result);
    })
    .catch((err) => [res.send(err)]);
});

app.listen(3000, function () {
  console.log("I am running on 3000");
});

app.post("/postData", function (req, res) {
  textract.fromFileWithPath(req.body.fileUrl, function (error, text) {
    const docRef = new eduDocs({
      docName: req.body.docName,
      docType: req.body.doctype,
      docUrl: req.body.fileUrl,
      docContent: text,
    });

    docRef
      .save()
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.send(err);
      });
  });
});

app.put("/putData", function (req, res) {
  console.log(req.body);
  var change = req.body;
  change.message = "hello updated";
  res.send(change);
});

app.delete("/deleteData", function (req, res) {
  console.log(req.body);
  var change = req.body;
  change.message = "hello deleted";
  res.send(change);
});

var download = function (url, dest, cb) {};

app.get("/", function (req, res) {
  if (req.query.url != undefined) {
    console.log(req.body);
    let localpath = req.query.url.toString();
    console.log(localpath);
    res.writeHead(200, "image/jpeg");
    require("fs").createReadStream(localpath).pipe(res);
  } else if (req.query.recurl != undefined) {
    console.log(req.body);
    let localpath = req.query.recurl.toString();
    console.log(localpath);
    res.writeHead(200, "image/mpeg");
    require("fs").createReadStream(localpath).pipe(res);
  } else if (req.query.download != undefined) {
    console.log(req.query.download);
    eduDocs
      .find({ _id: mongoose.Types.ObjectId(req.query.download) })
      .then((result) => {
        console.log(result);
        res.download(result[0].docUrl);
      })
      .catch((err) => res.send(err));
    // Set disposition and send it.
  }

  // res.send(mainenum.getValue('SeasonCode'));
});

app.post("/fileUpload", upload.array("myFile", 12), function (req, res, next) {
  console.log(req.files);
  if (req.files.length > 0) {
    var arrayfiles = [];
    req.files.forEach(function (file) {
      console.log("Uploading file...");
      let url;
      url = path.resolve("uploads", file.filename);
      url = url.replace(/\\/g, "/");
      // url = url.replace(/(\s+)/g, "\\$1");
      arrayfiles.push({ url: url });
    });
    res.send(arrayfiles);

    // res.send({
    //     requestcommand:"uploadCsv",
    //      argsList:[{
    //         name:"status",
    //         value:true,
    //         type:uploaded
    //     }]
    // })

    // var uploadStatus = 'File Uploaded Successfully';
  } else {
    console.log("No File Uploaded");
    // var filename = 'FILE NOT UPLOADED';
    // var uploadStatus = 'File Upload Failed';
  }
});
