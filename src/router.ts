import Vue from 'vue';
import Router from 'vue-router';
import * as _ from 'lodash';

import Root from '@/routes/Root.vue';
import Home from '@/routes/home/RouteHome.vue';
import NotFound from '@/routes/NotFound.vue';
import VirheRoute from '@/routes/virhe/VirheRoute.vue';
import Debug from '@/routes/debug/component.vue';
import HallintaRoute from '@/routes/hallinta/HallintaRoute.vue';

import RouteOpetussuunnitelma from '@/routes/opetussuunnitelmat/RouteOpetussuunnitelma.vue';
import RoutePohjaUusi from '@/routes/opetussuunnitelmat/RoutePohjaUusi.vue';
import RouteTiedot from '@/routes/opetussuunnitelmat/tiedot/RouteTiedot.vue';
import RouteSisalto from '@/routes/opetussuunnitelmat/sisalto/RouteSisalto.vue';

import EditointiDebug from '@/routes/debug/editointi/editointi.vue';

import { Virheet } from '@/stores/virheet';
import { Kielet, UiKielet } from '@/stores/kieli';
import { Kieli, SovellusVirhe } from '@/tyypit';

Vue.use(Router);

import { createLogger } from '@/stores/logger';
const logger = createLogger('Router');

export const router = new Router({
  routes: [{
    path: '/',
    redirect: (to) => '/fi',
  }, {
    path: '/:lang',
    component: Root,
    children: [{
      path: '',
      name: 'root',
      component: Home,
    }, {
      path: 'admin',
      name: 'admin',
      component: HallintaRoute,
    }, {
      path: 'virhe',
      name: 'virhe',
      component: VirheRoute,
    }, {
      path: 'uusi/pohja',
      name: 'uusiPohja',
      component: RoutePohjaUusi,
    }, {
      path: 'uusi/ops',
      name: 'uusiPohja',
      component: RoutePohjaUusi,
    }, {
      path: 'opetussuunnitelmat/:id',
      name: 'opetussuunnitelma',
      component: RouteOpetussuunnitelma,
      children: [{
        path: 'tiedot',
        component: RouteTiedot,
        name: 'opsTiedot',
      }],
    }, {
      path: 'debug',
      name: 'debug',
      component: Debug,
      children: [{
        path: 'editointi',
        name: 'editointiDebug',
        component: EditointiDebug,
      }],
    }],
  }, {
    path: '*',
    redirect: (to) => {
      return {
        name: 'virhe',
        params: to.params,
        query: {
          // virhe: JSON.stringify({}),
        },
      };
    },
  }],
});

Virheet.onError((virhe: SovellusVirhe) => {
  logger.error('Route error', virhe);
  router.push({
    name: 'virhe',
    query: {
      // virhe: JSON.stringify(virhe),
    },
  });
});


router.beforeEach((to, from, next) => {
  if (to.params.lang
    && to.params.lang !== from.params.lang
    && _.includes(UiKielet, to.params.lang)) {
    Kielet.setUiKieli(to.params.lang as Kieli);
  }
  logger.debug(`Route change ${from.name} -> ${to.name}`, from, to);
  next();
  // else {
  //   router.push({
  //     ...to,
  //     params: {
  //       ...to.params,
  //       lang: i18n.fallbackLocale || 'fi',
  //     },
  //   });
  // }
});
