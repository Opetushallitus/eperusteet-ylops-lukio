<template>
<div class="content">
  <div v-if="hooks && !isLoading">
    <ep-editointi :hooks="hooks" v-model="editable" :validator="validator" type="opintojakso">
      <template slot="ohje" slot-scope="{ }">
        <div class="sidepad">
          <p v-html="$t('ohje-opintojakso')">
          </p>
          <p v-html="$t('ohje-opintojakso-saannot')">
          </p>
        </div>
      </template>
      <template slot="keskustelu" slot-scope="{ }">
      </template>
      <template slot="header" slot-scope="{ data }">
        <div class="nimi">{{ $kaanna(data.nimi) || $t('opintojakso') }}</div>
      </template>
      <template v-slot="{ data, validation, isEditing }">
        <div class="osio">
          <div class="row">
            <div class="col-md-6">
              <ep-form-content name="nimi">
                <ep-field
                  help="opintojakso-nimi-ohje"
                  v-model="data.nimi"
                  :validation="validation.nimi"
                  :is-header="false"
                  :is-editing="isEditing"></ep-field>
              </ep-form-content>
            </div>
            <div class="col-md-6">
              <ep-form-content name="koodi">
                <ep-field help="opintojakso-koodi-ohje" v-model="data.koodi" type="string" :validation="validation.koodi" :is-editing="isEditing" />
              </ep-form-content>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <ep-form-content name="oppiaineet">
                <ep-oppiaine-selector
                  v-if="isEditing"
                  :opetussuunnitelma-store="opetussuunnitelmaStore"
                  :ops-id="$route.params.id"
                  :validation="validation.oppiaineet"
                  :value="data.oppiaineet.map(x => x.koodi)"
                  @input="updateOppiaineet" />
                <div v-else>
                  <ul>
                    <li v-for="oa in data.oppiaineet" :key="oa.koodi">
                      {{ $kaanna(oppiaineetMap[oa.koodi].nimi) }}
                    </li>
                  </ul>
                </div>
              </ep-form-content>
            </div>
            <div class="col-md-6">
              <ep-form-content name="opintopisteet">
                <span>{{ laajuus }} {{ $t('opintopiste') }} ({{ $t('johdetaan-moduuleista') }})</span>
              </ep-form-content>
            </div>
          </div>
        </div>
        <hr/>
        <div class="osio" v-if="isEditing || data.moduulit.length > 0">
          <ep-collapse tyyppi="opintojakson-moduulit">
            <div class="alueotsikko" slot="header">{{ $t('opintojakson-moduulit') }}</div>
            <div class="oppiaineet" v-if="isEditing">
              <div v-for="oa in data.oppiaineet" :key="oa.koodi">
                <div>
                  <div class="d-flex moduuliotsikko">
                    <div class="flex-grow-1">
                      {{ $kaanna(oppiaineetMap[oa.koodi].nimi) }}
                    </div>
                    <ep-toggle @input="toggleLaajuus(oa, $event)" class="mb-2" :value="oa.isModuuliton">
                      <span class="label">
                        {{ $t('ilman-moduuleita') }}
                      </span>
                    </ep-toggle>
                  </div>
                  <div v-if="oa.isModuuliton">
                    <ep-form-content name="laajuus">
                      <ep-field
                        type="number"
                        help="oppainekohtainen-laajuus-opintojaksossa"
                        v-model="oa.laajuus"
                        :is-header="false"
                        :is-editing="isEditing"></ep-field>
                    </ep-form-content>
                  </div>
                  <div v-else>
                    <div class="moduulit">
                      <div class="moduuli" v-for="moduuli in oppiaineetMap[oa.koodi].moduulit" :key="moduuli.id">
                        <ep-opintojakson-moduuli
                          :moduuli="moduuli"
                          :is-editing="true"
                          v-model="data.moduulit" />
                      </div>
                    </div>
                    <div class="moduulikuvaukset mt-1 mb-5" v-if="isEditing">
                      <ep-color-ball kind="pakollinen" />
                      <span class="ml-2">{{ $t('pakollinen') }}</span>
                      <ep-color-ball class="ml-4" kind="valinnainen" />
                      <span class="ml-2">{{ $t('valinnainen') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="oppiaineet" v-if="!isEditing">
              <div class="moduulit" v-if="editable && editable.moduulit">
                <div class="moduuli" v-for="moduuli in editable.moduulit" :key="moduuli.koodiUri">
                  <ep-opintojakson-moduuli :moduuli="moduulitMap[moduuli.koodiUri]" :value="data.moduulit">
                  </ep-opintojakson-moduuli>
                </div>
              </div>
            </div>
            <div class="moduulilista" v-if="isEditing && editable.moduulit.length > 0">
              <h5>{{ $t('valitut-moduulit') }}</h5>
              <div v-for="(moduuli, idx) in editable.moduulit" :key="idx">
                <div class="d-flex">
                  <div class="p-2 flex-grow-1">
                    <fas class="checked" icon="check">
                    </fas>
                    <span class="nimi">{{ $kaanna(moduulitMap[moduuli.koodiUri].nimi) }}</span>
                  </div>
                  <div class="p-2">
                    <span class="laajuus">{{ moduulitMap[moduuli.koodiUri].laajuus }} {{ $t('opintopiste') }}</span>
                    <ep-color-ball :kind="moduulitMap[moduuli.koodiUri].pakollinen ? 'pakollinen' : 'valinnainen'" />
                  </div>
                </div>
              </div>
            </div>
          </ep-collapse>
        </div>
        <div class="osio">
          <ep-collapse tyyppi="opintojakson-tavoitteet">
            <div class="alueotsikko" slot="header">{{ $t('tavoitteet') }}</div>
            <div class="perustesisalto" v-for="(moduuli, idx) in data.moduulit" :key="idx">
              <div class="moduuliotsikko">{{ $kaanna(moduulitMap[moduuli.koodiUri].nimi) }}</div>
              <ep-prefix-list :value="moduulitMap[moduuli.koodiUri].tavoitteet" kohde="kohde" arvot="tavoitteet"></ep-prefix-list>
            </div>
            <div class="moduuliotsikko">{{ $t('paikallinen-lisays') }}</div>
            <div class="alert alert-info" v-if="!isEditing && data.tavoitteet && data.tavoitteet.length === 0">{{ $t('ei-paikallista-tarkennusta') }}</div>
            <ep-list
              :is-editable="isEditing"
              lisays="lisaa-tavoite"
              kentta="kuvaus"
              v-model="data.tavoitteet" />
          </ep-collapse>
        </div>

        <div class="osio">
          <ep-collapse tyyppi="opintojakson-keskeiset-sisallot">
            <div class="alueotsikko" slot="header">{{ $t('keskeiset-sisallot') }}</div>
            <div class="perustesisalto" v-for="(moduuli, idx) in data.moduulit" :key="idx">
              <div class="moduuliotsikko">{{ $kaanna(moduulitMap[moduuli.koodiUri].nimi) }}</div>
              <ep-prefix-list :value="moduulitMap[moduuli.koodiUri].sisallot" kohde="kohde" arvot="sisallot">
              </ep-prefix-list>
            </div>

            <div class="moduuliotsikko">{{ $t('paikallinen-lisays') }}</div>
            <div class="alert alert-info" v-if="!isEditing && data.keskeisetSisallot && data.keskeisetSisallot.length === 0">{{ $t('ei-paikallista-tarkennusta') }}</div>
            <ep-list
              :is-editable="isEditing"
              lisays="lisaa-keskeinen-sisalto"
              kentta="kuvaus"
              v-model="data.keskeisetSisallot" />
          </ep-collapse>
        </div>

        <div class="osio">
         <ep-collapse tyyppi="opintojakson-laaja-alaiset">
            <div class="alueotsikko" slot="header">{{ $t('laaja-alaiset-sisallot') }}</div>

            <div class="perustesisalto" v-for="(oppiaine, idx) in opintojaksonOppiaineet" :key="idx">
              <div v-if="oppiaine.laajaAlaisetOsaamiset && oppiaine.laajaAlaisetOsaamiset.kuvaus">
                <div class="moduuliotsikko" v-html="$kaanna(oppiaine.nimi)"></div>
                <ep-content
                  layout="normal"
                  :opetussuunnitelma-store="opetussuunnitelmaStore"
                  :value="oppiaine.laajaAlaisetOsaamiset.kuvaus"
                  help="ohje-lyhyt-laaja-alainen"></ep-content>
              </div>
              <!-- Todo: Tee parempi ratkaisu tähän -->
              <div v-else-if="oppiaine.laajaAlainenOsaaminen">
                <div class="moduuliotsikko" v-html="$kaanna(oppiaine.nimi)"></div>
                <ep-content layout="normal" :opetussuunnitelma-store="opetussuunnitelmaStore" :value="oppiaine.laajaAlainenOsaaminen"></ep-content>
              </div>
            </div>

            <div class="moduuliotsikko">{{ $t('paikallinen-lisays') }}</div>
            <div class="paikallinen-laaja-alainen" v-for="lo in data.laajaAlainenOsaaminen" :key="lo.koodi">
              <ep-collapse>
                <div slot="header" class="moduuliotsikko">
                  <span v-if="laajaAlaisetKooditByUri[lo.koodi]">
                    {{ $kaanna(laajaAlaisetKooditByUri[lo.koodi].nimi) }}
                  </span>
                  <b-button variant="link" @click.stop="poistaLaaja(lo)" v-if="isEditing">
                    <fas icon="times" />
                  </b-button>
                </div>
                <ep-content
                  layout="normal"
                  v-model="lo.kuvaus"
                  :is-editable="isEditing"></ep-content>
              </ep-collapse>
            </div>
            <div class="alert alert-info" v-if="!isEditing && data.laajaAlainenOsaaminen.length === 0">{{ $t('ei-paikallista-tarkennusta') }}</div>
            <b-dropdown v-if="isEditing" :text="$t('lisaa-laaja-alainen-osaaminen')" variant="primary">
              <b-dropdown-item-button
                @click="addLaaja(laaja)"
                v-for="laaja in laajaAlaistenKoodit"
                :key="laaja.koodi"
                :disabled="laaja.hasPaikallinenKuvaus">
                {{ $kaanna(laaja.nimi) }}
              </b-dropdown-item-button>
            </b-dropdown>
          </ep-collapse>
        </div>

        <div class="osio">
          <ep-collapse tyyppi="opintojakson-arviointi">
            <div class="alueotsikko" slot="header">{{ $t('opintojakson-arviointi') }}</div>

            <div class="perustesisalto" v-for="(oppiaine, idx) in opintojaksonOppiaineet" :key="idx">
              <div v-if="oppiaine.arviointi && oppiaine.arviointi.kuvaus">
                <div class="moduuliotsikko" v-html="$kaanna(oppiaine.nimi)"></div>
                <ep-content layout="normal" :opetussuunnitelma-store="opetussuunnitelmaStore" :value="oppiaine.arviointi.kuvaus"></ep-content>
              </div>
            </div>

            <div class="moduuliotsikko">{{ $t('paikallinen-lisays') }}</div>
            <div class="alert alert-info" v-if="!isEditing && !data.arviointi">{{ $t('ei-paikallista-tarkennusta') }}</div>
            <ep-content :opetussuunnitelma-store="opetussuunnitelmaStore" layout="normal" v-model="data.arviointi" :is-editable="isEditing"></ep-content>
          </ep-collapse>
        </div>

        <div class="osio">
          <ep-collapse tyyppi="opintojakson-vapaa-kuvaus">
            <div class="alueotsikko" slot="header">{{ $t('opintojakson-vapaa-kuvaus') }}</div>
            <div class="alert alert-info" v-if="!isEditing && !data.kuvaus">{{ $t('ei-kuvausta') }}</div>
            <ep-content :opetussuunnitelma-store="opetussuunnitelmaStore" layout="normal" v-model="data.kuvaus" :is-editable="isEditing" help="ohje-lyhyt-vapaa-kuvaus" ></ep-content>
          </ep-collapse>
        </div>
      </template>
    </ep-editointi>
  </div>
</div>
</template>

<script lang="ts">
import { Vue, Mixins, Component, Prop } from 'vue-property-decorator';
import EpCollapse from '@/components/EpCollapse/EpCollapse.vue';
import EpColorBall from '@/components/EpColorBall/EpColorBall.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpField from '@/components/forms/EpField.vue';
import EpFormContent from '@/components/forms/EpFormContent.vue';
import EpInput from '@/components/forms/EpInput.vue';
import EpList from '@/components/forms/EpList.vue';
import EpOppiaineSelector from '@/components/EpOppiaineSelector/EpOppiaineSelector.vue';
import EpPrefixList from '@/components/EpPrefixList/EpPrefixList.vue';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Lops2019OpintojaksonOppiaineDto, Lops2019ModuuliDto, Lops2019OpintojaksoDto, Lops2019OppiaineDto } from '@/tyypit';
import { PerusteCache } from '@/stores/peruste';
import EpOpsRoute from '@/mixins/EpOpsRoute';
import * as _ from 'lodash';
import EpOpintojaksonModuuli from './EpOpintojaksonModuuli.vue';
import { opintojaksoValidator } from '@/validators/opintojakso';
import { Kielet } from '@shared/stores/kieli';
import * as defaults from '@/defaults';
import { getLaajaAlaisetKoodit } from '@/utils/perusteet';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { koodiSorters } from '@/utils/perusteet';


@Component({
  components: {
    EpCollapse,
    EpColorBall,
    EpContent,
    EpEditointi,
    EpField,
    EpFormContent,
    EpInput,
    EpList,
    EpOpintojaksonModuuli,
    EpOppiaineSelector,
    EpPrefixList,
    EpToggle,
  },
})
export default class RouteOpintojakso extends Mixins(EpOpsRoute) {
  @Prop({ required: false })
  private oppiaineUri!: string;

  private oppiaineQuery = '';
  private editable: Lops2019OpintojaksoDto | null = null;
  private cache!: PerusteCache;
  private hooks: EditointiKontrolliConfig = {
    editAfterLoad: this.isUusi,
    remove: this.remove,
    source: {
      save: this.save,
      load: this.load,
    },
    history: {
      revisions: this.revisions,
    },
  };

  async remove(data: any) {
    if (await this.vahvista()) {
      await this.store.removeOpintojakso(data.id);
      this.$router.push({
        name: 'oppiaineet',
      });
    }
  }

  async isUusi() {
    return this.$route.params.opintojaksoId === 'uusi';
  }

  async revisions() {
    if (await this.isUusi()) {
      return [];
    }
    else {
      return this.store.getOpintojaksoHistoria(_.parseInt(this.$route.params.opintojaksoId));
    }
  }

  async init() {
    this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
  }

  get validator() {
    return opintojaksoValidator([
      Kielet.getSisaltoKieli, // Validoidaan kentät sisältökielen mukaan
    ]);
  }

  get laajaAlaistenKoodit() {
    const lisatyt = _.map(this.editable!.laajaAlainenOsaaminen!, 'koodi');
    return _.map(getLaajaAlaisetKoodit(), lo => ({
      ...lo,
      hasPaikallinenKuvaus: _.includes(lisatyt, lo.koodi),
    }));
  }

  get laajaAlaisetKooditByUri() {
    return _.keyBy(this.laajaAlaistenKoodit, 'koodi');
  }

  get paikallisetOppiaineet() {
    return _.chain(this.store.paikallisetOppiaineet)
      .filter('koodi')
      .map((oa) => {
        return {
          ...oa,
          koodi: {
            uri: oa.koodi,
          }
        };
      })
      .value();
  }

  get oppiaineet() {
    return [
      ...this.cache.peruste.oppiaineet,
      ...this.paikallisetOppiaineet
    ] as Lops2019OppiaineDto[];
  }

  get laajuus() {
    let result: number = _.chain(this.editable!.oppiaineet)
      .filter('laajuus')
      .map('laajuus')
      .map(_.parseInt)
      .sum()
      .value();
    if (this.editable && this.editable.moduulit && !_.isEmpty(this.editable.moduulit)) {
      result += _.chain(this.editable.moduulit)
        .map('koodiUri')
        .map((uri: string) => this.moduulitMap[uri].laajuus)
        .map(_.parseInt)
        .sum()
        .value();
    }
    return result;
  }

  get oppiaineetMap() {
    return _.keyBy(this.oppiaineetJaOppimaarat, 'koodi.uri');
  }

  get moduulit() {
    return _.chain(this.oppiaineetJaOppimaarat)
      .map((oa) => _.map(oa.moduulit, (moduuli) => ({
        ...moduuli,
        oppiaineUri: oa.koodi!.uri,
      })))
      .flatten()
      .sortBy(...koodiSorters())
      .value() as (Lops2019ModuuliDto & { oppiaineUri: string })[];
  }

  get moduulitMap() {
    return _.chain(this.moduulit)
      .keyBy('koodi.uri')
      .value();
  }

  get oppiaineetJaOppimaarat() {
    return _.chain(this.oppiaineet)
      .map((oa: any) => [oa, ..._.map(oa.oppimaarat, om => ({
        ...om,
        parentUri: oa.koodi.uri,
      }))])
      .flatten()
      .map((oa: Lops2019OppiaineDto) => {
        return {
          ...oa,
          moduulit: _.sortBy(oa.moduulit, ...koodiSorters()),
        };
      })
      .value() as (Lops2019OppiaineDto & { parentUri?: string })[];
  }

  get filteredOppiaineet() {
    return _.chain(this.oppiaineetJaOppimaarat)
      .filter((org) => Kielet.search(this.oppiaineQuery, org.nimi))
      .map('koodi.uri')
      .value();
  }

  get opintojaksonOppiaineet() {
    return _.chain(this.editable!.oppiaineet)
      .map(({ koodi }) => koodi)
      .sortBy(...koodiSorters() as any[])
      .uniq()
      .map((uri: string) => {
        if (this.oppiaineetMap[uri].parentUri) {
          return [this.oppiaineetMap[uri].parentUri, uri];
        }
        else {
          return [uri];
        }
      })
      .flatten()
      .map((uri: string) => this.oppiaineetMap[uri])
      .value() as Lops2019OppiaineDto[];
  }

  get oppiaineidenTavoitteet() {
    interface Tavoitteet {
      nimi: any;
      tavoitteet: any;
    }

    if (_.isEmpty(this.editable!.moduulit)) {
      return _.chain(this.opintojaksonOppiaineet)
        .map(oa => {
          return {
            kind: 'oppiaine',
            nimi: oa.nimi,
            tavoitteet: oa.tavoitteet,
          };
        })
        .value();
    }
    else {
      return _.chain(this.editable!.moduulit)
        .map((moduuli: Lops2019ModuuliDto) => {
          return {
            kind: 'moduuli',
            nimi: moduuli.nimi,
            kuvaus: null,
            tavoitteet: moduuli.tavoitteet,
          };
        })
        .value();
    }
  }

  get laajaAlaisetOsaamiset() {
    return _.chain(this.opintojaksonOppiaineet)
      .filter((oa: any) => oa.laajaAlaisetOsaamiset && oa.laajaAlaisetOsaamiset.kuvaus)
      .value();
  }

  private toggleLaajuus(oa, value) {
    oa.isModuuliton = value;
    if (value) {
      this.editable!.moduulit = _.reject(this.editable!.moduulit, moduuli => {
        return moduuli.koodiUri && this.moduulitMap[moduuli.koodiUri].oppiaineUri === oa.koodi;
      }) as any[];
    }
    else {
      oa.laajuus = 0;
    }
  }

  private async poistaLaaja(laaja) {
    if (await this.vahvista('vahvista-poisto')) {
      const filtered = _.reject(this.editable!.laajaAlainenOsaaminen!,
        (lo) => laaja.koodi === lo.koodi);
      Vue.set(this.editable!, 'laajaAlainenOsaaminen', filtered);
    }
  }

  private addLaaja({ koodi }) {
    this.editable!.laajaAlainenOsaaminen!.push({
      koodi,
    });
  }

  updateOppiaineet(koodit: string[]) {
    const vanhat = _.keyBy(this.editable!.oppiaineet, 'koodi');
    const koodiSet = _.keyBy(koodit);

    this.editable!.moduulit = _.filter(this.editable!.moduulit, moduuli => {
      return moduuli.koodiUri && !!koodiSet[this.moduulitMap[moduuli.koodiUri].oppiaineUri];
    }) as any[];

    this.editable!.oppiaineet = _.map(koodit, (koodi) => ({
      koodi,
      laajuus: vanhat[koodi] && vanhat[koodi].laajuus,
      isModuuliton: false,
    }));
  }

  public async load() {
    const { opintojaksoId } = this.$route.params;
    if (await this.isUusi()) {
      const result = defaults.opintojakso();
      const oaUri = _.get(this.$route, 'query.oppiaineet');
      if (oaUri) {
        result.oppiaineet!.push({
          koodi: oaUri,
          laajuus: null as any,
          isModuuliton: false,
        } as Partial<Lops2019OpintojaksonOppiaineDto>);
        delete this.$route.query.oppiaineet;
      }
      return result;
    }
    else {
      const opintojakso = await this.store.getOpintojakso(_.parseInt(opintojaksoId));
      _.forEach(opintojakso.oppiaineet, oa => {
        if (oa.laajuus) {
          (oa as any).isModuuliton = true;
        }
      });

      if (opintojakso) {
        this.breadcrumb('opintojakso', opintojakso.nimi);
      }
      return opintojakso;
    }
  }

  async save(opintojakso: Lops2019OpintojaksoDto) {
    _.forEach(opintojakso.oppiaineet, oa => {
      if (!(oa as any).isModuuliton) {
        oa.laajuus = null as any;
      }
    });

    if (await this.isUusi()) {
      const uusi = await this.store.addOpintojakso(opintojakso);
      this.$router.push({
        ...(this.$router.currentRoute as any),
        params: {
          ...this.$router.currentRoute.params,
          opintojaksoId: uusi.id,
        },
      });
    }
    else {
      await this.store.saveOpintojakso(opintojakso);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/_variables.scss";

/deep/ .nimi {
  font-size: 150%;
  font-weight: 600;
}

.moduulit {
  display: flex;
  flex-wrap: wrap;

  .moduuli {
    margin: 0 10px 10px 0;
  }
}

.liitetyt-moduulit {
  .taso {
    margin-left: 8px;
  }
}

hr.valiviiva {
  margin: 30px 0 30px 0;
}

.block-container {
  padding-top: 20px;
}

.collapse-container {
  padding-top: 30px;
  padding-bottom: 30px;

  div.ep-collapse {
    border-top: 1px solid #ccc;
    padding: 10px 10px 10px 0px;
  }

  div.ep-collapse:last-child {
    border-bottom: 1px solid #ccc;
  }
}


.osio {
  padding: 27px 0 0 0px;

  &:not(:first-child) {
    //margin: 27px 0 27px 0;
    // border-top: 1px solid #DADADA;
  }

  .paikallinen-laaja-alainen {
    margin-bottom: 20px;
  }

  .alueotsikko {
    color: #010013;
    font-size: 20px;
    margin-bottom: 24px;
  }

  .moduuliotsikko {
    font-size: 18px;
    color: #2B2B2B;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .perustesisalto {
    color: #2B2B2B;
    font-size: 16px;
    margin-bottom: 10px;
    padding-bottom: 5px;
  }
}

.moduulilista {
  margin-top: 27px;
  .checked {
    color: $blue-lighten-1;
  }

  span.nimi {
    padding: 5px;
  }

  span.laajuus {
    padding: 5px;
  }
}

.sidepad {
  padding: 8px;
}

</style>
