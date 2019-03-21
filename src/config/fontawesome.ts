import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import * as solid from '@fortawesome/free-solid-svg-icons';
import * as regular from '@fortawesome/free-regular-svg-icons';
import * as oph from './icons';

library.add(regular.faComment);
library.add(solid.faBars);
library.add(solid.faBell);
library.add(solid.faCalendarDay);
library.add(solid.faCheck);
library.add(solid.faChevronDown);
library.add(solid.faChevronLeft);
library.add(solid.faChevronRight);
library.add(solid.faChevronUp);
library.add(solid.faClock);
library.add(solid.faCog);
library.add(solid.faFileArchive);
library.add(solid.faFileDownload);
library.add(solid.faFileSignature);
library.add(solid.faGlassCheers);
library.add(solid.faHome);
library.add(solid.faLandmark);
library.add(solid.faMinus);
library.add(solid.faPen);
library.add(solid.faPencilAlt);
library.add(solid.faPencilRuler);
library.add(solid.faPlus);
library.add(solid.faQuestion);
library.add(solid.faSearch);
library.add(solid.faThumbsUp);
library.add(solid.faTimes);
library.add(solid.faUsers);
library.add(solid.faPlusCircle);

// OPH icons
library.add(oph.arkisto);
library.add(oph.luoUusi);
library.add(oph.opetussuunnitelmasi);
library.add(oph.tiedotteet);
library.add(oph.tyoryhma);
library.add(oph.ukk);
library.add(oph.valtakunnallisetPerusteet);

Vue.component('fas', FontAwesomeIcon);
