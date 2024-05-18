import { CustomEventHandler } from './event';

type I18NEvents<Lang extends string> = {
  ready: [lang: Lang | String];
  update: [lang: Lang | String];
  error: [err: Error];
};

export class I18N<Langs extends string = 'en'> extends CustomEventHandler<
  I18NEvents<Langs>
> {
  public ready = false;
  private _lang: string = 'en';
  private _translations: { [key: string]: string } = {};

  constructor(lang: Langs | String = 'en') {
    super();
    this.set(lang, true);
  }

  get lang() {
    return this._lang;
  }

  set(lang: Langs, init?: boolean): void;
  set(lang: String, init?: boolean): void;
  set(lang: string, init = false) {
    fetch(`./i18n/${lang}.json`)
      .then((response) => {
        if (!response.ok) {
          throw lang == 'en'
            ? new Error('Internal server error')
            : new Error('Language json not found');
        }

        response.json().then((data) => {
          if (!data.language) {
            throw new Error('Invalid lang json');
          }

          this.ready = true;
          this._lang = lang;
          this._translations = data?.strings || {};
          this.dispatchEvent('update', [lang]);
          init && this.dispatchEvent('ready', [lang]);
        });
      })
      .catch((err) => {
        this.dispatchEvent('error', [err]);
      });
  }

  get(key: string, ...args: any[]) {
    const translation = this._translations[key];
    if (translation) {
      return translation.replace(/{(\d+)}/g, (match, number) => {
        return typeof args[number] != 'undefined' ? args[number] : match;
      });
    }
    return key;
  }
}
