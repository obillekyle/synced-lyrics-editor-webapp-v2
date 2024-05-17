const langCodes: Record<string, string> = {
  ph: 'tl',
}

export async function getTranslatedText(text: string, lang: string = 'en') {

  lang = langCodes[lang] || lang


  try {

    const data = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${text}`)
    const json = await data.json()
    return json[0][0][0]

  } catch {
    console.error('Failed to get translation for "' + text + '" in "' + lang + '" language')
  }

  return text

}