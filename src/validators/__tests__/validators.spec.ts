import { Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import Vuelidate from 'vuelidate';

import EpValidation from '@/mixins/EpValidation';
import { TekstiKappaleDto, Lops2019OpintojaksoDto, TermiDto, KysymysDto, OpetussuunnitelmaLuontiDto, OpetussuunnitelmaDto, Lops2019OppiaineDto } from '@/tyypit';
import { kasiteValidator } from '@/validators/kasite';
import { kysymysValidator } from '@/validators/ukk';
import { opintojaksoValidator, opintojaksoLuontiValidator } from '@/validators/opintojakso';
import { opsTiedotValidator, pohjaLuontiValidator, opsLuontiValidator } from '@/validators/ops';
import { tekstikappaleLuontiValidator } from '@/validators/tekstikappaleet';
import { oppiaineValidator, oppiaineLuontiValidator } from '@/validators/oppiaineet';


@Component
class Dummy extends Mixins(EpValidation) {
  private kielet = [];
  private oppiaine: Lops2019OppiaineDto = {};
  private oppiaineLuonti: Lops2019OppiaineDto = {};
  private pohja: OpetussuunnitelmaDto = {};
  private ops: OpetussuunnitelmaDto = {};
  private opsLuonti: OpetussuunnitelmaLuontiDto = {};
  private pohjaLuonti: OpetussuunnitelmaLuontiDto = {};
  private kysymys: KysymysDto = {};
  private kasite: TermiDto = {};
  private opintojakso: Lops2019OpintojaksoDto = {};
  private opintojaksoLuonti: Lops2019OpintojaksoDto = {};
  private tekstikappale: TekstiKappaleDto = {};

  get validationConfig() {
    const kielet = (this as any).kielet;
    return {
      oppiaineLuonti: oppiaineLuontiValidator(kielet),
      oppiaine: oppiaineValidator(kielet),
      pohja: opsTiedotValidator(kielet, false),
      ops: opsTiedotValidator(kielet),
      opsLuonti: opsLuontiValidator(kielet),
      pohjaLuonti: pohjaLuontiValidator(kielet),
      kysymys: kysymysValidator(kielet),
      kasite: kasiteValidator(kielet),
      opintojakso: opintojaksoValidator(kielet),
      opintojaksoLuonti: opintojaksoLuontiValidator(kielet),
      tekstikappale: tekstikappaleLuontiValidator(kielet),
    };
  }

  render(h) {
    return h('div');
  }
}

describe('Oppiaine validators', () => {
  const localVue = createLocalVue();
  localVue.use(Vuelidate);

  const nimi = {
    fi: 'nimi',
  };

  test('Opintojakson validointi', async () => {
    const wrapper = mount(Dummy, { localVue });
    await localVue.nextTick();
    expect(wrapper.vm.$v.opintojakso!.$invalid).toBe(true);
    expect(wrapper.vm.$v.opintojaksoLuonti!.$invalid).toBe(true);

    wrapper.setData({
      kielet: ['fi'],
      opintojakso: {
        nimi,
        koodi: '123',
        oppiaineet: [{
          koodi: '456',
        }],
      },
      opintojaksoLuonti: {
        nimi,
        oppiaineet: [{
          koodi: '456',
        }],
      },
    });

    expect(wrapper.vm.$v.opintojakso!.$invalid).toBe(false);
    expect(wrapper.vm.$v.opintojaksoLuonti!.$invalid).toBe(false);
  });

  test('Tekstikappale validointi', async () => {
    const wrapper = mount(Dummy, { localVue });
    await localVue.nextTick();
    expect(wrapper.vm.$v.tekstikappale!.$invalid).toBe(true);
    wrapper.setData({
      kielet: ['fi'],
      tekstikappale: {
        nimi,
      },
    });
    expect(wrapper.vm.$v.tekstikappale!.$invalid).toBe(false);
  });

  test('Käsite validointi', async () => {
    const wrapper = mount(Dummy, { localVue });
    await localVue.nextTick();
    expect(wrapper.vm.$v.kasite!.$invalid).toBe(true);
    wrapper.setData({
      kielet: ['fi'],
      kasite: {
        termi: nimi,
        selitys: nimi,
      },
    });
    expect(wrapper.vm.$v.kasite!.$invalid).toBe(false);
  });

  test('UKK validointi', async () => {
    const wrapper = mount(Dummy, { localVue });
    await localVue.nextTick();
    expect(wrapper.vm.$v.kysymys!.$invalid).toBe(true);
    wrapper.setData({
      kysymys: {
        kysymys: nimi,
        vastaus: nimi,
        organisaatiot: [{
          oid: 'x.y.z',
        }],
      },
    });
    expect(wrapper.vm.$v.kysymys!.$invalid).toBe(false);
  });

  test('Virheellinen validointi', async () => {
    const wrapper = mount(Dummy, { localVue });
    await localVue.nextTick();
    expect(wrapper.vm.$v.oppiaine!.$invalid).toBe(true);
    expect(wrapper.vm.$v.oppiaineLuonti!.$invalid).toBe(true);
    expect(wrapper.vm.$v.pohja!.$invalid).toBe(true);
    expect(wrapper.vm.$v.ops!.$invalid).toBe(true);
    expect(wrapper.vm.$v.opsLuonti!.$invalid).toBe(true);
    expect(wrapper.vm.$v.pohjaLuonti!.$invalid).toBe(true);
  });

  test('Oppiaineet', async () => {
    const wrapper = mount(Dummy, { localVue });
    await localVue.nextTick();

    wrapper.setData({
      kielet: ['fi'],
      oppiaine: {
        koodi: '123',
        nimi,
      },
      oppiaineLuonti: {
        koodi: '123',
        nimi,
      },
    });

    expect(wrapper.vm.$v.oppiaine!.$invalid).toBe(false);
    expect(wrapper.vm.$v.oppiaineLuonti!.$invalid).toBe(false);

    wrapper.setData({
      kielet: ['fi', 'sv'],
    });

    expect(wrapper.vm.$v.oppiaine!.$invalid).toBe(true);
    expect(wrapper.vm.$v.oppiaineLuonti!.$invalid).toBe(true);
  });

  test('Opetussuunnitelmien perustiedot', async () => {
    const wrapper = mount(Dummy, { localVue });
    await localVue.nextTick();

    wrapper.setData({
      kielet: ['fi'],
      ops: { nimi },
      opsLuonti: { nimi },
      pohja: { nimi },
      pohjaLuonti: { nimi },
    });

    expect(wrapper.vm.$v.ops!.$invalid).toBe(true);
    expect(wrapper.vm.$v.opsLuonti!.$invalid).toBe(true);
    expect(wrapper.vm.$v.pohja!.$invalid).toBe(false);
    expect(wrapper.vm.$v.pohjaLuonti!.$invalid).toBe(true);

    wrapper.setData({
      kielet: ['fi'],
      ops: { nimi, julkaisukielet: ['fi'] },
      opsLuonti: { nimi, julkaisukielet: ['fi'] },
      pohjaLuonti: { nimi, julkaisukielet: ['fi'] },
    });

    expect(wrapper.vm.$v.ops!.$invalid).toBe(false);
    expect(wrapper.vm.$v.opsLuonti!.$invalid).toBe(true);
    expect(wrapper.vm.$v.pohjaLuonti!.$invalid).toBe(true);

    wrapper.setData({
      kielet: ['fi'],
      opsLuonti: {
        nimi,
        julkaisukielet: ['fi'],
        pohja: {
          id: 42,
          pohja: '42',
        },
        organisaatiot: {
          jarjestajat: [{
            oid: 'x',
          }],
        },
      },
      pohjaLuonti: {
        nimi,
        valittuPeruste: {
          id: 1,
        },
      } as any,
    });

    expect(wrapper.vm.$v.opsLuonti!.$invalid).toBe(false);
    expect(wrapper.vm.$v.pohjaLuonti!.$invalid).toBe(false);

  });

});