import _ from 'lodash';
import { Vue, Component } from 'vue-property-decorator';
import { Virheet } from '@shared/stores/virheet';
import { Meta } from '@shared/utils/decorators';

Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteUpdate',
  'beforeRouteLeave',
]);

@Component
export default class EpRoot extends Vue {
  private mIsLoading = true;

  @Meta
  getMetaInfo() {
    if (this.$route && this.$route.name) {
      return {
        title: this.$t('route-' + this.$route.name),
        titleTemplate: '%s - ' + this.$t('eperusteet-ops-tyokalu'),
      };
    }
    else {
      return {
        title: this.$t('eperusteet-ops-tyokalu'),
        titleTemplate: null,
      };
    }
  }

  public async beforeRouteEnter(to: any, from: any, next: any) {
    next();
  }

  public async beforeRouteUpdate(to: any, from: any, next: any) {
    next();
  }

  public async beforeRouteLeave(to: any, from: any, next: any) {
    next();
  }

  public async vahvista(title = 'vahvista-toiminto', msg = 'vahvista-toiminto-viesti', okTitle = 'kylla', config: any = {}) {
    return this.$bvModal.msgBoxConfirm(this.$t(msg) as any, {
      title: this.$t(title),
      okVariant: 'primary',
      okTitle: this.$t(okTitle) as any,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as any,
      centered: true,
      ...config,
    });
  }

  public async mounted() {
    this.loading(this.init);
  }

  public async loading(
    fn: () => Promise<void>
  ) {
    this.mIsLoading = true;
    try {
      await fn();
    }
    catch (err) {
      if (this.$route) {
        await Virheet.lisaaVirhe({
          path: this.$route.path,
          err,
        });
      }
    }
    finally {
      this.mIsLoading = false;
    }
  }

  public get isLoading() {
    return this.mIsLoading;
  }

  protected async init() {}
}
