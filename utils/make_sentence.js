module.exports = function make_sentence(text, cut1, cut2) {
  const original_word = text
    ?.split(/\n/)
    .join(" ")
    ?.split(" ")
    .join("__")
    .split(cut1)[1]
    ?.split(cut2)[0]
    .split("__");

  let output_text = "";

  // Detect Language
  original_word
    ?.forEach((w) => {
      if (/^[a-zA-Z0-9]+$/.test(w)) {
        // English
        output_text += w + " ";
      } else {
        // Bengali
        if (w.length > 2) {
          output_text += w + " ";
        } else {
          output_text += w;
        }
      }
    })
    ?.trim();

  return output_text?.trim();
};
