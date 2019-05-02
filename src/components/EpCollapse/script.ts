import { Vue, Component, Prop } from 'vue-property-decorator';
import { setItem, getItem } from '@/utils/localstorage';

@Component
export default class EpCollapse extends Vue {
  @Prop({ default: true })
  private defaultState!: boolean;

  @Prop({ default: '' })
  private tyyppi!: string;
  private toggled = false;

  isToggled() {
    try {
      if (this.tyyppi) {
        const item = getItem('toggle-' + this.tyyppi);
        if (item) {
          return (item as any).toggled;
        }
      }
    }
    finally {
    }
    return true;
  }

  mounted() {
    this.toggled = this.isToggled();
  }

  toggle() {
    this.toggled = !this.toggled
    if (this.tyyppi) {
      setItem('toggle-' + this.tyyppi, {
        toggled: this.toggled,
      });
    }
  }
}
