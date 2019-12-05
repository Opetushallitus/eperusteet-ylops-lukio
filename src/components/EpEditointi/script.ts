import _ from 'lodash';
import { Watch, Component, Mixins, Prop } from 'vue-property-decorator';
import {
  editointi,
  EditointiKontrolli,
  EditointiKontrolliConfig,
} from '@/stores/editointi';
import EpVersioModaali from './EpVersioModaali.vue';
import '@shared/stores/kieli';
import { validationMixin } from 'vuelidate';
import Sticky from 'vue-sticky-directive';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import EpButton from '@/components/EpButton/EpButton.vue';
import EpRoundButton from '@/components/EpButton/EpRoundButton.vue';
import { setItem, getItem } from '@/utils/localstorage';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';

@Component({
  validations() {
    return {
      state: {
        data: {
          ...(this as any).validator,
        },
      },
    };
  },
  directives: {
    oikeustarkastelu,
    Sticky,
  },
  components: {
    EpButton,
    EpRoundButton,
    EpSpinner,
    EpVersioModaali,
  },
} as any)
export default class EpEditointi extends Mixins(validationMixin) {
  @Prop({ required: true })
  private hooks!: EditointiKontrolliConfig;

  @Prop({ default: null })
  private validator!: any | null;

  @Prop({ required: false })
  private type!: string | null;

  private sidebarState = 0;

  private ctrls: EditointiKontrolli | null = null;
  private state: any = null;
  private isInitialized = false;

  get poistoteksti() {
    if(!this.type) {
      return this.$t('poista');
    }

    return this.$t('poista-'+this.type);
  }

  get dropDownValinnatVisible() {
    return this.ctrls!.isEditing && !(!this.hooks.remove || this.state.disabled);
  }

  get hasKeskusteluSlot() {
    return this.$scopedSlots.keskustelu;
  }

  get hasPerusteSlot() {
    return this.$scopedSlots.peruste;
  }

  get hasOhjeSlot() {
    return this.$scopedSlots.ohje;
  }

  toggleSidebarState(val: number) {
    if (val === this.sidebarState) {
      this.sidebarState = 0;
    }
    else {
      this.sidebarState = val;
    }
    setItem('ep-editointi-sidebar-state', {
      value: this.sidebarState,
    });
  }

  get saveHelpText() {
    const vuelidate = this.$v as any;
    if (this.state.disabled) {
      return 'tallenna-kaynnissa';
    }
    else if (this.state.disabled) {
      return 'tallenna-tila-virhe-ohje';
    }
    else if (vuelidate.state.data.$invalid) {
      return 'tallenna-validointi-virhe-ohje';
    }
    else {
      return '';
    }
  }

  @Watch('state.data')
  private changed(newValue: any, oldValue: any) {
    this.$emit('input', newValue);
  }

  public async mounted() {
    this.ctrls = editointi({ ...this.hooks });
    await this.ctrls.init();
    this.state = this.ctrls.state;
    this.isInitialized = true;

    const sidebarState = await getItem('ep-editointi-sidebar-state') as any;
    if (sidebarState) {
      this.sidebarState = sidebarState!.value;
    }
  }

  get current() {
    return _.first(this.historia);
  }

  get latest() {
    return _.first(this.historia);
  }

  get historia() {
    const revs = this.ctrls!.state!.revisions || [];
    return _.map(this.ctrls!.state!.revisions, (rev, index) => ({
      ...rev,
      index: revs.length - index,
    }));
  }
}
