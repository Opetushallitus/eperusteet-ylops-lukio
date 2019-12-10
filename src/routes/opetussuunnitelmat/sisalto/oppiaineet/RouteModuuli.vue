<template lang="pug">

div.content
  ep-spinner(v-if="isLoading")
  div(v-if="!isLoading")
    h2 {{ $kaanna(moduuli.nimi) }} ({{ moduuli.koodi.arvo }})

    p.kuvaus(v-html="$kaanna(moduuli.kuvaus)")

    div.collapse-container
      ep-collapse(:first="true")
        h4(slot="header") {{ $t('yleiset-tavoitteet') }}
        ep-prefix-list(
          :value="moduuli.tavoitteet",
          kohde="kohde",
          arvot="tavoitteet")

      ep-collapse
        h4(slot="header") {{ $t('keskeiset-sisallot') }}
        ep-prefix-list(
          :value="moduuli.sisallot",
          kohde="kohde",
          arvot="sisallot")

      ep-spinner(v-if="!opintojaksot")
      ep-collapse(v-else-if="opintojaksot.length > 0")
        h4(slot="header") {{ $t('opintojaksot') }}
        div.block-container(v-for="opintojakso in opintojaksot", :key="opintojakso.id")
          .oj-content.pakollinen
            span.nimi
              router-link(:to=`{ name: 'opintojakso', params: { opintojaksoId: opintojakso.id } }`)
                | {{ $kaanna(opintojakso.nimi) }}
            span.pituus {{ opintojakso.laajuus }} {{ $t('opintopiste') }}

</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';
import EpButton from '@/components/EpButton/EpButton.vue';
import EpCollapse from '@/components/EpCollapse/EpCollapse.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpPrefixList from '@/components/EpPrefixList/EpPrefixList.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Lops2019ModuuliDto, Lops2019OpintojaksoDto } from '@/tyypit';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import { PerusteCache } from '@/stores/peruste';
import _ from 'lodash';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpEditointi,
    EpPrefixList,
    EpSpinner,
  },
})
export default class RouteOppiaine extends Mixins(EpRoute, EpOpsComponent) {
  private cache: PerusteCache | null = null;
  private moduuli: Lops2019ModuuliDto | null = null;
  private opintojaksot: Lops2019OpintojaksoDto[] = [];

  async init() {
    this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
    this.moduuli = await this.cache.getModuuli(
      _.parseInt(this.$route.params.oppiaineId),
      _.parseInt(this.$route.params.moduuliId));
    this.opintojaksot = await this.store.getOpintojaksot({
      moduuliUri: this.moduuli!.koodi!.uri as string,
    } as any);
    this.breadcrumb('moduuli', this.moduuli.nimi);
  }
}
</script>

<style lang="scss" scoped>
.content {
  padding: 20px;
}

.oj-content {
  border-radius: 30px;
  padding: 10px 20px;
  display: flex;
  margin-top: 5px;
  margin-bottom: 5px;
  background-color: #e4f3cf;

  &.pakollinen {
    background-color: #eaf5fe;
  }

  span.nimi {
    flex: 1 0 auto;
  }

  span.pituus {
    min-width: 4em;
  }

  span.tyyppi {
    min-width: 6em;
  }
}

p.kuvaus {
  margin-top: 40px;
}

.block-container {
  padding-top: 20px;
}

.collapse-container {
  padding-top: 30px;
  padding-bottom: 30px;

  div.ep-collapse {
    border-bottom: 1px solid #ccc;
    padding: 30px 10px 30px 0;
  }

  div.ep-collapse:last-child {
    border-bottom: none;
  }
}
</style>
