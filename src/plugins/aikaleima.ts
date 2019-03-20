import Vue from 'vue';
import moment from 'moment';

export class Aikaleima {
  public install(vue: typeof Vue) {
    function aikaleimaFnFactory(this: void, format: string) {
      return function(this: void, value: number) {
        // tslint:disable-next-line
        (this as any).$i18n.locale;
        return moment(value).format(format);
      };
    }

    // Long datetime
    vue.prototype.$ldt = aikaleimaFnFactory('LLL');

    // Long date
    vue.prototype.$ld = aikaleimaFnFactory('LL');

    // Long time
    vue.prototype.$lt = aikaleimaFnFactory('H:mm:ss');

    // Short datetime
    vue.prototype.$sdt = aikaleimaFnFactory('D.M.YYYY H:mm');

    // Short date
    vue.prototype.$sd = aikaleimaFnFactory('D.M.YYYY');

    // Short time
    vue.prototype.$st = aikaleimaFnFactory('H:mm');

    // Time until or ago an event counting from now
    vue.prototype.$ago = function(value: number) {
      // tslint:disable-next-line
      this.$i18n.locale;
      return moment(value).fromNow();
    };

    // Custom datetime
    vue.prototype.$cdt = function(value: number, format: string) {
      // Pakko olla, jotta localen vaihtuessa komponentti päivittyy
      // tslint:disable-next-line
      this.$i18n.locale;
      return moment(value).format(format);
    };
  }
}

export default new Aikaleima();
