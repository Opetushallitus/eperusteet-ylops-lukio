<template lang="pug">
.kasitteet
  .ylapaneeli
    h2.otsikko {{ $t('kasitteet') }}

  ep-spinner(v-if="isLoading")
  div.sisalto(v-else)
    .otsikko-toiminnot
      ep-search.mb-3(v-model="hakusana")
      .lisaysnappi
        button(@click="avaaMuokkausModal(null)")
          fas.mr-2(icon="plus-circle")
          span {{ $t('lisaa-kasite') }}

    .kasitelista
      .kasite(v-for="k in suodatettuTermisto")
        ep-content.termi(:class="{ closed: k.closed, open: !k.closed }", :value="k.kasite.termi")
        ep-content.selitys(:class="{ closed: k.closed, open: !k.closed }", :value="k.kasite.selitys")
        .toiminnot
          button.btn.btn-link(@click="avaaPoistoModal(k.kasite)")
            fas(:icon="['far','trash-alt']", fixed-width)
          button.btn.btn-link(@click="avaaMuokkausModal(k.kasite)")
            fas(icon="pen" fixed-width)
          button.btn.btn-link(@click="k.closed = !k.closed")
            fas(icon="chevron-down", v-if="k.closed", fixed-width)
            fas(icon="chevron-up", v-else, fixed-width)

  // Käsitteen poisto modal
  b-modal.backdrop(
    id="kasitteenPoistoModal",
    ref="kasitteenPoistoModal",
    @ok="poistaKasite",
    :lazy="true",
    size="lg")
    span.mr-2 {{ $t('haluatko-poistaa-kasitteen') }}
    template(slot="modal-cancel") {{ $t('peruuta') }}
    template(slot="modal-ok") {{ $t('poista') }}

  // Käsitteen luomisen ja muokkaamisen modaali
  b-modal.backdrop(
    id="kasitteenLuontiModal",
    ref="kasitteenLuontiModal",
    @ok="tallennaKasite",
    :no-close-on-backdrop="true",
    :no-enforce-focus="true",
    :lazy="true",
    :ok-disabled="validation.$invalid",
    size="lg")
    template(slot="modal-title")
      span.mr-2 {{ kasite.id ? $t('muokkaa-kasitetta') : $t('lisaa-uusi-kasite') }}
      // Sisällön kieli
      b-dropdown.float-right(size="sm")
        template(slot="button-content")
          span {{ $t("kieli-sisalto") }}: {{ sisaltoKieli }}
        b-dropdown-item(
          @click="valitseSisaltoKieli(kieli)",
          v-for="kieli in sovelluksenKielet",
          :key="kieli",
          :disabled="kieli === sisaltoKieli") {{ kieli }}
    ep-form-content(name="kasite-termi")
      ep-input(
        v-model="kasite.termi",
        type="localized",
        help="kasite-termi-ohje",
        :validation="validation.termi",
        :is-editing="true")
    ep-form-content(name="kasite-selitys")
      ep-content(
        v-model="kasite.selitys",
        help="kasite-selitys-ohje",
        :validation="validation.selitys",
        :is-editable="true")
    ep-form-content(name="alaviite")
      ep-toggle(v-model="kasite.alaviite") {{ $t('merkitse-kasite-alaviitteeksi') }}
    template(slot="modal-cancel") {{ $t('peruuta') }}
    template(slot="modal-ok") {{ kasite.id ? $t('tallenna') : $t('lisaa-kasite') }}

</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss" scoped></style>
