<template>
<div class="tekstiviite" v-if="hooks">
  <div class="kappale">
    <ep-editointi :hooks="hooks" type="tekstikappale">
      <template slot="ohje" slot-scope="{ isEditing, data }">
        <div class="sidepad">
          <p>{{ $t('ohje-tekstikapale') }}</p>
          <p>{{ $t('ohje-tekstikapale-perusteteksti') }}</p>
          <div class="ohjeet" v-if="data.ohjeet.length > 0">
            <div class="ohje" v-for="ohje in data.ohjeet" :key="ohje.id">
              <ep-content layout="normal" :opetussuunnitelma-store="opetussuunnitelmaStore" v-model="ohje.teksti" :is-editable="allowOhjeEdit && isEditing"> </ep-content>
            </div>
          </div>
        </div>
      </template>
      <template slot="keskustelu" slot-scope="{ }">
        <span>
        </span>
      </template>
      <template slot="header" slot-scope="{ isEditing, data }">
        <div class="otsikko">
          <ep-field v-if="data.tov.tekstiKappale" help="tekstikappale-nimi-ohje" v-model="data.tov.tekstiKappale.nimi" :is-header="true" :is-editing="isEditing && !data.tov.perusteTekstikappaleId"></ep-field>
        </div>
      </template>
      <template slot-scope="{ isEditing, data }">
        <div class="teksti">
          <span comment-uuid="data.tov.tekstiKappale.tunniste">
            <ep-collapse tyyppi="perusteteksti" v-if="(isEditing || data.tov.naytaPerusteenTeksti) && perusteenTeksti && perusteenTeksti.perusteenOsa">
              <h5 slot="header">{{ $t('perusteen-teksti') }}</h5>
              <p class="perusteteksti" v-html="$kaanna(perusteenTeksti.perusteenOsa.teksti)">
              </p>
              <div class="font-italic text-secondary" v-if="!isEditing && !$kaanna(perusteenTeksti.perusteenOsa.teksti)">{{ $t('perusteen-sisaltoa-ei-maaritetty') }}</div>
              <div v-if="isEditing">
                <ep-toggle v-model="data.tov.naytaPerusteenTeksti">{{ $t('nayta-perusteen-teksti') }}</ep-toggle>
              </div>
              <div class="spacing" />
            </ep-collapse>
            <ep-collapse v-if="alkuperainen && alkuperainen.tekstiKappale && (isEditing || data.tov.naytaPohjanTeksti)">
              <h5 slot="header">
                {{ $t('pohjan-teksti') }}
              </h5>
              <p class="perusteteksti" v-html="$kaanna(alkuperainen.tekstiKappale.teksti)" />
              <div v-if="isEditing">
                <ep-toggle v-model="data.tov.naytaPohjanTeksti">{{ $t('nayta-pohjan-teksti') }}</ep-toggle>
              </div>
              <div class="spacing" />
            </ep-collapse>
            <ep-collapse :disable-header="!data.tov.perusteTekstikappaleId">
              <template #header>
                <h5>{{ $t('paikallinen-teksti') }}</h5>
              </template>
              <ep-content layout="normal" :opetussuunnitelma-store="opetussuunnitelmaStore" v-model="data.tov.tekstiKappale.teksti" :is-editable="isEditing"> </ep-content>
              <ep-alert v-if="!isEditing && !$kaanna(data.tov.tekstiKappale.teksti)" :ops="false" :text="$t('paikallista-sisaltoa-ei-maaritetty')" />
            </ep-collapse>
          </span>
        </div>
      </template>
    </ep-editointi>
  </div>
</div>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';

import EpRoute from '@/mixins/EpRoute';

import EpRoot from '@/mixins/EpRoot';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import EpButton from'@/components/EpButton/EpButton.vue';
import EpCollapse from'@/components/EpCollapse/EpCollapse.vue';
import EpContent from'@/components/EpContent/EpContent.vue';
import EpEditointi from'@/components/EpEditointi/EpEditointi.vue';
import EpField from'@/components/forms/EpField.vue';
import EpFormContent from'@/components/forms/EpFormContent.vue';
import EpInput from'@/components/forms/EpInput.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';

import {
  Lops2019Perusteet,
  Ohjeet,
  OpetussuunnitelmanSisalto,
} from '@/api';

import {
  Puu,
  OhjeDto,
  PerusteTekstiKappaleViiteDto,
} from '@/tyypit';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpEditointi,
    EpFormContent,
    EpField,
    EpInput,
    EpAlert,
  },
})
export default class RouteTekstikappale extends Mixins(EpRoute, EpOpsComponent) {
  private ohjeet: OhjeDto[] = [];
  private perusteenTeksti: PerusteTekstiKappaleViiteDto | null = null;
  private alkuperainen: PerusteTekstiKappaleViiteDto | null = null;
  private nimi: any = {};


  private hooks: EditointiKontrolliConfig = {
    editAfterLoad: async () => this.isUusi(),
    source: {
      load: this.load,
      save: this.save,
    },
    remove: this.remove,
  };

  async remove(data: any) {
    await this.store.removeTeksti(data.tov);
    this.$router.push({
      name: 'opsTiedot',
    });
  }

  get isPohja() {
    return this.store.opetussuunnitelma!.tyyppi as string === 'pohja';
  }

  get allowOhjeEdit() {
    return this.isPohja;
  }

  get opsId() {
    return _.parseInt(this.$route.params.id);
  }

  get osaId(): number {
    return _.parseInt(this.$route.params.osaId);
  }

  async isUusi() {
    return this.$route.params.osaId === 'uusi';
  }

  private async load() {
    if (await this.isUusi()) {
      return {
        tov: {
          tekstiKappale: {
            nimi: {},
          },
        },
      };
    }
    else {
      const teksti = (await OpetussuunnitelmanSisalto.getTekstiKappaleViiteSyva(this.opsId, this.osaId)).data;
      const ohjeet = await Ohjeet.getTekstiKappaleOhje(teksti.tekstiKappale!.tunniste as string);
      try {
        this.alkuperainen = (await OpetussuunnitelmanSisalto.getTekstiKappaleViiteOriginal(this.opsId, this.osaId)).data;
      }
      catch (err) {}

      const result = {
        tov: _.omit(_.cloneDeep(teksti), 'lapset'),
        ohjeet: ohjeet.data || [],
      } as any;

      if (_.isEmpty(result.ohjeet)) {
        result.ohjeet.push({});
      }

      if (teksti.perusteTekstikappaleId) {
        this.perusteenTeksti = (await Lops2019Perusteet.getAllLops2019PerusteTekstikappale(this.opsId, teksti.perusteTekstikappaleId)).data as PerusteTekstiKappaleViiteDto;
      }
      this.breadcrumb('tekstikappale', teksti.tekstiKappale!.nimi);
      return result;
    }
  }

  siirry(uusi) {
    setTimeout(() => {
      this.$router.push({
        name: 'tekstikappale',
        params: {
          ...this.$route.params,
          osaId: '' + uusi.id,
        },
      });
    }, 300);
  }

  async save({ tov, ohjeet }) {
    if (await this.isUusi()) {
      const uusi = await this.store.addTeksti(tov, _.parseInt(this.$route.params.parentId));
      console.log('siirrytään', uusi);
      this.$nextTick(() => this.siirry(uusi));
    }
    else {
      await this.store.saveTeksti(tov);
      await Promise.all(_.map(ohjeet, (ohje) => this.store.saveOhje({
        ...ohje,
        kohde: tov.tekstiKappale.tunniste,
      })));
    }
  }

  async addAlikappale(parent: Puu) {
    const uusi = await this.store.addTeksti({}, parent.id);
    this.$nextTick(() => this.siirry(uusi));
  }

}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";
@import '@shared/styles/_mixins.scss';

.badges {
  .badge {
    margin: 4px;
  }
}

.tekstiviite {
  .kappale {
    .otsikko {
      margin-bottom: 0;
    }

    .teksti {
      margin-left: 0;
    }

    .infos {
      margin-bottom: 20px;

      .badges {
        .badge {
          margin: 0 4px 0 4px;
        }
      }
    }

    .spacing {
      margin-bottom: 40px;
    }

    .perusteteksti {

      @include teksti-sisalto;

      font-style: italic;
      font-size: 80%;
    }

    .ohjeet {
      .ohje {
        padding: 10px;
        margin-bottom: 10px;
        color: #555;
      }

      .ohje-perusteteksti {
        background: #F5FBF0;
      }

      .ohje-ohje {
        background: #FBF1FA;
      }
    }

  }

  .sidepad {
    padding: 8px;
  }

}
</style>
