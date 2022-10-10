const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const { getMimeType } = require("stream-mime-type");
const path = require("path");

module.exports = async function extract_images_from_pdf(pdf_path) {
  const extract_images = [];

  const existingPdfBytes = await new Promise((resolve, reject) => {
    fs.readFile(pdf_path, (err, result) => {
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

  await Promise.all(
    mime.map(async (el, i) => {
      if (el.mime === "image/jpeg") {
        return new Promise(async (resolve) => {
          const resp = await result[i];
          const fileContents = new Buffer.from(resp, "base64");
          const file_name = `${Math.random()}.jpg`;
          extract_images.push(file_name);
          fs.writeFile(`uploads/${file_name}`, fileContents, (err) => {});
        });
      }
    })
  );

  return await "extract_images";
};
