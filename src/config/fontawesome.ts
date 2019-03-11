import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import * as solid from '@fortawesome/free-solid-svg-icons';

library.add(solid.faBars);
library.add(solid.faBell);
library.add(solid.faChevronDown);
library.add(solid.faChevronUp);
library.add(solid.faChevronLeft);
library.add(solid.faChevronRight);
library.add(solid.faClock);
library.add(solid.faCog);
library.add(solid.faFileArchive);
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
library.add(solid.faCalendarDay);
library.add(solid.faFileDownload);

Vue.component('fas', FontAwesomeIcon);
