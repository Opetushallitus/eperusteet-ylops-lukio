const kohdereititys = {
  viite: 'tekstikappale',
  opetussuunnitelma: 'opsTiedot',
  opetussuunnitelma_rakenne: 'jarjesta',
  poppiaine: 'paikallinenOppiaine',
  opintojakso: 'opintojakso',
  termi: 'opsKasitteet',
};

const kohdereititysId = {
  viite: 'osaId',
  poppiaine: 'paikallinenOppiaineId',
  opintojakso: 'opintojaksoId',
};

const kohdeIcon = {
  viite: 'kyna',
  opetussuunnitelma: 'opetussuunnitelma',
  opetussuunnitelma_rakenne: 'jarjesta',
  termi: 'kasitteet',
  kommentti: 'kommentti',
};

const tapahtumaIcon = {
  paivitys: 'kyna',
  luonti: 'plussa',
  poisto: 'roskalaatikko',
};

export function muokkaustietoRoute(id, kohde) {

  const router = {
    name: kohdereititys[kohde],
    params: {}
  };

  if (kohdereititysId[kohde]) {
    router.params[kohdereititysId[kohde]] = id;
  }

  return router;
}

export function muokkaustietoIcon(kohde, tapahtuma) {
  if (kohde === 'kommentti' || kohde === 'opetussuunnitelma_rakenne') {
    return kohdeIcon[kohde];
  }

  return tapahtumaIcon[tapahtuma];
}
