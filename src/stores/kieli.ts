import Vue from 'vue';
import VueI18n from 'vue-i18n';
import * as _ from 'lodash';
Vue.use(VueI18n);

import { Store, Getter, Mutation, Action, State } from './store';
import { Kieli } from '@/tyypit';
import { Ulkopuoliset } from '@/api';

export const UiKielet = Object.freeze(_.values(Kieli as object));

export const i18n = new VueI18n({
  fallbackLocale: Kieli.fi,
  locale: Kieli.fi,
  messages: {
    fi: require('@/translations/locale-fi.json'),
    sv: require('@/translations/locale-sv.json'),
  },
});


@Store
class KieliStore {
  @State() private sisaltoKieli: Kieli = Kieli.fi;

  @Getter()
  public getUiKieli() {
    return i18n.locale;
  }

  @Getter()
  public getSisaltoKieli() {
    return this.sisaltoKieli;
  }

  @Mutation()
  public setSisaltoKieli(kieli: Kieli) {
    if (this.sisaltoKieli !== kieli && _.includes(UiKielet, kieli)) {
      this.sisaltoKieli = kieli;
    }
  }

  public async init() {
    _.forEach(await this.fetchLocaleMap(), (locales, lang) => {
      i18n.mergeLocaleMessage(lang, locales);
    });
  }

  private async fetchLocaleMap() {
    try {
      const result: any = {};
      const localeObj = (await Ulkopuoliset.getLokalisoinnit()).data;
      _.forEach(localeObj, (locales, lang) => {
        result[lang] = {};
        for (const locale of locales) {
          if (locale.key && locale.value) {
            result[lang][locale.key] = locale.value;
          }
        }
      });
      return result;
    }
    catch (err) {
      console.error(err);
      return {};
    }
  }
}

export const Kielet = new KieliStore();
