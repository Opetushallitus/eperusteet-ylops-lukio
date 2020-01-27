<template>
<ep-main-view :tutoriaalistore="tutoriaalistore">
  <template slot="icon">
    <ep-icon class="float-right" icon="luo-uusi"></ep-icon>
  </template>
  <template slot="header">
    <h1>{{ $t('uusi-opetussuunnitelma') }}</h1>
  </template>
  <fieldset class="form-group">
    <div class="row">
      <legend class="col-form-label col-sm-2 pt-0">{{ $t('opetussuunnitelman-pohjatyyppi') }}:</legend>
      <div class="col-sm-10 mb-4">
        <div class="form-check">
          <input class="form-check-input"
                 id="uusi-ops-pohjavalinta-1"
                 type="radio"
                 :value="'opsista'"
                 v-model="oletuspohjasta" />
          <label class="form-check-label"
                 for="uusi-ops-pohjavalinta-1">{{ $t('toinen-opetussuunnitelma') }}</label>
        </div>
        <div class="form-check">
          <input class="form-check-input"
                 id="uusi-ops-pohjavalinta-2"
                 type="radio"
                 :value="'pohjasta'"
                 v-model="oletuspohjasta"
                 checked="checked" />
          <label class="form-check-label" for="uusi-ops-pohjavalinta-2">{{ $t('oletuspohja') }}</label>
        </div>
      </div>
    </div>
    <div v-if="oletuspohjasta">
      <div class="form-group">
        <div v-if="pohjat">
          <ep-form-content v-if="pohjat.length > 0" name="uusi-ops-pohja">
            <ep-select v-model="uusi.pohja"
                       :items="pohjat"
                       :validation="$v.uusi.pohja"
                       :is-editing="true"
                       help="uusi-ops-pohja-ohje"
                       placeholder="valitse-opetussuunnitelman-pohja">
              <template slot-scope="{ item }">
                <span>{{ $kaanna(item.nimi) }} ({{ item.perusteenDiaarinumero }})</span>
              </template>
            </ep-select>
          </ep-form-content>
          <div v-else>
            <div class="alert alert-info">{{ $t('ei-opetussuunnitelmia') }}</div>
          </div>
        </div>
        <ep-spinner v-else></ep-spinner>
      </div>
    </div>
  </fieldset>
  <div v-if="oletuspohjasta">
    <hr/>
    <ep-form-content name="nimi">
      <ep-field help="ops-nimi-ohje" v-model="uusi.nimi" :validation="$v.uusi.nimi" :is-editing="true"></ep-field>
    </ep-form-content>
    <div v-if="uusi.pohja">
      <hr/>
      <ep-organizations :validation="$v.uusi.organisaatiot" :koulutustyyppi="koulutustyyppi" v-model="uusi.organisaatiot"></ep-organizations>
      <ep-form-content name="ainepainoitteinen">
        <ep-toggle v-model="uusi.ainepainoitteinen" :is-editing="true"></ep-toggle>
      </ep-form-content>

      <ep-button :disabled="$v.uusi.$invalid || addingOpetussuunnitelma" @click="luoUusiOpetussuunnitelma" :show-spinner="isLoading">{{ $t('luo-opetussuunnitelma') }}</ep-button>
    </div>
  </div>
</ep-main-view>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Prop, Mixins, Watch } from 'vue-property-decorator';

import { success, fail } from '@/utils/notifications';
import { validationMixin } from 'vuelidate';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';
import { delay } from '@shared/utils/delay';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpIcon from '@/components/EpIcon/EpIcon.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpMainView from '@/components/EpMainView/EpMainView.vue';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpOrganizations from '@/components/EpOrganizations/EpOrganizations.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpRoute from '@/mixins/EpRoute';


import {
  Opetussuunnitelmat,
} from '@/api';

import {
  OpetussuunnitelmaInfoDto,
  OpetussuunnitelmaLuontiDto,
} from '@/tyypit';

import { opsLuontiValidator } from '@/validators/ops';

@Component({
  components: {
    EpButton,
    EpContent,
    EpField,
    EpFormContent,
    EpIcon,
    EpInput,
    EpMainView,
    EpNavigation,
    EpOrganizations,
    EpSelect,
    EpSpinner,
    EpToggle,
  },
  validations: {
    uusi: opsLuontiValidator(),
  },
} as any)
export default class RouteOpetussuunnitelmaUusi extends Mixins(validationMixin, EpRoute) {
  private oletuspohjat: OpetussuunnitelmaInfoDto[] | null = null;
  private opetussuunnitelmat: OpetussuunnitelmaInfoDto[] | null = null;
  private oletuspohjasta: 'pohjasta' | 'opsista' | null = null;
  private addingOpetussuunnitelma = false;
  private uusi = {
    pohja: null as (OpetussuunnitelmaInfoDto | null),
    nimi: {},
    organisaatiot: {
      jarjestajat: [],
      oppilaitokset: [],
      kunnat: [],
    },
    ainepainoitteinen: false,
  };

  @Prop({ required: true })
  private tutoriaalistore!: TutoriaaliStore;

  get steps() {
    return [{
      name: 'wizard-valitse-tyyppi',
      hide: true,
    }, {
      name: 'wizard-pohjan-valinta',
    }, {
      name: 'wizard-perustiedot',
    }, {
      name: 'wizard-lisatiedot',
    }];
  }

  get koulutustyyppi() {
    return _.get(this.uusi, 'pohja.koulutustyyppi');
  }

  @Watch('oletuspohjasta')
  oletuspohjavalintaMuutos() {
    this.uusi.pohja = null;
  }

  @Watch('uusi.pohja')
  uusiPohjaMuutos() {
    this.uusi.organisaatiot = {
      jarjestajat: [],
      oppilaitokset: [],
      kunnat: [],
    };
  }

  protected async init() {
    this.oletuspohjat = (await Opetussuunnitelmat.getAll('POHJA')).data;
    this.opetussuunnitelmat = (await Opetussuunnitelmat.getAll('OPS')).data;
  }

  get pohjat() {
    if (this.oletuspohjasta === 'pohjasta') {
      return this.pohjatFilter(this.oletuspohjat);
    }
    else {
      return this.pohjatFilter(this.opetussuunnitelmat);
    }
  }

  pohjatFilter(pohjat) {
    return _.chain(pohjat)
      .filter(pohja => pohja.tila !== 'POISTETTU')
      .filter(pohja => pohja.toteutus === 'lops2019')
      .value();
  }

  public async luoUusiOpetussuunnitelma() {
    this.addingOpetussuunnitelma = true;
    this.loading(async () => {
      const ops: OpetussuunnitelmaLuontiDto = {
        nimi: this.uusi.nimi,
        julkaisukielet: [],
        tyyppi: 'ops' as any,
        kunnat: this.uusi.organisaatiot.kunnat,
        organisaatiot: [
          ...this.uusi.organisaatiot.jarjestajat,
          ...this.uusi.organisaatiot.oppilaitokset,
        ],
        ainepainoitteinen: this.uusi.ainepainoitteinen,
      };

      // FIXME: #swagger
      (ops as any)._pohja = '' + this.uusi.pohja!.id;
      try {
        const luotu = await Opetussuunnitelmat.addOpetussuunnitelma(ops);
        success('lisays-opetussuunnitelma-onnistui');
        this.$router.replace({
          name: 'yleisnakyma',
          params: {
            id: '' + luotu.data.id,
          },
        });
      }
      catch (err) {
        fail('ei-riittavia-oikeuksia-organisaatioissa');
        await delay(300);
        this.addingOpetussuunnitelma = false;
      }
    });
  }
}

</script>

<style scoped lang="scss">

@import '@/styles/_variables.scss';

</style>
