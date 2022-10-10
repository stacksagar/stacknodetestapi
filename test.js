const express = require("express");
const multer = require("multer");
const app = express();
const cors = require("cors");

app.use("", express.static("./uploads"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let uploaded_file_name;
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads");
  },

  filename: function (req, file, callback) {
    const new_name = Math.floor(Math.random() * 999999);
    uploaded_file_name = new_name + "-" + file.originalname;
    callback(null, uploaded_file_name);
  },
});

const upload = multer({ storage: storage }).single("file");

app.post("/", function (req, res, next) {
  upload(req, res, function (err1) {
    // pdfUtil.pdfToText(`./uploads/${pdf_file_name}.pdf`, async (err2, data) => {
    res.json({
      message: "server is running!",
      uploaded_file_name: `http://localhost:1000/` + uploaded_file_name,
    });
    // });
  });
});

const PORT = process.env.PORT || 1000;
app.listen(PORT);
