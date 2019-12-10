import Vue from 'vue';
import * as _ from 'lodash';
import { RevisionDto } from '@/tyypit';
import { router } from '@/router';
import { fail } from '@/utils/notifications';
import { createLogger } from '@shared/utils/logger';

interface EditointiKontrolliFeatures {
  removal: boolean;
  validation: boolean;
  history: boolean;
  restore: boolean;
}

export interface EditointiKontrolliHistory {
  revisions: () => Promise<RevisionDto[]>;
  restore?: (rev: RevisionDto) => Promise<void>;
}

export interface EditointiKontrolliData {
  load: () => Promise<unknown>;
  save?: (data: any) => Promise<any>;
  cancel?: () => Promise<void>;
}

export interface EditointiKontrolliLocks {
  acquire: () => Promise<boolean>;
  release: () => Promise<void>;
}

export interface EditointiKontrolliConfig {
  editAfterLoad?: () => Promise<boolean>;
  source: EditointiKontrolliData;
  locks?: EditointiKontrolliLocks;
  history?: EditointiKontrolliHistory;
  start?: () => Promise<void>;
  remove?: (data: any) => Promise<void>;
  validate?: () => Promise<boolean>;
}

const DefaultConfig = {
  start: async () => {},
  remove: async () => {},
  validate: async () => true,
};


export class EditointiKontrolli {
  private static totalEditingEditors = 0;
  private logger = createLogger(EditointiKontrolli);
  private isEditingState = false;
  private isRemoved = false;
  private isNew = false;

  private readonly features: EditointiKontrolliFeatures;
  private mstate = Vue.observable({
    data: null,
    revisions: [] as RevisionDto[],
    backup: null,
    disabled: true,
    isSaving: false,
  });
  private backup: any = null;

  public static anyEditing() {
    return EditointiKontrolli.totalEditingEditors > 0;
  }

  public constructor(
    private config: EditointiKontrolliConfig
  ) {
    this.features = {
      removal: !!config.remove,
      validation: !!config.validate,
      history: !!config.history,
      restore: !!config.history && !!config.history.restore,
    };

    this.logger.debug('Initing editointikontrollit with: ', _.keys(config));
    this.config = {
      ...DefaultConfig,
      ...config,
    };
  }

  public get getFeatures() {
    return this.features;
  }

  public get isEditing() {
    return this.isEditingState;
  }

  public get isEditable() {
    return !!(this.config.source.save);
  }

  public get state() {
    return this.mstate;
  }

  public async init() {
    this.isNew = !!(this.config.editAfterLoad && await this.config.editAfterLoad());
    const data = await this.fetch();
    if (this.config.history && this.config.history.revisions) {
      this.mstate.revisions = await this.config.history.revisions();
    }
    this.logger.debug('Haetaan data', data);
    this.backup = JSON.stringify(data);
    this.mstate.data = data;
    this.mstate.disabled = false;
    // this.config.setData!(data);
    if (this.isNew) {
      await this.start();
    }
  }

  public async start() {
    this.mstate.disabled = true;
    if (this.isEditing) {
      this.logger.warn('Editointi jo käynnissä');
      this.mstate.disabled = false;
      return;
    }

    if (this.isRemoved) {
      this.logger.warn('Poistettua resurssia ei voi editoida');
      this.mstate.disabled = false;
      return;
    }

    try {
      this.logger.debug('Aloitetaan editointi');
      if (!this.isNew) {
        await this.init();
      }
      if (this.config.start) {
        await this.config.start();
      }
      this.isEditingState = true;
      EditointiKontrolli.totalEditingEditors += 1;
    }
    catch (err) {
      this.logger.error('Editoinnin aloitus epäonnistui:', err);
    }
    finally {
      this.mstate.disabled = false;
    }
  }

  public async cancel() {
    this.mstate.disabled = true;
    if (!this.isEditing) {
      this.logger.warn('Ei voi perua');
      return;
    }

    this.logger.debug('Perutaan editointi');
    if (this.config.source.cancel) {
      await this.config.source.cancel!();
    }

    this.mstate.data = JSON.parse(this.backup);
    // this.config.setData!(JSON.parse(this.backup));
    this.isEditingState = false;
    EditointiKontrolli.totalEditingEditors -= 1;
    this.mstate.disabled = false;

    if (this.isNew) {
      router.go(-1);
    }
  }

  public async validate() {
    const validation = await this.config.validate!();
    this.logger.debug('Validointi:', validation);
    return validation;
  }

  public async remove() {
    this.mstate.disabled = true;
    this.isRemoved = true;
    this.isEditingState = false;
    EditointiKontrolli.totalEditingEditors -= 1;
    await this.config.remove!(this.mstate.data);
    this.logger.debug('Poistettu');
  }

  public async save() {
    this.mstate.disabled = true;
    this.mstate.isSaving = true;

    if (!this.isEditing) {
      this.logger.warn('Ei voi tallentaa ilman editointia');
    }
    else if (await this.validate() && !!(this.config.source.save)) {
      EditointiKontrolli.totalEditingEditors -= 1;
      try {
        await this.config.source.save(this.mstate.data);
        this.logger.success('Tallennettu onnistuneesti');
        this.isEditingState = false;
      }
      catch (err) {
        fail('tallennus-epaonnistui', err.response.data.syy);
        EditointiKontrolli.totalEditingEditors += 1;
        this.isEditingState = true;
      }
    }
    else {
      this.logger.debug('Tallentaminen ei mahdollista');
    }
    this.mstate.disabled = false;
    this.mstate.isSaving = false;
  }

  private async fetch() {
    const data = await this.config.source.load();
    if (_.isObject(data) || _.isArray(data)) {
      return JSON.parse(JSON.stringify(data));
    }
    else {
      throw new Error('Source must be an object or an array');
    }
  }
}

export function editointi(config: EditointiKontrolliConfig) {
  return new EditointiKontrolli(config);
}
