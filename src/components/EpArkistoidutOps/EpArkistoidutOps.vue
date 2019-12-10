<template>
<div>
  <ep-button v-b-modal.arkistoidutopetussuunnitelmatmodal variant="link">
    <fas class="mr-2" :icon="['far', 'folder']" >
    </fas>
    <span>{{ $t(title) }}</span>
  </ep-button>
  <b-modal ref="arkistoidutOpsModal" id="arkistoidutopetussuunnitelmatmodal" size="lg" ok-only>
    <template v-slot:modal-title>
      {{ $t(title) }} ({{arkistoidut.length}})
    </template>

    <div class="search">
      <ep-search v-model="query" />
    </div>
    <b-table borderless striped :items="arkistoidut" :fields="fields" :current-page="currentPage" :per-page="perPage">

      <template v-slot:cell(nimi)="data">
        {{ $kaanna(data.value) }}
      </template>

      <template v-slot:cell(muokattu)="data">
        {{ $sdt(data.value) }}
      </template>

      <template v-slot:cell(siirtyminen)="data">
        <router-link tag="a" :to="{ name: 'opsTiedot', params: { id: data.value } }" :key="data.value"> {{ $t('siirry-tarkastelemaan') }}</router-link>
      </template>

    </b-table>

    <b-pagination
      v-model="currentPage"
      :total-rows="arkistoidut.length"
      :per-page="perPage"
      aria-controls="arkistoidut-opetussuunnitelmat"
      align="center">
    </b-pagination>

    <template v-slot:modal-ok>
      {{ $t('valmis')}}
    </template>

  </b-modal>
</div>
</template>

<script lang="ts">
import { Prop, Component, Vue, Mixins } from 'vue-property-decorator';
import EpButton from '@/components/EpButton/EpButton.vue';
import _ from 'lodash';
import { OpetussuunnitelmaInfoDto } from '../../generated';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import { Kielet } from '@shared/stores/kieli';

@Component({
  components: {
    EpButton,
    EpSearch,
  },
})
export default class EpArkistoidutOps extends Vue {

  @Prop()
  private opetussuunnitelmat!: OpetussuunnitelmaInfoDto[];

  @Prop()
  private title!: string;

  private query = '';
  private currentPage = 1;
  private perPage = 10;

  get arkistoidut() {
    return _.chain(this.opetussuunnitelmat)
      .map((ops) => ({
        nimi: ops.nimi,
        muokattu: ops.muokattu,
        arkistoija: ops.muokkaaja,
        siirtyminen: ops.id,
      }))
      .filter(ops => Kielet.search(this.query, ops.nimi))
      .orderBy('muokattu', 'desc')
      .value();
  }

  get fields() {
    return [{
      key: 'nimi',
      label: this.$t('ops-nimi'),
    }, {
      key: 'muokattu',
      label: this.$t('poistettu'),
      sortable: true,
    }, {
      key: 'arkistoija',
      label: this.$t('arkistoija'),
      sortable: true,
    }, {
      key: 'siirtyminen',
      label: '',
    }];
  }
}

</script>

<style scoped lang="scss">

</style>
