import Vue from 'vue';
import Router from 'vue-router';
import { RouteConfig } from 'vue-router';
import _ from 'lodash';

import Root from '@/routes/Root.vue';
import Home from '@/routes/home/RouteHome.vue';
import VirheRoute from '@/routes/virhe/VirheRoute.vue';
import HallintaRoute from '@/routes/hallinta/HallintaRoute.vue';

import RouteDokumentti from '@/routes/opetussuunnitelmat/dokumentti/RouteDokumentti.vue';
import RouteKasite from '@/routes/opetussuunnitelmat/kasite/RouteKasite.vue';
import RouteKommentit from '@/routes/kommentit/RouteKommentit.vue';
import RouteModuuli from '@/routes/opetussuunnitelmat/sisalto/oppiaineet/RouteModuuli.vue';
import RouteOpetussuunnitelma from '@/routes/opetussuunnitelmat/RouteOpetussuunnitelma.vue';
import RouteOpetussuunnitelmaListaus from '@/routes/opetussuunnitelmat/RouteOpetussuunnitelmaListaus.vue';
import RouteOpetussuunnitelmaUusi from '@/routes/opetussuunnitelmat/RouteOpetussuunnitelmaUusi.vue';
import RouteOpintojakso from '@/routes/opetussuunnitelmat/sisalto/oppiaineet/opintojaksot/RouteOpintojakso.vue';
import RouteOppiaine from '@/routes/opetussuunnitelmat/sisalto/oppiaineet/RouteOppiaine.vue';
import RouteOppiaineet from '@/routes/opetussuunnitelmat/sisalto/oppiaineet/RouteOppiaineet.vue';
import RoutePaikallinenOppiaine from '@/routes/opetussuunnitelmat/sisalto/oppiaineet/RoutePaikallinenOppiaine.vue';
import RouteOrganisaatio from '@/routes/organisaatio/RouteOrganisaatio.vue';
import RoutePohjaUusi from '@/routes/opetussuunnitelmat/RoutePohjaUusi.vue';
import RoutePoistetut from '@/routes/opetussuunnitelmat/RoutePoistetut.vue';
import RouteTekstikappale from '@/routes/opetussuunnitelmat/sisalto/tekstikappale/RouteTekstikappale.vue';
import RouteTiedot from '@/routes/opetussuunnitelmat/tiedot/RouteTiedot.vue';
import RouteJarjestys from '@/routes/opetussuunnitelmat/RouteJarjestys.vue';
import RouteJulkaisu from '@/routes/opetussuunnitelmat/RouteJulkaisu.vue';
import RouteTiedotteet from '@/routes/tiedotteet/RouteTiedotteet.vue';
import RouteUkk from '@/routes/ukk/RouteUkk.vue';

import { Virheet } from '@/stores/virheet';
import { EditointiKontrolli } from '@/stores/editointi';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import { Kieli, SovellusVirhe } from '@/tyypit';
import { getOpetussuunnitelmaService, OpetussuunnitelmaStore, Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import { info } from '@/utils/notifications';
import { changeLang, resolveRouterMetaProps } from '@shared/utils/router';

import { createLogger } from '@/stores/logger';
import { tutoriaalistore } from './stores/tutoriaaliStore';
import { VueTutorial } from './directives/tutoriaali';

Vue.use(Router);
const logger = createLogger('Router');

Vue.use(VueTutorial, {tutoriaalistore});

export const router = new Router({
  scrollBehavior: () => ({ x: 0, y: 0 }),
  routes: [{
    path: '/',
    redirect: () => '/fi',
  }, {
    path: '/:lang',
    component: Root,
    meta: {
      resolve: {
        async props(route) {
          return {
            default: {
              tutoriaalistore: tutoriaalistore,
            },
          };
        },
      },
    },
    children: [{
      path: '',
      name: 'root',
      component: Home,
    }, {
      path: 'kommentit',
      name: 'kommentit',
      component: RouteKommentit,
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
      path: 'uusi/opetussuunnitelma',
      name: 'uusiOpetussuunnitelma',
      component: RouteOpetussuunnitelmaUusi,
    }, {
      path: 'tiedotteet',
      name: 'tiedotteet',
      component: RouteTiedotteet,
    }, {
      path: 'organisaatio',
      name: 'organisaatio',
      component: RouteOrganisaatio,
    }, {
      path: 'ukk',
      name: 'useinkysytyt',
      component: RouteUkk,
    }, {
      path: 'pohjat',
      name: 'pohjaListaus',
      component: RouteOpetussuunnitelmaListaus,
      props: {
        tyyppi: 'pohjat',
      },
    }, {
      path: 'opetussuunnitelmat',
      name: 'opetussuunnitelmaListaus',
      component: RouteOpetussuunnitelmaListaus,
    }, {
      path: 'opetussuunnitelmat/:id',
      name: 'opetussuunnitelma',
      component: RouteOpetussuunnitelma,
      meta: {
        resolve: {
          cacheBy: ['id'],
          async props(route) {
            return {
              default: {
                opetussuunnitelmaStore: getOpetussuunnitelmaService(_.parseInt(route.params.id)),
              },
            };
          },
        },
      },
      children: [{
        path: 'tiedot',
        component: RouteTiedot,
        name: 'opsTiedot',
      }, {
        path: 'julkaisu',
        component: RouteJulkaisu,
        name: 'opsJulkaisu',
      }, {
        path: 'jarjesta',
        component: RouteJarjestys,
        name: 'jarjesta',
      }, {
        path: 'dokumentti',
        component: RouteDokumentti,
        name: 'opsDokumentti',
      }, {
        path: 'poistetut',
        component: RoutePoistetut,
        name: 'opsPoistetut',
      }, {
        path: 'kasitteet',
        component: RouteKasite,
        name: 'opsKasitteet',
      }, {
        path: 'oppiaineet',
        component: RouteOppiaineet,
        name: 'oppiaineet',
      }, {
        path: 'oppiaineet/:oppiaineId',
        component: RouteOppiaine,
        name: 'oppiaine',
      }, {
        path: 'oppiaineet/:oppiaineId/moduulit/:moduuliId',
        component: RouteModuuli,
        name: 'moduuli',
      }, {
        path: 'poppiaineet/:paikallinenOppiaineId',
        component: RoutePaikallinenOppiaine,
        name: 'paikallinenOppiaine',
      }, {
        path: 'opintojaksot/:opintojaksoId',
        component: RouteOpintojakso,
        name: 'opintojakso',
      }, {
        path: 'tekstikappaleet/:osaId',
        component: RouteTekstikappale,
        name: 'tekstikappale',
      }],
    }],
  }, {
    path: '*',
    redirect: (to) => {
      logger.error('Unknown route', to);
      return {
        name: 'virhe',
        params: {
          lang: 'fi',
          ...to.params,
        },
        query: {
          viesti: 'virhe-route',
          virhe: to.path,
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

let lastOpsId!: string;

window.onbeforeunload = () => {
  if (EditointiKontrolli.anyEditing()) {
    return 'Oletko varma?';
  }
};

router.beforeEach(async (to, from, next) => {
  // Estetään siirtyminen jos editointi on käynnissä
  if (EditointiKontrolli.anyEditing()) {
    // TODO: Lisää notifikaatio
    logger.warn('Route change denied: Still in editing state', from, to);
    info('tallenna-tai-peruuta-muutoksesi-ensin');
    return;
  }

  changeLang(to, from);
  await resolveRouterMetaProps(to);

  // Alustetaan opetussuunnitelma tilan vaihtuessa
  if (Opetussuunnitelma()) {
    try {
      await Opetussuunnitelma().init();
    }
    catch (err) {
      console.error(err);
    }
  }

  // logger.debug(`Route change ${from.name} -> ${to.name}`, from, to);
  next();
});
