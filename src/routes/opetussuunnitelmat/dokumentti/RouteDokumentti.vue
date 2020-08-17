<template>

  <div class="dokumentit">
    <div class="ylapaneeli d-flex align-items-center">
        <h2 class="otsikko">{{ $t('luo-pdf') }}</h2>
    </div>
    <div class="sisalto">
      <div class="mb-4">
        <h5>{{ $t('luo-ja-lataa-pdf') }}</h5>
        <p>{{ $t('luo-pdf-selite')}}</p>

        <div class="row pdf-box align-items-center justify-content-between" :class="dto && href ? 'luotu': 'ei-luotu'">
          <div class="col col-auto ikoni">
            <img src="../../../../public/img/icons/pdfkuva_lataus.svg" />
          </div>
          <div class="col-lg teksti">
            <span  v-if="dto && href">
              {{$kaanna(opetussuunnitelmanimi)}}.pdf
            </span>
            <span v-else>
              {{$t('pdf-tiedostoa-ei-ole-viela-luotu')}}
            </span>
          </div>
          <div class="col-sm-2 text-left luomisaika" v-if="dto && href">
            {{$t('luotu')}}: {{$sd(dto.valmistumisaika)}}
          </div>
          <div class="col-sm-2 text-left"  v-if="dto && href">
            <a class="btn btn-link pl-0" :href="href" target="_blank" rel="noopener noreferrer" variant="link">
              <fas class="mr-2" icon="silma"></fas>
              <span>{{ $t('esikatsele-ja-lataa') }}</span>
            </a>
          </div>
        </div>

        <div class="btn-group">
          <ep-button @click="createDocument" :disabled="isPolling" :show-spinner="isPolling" buttonClass="px-5"><span>{{ $t('luo-uusi-pdf') }}</span></ep-button>
        </div>
      </div>

      <div class="row">
        <div class="col kuvalataus">
          <ep-dokumentti-kuva-lataus tyyppi="kansikuva" :dto="dto" @saveImage="saveImage" @removeImage="removeImage"></ep-dokumentti-kuva-lataus>
        </div>
        <div class="col-4 text-center sijaintikuva">
          <div class="sijainti-topic">{{$t('sijainti')}}</div>
          <img src="../../../../public/img/icons/pdfkuva_etusivu.svg" />
        </div>
      </div>

       <div class="row">
        <div class="col kuvalataus">
          <ep-dokumentti-kuva-lataus tyyppi="ylatunniste" :dto="dto" @saveImage="saveImage" @removeImage="removeImage"></ep-dokumentti-kuva-lataus>
        </div>
        <div class="col-4 text-center sijaintikuva">
          <div class="sijainti-topic">&nbsp;</div>
          <img src="../../../../public/img/icons/pdfkuva_header.svg" />
        </div>
      </div>

       <div class="row">
        <div class="col kuvalataus">
          <ep-dokumentti-kuva-lataus tyyppi="alatunniste" :dto="dto" @saveImage="saveImage" @removeImage="removeImage"></ep-dokumentti-kuva-lataus>
        </div>
        <div class="col-4 text-center sijaintikuva">
          <div class="sijainti-topic">&nbsp;</div>
          <img src="../../../../public/img/icons/pdfkuva_alatunniste.svg"/>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Watch } from 'vue-property-decorator';

import { baseURL, Dokumentit, DokumentitParams, DokumenttiDto, DokumenttiDtoTilaEnum } from '@shared/api/ylops';
import { Kielet } from '@shared/stores/kieli';

import EpOpsRoute from '@/mixins/EpOpsRoute';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpDokumenttiKuvaLataus from './EpDokumenttiKuvaLataus.vue';
import { success, fail } from '@/utils/notifications';

@Component({
  components: {
    EpButton,
    EpFormContent,
    EpSpinner,
    EpDokumenttiKuvaLataus,
  },
})
export default class RouteDokumentti extends EpOpsRoute {
  private previewUrl = null;
  private dto: DokumenttiDto | null = null;
  private polling: any = null;
  private pollingFrequency = 1000;
  private href: string | null = null;

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  @Watch('kieli')
  private kieliChanged() {
    this.init();
  }

  get tilaFormatted() {
    if (this.dto) {
      return this.$t('dokumentti-' + _.kebabCase(this.dto.tila), {
        valmistumisaika: this.dto.valmistumisaika ? (this as any).$sdt(this.dto.valmistumisaika) : null,
      });
    }
    else {
      return this.$t('dokumentti-' + _.kebabCase(DokumenttiDtoTilaEnum.EIOLE));
    }
  }

  get isPolling() {
    return this.polling != null;
  }

  // Alustetaan komponentti
  async init() {
    this.previewUrl = null;
    this.dto = null;
    clearInterval(this.polling);
    this.polling = null;
    this.href = null;

    const res = await Dokumentit.getDokumenttiId(this.opsId, this.kieli);

    // Jos dokumentti löytyy, haetaan sen tila
    if (_.isNumber(res.data)) {
      const dokumenttiId = res.data;
      this.href = baseURL + DokumentitParams.get(_.toString(dokumenttiId)).url;
    }

    await this.getDokumenttiTila();
  }

  // Haetaan dokumentin tila ja päivitetään muuttujat
  private async getDokumenttiTila() {
    // Päivitetään dokumentin tila
    this.dto = (await Dokumentit.getDokumentti(this.opsId, this.kieli)).data;

    // Lopetetaan pollaaminen kun dokumentin luominen on päättynyt
    if (_.kebabCase(this.dto.tila) === _.kebabCase(DokumenttiDtoTilaEnum.EPAONNISTUI)
      || _.kebabCase(this.dto.tila) === _.kebabCase(DokumenttiDtoTilaEnum.VALMIS)) {
      clearInterval(this.polling);
      this.polling = null;

      if (_.kebabCase(this.dto.tila) === _.kebabCase(DokumenttiDtoTilaEnum.VALMIS) && this.dto.id) {
        this.href = baseURL + DokumentitParams.get(_.toString(this.dto.id)).url;
      }
      else if (_.kebabCase(this.dto.tila) === _.kebabCase(DokumenttiDtoTilaEnum.EPAONNISTUI)) {
        fail('pdf-tiedosto-luonti-epaonnistui');
      }
    }
  }

  // Luodaan uusi dokumentti
  private async createDocument() {
    // Lopetetaan aikaisempi pollaus
    clearInterval(this.polling);
    this.polling = true;

    // Lähetetään pyyntö taustapalveluun
    this.dto = (await Dokumentit.create(this.opsId, this.kieli)).data;

    // Ohitetaan ensimmäinen pollaus, koska paluuarvossa on jo tämänhetkinen tila
    setTimeout(() => {
      // Aloitetaan tilan pollaaminen
      this.polling = setInterval(() => {
        this.getDokumenttiTila();
      }, this.pollingFrequency);
    }, this.pollingFrequency);
  }

  // Tallennetaan uusi kansikuva
  private async saveImage(file, tyyppi) {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      this.dto = (await Dokumentit.addImage(this.opsId, tyyppi, this.kieli, formData)).data;
      success('pdf-tiedosto-kuva-lataus-onnistui');
    }
  }

  // Poistetaan kansikuva
  private async removeImage(tyyppi) {
    await Dokumentit.deleteImage(this.opsId, tyyppi, this.kieli);
    success('pdf-tiedosto-kuva-poisto-onnistui');
    if (this.dto) {
      this.dto[tyyppi] = undefined;
    }
  }

  destroyed() {
    clearInterval(this.polling);
  }

  get opetussuunnitelmanimi() {
    return this.ops.nimi;
  }
}

</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.dokumentit {
  margin-top: 4px;

  .ylapaneeli {
    border-bottom: 1px solid #eee;
    font-weight: 600;
    padding: 5px 15px 5px 15px;
    height: 50px;

    .otsikko {
      margin-bottom: 0;
    }
  }

  .sisalto {
    margin: 35px 50px 20px 15px;

    .pdf-box {
      margin: 25px 0px;
      width: 100%;
      border-radius: 2px;
      padding: 25px;

      .ikoni {
        font-size: 1.5rem;
      }

      &.luotu {
        background-color: $gray-lighten-10;

        .ikoni {
          color: $blue-lighten-6;
        }

        @media(max-width: 575px) {

          .ikoni {
            display: none;
          }
        }

        .teksti {
          font-weight: 600;
        }
      }

      &.ei-luotu {
        border: 1px solid $gray-lighten-9;
        color: $gray-lighten-2;
        font-style: italic;
      }

    }

    @media(max-width: 575px) {

      .sijaintikuva {
        display:none;
      }

    }

    .kuvalataus {
      min-width: 300px;
    }

    .sijainti-topic {
      margin-bottom: 40px;
      font-weight: 600;
    }

  }
}

</style>
