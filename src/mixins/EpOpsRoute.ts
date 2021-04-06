import { Prop, Component } from 'vue-property-decorator';
import EpRoute from './EpRoute';
import { OpetussuunnitelmaStore, Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import _ from 'lodash';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { TermitStore } from '@/stores/TermitStore';
import { KuvaStore } from '@/stores/KuvaStore';

/**
 * Mixin näkymäkomponenteille mitkä tarvitsevat opetussuunnitelman sisällön
 */
@Component
export default class EpOpsRoute extends EpRoute {
  @Prop({ required: true })
  private opetussuunnitelmaStore!: OpetussuunnitelmaStore;

  get store() {
    return this.opetussuunnitelmaStore;
  }

  get ops() {
    return this.store.opetussuunnitelma!;
  }

  get opsId() {
    return this.store.opetussuunnitelma!.id!;
  }

  get isPohja() {
    return this.store.opetussuunnitelma!.tyyppi as string === 'pohja';
  }

  get isOps() {
    return this.store.opetussuunnitelma!.tyyppi as string === 'ops';
  }

  get isValmisPohja() {
    return this.isPohja && this.ops.tila as any === 'valmis';
  }

  get kasiteHandler() {
    return createKasiteHandler(new TermitStore(this.opsId!));
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.opsId!));
  }
}
