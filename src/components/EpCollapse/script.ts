import { Vue, Component, Prop } from 'vue-property-decorator';
import { setItem, getItem } from '@/utils/localstorage';
import _ from 'lodash';


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
        if (_.isObject(item)) {
          return (item as any).toggled;
        }
      }
    }
    finally {
    }
    return this.defaultState;
  }

  mounted() {
    this.toggled = this.isToggled();
    console.log(this.toggled);
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
