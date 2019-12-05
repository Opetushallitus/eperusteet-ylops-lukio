<template>
<div class="content">
  <ep-editointi :hooks="hooks">
    <template slot="header">
      <h2>
        <span>{{ $t('oppiaineet') }}</span>
      </h2>
    </template>
     <template slot="ohje">
      <div class="sidepad">
        <!-- <p>N/A</p> -->
      </div>
    </template>

    <div class="row">
      <div class="col-md-9">
        <div>
          <p>{{ $t('route-oppiaineet-kuvaus') }}</p>
        </div>
        <div>
          <div class="d-flex align-items-center">
            <div class="p-2">
              <ep-search v-model="query">
              </ep-search>
            </div>
            <div class="p-2 checkbox">
              <ep-toggle v-model="vainPuuttuvat">{{ $t('vain-liittamattomat-moduulit') }}</ep-toggle>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div>
          <ep-button v-oikeustarkastelu="'muokkaus'" variant="outline-primary" icon="plus" @click="uusiOppiaine()">{{ $t('paikallinen-oppiaine') }}</ep-button>
          <ep-button v-oikeustarkastelu="'muokkaus'" variant="outline-primary" icon="plus" @click="uusiOpintojakso()">{{ $t('opintojakso') }}</ep-button>
        </div>
      </div>
    </div>
    <table class="table table-borderless oppiaineet">
      <thead class="head">
        <tr>
          <th width="20%">{{ $t('oppiaine') }}</th>
          <th width="25%">{{ $t('luodut-opintojaksot') }}</th>
          <th width="25%">{{ $t('liitetyt-moduulit') }}</th>
          <th width="25%">{{ $t('vieraat-moduulit') }}</th>
          <th class="actions" width="5%">
            <button class="btn btn-link" @click="toggleAll()">
              <fas icon="chevron-down">
              </fas>
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(oa, idx) in suodatettuOppiaineRakenne">
          <tr class="headerline" :class="oa.isOpen && 'opened'" :key="idx">
            <td>
              <router-link :to="{ name: 'oppiaine', params: { oppiaineId: oa.id } }">
                <span>{{ $kaanna(oa.nimi) }}</span>
                <span class="ml-1" v-if="oa.koodi">({{ oa.koodi.arvo }})</span>
              </router-link>
            </td>
            <td>
              <span v-if="oa.oppimaarat && oa.oppimaarat.length === 0">{{ oa.stats.opintojaksot }}</span>
            </td>
            <td :class="oa.stats.valid ? 'valid' : 'invalid'">
              <span v-if="oa.oppimaarat && oa.oppimaarat.length === 0">{{ oa.stats.kaytetytModuulit }}/{{ oa.stats.kaikkiModuulit }}</span>
            </td>
            <td>
            </td>
            <td class="actions">
              <button class="btn btn-link" @click="toggleOppiaine(oa)" v-if="oa.oppimaarat && oa.oppimaarat.length === 0">
                <fas v-if="oa.isOpen" icon="chevron-down">
                </fas>
                <fas v-else icon="chevron-up">
                </fas>
              </button>
            </td>
          </tr>
          <tr class="dataline" v-if="(!oa.oppimaarat || oa.oppimaarat.length === 0) && oa.isOpen" :key="-idx - 1">
            <td>
            </td>
            <td>
              <div class="boxcontainer" v-for="oj in oa.opintojaksot" :key="oj.id">
                <div class="opintojakso" @mouseover="hoverOpintojakso(oj)" @mouseleave="unhoverOpintojakso(oj)">
                  <table>
                    <tr class="item">
                      <!-- td.op {{ oj.laajuus || 0 }}{{ $t('op') }}-->
                      <td class="nimi">
                        <router-link :to="{ name: 'opintojakso', params: { opintojaksoId: oj.id } }">{{ $kaanna(oj.nimi) }} ({{ oj.koodi }})</router-link>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </td>
            <td>
              <div>
                <div class="boxcontainer" v-for="(moduuli, idx) in oa.moduulit" :key="idx">
                  <div class="moduuli" :class="moduuli.classes">
                    <table>
                      <tr class="item">
                        <td>
                          <ep-color-ball class="mr-2" :kind="moduuli.pakollinen ? 'pakollinen' : 'valinnainen'">
                          </ep-color-ball>
                          <span>{{ $kaanna(moduuli.nimi) }}</span>
                          <span class="ml-1" v-if="moduuli.koodi">({{ moduuli.koodi.arvo }})</span>
                        </td>
                        <!-- td.op {{ moduuli.laajuus }}{{ $t('op') }}-->
                        <!-- td.nimispan {{ $kaanna(moduuli.nimi) }} ({{ moduuli.koodi.arvo }})-->
                      </tr>
                    </table>
                  </div>
                </div>
              </div>
            </td>
            <td>
              <div>
                <div class="boxcontainer" v-for="(moduuli, idx) in oa.vieraatModuulit" :key="idx">
                  <div class="moduuli" :class="moduuli.classes">
                    <table>
                      <td>
                        <ep-color-ball class="mr-2" :kind="moduuli.pakollinen ? 'pakollinen' : 'valinnainen'"> </ep-color-ball>
                        <span>{{ $kaanna(moduuli.nimi) }}</span>
                        <span class="ml-1">({{ moduuli.koodi.arvo }})</span>
                      </td>
                    </table>
                  </div>
                </div>
              </div>
            </td>
            <td>
            </td>
          </tr>
        </template>
        <tr class="total">
          <td>{{ $t('yhteensa') }}</td>
          <td>{{ total.opintojaksot }}</td>
          <td>{{ total.kaytetytModuulit }}/{{ total.kaikkiModuulit }}</td>
          <td>
          </td>
          <td>
          </td>
        </tr>
      </tbody>
    </table>
  </ep-editointi>
</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator';
import EpButton from '@/components/EpButton/EpButton.vue';
import EpCollapse from '@/components/EpCollapse/EpCollapse.vue';
import EpColorBall from '@/components/EpColorBall/EpColorBall.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import EpSearch from '@/components/forms/EpSearch.vue';
import EpToggle from'@shared/components/forms/EpToggle.vue';
import { Lops2019ModuuliDto, Lops2019OppiaineDto } from '@/tyypit';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import { PerusteCache } from '@/stores/peruste';
import { koodiAlku, koodiNumero } from '@/utils/perusteet';

import _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { EditointiKontrolliConfig } from '@/stores/editointi';


@Component({
  directives: {
    oikeustarkastelu,
  },
  components: {
    EpButton,
    EpCollapse,
    EpColorBall,
    EpContent,
    EpEditointi,
    EpSearch,
    EpSpinner,
    EpToggle,
  },
})
export default class RouteOppiaineet extends Mixins(EpRoute, EpOpsComponent) {
  private cache: PerusteCache | null = null;
  private valitutModuuliUrit: { [uri: string]: string } | null = null;
  private query = '';
  private vainPuuttuvat = false;
  private opened: { [id: number]: any } = {};

   private hooks: EditointiKontrolliConfig = {
     source: {
       load: this.load,
     },
   };

   private async load() {
     const result = {
       ohjeet: [{teksti:'N/A'}],
     } as any;

     if (_.isEmpty(result.ohjeet)) {
       result.ohjeet.push({});
     }

     return result;
   }

   get isHovering() {
     return this.valitutModuuliUrit !== null;
   }

   get peruste() {
     if (this.cache) {
       return this.cache!.peruste;
     }
     else {
       return null;
     }
   }

   get total() {
     return _(this.oppiaineRakenne)
       .map('stats')
       .reduce((acc, next) => {
         return {
           opintojaksot: acc.opintojaksot + next.opintojaksot,
           kaytetytModuulit: acc.kaytetytModuulit + next.kaytetytModuulit,
           kaikkiModuulit: acc.kaikkiModuulit + next.kaikkiModuulit,
         };
       }, {
         opintojaksot: 0,
         kaytetytModuulit: 0,
         kaikkiModuulit: 0,
       });
   }

   get oppiaineetJaOppimaarat() {
     return _(this.peruste.oppiaineet as Lops2019OppiaineDto[])
       .map(oa => [oa, ...(oa.oppimaarat || [])])
       .flatten()
       .value();
   }

   get moduulit() {
     const result = _(this.oppiaineetJaOppimaarat)
       .map('moduulit')
       .flatten()
       .value();
     return result;
   }

   get moduulitByKoodi() {
     return _(this.moduulit)
       .filter('koodi.uri')
       .keyBy('koodi.uri')
       .value() as { [uri: string]: Lops2019ModuuliDto };
   }

   get suodatettuOppiaineRakenne() {
     return _(this.oppiaineRakenne)
       .map(oa => {
         return {
           ...oa,
           vieraatModuulit: this.vainPuuttuvat ? [] : oa.vieraatModuulit,
           moduulit: _(oa.moduulit)
             .reject((moduuli) => this.vainPuuttuvat && moduuli.used)
             .filter((moduuli) => Kielet.search(this.query, moduuli.nimi))
             .sortBy(koodiAlku, koodiNumero)
             .value(),
           opintojaksot: _(oa.opintojaksot)
             .filter((oj) => Kielet.search(this.query, oj.nimi))
             .sortBy(koodiAlku, koodiNumero)
             .value(),
         };
       })
       .filter((oa: any) => Kielet.search(this.query, oa.nimi)
          || !_.isEmpty(oa.moduulit)
          || !_.isEmpty(oa.opintojaksot))
       .sortBy((oa: any) => oa.paikallinen, koodiAlku, koodiNumero)
       .value();
   }

   private moduuliPresentation(moduuli: any, opintojaksojenModuulit: any) {
     const active = moduuli.koodi && this.valitutModuuliUrit !== null && !!this.valitutModuuliUrit[moduuli.koodi.uri];
     const used = moduuli.koodi && !!opintojaksojenModuulit[moduuli.koodi.uri];
     return {
       ...moduuli,
       active,
       used,
       classes: {
         'moduuli-active': active,
         'moduuli-inactive': this.isHovering && !active,
         'moduuli-unused': !this.isHovering && !used,
       },
     };
   }

   get paikallinenOppiaineRakenne() {
     if (!this.peruste || !this.store.paikallisetOppiaineet) {
       return [];
     }
     return _(this.store.paikallisetOppiaineet)
       .map(oa => {
         const opintojaksot = [];

         return {
           ...oa,
           koodi: {
             arvo: oa.koodi,
             uri: oa.koodi,
           },
           isOpen: this.opened[oa.id!] || !_.isEmpty(this.query),
           paikallinen: true,
           vieraatModuulit: [],
           opintojaksot: [],
           moduulit: [],
           stats: {
             opintojaksot: _.size(opintojaksot),
             kaytetytModuulit: 0,
             kaikkiModuulit: 0,
             valid: !_.isEmpty(opintojaksot),
           },
         };
       })
       .value();
   }

   get perusteenOppiaineRakenne() {
     if (!this.peruste) {
       return [];
     }

     return _(this.peruste.oppiaineet as Lops2019OppiaineDto[])
       .map(oa => [oa, ...(oa.oppimaarat || [])])
       .flatten()
       .map(oa => {
         const opintojaksot = _(this.store.opintojaksot)
           .filter(oj => _.includes(
             _(oj.oppiaineet)
               .map('koodi')
               .filter(_.identity)
               .value(),
            oa.koodi!.uri))
           .value();

         const opintojaksojenModuulit = _(opintojaksot)
           .map('moduulit')
           .flatten()
           .keyBy('koodiUri')
           .value();

         const vieraatModuulit = _(opintojaksot)
           .map('moduulit')
           .flatten()
           .map(moduuli => this.moduulitByKoodi[moduuli.koodiUri])
           .reject((moduuli: any) => !moduuli.koodi || _.startsWith(moduuli.koodi!.arvo, oa.koodi!.arvo))
           .map(moduuli => this.moduuliPresentation(moduuli, opintojaksojenModuulit))
           .value();

         const kaytetytModuulit = _.size(opintojaksojenModuulit) - _.size(vieraatModuulit);
         return {
           ...oa,
           isOpen: this.opened[oa.id!] || !_.isEmpty(this.query),
           moduulit: _.map(oa.moduulit, (moduuli) => this.moduuliPresentation(moduuli, opintojaksojenModuulit)),
           vieraatModuulit,
           paikallinen: false,
           opintojaksot,
           stats: {
             opintojaksot: _.size(opintojaksot),
             kaytetytModuulit,
             kaikkiModuulit: _.size(oa.moduulit),
             valid: kaytetytModuulit === _.size(oa.moduulit),
           },
         };
       })
       .value();
   }

   get oppiaineRakenne() {
     return [
       ...this.perusteenOppiaineRakenne,
       ...this.paikallinenOppiaineRakenne];
   }

   async mounted() {
     this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
     this.$nextTick(() => {
       this.toggleAll();
     });
   }

   private toggleOppiaine(oa: any) {
     this.$set(this.opened, oa.id, !this.opened[oa.id]);
   }

   private hoverOpintojakso(oj: any) {
     this.valitutModuuliUrit = _(oj.moduulit)
       .keyBy('koodiUri')
       .value();
   }

   private unhoverOpintojakso(oj: any) {
     this.valitutModuuliUrit = null;
   }

   private toggleAll() {
     if (_.isEmpty(this.opened)) {
       this.opened = _.keyBy(this.oppiaineRakenne, 'id');
     }
     else {
       this.opened = {};
     }
   }

   public uusiOppiaine() {
     this.$router.push({
       name: 'paikallinenOppiaine',
       params: {
         ...this.$router.currentRoute.params,
         paikallinenOppiaineId: 'uusi',
       },
     });
   }

   public uusiOpintojakso() {
     this.$router.push({
       name: 'opintojakso',
       params: {
         ...this.$router.currentRoute.params,
         opintojaksoId: 'uusi',
       },
     });
   }

}
</script>

<style lang="scss" scoped>
@import "@/styles/_variables.scss";

.content {
  padding: 20px;
}

table.oppiaineet {
  border-collapse: collapse;

  th, td {
    border: none;
  }

  thead {
    border: none;
  }

  tr.headerline {

    &:nth-child(2n - 1) {
      background-color: #F9F9F9;
    }

    &.opened {
      background: $paletti-background-light-2;
    }

    td.actions {
      padding: 5px;
    }

    .invalid {
      color: $red;
    }

    .valid {
      color: $green-lighten-2;
    }
  }

  tr.total {
    border: 1px solid $paletti-background-light-2;
    font-weight: bold;
    font-size: 80%;

    td {
      padding: 14px;
    }
  }

  tr.dataline {
    background: $paletti-background-light;
    border: 1px solid #DFEFFF;
    font-size: 80%;

    td.chevron {
      width: 10px;
    }

    td {
      padding: 2px;

      tr.item {
        padding: 0;

        td.op {
          padding: 4px;
        }
        td.nimi {
          padding: 4px;
        }
      }

      .opintojakso {
        padding: 4px;
        padding-left: 0;
      }

      .moduuli {
        padding: 4px;
        color: #000;
      }

      .moduuli-unused {
        color: #888;
      }

      .moduuli-inactive {
        color: #888;
      }

      .moduuli-active {
        background: #fff;
        border-radius: 12px;
        box-shadow: 2px 2px 2px #cdd8ef;
      }
    }
  }
}
</style>
