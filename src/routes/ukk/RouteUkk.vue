<template>
  <ep-main-view :tutoriaalistore="tutoriaalistore">
    <template slot="icon">
      <ep-icon class="float-right" icon="question" background-color="#CE52C6"></ep-icon>
    </template>

    <!-- Rajaimet-->
    <template slot="header">
      <h2>{{ $t('ukk') }}</h2>
      <p>{{ $t('ukk-kuvaus-nakyma') }}</p>
      <ep-spinner v-if="isLoading"></ep-spinner>
      <div v-else>
        <ep-search v-model="rajain" class="mb-3"></ep-search>
        <p>{{ $t('ukk-luoja-rajaus') }}:</p>
        <div class="form-check form-check-inline" v-for="(org, idx) in organisaatiot" :key="idx">
          <ep-toggle v-model="org.$checked" :id="org.oid">{{ $kaanna(org.nimi) }}</ep-toggle>
        </div>
        <p>
          <ep-button v-oikeustarkastelu="'tilanvaihto'" class="float-right" variant="outline-primary" icon="plus" @click="startKysymysModal(null)">
            {{ $t('lisaa-uusi-kysymys') }}
          </ep-button>
        </p>
      </div>
    </template>

    <!-- Kysymykset-->
    <template slot="custom-content">
      <div v-if="!isLoading">
        <div class="row" v-for="kysymys in kysymyksetFormatted" :key="kysymys.id">
          <div class="col">
            <div class="float-right">
              <button class="btn btn-link" @click="startKysymysModal(kysymys)">
                <fas icon="pen">
                </fas>
              </button>
              <button class="btn btn-link" @click="startRemoveKysymys(kysymys)">
                <fas icon="times">
                </fas>
              </button>
            </div>
            <div>
              <p class="text-secondary">
                {{ $ago(kysymys.luotu) }}
              </p>
              <h5 v-html="$kaanna(kysymys.kysymys)"></h5>
              <p class="text-secondary">
                <ep-content layout="simplified" :value="kysymys.vastaus"></ep-content>
              </p>
              <hr />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Kysymyksen poiston vahvistus modal-->
    <b-modal class="backdrop" id="removeKysymys" ref="removeKysymys" @ok="deleteKysymys" :lazy="true" size="lg">
      <span class="mr-2">{{ $t('haluatko-poistaa-kysymyksen') }}</span>
      <template slot="modal-cancel">{{ $t('peruuta') }}</template>
      <template slot="modal-ok">{{ $t('poista') }}</template>
    </b-modal>

    <!-- Kysymyksen luomisen ja muokkaamisen modaali-->
    <template slot="after">
      <b-modal class="backdrop" id="createUpdateKysymys" ref="createUpdateKysymys" @ok="createUpdateKysymys" :no-close-on-backdrop="true" :no-enforce-focus="true" :lazy="true" :ok-disabled="validation.$invalid" size="lg">
        <template slot="modal-title">
          <span class="mr-2">{{ kysymys.$uusi ? $t('lisaa-uusi-kysymys') : $t('muokkaa-kysymys') }}</span>
          <!-- Sisällön kieli-->
          <b-dropdown class="float-right" size="sm">
            <template slot="button-content">
              <span>{{ $t("kieli-sisalto") }}: {{ sisaltoKieli }}</span>
            </template>
            <b-dropdown-item @click="valitseSisaltoKieli(kieli)" v-for="kieli in sovelluksenKielet" :key="kieli" :disabled="kieli === sisaltoKieli">{{ kieli }}</b-dropdown-item>
          </b-dropdown>
        </template>
        <ep-form-content name="kysymys-nimi">
          <ep-content v-model="kysymys.kysymys" help="kysymys-nimi-ohje" layout="simplified" :validation="validation.kysymys" :is-editable="true">
          </ep-content>
        </ep-form-content>
        <ep-form-content name="kysymys-vastaus">
          <ep-content v-model="kysymys.vastaus" help="kysymys-vastaus-ohje" layout="simplified" :validation="validation.vastaus" :is-editable="true">
          </ep-content>
        </ep-form-content>
        <ep-form-content name="nayta-organisaatioissa">
          <ep-select
            v-model="kysymys.organisaatiot"
            help="kysymys-organisaatiot-ohje"
            :validation="validation.organisaatiot"
            :is-editing="true"
            :items="organisaatiot"
            :multiple="true">
            <template slot-scope="{ item }">
              <span>{{ $kaanna(item.nimi) }}</span>
            </template>
          </ep-select>
        </ep-form-content>
        <template slot="modal-cancel">{{ $t('peruuta') }}</template>
        <template slot="modal-ok">{{ kysymys.$uusi ? $t('lisaa-kysymys') : $t('tallenna') }}</template>
      </b-modal>
    </template>
  </ep-main-view>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { validationMixin } from 'vuelidate';
import EpRoute from '@/mixins/EpRoot';
import EpContent from'@/components/EpContent/EpContent.vue';
import EpButton from'@shared/components/EpButton/EpButton.vue';
import EpFormContent from'@/components/forms/EpFormContent.vue';
import EpIcon from'@/components/EpIcon/EpIcon.vue';
import EpMainView from'@/components/EpMainView/EpMainView.vue';
import EpSearch from'@/components/forms/EpSearch.vue';
import EpSelect from'@/components/forms/EpSelect.vue';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import { Kysymykset, Ulkopuoliset } from '@/api';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import { Kieli, KysymysDto } from '@/tyypit';
import { kysymysValidator } from '@/validators/ukk';
import { organizations } from '@/utils/organisaatiot';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';
import EpToggle from'@shared/components/forms/EpToggle.vue';


export interface KysymysLaajennettuDto extends KysymysDto {
  $uusi?: boolean;
}

@Component({
  directives: {
    oikeustarkastelu,
  },
  components: {
    EpButton,
    EpContent,
    EpFormContent,
    EpIcon,
    EpMainView,
    EpSearch,
    EpSelect,
    EpSpinner,
    EpToggle,
  },
  validations() {
    return {
      kysymys: {
        ...(this as any).validator,
      },
    };
  },
} as any)
export default class RouteUkk extends Mixins(EpRoute, validationMixin) {
  rajain = '';
  kysymykset: KysymysLaajennettuDto[] = [];
  orgs: any[] = [];
  kysymys: KysymysLaajennettuDto = {
    $uusi: true,
    organisaatiot: []
  };

  @Prop()
  private tutoriaalistore!: TutoriaaliStore;

  async mounted() {
    this.kysymykset = (await Kysymykset.getKysymykset() as any).data;

    // Haetaan käyttäjän organisaatiot
    const orgs = (await Ulkopuoliset.getUserOrganisations() as any).data;

    if (!_.find(orgs, o => o.oid === organizations.oph.oid)) {
      orgs.push(organizations.oph);
    }

    // Ei rajausta oletuksena
    _.each(orgs, o => {
      o.$checked = true;
    });

    this.orgs = orgs;
  }

  get validator() {
    return kysymysValidator([
      Kielet.getSisaltoKieli, // Validoidaan kentät sisältökielen mukaan
    ]);
  }

  get validation() {
    return (this as any).$v.kysymys;
  }

  get kysymyksetFormatted() {
    return _(this.kysymykset)
      // Suodata kysymyksellä
      .filter((k: any) => _.includes(
        _.toLower(_.get(k, 'kysymys.' + Kielet.getSisaltoKieli)),
        _.toLower(this.rajain)
      ))
      // Suodata organisaatiolla
      .filter((k: any) => {
        // Tehdään lista valituista organisaatioista
        const checked: string[] = [];
        _.each(this.organisaatiot, org => {
          if (org.$checked) {
            checked.push(org.oid);
          }
        });

        // Tarkistetaan, löytyykö organisaatio haettavien joukosta
        let found = false;
        const kOrgs = _.map(k.organisaatiot, 'oid');
        _.each(checked, oid => {
          found = found || _.includes(kOrgs, oid);
        });

        return found;
      })
      .sortBy((k: any) => -k.luotu) // Laskeva järjestys
      .value();
  }

  get organisaatiot() {
    return _.sortBy(this.orgs, o => _.get(o, 'nimi.' + Kielet.getSisaltoKieli));
  }

  get organisaatiotOptions() {
    return _.map(this.organisaatiot, o => _.get(o, 'nimi.' + Kielet.getSisaltoKieli));
  }

  // Luodaan uusi kysymys tai muokataan kysymystä riippuen tilanteesta
  async createUpdateKysymys(event: any) {
    event.preventDefault(); // Piilotetaan modaali myöhemmin
    try {
      if (this.kysymys.id) {
        // Muokataan olemassa olevaa
        const res = (await Kysymykset.updateKysymys(this.kysymys.id, (this as any).kysymys) as any).data;
        _.remove(this.kysymykset, k => k.id === res.id);
        this.kysymykset.push(res);
      }
      else {
        // Luodaan uusi kysymys
        const res = (await Kysymykset.createKysymys((this as any).kysymys) as any).data;
        this.kysymykset.push(res);
      }
      (this as any).$refs.createUpdateKysymys.hide();
    }
    catch (e) {
      // Todo: Tallentaminen epäonnistui
    }
  }

  // Poistetaan olemassa oleva kysymys
  async deleteKysymys() {
    if (!this.kysymys || !this.kysymys.id) {
      return;
    }

    try {
      (await Kysymykset.deleteKysymys(this.kysymys.id));
      _.remove(this.kysymykset, k => k.id === this.kysymys.id);
      // Reaktiivisuus täytyy hoitaa käsin tässä tilanteessa
      this.kysymykset = [
        ...this.kysymykset
      ];
    }
    catch (e) {
      // Todo: Poistaminen epäonnistui
    }
  }

  // Aloitetaan kysymyksen muokkaamisen modaali
  startKysymysModal(kysymys: KysymysLaajennettuDto | null) {
    if (kysymys) {
      this.kysymys = {
        $uusi: false,
        ..._.cloneDeep(kysymys)
      };
    }
    else {
      this.kysymys = {
        organisaatiot: [],
        $uusi: true
      };
    }
    (this as any).$refs.createUpdateKysymys.show();
  }

  // Aloitetaan kysymyksen poiston modaali
  startRemoveKysymys(kysymys: KysymysLaajennettuDto) {
    this.kysymys = {
      $uusi: false,
      ..._.cloneDeep(kysymys)
    };
    (this as any).$refs.removeKysymys.show();
  }

  // TODO: tämä voisi olla oma komponentti
  // Modaalin kielivalitsimen metodit
  get sisaltoKieli() {
    return Kielet.getSisaltoKieli;
  }

  get sovelluksenKielet() {
    return UiKielet;
  }

  valitseSisaltoKieli(kieli: Kieli) {
    Kielet.setSisaltoKieli(kieli);
  }
}
</script>

<style scoped lang="scss">

.qty {
  user-select: all;
}

.btn-link {
  text-decoration: none;
}

</style>
