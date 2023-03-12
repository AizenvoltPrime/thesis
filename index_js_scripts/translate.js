let translator = new Translator({
  defaultLanguage: "en",
});

fetch("./site_languages/greek.json")
  .then((response) => response.json())
  .then((data) => {
    translator.add("el", data);
  });

fetch("./site_languages/english.json")
  .then((response) => response.json())
  .then((data) => {
    translator.add("en", data);
  });

export { translator };
