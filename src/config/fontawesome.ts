import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import * as solid from '@fortawesome/free-solid-svg-icons';
import * as regular from '@fortawesome/free-regular-svg-icons';
import * as oph from './icons';

library.add(regular.faComment);
library.add(regular.faTrashAlt);
library.add(solid.faBars);
library.add(solid.faBell);
library.add(solid.faBold);
library.add(solid.faBookmark);
library.add(solid.faCalendarDay);
library.add(solid.faCheck);
library.add(solid.faChevronDown);
library.add(solid.faChevronLeft);
library.add(solid.faChevronRight);
library.add(solid.faChevronUp);
library.add(solid.faClock);
library.add(solid.faCog);
library.add(solid.faEllipsisH);
library.add(solid.faExclamation);
library.add(solid.faExternalLinkAlt);
library.add(solid.faFileArchive);
library.add(solid.faFileDownload);
library.add(solid.faFilePdf);
library.add(solid.faFileSignature);
library.add(solid.faFolder);
library.add(solid.faGlassCheers);
library.add(solid.faHome);
library.add(solid.faInfoCircle);
library.add(solid.faItalic);
library.add(solid.faLandmark);
library.add(solid.faLink);
library.add(solid.faListOl);
library.add(solid.faListUl);
library.add(solid.faMinus);
library.add(solid.faPen);
library.add(solid.faPencilAlt);
library.add(solid.faPencilRuler);
library.add(solid.faPlus);
library.add(solid.faPlusCircle);
library.add(solid.faQuestion);
library.add(solid.faRecycle);
library.add(solid.faRedo);
library.add(solid.faSearch);
library.add(solid.faSort);
library.add(solid.faStrikethrough);
library.add(solid.faThumbsUp);
library.add(solid.faTimes);
library.add(solid.faUnderline);
library.add(solid.faUndo);
library.add(solid.faUpload);
library.add(solid.faUsers);
library.add(solid.faTable);
library.add(solid.faFileImage);

// OPH icons
library.add(oph.arkisto);
library.add(oph.luoUusi);
library.add(oph.opetussuunnitelmasi);
library.add(oph.tiedotteet);
library.add(oph.tyoryhma);
library.add(oph.ukk);
library.add(oph.valtakunnallisetPerusteet);

Vue.component('fas', FontAwesomeIcon);
