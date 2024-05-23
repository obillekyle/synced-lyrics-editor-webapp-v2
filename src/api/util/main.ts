const langCodes: Record<string, string> = {
  ph: 'tl',
};

const translationStore: Record<string, Record<string, undefined>> = {};

export async function getTranslatedText(text: string, lang: string = 'en') {
  lang = langCodes[lang] || lang;

  if (!translationStore[lang]) translationStore[lang] = {};
  if (translationStore[lang] && translationStore[lang][text]) {
    return translationStore[lang][text];
  }

  try {
    const data = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${text}`
    );
    const json = await data.json();
    translationStore[lang][text] = json[0][0][0];
    return json[0][0][0];
  } catch {
    console.error(
      'Failed to get translation for "' + text + '" in "' + lang + '" language'
    );
  }

  return text;
}
