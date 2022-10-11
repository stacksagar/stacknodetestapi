const express = require("express");
const cors = require("cors");
const app = express();
const multer = require("multer");
const pdfUtil = require("pdf-to-text");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const { getMimeType } = require("stream-mime-type");

let pdf_file_name = "";

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads");
  },
  filename: function (req, file, callback) {
    const new_name = Math.random().toString().slice(2);
    pdf_file_name = new_name;
    callback(null, `${pdf_file_name}.pdf`);
  },
});

const upload = multer({ storage: storage }).single("pdfdoc");

app.use("", express.static("uploads"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const send_pdf_json = require("./utils/send_pdf_json");

let extracted_json_data;
let extracted_images = [];

app.post("/", function (req, res, next) {
  extracted_images = [];
  extracted_json_data = null;

  upload(req, res, function (err1) {
    return pdfUtil.pdfToText(
      `./uploads/${pdf_file_name}.pdf`,
      async (err2, data) => {
        const existingPdfBytes = await new Promise((resolve, reject) => {
          fs.readFile(`./uploads/${pdf_file_name}.pdf`, (err, result) => {
            if (err) {
              reject(err);
            }
            if (!err) {
              resolve(result);
            }
          });
        });

        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const result = [];

        pages[0].doc.context.indirectObjects.forEach((el) => {
          if (el.hasOwnProperty("contents")) result.push(el.contents);
        });

        const mime = await Promise.all(
          result.map(async (el) => {
            return new Promise(async (resolve) => {
              const res = await getMimeType(el);
              if (res) {
                resolve(res);
              }
            });
          })
        );

        Promise.all(
          mime.map(async (el, i) => {
            if (el.mime === "image/jpeg") {
              return new Promise(async (resolve) => {
                const resp = await result[i];
                const fileContents = new Buffer.from(resp, "base64");
                const file_name = `${Math.random().toString().slice(2)}.jpg`;
                extracted_images.push(`http://localhost:2000/${file_name}`);
                fs.writeFile(`uploads/${file_name}`, fileContents, (err) => {});
              });
            }
          })
        );

        extracted_json_data = send_pdf_json(data);
        res.send("Successfully uploaded!");
      }
    );
  });
});

app.get("/get_extracted_data", (req, res) => {
  res.json({ ...extracted_json_data, extracted_images });
});

app.get("/test", (req, res) => {
  res.json({ message: "ok!" });
});

const PORT = process.env.PORT || 2000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
