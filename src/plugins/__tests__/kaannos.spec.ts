import { createLocalVue, mount } from '@vue/test-utils';
import { Kielet, KieliStore } from '@shared/stores/kieli';
import { Kieli } from '@/tyypit';
import Vue from 'vue';

describe('Plugin kaannos', () => {
  beforeEach(() => {
    Kielet.setSisaltoKieli(Kieli.fi);
  });

  function createWrapper(data: object) {
    return mount({
      template: '<div>{{ $kaanna(teksti) }}</div>',
      data() {
        return {
          ...data,
        };
      },
    } as any, {
      i18n: KieliStore.i18n,
    } as any);
  }

  test('tekstioliot', () => {
    const wrapper = createWrapper({
      teksti: {
        fi: 'suomeksi',
        sv: 'ruotsiksi',
      },
    });

    expect(wrapper.text()).toEqual('suomeksi');

    Kielet.setSisaltoKieli(Kieli.sv);
    expect(wrapper.text()).toEqual('ruotsiksi');
  });

  test('undefined', () => {
    const wrapper = createWrapper({ teksti: undefined });
    expect(wrapper.text()).toEqual('');
  });

  test('null', () => {
    const wrapper = createWrapper({ teksti: null });
    expect(wrapper.text()).toEqual('');
  });

  test('viallinen syöte', () => {
    const spy = jest.spyOn(console, 'warn')
      .mockImplementationOnce(() => {});
    const wrapper = createWrapper({
      teksti: 'tekstiä',
    });

    expect(wrapper.text()).toEqual('tekstiä');
    expect(spy).toBeCalled();
  });
});