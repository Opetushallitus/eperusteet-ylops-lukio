import _ from 'lodash';
import { computed } from '@vue/composition-api';

import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Oppiaineet, Vuosiluokkakokonaisuudet, OpsVuosiluokkakokonaisuusKevytDto } from '@shared/api/ylops';

export class PerusopetusPaikallinenOppiaineStore implements IEditoitava {
  constructor(
    private opsId: number,
    private oppiaineId: number,
    private vuosiluokkakokonaisuus: OpsVuosiluokkakokonaisuusKevytDto,
    private vuosiluokkakokonaisuudet: OpsVuosiluokkakokonaisuusKevytDto[],
  ) {

  }

  async acquire() {
    return null;
  }

  async cancel() {
  }

  async editAfterLoad() {
    return false;
  }

  async history() {
  }

  async load() {
    const oppiaine = (await Oppiaineet.getOppiaine(this.opsId, this.oppiaineId)).data;
    const vuosiluokkakokonaisuus = _.find(oppiaine.vuosiluokkakokonaisuudet, [
      '_vuosiluokkakokonaisuus',
      this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus!['_tunniste'],
    ]);

    const opsVuosiluokkakokonaisuus = _.find(this.vuosiluokkakokonaisuudet, [
      'vuosiluokkakokonaisuus._tunniste',
      vuosiluokkakokonaisuus!['_vuosiluokkakokonaisuus'],
    ]);

    const perusteVuosiluokkakokonaisuus = (await Vuosiluokkakokonaisuudet
      .getVuosiluokkakokonaisuudenPerusteSisalto(
        this.opsId,
        opsVuosiluokkakokonaisuus!.vuosiluokkakokonaisuus!.id!
      )).data;

    const vuosiluokat = _.orderBy(vuosiluokkakokonaisuus?.vuosiluokat, 'vuosiluokka', 'asc');
    const perusteVuosiluokat = perusteVuosiluokkakokonaisuus.vuosiluokat;

    return {
      oppiaine,
      vuosiluokkakokonaisuus,
      vuosiluokat,
      valitutVuosiluokat: _.map(vuosiluokat, 'vuosiluokka'),
      perusteVuosiluokat: _(perusteVuosiluokat).sort(),
    };
  }

  async save(data) {
    data.oppiaine.vuosiluokkakokonaisuudet = [data.vuosiluokkakokonaisuus];
    const oppiaineenTallennus = {
      oppiaine: data.oppiaine,
      vuosiluokkakokonaisuusId: this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus?.id!,
      vuosiluokat: data.valitutVuosiluokat,
      tavoitteet: [],
    };
    return Oppiaineet.updateYksinkertainen(this.opsId, this.oppiaineId, oppiaineenTallennus);
  }

  async preview() {
    return null;
  }

  async release() {
  }

  async lock() {
    return null;
  }

  async restore() {
  }

  async revisions() {
    return [];
  }

  async start() {
  }

  public readonly validator = computed(() => {
    return {};
  });
}
