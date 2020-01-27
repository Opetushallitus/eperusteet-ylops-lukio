<template>
  <ep-main-view :tutoriaalistore="tutoriaalistore">
    <template slot="icon">
      <ep-icon class="float-right" icon="luo-uusi">
      </ep-icon>
    </template>
    <template slot="header">
      <h1>{{ $t('uusi-pohja') }}</h1>
    </template>
    <div>
      <ep-form-content name="pohja-nimi">
        <ep-field help="pohja-nimi-ohje" v-model="uusi.nimi" :validation="$v.uusi.nimi" :is-editing="true" />
      </ep-form-content>
    </div>
    <div v-if="valittavat.length > 0">
      <ep-form-content name="peruste">
        <ep-select help="ops-peruste-ohje" v-model="uusi.valittuPeruste" :items="valittavat" :validation="$v.uusi.valittuPeruste" :is-editing="true">
          <template slot-scope="{ item }">
            {{ $kaanna(item.nimi) }} ({{ item.diaarinumero }})
          </template>
        </ep-select>
      </ep-form-content>
    </div>
    <ep-spinner v-else />
    <ep-button :disabled="$v.uusi.$invalid" @click="luoUusiPeruste" :show-spinner="isSaving">
      {{ $t('luo-pohja') }}
    </ep-button>
  </ep-main-view>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Prop, Mixins } from 'vue-property-decorator';

import { Ulkopuoliset, Opetussuunnitelmat } from '@/api';
import { pohjaLuontiValidator } from '@/validators/ops';
import { isPerusteSupported } from '@/utils/perusteet';
import {
  PerusteInfoDto,
  OpetussuunnitelmaLuontiDto,
} from '@/tyypit';
import { createLogger } from '@shared/utils/logger';
import { success } from '@/utils/notifications';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';
import { Kieli } from '@shared/tyypit';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpIcon from '@/components/EpIcon/EpIcon.vue';
import EpMainView from '@/components/EpMainView/EpMainView.vue';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpRoute from '@/mixins/EpRoute';
import EpValidation from '@shared/mixins/EpValidation';

const logger = createLogger('RoutePohjaUusi');


@Component({
  components: {
    EpButton,
    EpContent,
    EpField,
    EpFormContent,
    EpIcon,
    EpMainView,
    EpNavigation,
    EpSelect,
    EpSpinner,
  },
})
export default class RoutePohjaUusi extends Mixins(EpRoute, EpValidation) {
  private isSaving = false;
  private perusteet: PerusteInfoDto[] = [];
  private uusi = {
    valittuPeruste: null as (PerusteInfoDto | null),
    nimi: {},
  };

  @Prop()
  private tutoriaalistore!: TutoriaaliStore;

  get validationConfig() {
    return {
      uusi: pohjaLuontiValidator([]),
    };
  }

  get steps() {
    return [{
      name: 'wizard-peruste',
    }, {
      name: 'wizard-nimi',
    }];
  }

  public async mounted() {
    this.perusteet = (await Ulkopuoliset.getPerusteet()).data;
  }

  private get valittavat() {
    return _(this.perusteet)
      .filter((peruste) => isPerusteSupported(peruste))
      .sortBy((peruste) => (this as any).$kaanna(peruste.nimi))
      .value();
  }

  private valitsePeruste(peruste: PerusteInfoDto) {
    this.uusi.valittuPeruste = peruste;
  }

  private async luoUusiPeruste() {
    this.isSaving = true;

    try {
      const pohja: OpetussuunnitelmaLuontiDto = {
        nimi: this.uusi.nimi,
        perusteenDiaarinumero: this.uusi.valittuPeruste!.diaarinumero,
        julkaisukielet: [Kieli.fi, Kieli.sv] as any,
        tyyppi: 'pohja' as any,
      };

      const data = (await Opetussuunnitelmat.addOpetussuunnitelma(pohja)).data;
      success('lisays-pohja-onnistui');
      if (_.isNumber(data.id)) {
        this.$router.replace({
          name: 'yleisnakyma',
          params: {
            id: '' + data.id,
          },
        });
      }
    }
    catch (err) {
      logger.log(err);
      this.isSaving = false;
    }
  }
}

</script>

<style scoped lang="scss">

@import '@/styles/_variables.scss';

</style>
