import { Component, Prop, Vue } from 'vue-property-decorator';
import { Kielet } from '@/stores/kieli';
import _ from 'lodash';
import EpContentBase from '@/components/EpContentBase/EpContentBase.vue';


@Component({
  components: {
    EpContentBase,
  },
})
export default class EpContent extends Vue {
  @Prop({ default: true })
  private lokalisoitu!: boolean;

  @Prop({ required: true })
  private value!: string | object;

  @Prop({ default: false })
  private isEditable!: boolean;

  get contentValue() {
    if (!this.value) {
      return '';
    }
    else if (this.lokalisoitu) {
      const kieli = Kielet.getSisaltoKieli();
      return (this.value as any)[kieli];
    }
    else {
      return this.value;
    }
  }

  private handleContentChange(content: string) {
    if (this.lokalisoitu) {
      const kieli = Kielet.getSisaltoKieli();
      const value = (_.isPlainObject(this.value) ? this.value : {}) as object;
      this.$emit('input', {
        ...value,
        [kieli]: content,
      });
    }
    else {
      this.$emit('input', content);
    }
  }
}
