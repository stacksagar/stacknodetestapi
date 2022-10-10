const make_sentence = require("./make_sentence");

module.exports = function send_pdf_json(pdf_raw_text_data, metadata) {
  const full_text = pdf_raw_text_data
    ?.split(/\r|\n/)
    .join("")
    .split(" ")
    .filter((word) => word)
    .join("__");

  return {
    ...metadata,
    nid_no: make_sentence(full_text, "National__ID__", "Pin__"),
    nid_pin: make_sentence(full_text, "Pin__", "Status__printed"),
    name_bn: make_sentence(full_text, "Name(Bangla)__", "Name(English)__"),
    name_en: make_sentence(full_text, "Name(English)__", "Date__of__Birth__"),
    date_of_birth: make_sentence(
      full_text,
      "Date__of__Birth__",
      "Birth__Place__"
    ),
    birth_place: make_sentence(full_text, "Birth__Place__", "Birth__Other"),
    father_name: make_sentence(
      full_text,
      "Birth__Registration__",
      "__Voter__Documents"
    ),
    mother_name: make_sentence(full_text, "DocumentsNo__", "Father__Name__"),
  };
};
