import { Configuration } from '@/generated/configuration';
import axios, { AxiosInstance } from 'axios';
import {
  BaseAPI,
  OpetussuunnitelmatApi,
} from '@/generated/api';

type FactoryFn<T> = (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) => T;

const basePath = '';
const ax = axios.create({
  baseURL: '/eperusteet-ylops-service/api',
});

// https://github.com/Microsoft/TypeScript/issues/20719
type BaseAPIConstructor<T> = new(configuration?: Configuration, basePath?: string, axios?: AxiosInstance) => T;

function initApi<T>(t: BaseAPIConstructor<T>): T {
  return new t({ basePath }, basePath, ax);
}


export const Api = ax;
export const Opetussuunnitelmat = initApi(OpetussuunnitelmatApi);


// Types (just use vim to edit this)
export {
  AihekokonaisuudetDto,
  AihekokonaisuusDto,
  DokumenttiDto,
  JarjestysDto,
  JsonNode,
  KayttajanTietoDto,
  KeskeinenSisaltoalueDto,
  KommenttiDto,
  KoodistoDto,
  KoodistoKoodiDto,
  KoodistoMetadataDto,
  LaajaalainenosaaminenDto,
  LiiteDto,
  LokalisoituTekstiDto,
  Matala,
  OhjeDto,
  OpetuksenKeskeinensisaltoalueDto,
  OpetuksenKohdealueDto,
  OpetuksenTavoiteDto,
  OpetuksenYleisetTavoitteetDto,
  OpetussuunnitelmaBaseDto,
  OpetussuunnitelmaDto,
  OpetussuunnitelmaInfoDto,
  OpetussuunnitelmaJulkinenDto,
  OpetussuunnitelmaKevytDto,
  OpetussuunnitelmaLaajaDto,
  OpetussuunnitelmaLuontiDto,
  OpetussuunnitelmaNimiDto,
  OpetussuunnitelmaStatistiikkaDto,
  OppiaineDto,
  OppiaineLaajaDto,
  OppiaineSuppeaDto,
  OppiaineenVuosiluokkaDto,
  OppiaineenVuosiluokkaKevytDto,
  OppiaineenVuosiluokkakokonaisuusDto,
  OppiaineenVuosiluokkakokonaisuusSuppeaDto,
  OpsOppiaineDto,
  OpsOppiaineKevytDto,
  OpsOppiaineLaajaDto,
  OpsVuosiluokkakokonaisuusDto,
  OpsVuosiluokkakokonaisuusKevytDto,
  OrganisaatioDto,
  OrganisaatioLaajaDto,
  PerusopetuksenPerusteenSisaltoDto,
  PerusteDto,
  PerusteInfoDto,
  PerusteKeskeinensisaltoalueDto,
  PerusteKoulutusDto,
  PerusteLaajaalainenosaaminenDto,
  PerusteOpetuksenkohdealueDto,
  PerusteOpetuksentavoiteDto,
  PerusteOppiaineDto,
  PerusteOppiaineenVuosiluokkakokonaisuusDto,
  PerusteTavoitteenArviointiDto,
  PerusteTekstiKappaleDto,
  PerusteTekstiKappaleViiteDto,
  PerusteTekstiOsaDto,
  PerusteVersionDto,
  PerusteVuosiluokkakokonaisuudenLaajaalainenosaaminenDto,
  PerusteVuosiluokkakokonaisuusDto,
  PoistettuTekstiKappaleDto,
  Puu,
  Reference,
  RevisionDto,
  TavoitteenArviointiDto,
  TekstiKappaleDto,
  TekstiKappaleKevytDto,
  TekstiKappaleViiteKevytDto,
  TekstiosaDto,
  TermiDto,
  Validointi,
  Virhe,
  VuosiluokkakokonaisuusDto,
  VuosiluokkakokonaisuusSuppeaDto,
} from '@/generated/api';
