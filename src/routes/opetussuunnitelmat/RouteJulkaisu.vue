<template>
<div class="content">
  <h2 class="opsnimi">{{ $kaanna(nimi) }}</h2>
  <div v-html="$t('julkaisuohje')">
  </div>
  <div class="vaihe">
    <h3>{{ $t('validointi') }}</h3>
    <div class="kategoriat">
      <div class="kategoria" v-for="(category, idx) in kooste" :key="idx">
        <ep-collapse :expanded-by-default="false">
          <h4 slot="header">
            <span class="iconspan mr-2">
              <fas class="warning" v-if="category.hasFatal" icon="exclamation" fixed-width="fixed-width">
              </fas>
              <fas v-else :class="category.hasWarning ? 'warning' : 'success'" icon="check" fixed-width="fixed-width">
              </fas>
            </span>
            <span class="saanto">{{ $t(category.key) }}</span>
          </h4>
          <div class="validointi" v-for="(validation, vidx) in category.value" :key="vidx + (idx + 1) * 1000">
            <span>{{ $t(validation.kuvaus) }} ({{ $kaanna(validation.nimi) }})</span>
          </div>
        </ep-collapse>
      </div>
    </div>
  </div>
  <div class="vaihe">
    <h3>{{ $t('tiedot') }}</h3>
    <div>
      <div class="row">
        <div class="col-md-6">
          <ep-form-content name="ops-nimi">
            <ep-field help="ops-nimi-ohje" v-model="ops.nimi">
            </ep-field>
          </ep-form-content>
        </div>
        <div class="col-md-6">
          <ep-form-content name="peruste">
            <ep-field v-model="ops.perusteenDiaarinumero">
            </ep-field>
          </ep-form-content>
        </div>
        <div class="col-md-6">
          <ep-form-content name="julkaisukielet">
            <ep-select help="ops-julkaisukielet-ohje" v-model="ops.julkaisukielet" :items="kielet" :multiple="true">
            </ep-select>
          </ep-form-content>
        </div>
        <div class="col-md-6" v-if="isOps">
          <ep-form-content name="ops-hyvaksyjataho">
            <ep-field help="ops-hyvaksyjataho-ohje" v-model="ops.hyvaksyjataho" type="string">
            </ep-field>
          </ep-form-content>
        </div>
        <div class="col-md-6" v-if="isOps">
          <ep-form-content name="ops-hyvaksymispvm">
            <ep-datepicker v-model="ops.paatospaivamaara" help="ops-hyvaksymispvm-ohje">
            </ep-datepicker>
          </ep-form-content>
        </div>
        <div class="col-md-12">
          <ep-form-content name="ops-kuvaus">
            <ep-content opetussuunnitelma-store="opetussuunnitelmaStore" v-model="ops.kuvaus" help="ops-kuvaus-ohje">
            </ep-content>
          </ep-form-content>
        </div>
      </div>
    </div>
  </div>
  <div class="vaihe">
    <ep-collapse tyyppi="uusi-julkaisu">
      <h3 slot="header"> {{ $t('uusi-julkaisu') }}</h3>
      <div v-if="true || isValid">
        <ep-content opetussuunnitelma-store="opetussuunnitelmaStore" v-model="uusiJulkaisu.julkaisutiedote" help="uuden-julkaisun-tiedote" layout="simplified" :is-editable="true">
        </ep-content>
        <ep-button class="btn btn-primary" @click="julkaise()">{{ $t('julkaise') }}</ep-button>
      </div>
      <div class="alert alert-warning" v-else>{{ $t('opetussuunnitelman-tarkistukset-julkaisu') }}</div>
    </ep-collapse>
  </div>
  <div class="vaihe">
    <ep-collapse tyyppi="julkaisuhistoria">
      <h3 slot="header">{{ $t('julkaisuhistoria') }}</h3>
      <div class="alert alert-info" v-if="julkaisuhistoria.length === 0">{{ $t('opetussuunnitelmaa-ei-viela-julkaistu') }}</div>
      <div v-else>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>{{ $t('versio') }}</th>
              <th>{{ $t('luontihetki') }}</th>
              <th>{{ $t('tiedote') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(julkaisu, idx) in julkaisuhistoria" :key="idx">
              <td>{{ julkaisu.revision }}</td>
              <td>{{ $ago(julkaisu.luotu) }}</td>
              <td v-html="$kaanna(julkaisu.tiedote)">
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </ep-collapse>
  </div>
</div>
</template>

<script lang="ts">
import EpCollapse from '@/components/EpCollapse/EpCollapse.vue';
import EpButton from '@/components/EpButton/EpButton.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpField from '@/components/forms/EpField.vue';
import EpFormContent from '@/components/forms/EpFormContent.vue';
import EpSelect from '@/components/forms/EpSelect.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';

import EpOpsRoute from '@/mixins/EpOpsRoute';

import Tilanvaihto from '@/routes/opetussuunnitelmat/Tilanvaihto.vue';
import _ from 'lodash';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Component } from 'vue-property-decorator';
import { opsTiedotValidator } from '@/validators/ops';

import { Kielet } from '@shared/stores/kieli';
import { Lops2019ValidointiDto, UusiJulkaisuDto } from '@/tyypit';


@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpDatepicker,
    EpEditointi,
    EpField,
    EpFormContent,
    EpSelect,
    Tilanvaihto,
  },
})
export default class RouteTiedot extends EpOpsRoute {
  private hooks: EditointiKontrolliConfig | null = null;
  private validointi: Lops2019ValidointiDto | null = null;
  private isOpen: { [key: string]: boolean } = {};
  private showKooste = false;
  private julkaisut: any[] = [];
  private uusiJulkaisu: UusiJulkaisuDto = {};

  get graph() {
    return {
      colorScheme: 'vihrea_sininen',
      value: 80,
    };
  }

  get nimi() {
    return this.ops.nimi;
  }

  get julkaisuhistoria() {
    return _.reverse(_.sortBy(this.julkaisut, 'revision'));
  }

  get isValid() {
    return _.every(this.kooste, v => !v.hasFatal);
  }

  get kooste() {
    if (this.validointi) {
      return _(this.validointi.validoinnit)
        .map((value, key) => ({
          key,
          hasFatal: _.some(value, v => v.fatal && v.failed),
          hasWarning: _.some(value, v => v.failed),
          value: _.filter(value, v => v.failed),
        }))
        .value();
    }
    else {
      return [];
    }
  }

  avaaKooste() {
    this.showKooste = true;
  }

  async init() {
    this.validointi = await this.store.validate();
    this.julkaisut = await this.store.getJulkaisut();
  }

  async julkaise() {
    const julkaisu = await this.store.julkaise(this.uusiJulkaisu);
    this.julkaisut.unshift(julkaisu);
  }
}
</script>

<style scoped lang="scss">

.content {
  padding: 15px 50px 50px 50px;

  .vaihe {
    margin-top: 60px;
    padding-top: 20px;
  }

  .actions {
    margin-top: 40px;
  }

  .opsnimi {
    text-align: center;
  }

  .progress {
    height: 140px;
    width: 140px;
    margin: 0 auto;
    background: white;
  }

  p.julkaisuohje {
    margin: 40px;
    text-align: center;
  }

  span.iconspan {
    min-width: 20px;
    display: inline-block;
    text-align: center;

    .failed {
      color: #ff6b27;
    }

    .warning {
      color: #ff6b27;
    }

    .success {
      color: #449013;
    }
  }

  .kategoriat {
    margin-top: 40px;

    .kategoria {
      margin-top: 20px;
      font-size: 120%;

      .otsikko {
        user-select: none;
        .saanto {
          cursor: pointer;
        }
      }

      .validointi {
        font-size: 80%;
        padding: 6px;
        padding-left: 32px;
      }
    }
  }
}

</style>
