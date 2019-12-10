import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';
import * as solid from '@fortawesome/free-solid-svg-icons';
import * as regular from '@fortawesome/free-regular-svg-icons';
import * as oph from './icons';

library.add(regular.faComment);
library.add(regular.faTrashAlt);
library.add(regular.faFolder);
library.add(solid.faBan);
library.add(solid.faBars);
library.add(solid.faBell);
library.add(solid.faBold);
library.add(solid.faBookmark);
library.add(solid.faCalendarDay);
library.add(solid.faCheck);
library.add(solid.faCheckCircle);
library.add(solid.faChevronDown);
library.add(solid.faChevronLeft);
library.add(solid.faChevronRight);
library.add(solid.faChevronUp);
library.add(solid.faClock);
library.add(solid.faCog);
library.add(solid.faColumns);
library.add(solid.faCommentDots);
library.add(solid.faEllipsisH);
library.add(solid.faExclamation);
library.add(solid.faExternalLinkAlt);
library.add(solid.faFileArchive);
library.add(solid.faFileDownload);
library.add(solid.faFileImage);
library.add(solid.faFilePdf);
library.add(solid.faFileSignature);
library.add(solid.faFolder);
library.add(solid.faGlassCheers);
library.add(solid.faHeart);
library.add(solid.faHome);
library.add(solid.faInfoCircle);
library.add(solid.faCircle);
library.add(solid.faItalic);
library.add(solid.faLandmark);
library.add(solid.faLink);
library.add(solid.faList);
library.add(solid.faListOl);
library.add(solid.faListUl);
library.add(solid.faMinus);
library.add(solid.faObjectGroup);
library.add(solid.faAtlas);
library.add(solid.faPen);
library.add(solid.faPencilAlt);
library.add(solid.faPencilRuler);
library.add(solid.faPlus);
library.add(solid.faPlusCircle);
library.add(solid.faQuestion);
library.add(solid.faQuestionCircle);
library.add(solid.faRecycle);
library.add(solid.faRedo);
library.add(solid.faSearch);
library.add(solid.faSort);
library.add(solid.faStrikethrough);
library.add(solid.faTable);
library.add(solid.faThumbsUp);
library.add(solid.faTimes);
library.add(solid.faUnderline);
library.add(solid.faUndo);
library.add(solid.faUpload);
library.add(solid.faUsers);
library.add(solid.faComments);

// OPH icons
library.add(oph.arkisto);
library.add(oph.luoUusi);
library.add(oph.opetussuunnitelmasi);
library.add(oph.tiedotteet);
library.add(oph.tyoryhma);
library.add(oph.ukk);
library.add(oph.valtakunnallisetPerusteet);
library.add(oph.alleviivaus);

library.add(oph.arkistoi);
library.add(oph.checkmark);
library.add(oph.checkmarkYmpyra);
library.add(oph.etsi);
library.add(oph.faq);
library.add(oph.hallitus);
library.add(oph.huutomerkkiYmpyra);
library.add(oph.hymio);
library.add(oph.info);
library.add(oph.infoFill);
library.add(oph.jarjesta);
library.add(oph.kalenteri);
library.add(oph.kasitteet);
library.add(oph.kielet);
library.add(oph.kirje);
library.add(oph.kohdista);
library.add(oph.kolumniOikea);
library.add(oph.kolumniVasen);
library.add(oph.kommentit);
library.add(oph.kommentti);
library.add(oph.koti);
library.add(oph.koulutusvienti);
library.add(oph.kursivointi);
library.add(oph.kyna);
library.add(oph.kynaKehys);
library.add(oph.kysymysmerkki);
library.add(oph.lihavointi);
library.add(oph.liite);
library.add(oph.lisaaKuva);
library.add(oph.lisaaRivi);
library.add(oph.lista);
library.add(oph.listaLuettelo);
library.add(oph.listaNumerointi);
library.add(oph.luoPdf);
library.add(oph.menuPysty);
library.add(oph.menuVaaka);
library.add(oph.muistikirja);
library.add(oph.nuoliAlas);
library.add(oph.nuoliYlos);
library.add(oph.ohjeet);
library.add(oph.opetussuunnitelma);
library.add(oph.palauta);
library.add(oph.peruuta);
library.add(oph.plussa);
library.add(oph.poistaKolumni);
library.add(oph.poistaRivi);
library.add(oph.poistaTaulukko);
library.add(oph.raahaus);
library.add(oph.rakennus);
library.add(oph.ratas);
library.add(oph.riviAlas);
library.add(oph.riviYlos);
library.add(oph.roskalaatikko);
library.add(oph.ryhma);
library.add(oph.silma);
library.add(oph.sulje);
library.add(oph.tahti);
library.add(oph.tahtiTaytetty);
library.add(oph.taulukko);
library.add(oph.ulkoinenLinkki);
library.add(oph.vakanenAlas);
library.add(oph.vakanenAlas);
library.add(oph.yhdistaSolut);
library.add(oph.yliviivaus);

Vue.component('fas', FontAwesomeIcon);
Vue.component('fal', FontAwesomeLayers);
