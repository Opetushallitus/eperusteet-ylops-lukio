import { Termisto } from '@/api';
import { TermiDto, Lops2019PoistettuDto } from '@/tyypit';
import { UusiJulkaisuDto, Lops2019PaikallinenOppiaineDto, Matala, Lops2019OpintojaksoDto, OhjeDto, OpetussuunnitelmaDto, OpetussuunnitelmaKevytDto, Puu, TekstiKappaleViiteKevytDto } from '@/tyypit';
import { Lops2019, Ohjeet, OpetussuunnitelmanSisalto, Opintojaksot, Oppiaineet, Opetussuunnitelmat } from '@/api';
import { AxiosResponse } from 'axios';
import { createLogger } from '@shared/utils/logger';
import { State, Store } from '@shared/stores/store';
import { success, fail } from '@/utils/notifications';
import _ from 'lodash';

interface OpintojaksoQuery {
  oppiaineUri?: string;
  moduuliUri?: string;
}

const logger = createLogger('Opetussuunnitelma');


@Store
export class OpetussuunnitelmaStore {
  @State()
  public opsId: number;

  @State()
  public sisalto: TekstiKappaleViiteKevytDto | null = null;

  @State()
  public opetussuunnitelma: OpetussuunnitelmaKevytDto | null = null;

  @State()
  public paikallisetOppiaineet: Lops2019PaikallinenOppiaineDto[] = [];

  @State()
  public opintojaksot: Lops2019OpintojaksoDto[] = [];

  @State()
  public kasitteet: TermiDto[] = [];

  @State()
  public progress = 0;

  constructor(opsId: number) {
    this.opsId = opsId;
  }

  // Tekstikappaleet
  public async getOtsikot() {
    return (await OpetussuunnitelmanSisalto.getTekstiOtsikot(this.opsId)).data;
  }

  public async getKasitteet() {
    return (await Termisto.getAllTermit(this.opsId)).data || [];
  }

  public async updateSisalto() {
    this.sisalto = await this.getOtsikot();
    this.kasitteet = await this.getKasitteet();
  }

  public async init() {
    logger.info('Initing peruste store', this.opsId);
    this.opetussuunnitelma = await this.get();
    await this.updateSisalto();

    if ((this.opetussuunnitelma.toteutus as any) === 'lops2019') {
      this.opintojaksot = (await Opintojaksot.getAllOpintojaksot(this.opetussuunnitelma!.id!)).data;
      this.paikallisetOppiaineet = await this.getPaikallisetOppiaineet();
    }
  }

  public async get() {
    return (await Opetussuunnitelmat.getOpetussuunnitelma(this.opsId)).data;
  }

  public async save(opetussuunnitelma: OpetussuunnitelmaKevytDto) {
    const res = await Opetussuunnitelmat.updateOpetussuunnitelma(opetussuunnitelma.id as number, opetussuunnitelma as OpetussuunnitelmaDto);
    success('tallennus-onnistui-opetussuunnitelma');
    this.opetussuunnitelma = res.data as OpetussuunnitelmaKevytDto;
  }

  public async validate() {
    if ((this.opetussuunnitelma!.toteutus as any) === 'lops2019') {
      const result = (await Lops2019.getValidointi(this.opetussuunnitelma!.id!)).data;
      if (result) {
        const onnistuneet = result.onnistuneetValidoinnit;
        const kaikki = result.kaikkiValidoinnit;
        if (onnistuneet && kaikki) {
          this.progress = Math.floor(onnistuneet / kaikki * 100);
        }
      }
      return result;
    }

    return null;
  }

  public async removeTeksti(tov: Puu) {
    await OpetussuunnitelmanSisalto.removeTekstiKappaleViite(this.opetussuunnitelma!.id!, tov.id!);
  }

  public async addTeksti(tov: Puu, parentId?: number) {
    let osa: AxiosResponse<Matala>;
    if (parentId) {
      osa = await OpetussuunnitelmanSisalto.addTekstiKappaleLapsi(this.opetussuunnitelma!.id!, parentId, tov as Matala);
    }
    else {
      osa = await OpetussuunnitelmanSisalto.addTekstiKappale(this.opetussuunnitelma!.id!, tov as Matala);
    }
    success('lisays-onnistui-tekstikappale');
    await this.updateSisalto();
    return osa.data;
  }

  public static async updateOpsTila(opsId: number, uusiTila: string) {
    return await Opetussuunnitelmat.updateTila(opsId, uusiTila as any);
  }

  public async updateTila(uusiTila: string) {
    if (uusiTila) {
      await OpetussuunnitelmaStore.updateOpsTila(this.opetussuunnitelma!.id!, uusiTila as any);
      this.opetussuunnitelma = {
        ...this.opetussuunnitelma!,
        tila: uusiTila as any,
      };
    }
  }

  public async saveTeksti(tov: Puu) {
    await OpetussuunnitelmanSisalto.updateTekstiKappaleViite(this.opetussuunnitelma!.id!, tov.id!, tov);
    success('tallennus-onnistui-tekstikappale');
    await this.updateSisalto();
  }

  public async saveOhje(ohje: OhjeDto) {
    if (ohje.id) {
      const res = await Ohjeet.updateOhje(ohje.id, ohje);
      return res.data;
    }
    else {
      const res = await Ohjeet.addOhje(ohje);
      return res.data;
    }
  }

  // Julkaisut
  public async julkaise(julkaisu: UusiJulkaisuDto) {
    try {
      return (await Opetussuunnitelmat.julkaise(this.opetussuunnitelma!.id!, julkaisu)).data;
    }
    catch (err) {
      fail('julkaisu-epaonnistui', err.response.data.syy);
    }
  }

  // Lops 2021
  // Pilko omiin moduuleihin

  // Paikalliset oppiaineet
  public async addOppiaine(oppiaine: Lops2019PaikallinenOppiaineDto = {}) {
    const result = (await Oppiaineet.addLops2019PaikallinenOppiaine(this.opetussuunnitelma!.id!, oppiaine)).data;
    this.paikallisetOppiaineet = [...this.paikallisetOppiaineet, result];
    success('lisays-onnistui-oppiaine');
    return result;
  }

  public async getPaikallinenOppiaine(id: number) {
    return (await Oppiaineet.getLops2019PaikallinenOppiaine(this.opetussuunnitelma!.id!, id)).data;
  }

  public async getPaikallisetOppiaineet() {
    const paikalliset = (await Oppiaineet.getAllLops2019PaikallisetOppiainet(this.opetussuunnitelma!.id!)).data;
    return paikalliset;
  }

  public async savePaikallinenOppiaine(oppiaine: Lops2019PaikallinenOppiaineDto) {
    const result = (await Oppiaineet.updateLops2019PaikallinenOppiaine(this.opetussuunnitelma!.id!, oppiaine.id!, oppiaine)).data;
    success('tallennus-onnistui-oppiaine');
    const idx = _.findIndex(this.paikallisetOppiaineet, { id: result.id });
    this.paikallisetOppiaineet = [
      ..._.slice(this.paikallisetOppiaineet, 0, idx),
      result,
      ..._.slice(this.paikallisetOppiaineet, idx + 1),
    ];
    return result;
  }

  public async getJulkaisut() {
    return (await Opetussuunnitelmat.getJulkaisut(this.opetussuunnitelma!.id!)).data;
  }

  // Opintojaksot
  public async addOpintojakso(opintojakso: Lops2019OpintojaksoDto = {}) {
    const result = (await Opintojaksot.addOpintojakso(this.opetussuunnitelma!.id!, opintojakso)).data;
    success('lisays-onnistui-opintojakson');
    this.opintojaksot = [...this.opintojaksot, result];
    return result;
  }

  public async getOpintojaksot(query: OpintojaksoQuery = {}) {
    let chain = _((await Opintojaksot.getAllOpintojaksot(this.opetussuunnitelma!.id!)).data);
    if (query.oppiaineUri) {
      chain = chain.filter(oj => _.includes(_.map(oj.oppiaineet, 'koodi'), query.oppiaineUri));
    }
    if (query.moduuliUri) {
      chain = chain.filter(oj => _.includes(
        _.map(oj.moduulit, 'koodiUri'),
        query.oppiaineUri));
    }
    return chain.value();
  }

  public async getOpintojaksoHistoria(opintojaksoId: number) {
    return (await Opintojaksot.getVersionHistory(this.opetussuunnitelma!.id!, opintojaksoId)).data;
  }

  public async getOpintojakso(id: number) {
    return (await Opintojaksot.getOpintojakso(this.opetussuunnitelma!.id!, id)).data;
  }

  public async getPoistetut() {
    return (await Lops2019.getRemoved(this.opetussuunnitelma!.id!)).data;
  }

  public async palauta(poistettu: Lops2019PoistettuDto) {
    await Lops2019.palauta(this.opetussuunnitelma!.id!, poistettu.id!);
    success('palautus-onnistui');
    // this.opintojaksot = [...this.opintojaksot, result];
  }

  public async removeOppiaine(id: number) {
    await Oppiaineet.removeLops2019PaikallinenOppiaine(this.opetussuunnitelma!.id!, id);
    success('poisto-onnistui-oppiaineen');
    const idx = _.findIndex(this.opintojaksot, { id });
    this.opintojaksot = [
      ..._.slice(this.opintojaksot, 0, idx),
      ..._.slice(this.opintojaksot, idx + 1),
    ];
  }

  public async removeOpintojakso(id: number) {
    await Opintojaksot.removeOpintojakso(this.opetussuunnitelma!.id!, id);
    success('poisto-onnistui-opintojakson');
    const idx = _.findIndex(this.opintojaksot, { id });
    this.opintojaksot = [
      ..._.slice(this.opintojaksot, 0, idx),
      ..._.slice(this.opintojaksot, idx + 1),
    ];
  }

  public async saveOpintojakso(opintojakso: Lops2019OpintojaksoDto) {
    const result = (await Opintojaksot.updateOpintojakso(this.opetussuunnitelma!.id!, opintojakso.id!, opintojakso)).data;
    success('tallennus-onnistui-opintojakson');
    const idx = _.findIndex(this.opintojaksot, { id: result.id });
    this.opintojaksot = [
      ..._.slice(this.opintojaksot, 0, idx),
      result,
      ..._.slice(this.opintojaksot, idx + 1),
    ];
    return result;
  }
}

let opsServiceCache: OpetussuunnitelmaStore | null = null;

export function Opetussuunnitelma() {
  return opsServiceCache!;
}

export function getOpetussuunnitelmaService(id: number) {
  if (!opsServiceCache || opsServiceCache.opsId !== id) {
    opsServiceCache = new OpetussuunnitelmaStore(id);
  }
  return opsServiceCache;
}
