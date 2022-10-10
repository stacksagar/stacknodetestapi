const express = require("express");
const cors = require("cors");
const app = express();
const multer = require("multer");
const pdfUtil = require("pdf-to-text");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const { getMimeType } = require("stream-mime-type");

app.use("", express.static("uploads"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const send_pdf_json = require("./utils/send_pdf_json");

let extracted_images = [];

app.post("/", async function (req, res, next) {
  extracted_images = [];

  const existingPdfBytes = await new Promise((resolve, reject) => {
    fs.readFile(`./uploads/doc.pdf`, (err, result) => {
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

  res.send({ message: "Successfully uploaded!", extracted_images });
});

app.get("/get_extracted_data", (req, res) => {
  res.json({ extracted_images });
});

const PORT = process.env.PORT || 2000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
