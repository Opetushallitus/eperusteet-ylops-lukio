import { Node, Mark } from 'tiptap';
import Vue from 'vue';

import { IKasiteHandler, createKasiteHandler } from '@/stores/kuvat';
import { domAttrsGetter } from './helpers';
import { i18n } from '@/stores/kieli';
import { TermiDto } from '@/tyypit';
import TermiEditor from './TermiEditor.vue';
import EpContent from '@/components/EpContent/EpContent.vue';


export default class TermiExtension extends Mark {
  public constructor(private handler: IKasiteHandler) {
    super();
  }

  get name() {
    return 'termi';
  }

  get extensions() {
    return [];
  }

  get schema() {
    return {
      attrs: {
        'data-viite': {
          default: '',
        },
      },
      inclusive: false,
      parseDOM: [{
        tag: 'abbr[data-viite]',
        getAttrs: domAttrsGetter('data-viite'),
      }],
      toDOM: (node: any) => ['abbr', node.attrs, 0],
    };
  }

  commands(params) {
    const { type } = params;
    return (attrs) => (state, dispatch) => {
      const { from, to } = state.selection;
      return dispatch(state.tr.addMark(from, to, type.create(attrs)));
    };
  }

  get view() {
    const handler = this.handler;
    return Vue.extend({
      components: {
        TermiEditor,
        EpContent,
      },
      props: ['node', 'updateAttrs', 'view'],
      data() {
        return {
          abbrdata: null as TermiDto | null,
        };
      },
      methods: {
        async showTermiSelector() {
          if (!this.view.editable) {
            return;
          }

          const self = (this as any);
          const h = this.$createElement;
          const t = (v: string): string => i18n.t(v) as string;
          const kasiteTitle = h('div', {}, t('valitse-kasite'));
          const editor = h(TermiEditor, {
            props: {
              value: self.dataViite,
              handler,
            },
            on: {
              input(avain: string) {
                self.dataViite = avain;
              },
            },
          });
          this.$bvModal.msgBoxOk([editor], {
            buttonSize: 'sm',
            centered: true,
            size: 'lg',
            title: [kasiteTitle],
          });
        }
      },
      watch: {
        dataViite: {
          handler: async(value: string) => {
            if (!value) {
              return;
            }

            try {
              this.abbrdata = await handler.getOne(value);
            }
            catch (err) {
              this.abbrdata = null;
              throw err;
            }
          },
          immediate: true,
        },
      },
      computed: {
        dataViite: {
          get() {
            return (this as any).node.attrs['data-viite'];
          },
          set(value: any) {
            (this as any).updateAttrs({
              'data-viite': value,
            });
          },
        },
        title: () => {
          if (this.abbrdata) {
            return (this as any).$kaanna(this.abbrdata.selitys);
          }
          else {
            return (this as any).$t('termia-ei-kuvattu');
          }
        },
      },
      render(h) {
        return h('abbr', {
          class: {
            virheellinen: !(this as any).dataViite,
          },
          props: {
            'data-viite': (this as any).dataViite,
            title: (this as any).title,
          },
          on: {
            click: (this as any).showTermiSelector,
          },
        });
      },
      // template: `
      //   <abbr :class="{ 'virheellinen': !dataViite }" :data-viite="dataViite" @click="showTermiSelector" :title="title"></abbr>
      // `,
    });
  }

}
