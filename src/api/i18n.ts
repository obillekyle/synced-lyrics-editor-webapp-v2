import { CustomEventHandler } from './event';

export class I18N<Langs extends string = 'en'>
  extends CustomEventHandler<"ready" | "update" | "error", [Langs | String]> {

  private _translations: { [key: string]: string } = {};
  public ready = false;
  public lang: string = 'en';

  constructor(lang: Langs | String) {
    super();
    this.set(lang, true);
  }


  set(lang: Langs, init?: boolean): void;
  set(lang: String, init?: boolean): void;
  set(lang: string, init = false) {
    this.lang = lang;
    fetch(`./i18n/${this.lang}.json`).then((response) => {
      if (!response.ok) {
        if (lang == 'en') {
          throw new Error(response.statusText)
        } else {
          return this.set('en', init);
        }
      };
      response.json().then((data) => {
        this.ready = true
        this._translations = data?.strings || {};
        this.dispatchEvent("update", [lang]);
        init && this.dispatchEvent("ready", [lang]);
      })
    }).catch((err) => {
      this.dispatchEvent("error", [err]);
    })
  }

  get(key: string, ...args: any[]) {

    const translation = this._translations[key];
    if (translation) {
      return translation.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
      })
    }
    return key
  }
}
