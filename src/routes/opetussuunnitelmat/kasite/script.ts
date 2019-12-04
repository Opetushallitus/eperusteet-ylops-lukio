import _ from 'lodash';

import { Component } from 'vue-property-decorator';
import { validationMixin } from 'vuelidate';

import EpOpsRoute from '@/mixins/EpOpsRoute';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpFormContent from '@/components/forms/EpFormContent.vue';
import EpSearch from '@/components/forms/EpSearch.vue';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import EpInput from '@/components/forms/EpInput.vue';
import EpToggle from'@shared/components/forms/EpToggle.vue';
import { Termisto } from '@/api';

import { Kielet, UiKielet } from '@shared/stores/kieli';
import { Kieli, TermiDto } from '@/tyypit';
import { kasiteValidator } from '@/validators/kasite';

interface Kasite {
  kasite: TermiDto;
  closed: boolean;
}

@Component({
  components: {
    EpContent,
    EpFormContent,
    EpInput,
    EpSearch,
    EpSpinner,
    EpToggle,
  },
  mixins: [
    validationMixin,
  ],
  validations() {
    return {
      kasite: {
        ...(this as any).validator
      }
    };
  }
} as any)
export default class RouteKasite extends EpOpsRoute {
  private termisto: Kasite[] = [];
  private kasite: TermiDto = {};
  private hakusana: string = '';

  avaaMuokkausModal(kasite: TermiDto | null) {
    if (!kasite) {
      this.kasite = {
        termi: {},
      };
    }
    else {
      this.kasite = _.cloneDeep(kasite);
    }
    (this as any).$refs.kasitteenLuontiModal.show();
  }

  avaaPoistoModal(kasite) {
    this.kasite = _.cloneDeep(kasite);
    (this as any).$refs.kasitteenPoistoModal.show();
  }

  async poistaKasite() {
    if (!this.kasite || !this.kasite.id) {
      return;
    }

    try {
      await Termisto.deleteTermi(this.opsId, this.kasite.id);
      _.remove(this.termisto, k => k.kasite.id === this.kasite.id);
      this.termisto = [...this.termisto];
      await this.store.updateSisalto();
    }
    catch (err) {
      // Todo: Termin poisto epäonnistui
    }
  }

  makeKey(item) {
    var termi = _.first(_.compact(_.values(item.termi))) || '';
    return termi.replace(/[^a-zA-Z0-9]/g, '') + new Date().getTime();
  }

  async tallennaMuuttunut(kasiteId: number) {
    // Tallennetaan muokattu käsite
    const res = await Termisto.updateTermi(
      this.opsId,
      kasiteId,
      this.kasite
    );
    _.remove(this.termisto, termi => termi.kasite.id === kasiteId);
    this.termisto.push({
      closed: true,
      kasite: res.data,
    });
  }

  async tallennaUusi() {
    // Luodaan uusi käsite + lisätään sille avain
    if (!this.kasite.avain) {
      this.kasite.avain = this.makeKey(this.kasite);
    }
    const res = await Termisto.addTermi(this.opsId, this.kasite);
    this.termisto.push({
      closed: true,
      kasite: res.data,
    });
  }

  async tallennaKasite(e) {
    e.preventDefault();

    try {
      if (this.kasite.id) {
        await this.tallennaMuuttunut(this.kasite.id);
      }
      else {
        await this.tallennaUusi();
      }

      // Päivitetään OPS:n sisällä oleva käsitelista
      await this.store.updateSisalto();
      (this as any).$refs.kasitteenLuontiModal.hide();
    }
    catch (err) {
      // Todo: Tallennus epäonnistui
    }
  }

  async init() {
    try {
      const resp = await Termisto.getAllTermit(this.opsId);
      this.termisto = resp.data.map(kasite => {
        return { closed: true, kasite };
      });
    }
    catch (err) {
      // Todo: Termien lataus epäonnistui
    }
  }

  get suodatettuTermisto() {
    const hakutermi = _.toLower(this.hakusana);
    const kieli = Kielet.getSisaltoKieli;

    return this.termisto.filter(termi => _.includes(
      _.toLower(
        _.get(termi, 'kasite.termi.' + kieli) + ' ' + _.get(termi, 'kasite.selitys.' + kieli)
      ),
      hakutermi
    ));
  }

  get validator() {
    return kasiteValidator([
      Kielet.getSisaltoKieli, // Validoidaan kentät sisältökielen mukaan
    ]);
  }

  get validation() {
    return (this as any).$v.kasite;
  }

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
