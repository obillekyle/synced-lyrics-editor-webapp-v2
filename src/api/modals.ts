import type { Component, ComponentInternalInstance } from 'vue';

import { CustomEventHandler } from './event';
import { evaluate } from './util/object';
import { getParent } from './util/dom';

export type ModalKey = number | string;
export type ModalEvents = {
  opened: [key: ModalKey, modal: Modal];
  closed: [key: ModalKey];
  modified: [key: ModalKey, modal: Modal];
};

export type ModalActionsArgs = {
  self: Modal;
  id: ModalKey;
  modify: (
    modal: Partial<Modal> | ((modal: Modal) => Partial<Modal>)
  ) => boolean;
  close: () => void;
};

export type ModalActionsFunct = (
  this: ModalService,
  args: ModalActionsArgs
) => any;

export type Modal = {
  title: string;
  icon: string;
  content: Component | string;
  options: {
    width?: number;
    height?: number;
    mobileFullscreen?: boolean;
    noWrapperSpacing?: boolean;
  };
  actions: {
    text: string;
    disabled?: boolean;
    onClick: ModalActionsFunct;
    role?: 'primary' | 'secondary';
  }[];
};

export type ModalStore = {
  [key: ModalKey]: Modal;
};

class ModalService extends CustomEventHandler<ModalEvents> {
  private _key = 0;
  modals: ModalStore = {};

  constructor() {
    super();
  }

  open(modal: Partial<Modal & { id: ModalKey }>): ModalKey {
    if (modal.id && this.modals[modal.id]) return modal.id;

    const id = modal.id ?? this._key++;
    const newModal = {
      icon: modal.icon ?? '',
      title: modal.title ?? '',
      content: modal.content ?? '',
      actions: modal.actions ?? [],
      options: modal.options ?? {},
    };

    this.modals[id] = newModal;
    this.dispatchEvent('opened', [id, newModal]);
    return id;
  }

  modify(
    id: ModalKey,
    modified: Partial<Modal> | ((modal: Modal) => Partial<Modal>)
  ): boolean {
    const modal = this.modals[id];
    if (!modal) return false;

    Object.assign(modal, evaluate(modified, modal));
    this.dispatchEvent('modified', [id, modal]);
    return true;
  }

  close(id: ModalKey) {
    if (!this.get(id)) return;

    delete this.modals[id];
    this.dispatchEvent('closed', [id]);
  }

  get(id: ModalKey): Modal | undefined {
    return this.modals[id];
  }
}

export default ModalService;
