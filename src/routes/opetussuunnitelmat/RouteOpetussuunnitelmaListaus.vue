<template>
<div>
  <ep-main-view :tutoriaalistore="tutoriaalistore">
    <template slot="icon">
      <ep-icon class="float-right" icon="opetussuunnitelmasi" background-color="#5bca13">
      </ep-icon>
    </template>
    <template slot="header">
      <h1>{{ $t(tyyppi) }}</h1>
      <ep-arkistoidut-ops v-if="poistetut.length > 0"
                          :opetussuunnitelmat="poistetut"
                          :title="vars.poistetut"
                          class="float-right"
                          @restore="palauta"/>
      <p>{{ $t(vars.kuvaus) }}</p>
      <ep-search v-model="rajain" :placeholder="$t(vars.etsi)"></ep-search>
    </template>

    <ep-spinner v-if="isLoading"></ep-spinner>
    <b-container fluid v-else class="pl-0">
      <b-row>
        <b-col>
          <div class="opslistaus">
            <h2>{{ $t(vars.keskeneraiset) }}</h2>

            <div class="info" v-if="keskeneraiset.length === 0">
              <div v-if="hasRajain">
                {{ $t('ei-hakutuloksia') }}
              </div>
            </div>

            <div class="opscontainer">
              <div v-if="!hasRajain"
                   class="opsbox"
                   v-oikeustarkastelu="{ oikeus: 'luonti', kohde: 'opetussuunnitelma' }">
                <router-link tag="a" :to="{ name: vars.uusiRoute }">
                  <div class="uusi">
                    <div class="plus">
                      <fas icon="plussa"></fas>
                    </div>
                    <div class="text">
                      {{ $t('luo-uusi') }}
                    </div>
                  </div>
                </router-link>
              </div>

              <div v-for="ops in keskeneraiset" :key="ops.id">
                <div v-if="ops.toteutus === 'lops2019' || ops.toteutus === 'yksinkertainen'"
                    class="opsbox">
                  <router-link
                    tag="a"
                    :to="{ name: 'yleisnakyma', params: { id: ops.id } }"
                    :key="ops.id">
                    <div class="chart">
                      <div class="progress-clamper">
                        <ep-progress :slices="[0.2, 0.5, 1]" />
                      </div>
                    </div>
                    <div class="info">
                      <div class="nimi">
                        {{ $kaanna(ops.nimi, true) }}
                      </div>
                    </div>
                  </router-link>
                </div>
                <div v-else
                    ref="disabled"
                    class="opsbox disabled">
                  <div class="info-top">
                    <p>{{ $t('koulutustyyppi-ei-ole-toteutettu') }}</p>
                  </div>
                  <div class="info">
                    <div class="nimi">
                      {{ $kaanna(ops.nimi) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="opslistaus">
            <h2 class="mt-4">{{ $t(vars.julkaistut) }}</h2>

            <div class="info" v-if="julkaistut.length === 0">
              <div v-if="hasRajain">
                {{ $t('ei-hakutuloksia') }}
              </div>
              <ep-alert v-else :ops="true" :text="$t(vars.eivalmiita)" />
            </div>

            <div class="opscontainer">
              <div v-for="ops in julkaistut" :key="ops.id">
                <div class="opsbox julkaistu" v-if="ops.toteutus === 'lops2019' || ops.toteutus === 'yksinkertainen'">
                  <router-link
                    tag="a"
                    :to="{ name: 'yleisnakyma', params: { id: ops.id } }"
                    :key="ops.id">
                    <div class="chart">
                      <div class="progress-clamper">
                        <ep-progress :slices="[0.2, 0.5, 1]" />
                      </div>
                    </div>
                    <div class="info">
                      <div class="nimi">
                        {{ $kaanna(ops.nimi) }}
                      </div>
                    </div>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </ep-main-view>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Mixins } from 'vue-property-decorator';

import { OpetussuunnitelmaInfoDto } from '@/tyypit';
import { Opetussuunnitelmat } from '@/api';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { success, fail } from '@/utils/notifications';
import { Kielet } from '@shared/stores/kieli';

import EpRoute from '@/mixins/EpRoot';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpIcon from '@/components/EpIcon/EpIcon.vue';
import EpMainView from '@/components/EpMainView/EpMainView.vue';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpProgress from '@/components/EpProgress/EpProgress.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpArkistoidutOps from '@/components/EpArkistoidutOps/EpArkistoidutOps.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';


@Component({
  directives: {
    oikeustarkastelu,
  },
  components: {
    EpButton,
    EpContent,
    EpIcon,
    EpMainView,
    EpNavigation,
    EpProgress,
    EpSpinner,
    EpAlert,
    EpArkistoidutOps,
    EpSearch,
  },
})
export default class RouteOpetussuunnitelmaListaus extends Mixins(EpRoute) {
  @Prop({ default: 'opetussuunnitelmat' })
  private tyyppi!: 'opetussuunnitelmat' | 'pohjat';

  @Prop({ required: true })
  private tutoriaalistore!: TutoriaaliStore;

  private opslista: OpetussuunnitelmaInfoDto[] = [];

  private rajain = '';

  get hasRajain() {
    return !_.isEmpty(this.rajain);
  }

  get jarjestetyt() {
    return _(this.opslista)
      .filter(ops => _.includes(
        _.toLower(_.get(ops, 'nimi.' + Kielet.getSisaltoKieli)),
        _.toLower(this.rajain)
      ))
      .sortBy('luotu')
      .reverse()
      .value();
  }

  get arkistoimattomat() {
    return _.reject(this.jarjestetyt, ops => (ops.tila as any) === 'poistettu');
  }

  get poistetut() {
    return _.filter(this.jarjestetyt, ops => (ops.tila as any) === 'poistettu');
  }

  get valmisTila() {
    return this.tyyppi === 'pohjat'
      ? 'valmis'
      : 'julkaistu';
  }

  get keskeneraiset() {
    return _.reject(this.arkistoimattomat, ops => (ops.tila as any) === this.valmisTila);
  }

  get julkaistut() {
    return _.filter(this.arkistoimattomat,ops => (ops.tila as any) === this.valmisTila);
  }

  get vars() {
    if (this.tyyppi === 'pohjat') {
      return {
        eiarkistoituja: 'ei-arkistoituja-pohjia',
        eivalmiita: 'ei-valmiita-pohjia',
        etsi: 'etsi-pohjista',
        getTarget: 'POHJA',
        julkaistut: 'valmiit-pohjat',
        keskeneraiset: 'keskeneraiset-pohjat',
        kuvaus: 'pohjat-kuvaus',
        palautaOps: 'palauta-pohja',
        palautaOpsKuvaus: 'palauta-pohja-kuvaus',
        poistetut: 'arkistoidut-pohjat',
        uusiRoute: 'uusiPohja',
      };
    }
    else {
      return {
        eiarkistoituja: 'ei-arkistoituja-opetussuunnitelmia',
        eivalmiita: 'ei-julkaistuja-opetussuunnitelmia',
        etsi: 'etsi-opetussuunnitelmia',
        getTarget: 'OPS',
        julkaistut: 'julkaistut-opetussuunnitelmat',
        keskeneraiset: 'keskeneraiset-opetussuunnitelmat',
        kuvaus: 'opetussuunnitelmat-kuvaus',
        palautaOps: 'palauta-ops',
        palautaOpsKuvaus: 'palauta-ops-kuvaus',
        poistetut: 'arkistoidut-opetussuunnitelmat',
        uusiRoute: 'uusiOpetussuunnitelma',
      };
    }
  }

  async palauta(ops: OpetussuunnitelmaInfoDto) {
    if (await this.vahvista(this.vars.palautaOps, this.vars.palautaOpsKuvaus)) {
      try {
        await OpetussuunnitelmaStore.updateOpsTila(ops.id!, 'luonnos');
        const idx = _.findIndex(this.opslista, { id: ops.id });
        if (idx > -1) {
          this.opslista[idx].tila = 'luonnos' as any;
        }
        success('palautus-onnistui');
      }
      catch (err) {
        fail('palautus-epaonnistui');
      }
    }
  }

  protected async init() {
    const res = await Opetussuunnitelmat.getAll(this.tyyppi === 'pohjat' ? 'POHJA' : 'OPS');
    this.opslista = res.data;
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/_mixins.scss';

$box-size: 350px;

$box-radius: 10px;

h1 {
  color: #001A58;
  font-size: 0.5555555555555556rem;
  font-weight: 400;
}

h2 {
  font-size: 1.1111111111111112rem;
  font-weight: 400;
}

.opslistaus {

  .info {
    padding: 10px 0;
  }

  .opscontainer {
    display: flex;
    flex-wrap: wrap;

    .opsbox {
      user-select: none;
      margin: 10px;
      border-radius: $box-radius;
      @include tile-background-shadow;

      .julkaistu {
        background: linear-gradient(180deg, #e7eefe 0%, #f3f6fe 100%);
      }

      .poistettu {
        background-size: contain;
        background: linear-gradient(180deg, #e7eefe 0%, #f3f6fe 100%);
        border-radius: $box-radius;
        height: 230px;
        margin: 0 auto;
        padding-top: 0;
        text-align: center;
        width: 192px;

        .ikoni {
          color: #e44e4e;
          font-size: 50px;
          margin: 0 auto;
          text-align: center;
          width: 80px;
        }

        .text {
          color: black;
          font-weight: 400;
          margin: 0 auto;
          text-align: center;
          overflow-y: auto;
          height: 80px;
        }

        .palauta {
          margin-top: 20px;
        }
      }

      .uusi {
        background-size: contain;
        background: linear-gradient(180deg, #1E49CF 0%, #0f3284 100%);
        border-radius: $box-radius;
        height: 230px;
        margin: 0 auto;
        padding-top: 48px;
        text-align: center;
        width: 192px;

        .plus {
          color: white;
          font-size: 50px;
          margin: 0 auto;
          text-align: center;
          width: 80px;
        }

        .text {
          color: white;
          font-weight: 600;
          margin: 0 auto;
          text-align: center;
          width: 80px;
        }
      }

      .chart {
        width: 192px;
        border-radius: $box-radius $box-radius 0 0;
        height: 138px;
        background: linear-gradient(180deg, #1E49CF 0%, #0f3284 100%);
        background-size: contain;
        margin: 0 auto;
        text-align: center;
        padding-top: 28px;

        .progress-clamper {
          width: 80px;
          text-align: center;
          margin: 0 auto;
        }
      }

      .info {
        border-radius: 0 0 $box-radius $box-radius;
        text-align: center;
        height: 92px;
        width: 192px;
        padding: 10px 10px;
        margin: 0 auto;
        border: 1px solid #E7E7E7;
        border-top-width: 0;
        overflow-y: auto;

        .nimi {
          color: #2B2B2B;
          text-align: center;
          hyphens: none;
          font-size: 12px;
          font-weight: 600;
        }
      }

      &:hover:not(.disabled) {
        @include tile-background-shadow-selected;
      }
    }

    .disabled {
      cursor: not-allowed;

      .info-top {
        width: 192px;
        height: 138px;
        border-radius: $box-radius $box-radius 0 0;
        background-color: lightgray;
        margin: 0 auto;
        text-align: center;
        padding-top: 28px;
        padding-left: 10px;
        padding-right: 10px;
      }
    }
  }
}

</style>
