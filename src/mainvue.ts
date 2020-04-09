import Vue from 'vue';
import Loading from 'vue-loading-overlay';
import Notifications from 'vue-notification';

import '@/config/bootstrap';
import '@/config/fontawesome';

import { router } from '@/router';
import { Kielet } from '@shared/stores/kieli';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import Kaannos from '@shared/plugins/kaannos';
import VueI18n, { IVueI18n } from 'vue-i18n';
import VueCompositionApi from '@vue/composition-api';

import App from '@/App.vue';
import aikaleima from '@shared/plugins/aikaleima';

Vue.use(VueI18n);
Vue.use(VueCompositionApi);
Vue.use(Notifications);
Vue.use(Kaannos);
Vue.use(aikaleima);
Vue.directive('oikeustarkastelu', oikeustarkastelu);

Vue.use(Loading, {
  fullPage: true,
  color: '#159ecb',
  loader: 'dots',
});
Vue.use(Kielet, {
  messages: {
    fi: require('@/translations/locale-fi.json'),
    sv: require('@/translations/locale-sv.json'),
  },
});

export async function getRootConfig() {
  return {
    i18n: Kielet.i18n,
    router,
    render: (h: any) => h(App),
  };
}
