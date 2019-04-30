import { Lops2019ModuuliDto, Lops2019OpintojaksoDto, Lops2019PaikallinenOppiaineDto  } from '@/tyypit';


export function oppiaine(): Lops2019PaikallinenOppiaineDto {
  const oa = {
    nimi: {},
    tehtava: {},
    arviointi: {},
    laajaAlainenOsaaminen: {},
    tavoitteet: {
      tavoitealueet: [],
    },
  };
  return oa;
}


export function opintojakso(oppiaineUri?: string): Lops2019OpintojaksoDto {
  const oj = {
    nimi: {},
    oppiaineet: [],
    moduulit: [],
  };
  return oj;
}
