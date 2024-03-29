import { CustomEventHandler } from "./util";

export type ModalEvents = 'updated';
export type ModalKey = number | string
export type ModalArgs =
  | ["opened", ModalKey, Modal]
  | ["closed", ModalKey, undefined]
  | ["modified", ModalKey, Modal]

export type ModalActionsFunct = (
  this: ModalService,
  args: {
    id: ModalKey,
    modify: (
      this: ModalService,
      modal: Partial<Modal>
    ) => boolean
    close: () => void
  }
) => any

export type Modal = {
  title: string,
  icon: string,
  content: string,
  actions: {
    text: string,
    onClick: ModalActionsFunct
    role?: "primary" | "secondary"
  }[]
}

class ModalService extends CustomEventHandler<ModalEvents, ModalArgs> {
  private _key = 0;
  modals: { [key: ModalKey]: Modal } = {};

  constructor() {
    super();
  }


  open(modal: Partial<Modal & { id: ModalKey }>): ModalKey {
    if (modal.id && this.modals[modal.id]) return modal.id;

    const id = modal.id ?? this._key++;
    const newModal = {
      icon: modal.icon ?? "",
      title: modal.title ?? "",
      content: modal.content ?? "",
      actions: modal.actions ?? [],
    };

    this.modals[id] = newModal;
    this.dispatchEvent("updated", ["opened", id, newModal]);
    return id;
  }

  modify(id: ModalKey, modified: Partial<Modal>): boolean {
    const modal = this.modals[id];
    if (!modal) return false;

    Object.assign(modal, modified);
    this.dispatchEvent("updated", ["modified", id, modal]);
    return true;
  }

  close(id: ModalKey) {
    if (!this.get(id)) return;

    delete this.modals[id];
    this.dispatchEvent("updated", ["closed", id, undefined]);

  }

  get(id: ModalKey): Modal | undefined {
    return this.modals[id];
  }
}

export default ModalService