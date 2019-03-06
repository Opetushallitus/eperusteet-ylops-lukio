import { Component, Prop, Vue } from 'vue-property-decorator';

import CkEditor from '@/components/CkEditor/CkEditor.vue';
import EpViewer from '@/components/EpViewer/EpViewer.vue';

import { EditorLayout } from '@/tyypit';

@Component({
  components: {
    EpViewer,
    CkEditor,
  },
})
export default class EpContentBase extends Vue {
  @Prop({ required: true })
  private value!: string;

  @Prop({ required: true })
  private isEditable!: boolean;

  // CkEditorin layout (määrittää ominaisuudet)
  @Prop({ default: EditorLayout.simplified })
  private layout!: EditorLayout;

  @Prop()
  private validation!: any;
}
