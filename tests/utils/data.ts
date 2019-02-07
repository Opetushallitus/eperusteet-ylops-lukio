import { AxiosResponse } from 'axios';
import {
  Oikeus,
  Oikeudet,
} from '@/stores/kayttaja';
import { KayttajanTietoDto } from '@/tyypit';
import _ from 'lodash';


export type TestiOikeudet = 'none' | 'luku' | 'muokkaus' | 'laadinta' | 'oph';


export function genKayttaja(): KayttajanTietoDto {
  return {
    kayttajanimi: 'keke',
    kutsumanimi: 'Keke',
    kieliKoodi: 'fi',
    sukunimi: 'Käyttäjä',
    oidHenkilo: '1234.567',
  };
}


export function genOikeudet(tyyppi: TestiOikeudet): Oikeudet {
  let opetussuunnitelma: Oikeus[] = [];
  let pohja: Oikeus[] = [];
  const kaikki: Oikeus[] = ['muokkaus', 'tilanvaihto', 'poisto', 'luku', 'kommentointi', 'luonti'];

  switch (tyyppi) {
    case 'oph': {
      pohja = kaikki;
      opetussuunnitelma = kaikki;
      break;
    }
    case 'laadinta':
      opetussuunnitelma.push('tilanvaihto');
    case 'muokkaus':
      opetussuunnitelma.push('luonti');
      opetussuunnitelma.push('poisto');
      opetussuunnitelma.push('muokkaus');
    case 'luku':
      opetussuunnitelma.push('luku');
  }

  return {
    opetussuunnitelma: _.uniq(opetussuunnitelma),
    pohja: _.uniq(pohja),
  };
}


export function defaultAxiosResponse<T>(): AxiosResponse<T> {
  return {
    data: {} as T,
    status: 200,
    statusText: '',
    config: {},
    headers: {},
  };
}

export async function makeAxiosResponse<T>(data: T, config = defaultAxiosResponse<T>()): Promise<AxiosResponse<T>> {
  return {
    ...config,
    data,
  };
}
