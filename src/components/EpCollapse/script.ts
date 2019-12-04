import { Vue, Component, Prop } from 'vue-property-decorator';
import { setItem, getItem } from '@/utils/localstorage';
import _ from 'lodash';

@Component
export default class EpCollapse extends Vue {
  @Prop({ default: true })
  private expandedByDefault!: boolean;

  @Prop({ default: false })
  private disableHeader!: boolean;

  @Prop({ default: '' })
  private tyyppi!: string;

  @Prop({ default: false})
  private first!: boolean;

  private toggled = false;

  isToggled() {
    try {
      if (this.tyyppi) {
        const item = getItem('toggle-' + this.tyyppi);
        if (_.isObject(item)) {
          return (item as any).toggled;
        }
      }
      return true;
    }
    catch (err) {
      return true;
    }
  }

  mounted() {
    this.toggled = this.tyyppi
      ? this.isToggled()
      : this.expandedByDefault;
  }

  toggle() {
    this.toggled = !this.toggled;
    if (this.tyyppi) {
      setItem('toggle-' + this.tyyppi, {
        toggled: this.toggled,
      });
    }
  }
}
