import { CustomEventHandler } from './event';
import type { Dexie as DexieType } from 'dexie';

const Dexie = (await import('dexie')).default;

export type FolderIndex = {
  key?: number;
  path: string;
  type: 'folder';
  name: string;
  created: number;
  modified: number;
};

export type FileIndex = {
  key?: number;
  path: string;
  type: 'file';
  name: string;
  size: number;
  store: number;
  created: number;
  modified: number;
};

export type ExtendedFileIndex = {
  getData: () => Promise<File | Blob | undefined>;
  rename: (name: string) => Promise<boolean>;
  delete: () => Promise<boolean>;
  modifyData: (data: File | Blob) => Promise<boolean>;
  getAbsolutePath: () => string;
} & FileIndex;

export type ExtendedFolderIndex = {
  delete: () => Promise<boolean>;
  rename: (name: string) => Promise<boolean>;
  list: () => Promise<IndexType[]>;
  getAbsolutePath: () => string;
} & FolderIndex;

export type IndexType = FolderIndex | FileIndex;

export type StoreType = {
  key?: number;
  data: File | Blob;
};

export type PathEntry = {
  path: string;
  name: string;
  rawName: string;
  ext: string;
};

class FileStore extends Dexie {
  index!: DexieType.Table<IndexType, number>;
  data!: DexieType.Table<StoreType, number>;

  constructor() {
    super('files');
    this.version(1).stores({
      index: '++key, path, type, name, store, created, modified',
      data: '++key, store',
    });
  }
}

type FileManagerEvents = {
  ready: [];
  error: [err: Error];
  create: [path: string, id: number, type: 'folder' | 'file'];
  delete: [path: string];
  modify: [path: string, id: number];
  rename: [path: string, id: number];
  moved: [from: string, to: string];
  copied: [index: string, to: string];
};

type BannedNames = string[];
const bannedChars: BannedNames = [':', '*', '?', '"', '<', '>', '|'];
const bannedNames: BannedNames = ['.', '..'];
const bannedSlashes: BannedNames = ['\\', '/'];

class FileManager extends CustomEventHandler<FileManagerEvents> {
  private store = new FileStore();

  constructor() {
    super();

    this.init().then(() => {
      this.dispatchEvent('ready', []);
    });

    window.addEventListener('beforeunload', () => {
      this.store.close();
    });
  }

  async init() {
    await this.store.open();
  }

  async cd(path: string | number) {
    const newPath = await this.getPathFromKey(path)!;
    if (!newPath || typeof newPath !== 'string') return [];

    if (!FileManager.validPath(newPath)) return [];
    const array = await this.store.index
      .where('path')
      .equals(newPath)
      .toArray();

    return array;
  }

  ls = this.cd;
  list = this.cd;

  static validName(name: string) {
    const nameArray = name.split('');

    return (
      name.length > 0 &&
      !bannedNames.includes(name) &&
      !nameArray.some((char) => bannedChars.includes(char)) &&
      !nameArray.some((char) => bannedSlashes.includes(char))
    );
  }

  static validPath(path: string) {
    const pathArray = path.split('/');
    if (path === '/') return true;

    return (
      path.length > 0 &&
      path.startsWith('/') &&
      !bannedNames.includes(path) &&
      !pathArray.some((dir) =>
        dir.split('').some((char) => bannedChars.includes(char))
      )
    );
  }

  static getPathEntry(path: string): PathEntry {
    const pathArray = path.split('/');
    const nameArray = pathArray[pathArray.length - 1].split('.');

    return {
      path: pathArray.slice(0, pathArray.length - 1).join('/') || '/',
      name: pathArray[pathArray.length - 1],
      rawName: nameArray.slice(0, nameArray.length - 1).join('.'),
      ext: nameArray[nameArray.length - 1],
    };
  }

  static toPath(path: string, name?: string, ext?: string) {
    path = path === '/' ? '' : path;
    return path + (name ? '/' + name : '') + (ext ? '.' + ext : '');
  }

  async isFolder(pathOrKey: string | number) {
    if (typeof pathOrKey === 'number') {
      const item = await this.store.index
        .where('key')
        .equals(pathOrKey)
        .and((item) => item.type === 'folder')
        .first();
      return !!item;
    }

    if (!FileManager.validPath(pathOrKey)) return false;
    if (pathOrKey === '/') return true;

    const entry = FileManager.getPathEntry(pathOrKey);
    const array = await this.store.index
      .where('path')
      .equals(entry.path)
      .and((item) => item.type === 'folder' && item.name === entry.name)
      .first();

    return !!array;
  }

  async isFile(pathOrKey: string | number) {
    if (typeof pathOrKey === 'number') {
      const item = await this.store.index
        .where('key')
        .equals(pathOrKey)
        .and((item) => item.type === 'file')
        .first();
      return !!item;
    }

    if (!FileManager.validPath(pathOrKey)) return false;
    const entry = FileManager.getPathEntry(pathOrKey);

    const array = await this.store.index
      .where('path')
      .equals(entry.path)
      .and((item) => item.type === 'file' && item.name === entry.name)
      .first();

    return !!array;
  }

  async exists(path: string, name?: string) {
    path = FileManager.toPath(path, name);
    return (await this.isFile(path)) || (await this.isFolder(path));
  }

  async getFile(
    pathOrKey: string | number
  ): Promise<ExtendedFileIndex | undefined> {
    let item: FileIndex | undefined;

    if (typeof pathOrKey === 'number') {
      item = (await this.store.index
        .where('key')
        .equals(pathOrKey)
        .and((item) => item.type === 'file')
        .first()) as FileIndex | undefined;
    } else {
      const entry = FileManager.getPathEntry(pathOrKey);

      if (await this.isFile(pathOrKey)) {
        item = (await this.store.index
          .where('path')
          .equals(entry.path)
          .and((item) => item.type === 'file' && item.name === entry.name)
          .first()) as FileIndex | undefined;
      }
    }

    if (item) {
      Object.assign(item, {
        getData: async () => item && (await this.getFileData(item.store)),
        modifyData: async (data: File | Blob) =>
          item && (await this.modifyData(item.store, data)),
        delete: async () => item && (await this.delete(item.key!)),
      });
      return item as any;
    }
  }

  async getFolder(
    pathOrKey: string | number
  ): Promise<ExtendedFolderIndex | undefined> {
    let item: FolderIndex | undefined;

    if (typeof pathOrKey === 'number') {
      item = (await this.store.index
        .where('key')
        .equals(pathOrKey)
        .and((item) => item.type === 'folder')
        .first()) as FolderIndex | undefined;
    } else {
      if (!FileManager.validPath(pathOrKey)) return;

      const entry = FileManager.getPathEntry(pathOrKey);
      if (await this.isFolder(pathOrKey)) {
        item = (await this.store.index
          .where('path')
          .equals(entry.path)
          .and((item) => item.type === 'folder' && item.name === entry.name)
          .first()) as FolderIndex | undefined;
      }
    }

    if (item) {
      return {
        ...item,
        delete: async () => (item && (await this.delete(item.key!))) || false,
        list: async () => (item && (await this.ls(item?.key!))) || [],
        getAbsolutePath: () =>
          (item && FileManager.toPath(item.path, item.name)) || '',
        rename: async (name: string) =>
          (item && (await this.rename(item.key!, name))) || false,
      };
    }
  }

  async getFileData(store: number) {
    const item = await this.store.data.where('key').equals(store).first();
    return item?.data;
  }

  async readFile(path: string) {
    const item = await this.getFile(path);
    return item && (await this.getFileData(item.store));
  }

  async getTotalUsage() {
    return await this.store.index
      .where('size')
      .notEqual('undefined')
      .toArray()
      .then((array) =>
        array.reduce((a, b) => {
          'size' in b && (a += b.size);
          return a;
        }, 0)
      );
  }

  async modifyFile(path: string, data: File | Blob) {
    const item = await this.getFile(path);
    if (!item) return false;

    const result = await this.modifyData(item.store, data);
    result && this.emit('modify', [path, item.key!]);

    return result;
  }

  async modifyData(store: number, data: File | Blob) {
    const file = await this.store.index.where('store').equals(store).first();

    if (file && 'store' in file) {
      await this.store.data.update(file.store, { data });
      await this.store.index.update(file.key!, {
        modified: Date.now(),
        size: data.size,
      } as IndexType);

      return true;
    }

    return false;
  }

  async createFile(path: string, name: string, data: File | Blob) {
    if (!FileManager.validName(name)) return;
    if (await this.exists(path, name)) return;

    if (!(await this.isFolder(path))) {
      const entry = FileManager.getPathEntry(path);
      await this.createFolder(entry.path, entry.name);
    }

    const id = await this.store.data.add({ data });
    const fileId = await this.store.index.add({
      path,
      type: 'file',
      name,
      size: data.size,
      store: id,
      created: Date.now(),
      modified: Date.now(),
    });

    this.emit('create', [path, fileId, 'file']);
    return fileId;
  }

  async createFolder(path: string, name: string) {
    if (!FileManager.validPath(path)) return;
    if (!FileManager.validName(name)) return;
    if (await this.exists(path, name)) return;

    if (!(await this.isFolder(path))) {
      const entry = FileManager.getPathEntry(path);
      await this.createFolder(entry.path, entry.name);
    }

    const id = await this.store.index.add({
      path,
      name,
      type: 'folder',
      created: Date.now(),
      modified: Date.now(),
    });

    this.emit('create', [path, id, 'folder']);
    return id;
  }

  async getPathFromKey(key: string | number) {
    if (typeof key === 'string') return key;
    const item = await this.store.index.where('key').equals(key).first();

    if (!item) return;
    return FileManager.toPath(item.path, item.name);
  }

  async delete(pathOrKey: string | number) {
    let newPath = await this.getPathFromKey(pathOrKey);
    if (!newPath || typeof newPath !== 'string') return false;

    if (await this.isFile(newPath)) {
      const item = await this.getFile(newPath);

      if (item) {
        await this.store.index.delete(item.key!);
        await this.store.data.delete(item.store!);

        this.emit('delete', [newPath]);
        return true;
      }
    }

    if (newPath === '/') return false;
    if (await this.isFolder(newPath)) {
      const array = await this.ls(newPath);
      const result = array.map((item) => this.delete(item.key!));
      const entry = FileManager.getPathEntry(newPath);

      await Promise.all(result);
      await this.store.index
        .where('path')
        .equals(entry.path)
        .and((item) => item.type === 'folder' && item.name === entry.name)
        .delete();

      this.emit('delete', [newPath]);
      return true;
    }

    return false;
  }

  async rename(pathOrKey: string | number, name: string) {
    let newPath = await this.getPathFromKey(pathOrKey);
    if (!newPath || typeof newPath !== 'string') return false;

    return !!this.store.index
      .where('path')
      .equals(pathOrKey)
      .modify({ name, modified: Date.now() });
  }

  async move(from: string, to: string): Promise<boolean> {
    const fromEntry = FileManager.getPathEntry(from);
    const toEntry = FileManager.getPathEntry(to);

    if (from === '/' || to === '/') return false;
    if (!(await this.exists(from))) return false;

    if (await this.isFile(from)) {
      const item = await this.getFile(from);

      if (item) {
        if (!(await this.isFolder(toEntry.path))) {
          const newFolder = FileManager.getPathEntry(toEntry.path);
          await this.createFolder(newFolder.path, newFolder.name);
        }

        if (!(await this.exists(toEntry.path, item.name))) {
          return await this.move(
            item.getAbsolutePath(),
            FileManager.toPath(
              toEntry.path,
              toEntry.rawName + ' - Copy',
              toEntry.ext
            )
          );
        }

        await this.store.index.where('key').equals(item.key!).modify({
          path: toEntry.path,
          name: toEntry.name,
          modified: Date.now(),
        });

        this.emit('moved', [from, to]);
      }
      return true;
    }

    if (await this.isFolder(from)) {
      const folder = await this.getFolder(from);
      const array = await this.ls(from);

      if (folder) {
        await this.store.index.where('key').equals(folder.key!).modify({
          path: toEntry.path,
          name: toEntry.name,
          modified: Date.now(),
        });

        for (const item of array) {
          await this.move(
            FileManager.toPath(from, item.name),
            FileManager.toPath(to, item.name)
          );
        }

        this.emit('moved', [from, to]);
        return true;
      }
    }

    return false;
  }

  async copy(index: string, to: string) {
    const indexEntry = FileManager.getPathEntry(index);
    const toEntry = FileManager.getPathEntry(to);

    if (!FileManager.validPath(to)) return false;

    if (!(await this.isFolder(to))) {
      const newFolder = await this.createFolder(toEntry.path, toEntry.name);
      if (newFolder === undefined) return false;
    }

    if (await this.exists(to, indexEntry.name)) return false;

    if (await this.isFile(index)) {
      const item = await this.getFile(index);
      if (item) {
        const data = await this.getFileData(item.store);
        const id = await this.store.data.add({ data: data! });
        await this.store.index.add({
          path: to,
          type: 'file',
          name: item.name,
          size: item.size,
          store: id,
          created: Date.now(),
          modified: Date.now(),
        });

        this.emit('copied', [index, to]);
      }
      return true;
    }

    if (await this.isFolder(index)) {
      const folder = await this.getFolder(index);
      const array = await this.cd(index);

      if (folder) {
        await this.createFolder(to, folder.name);

        for (const item of array) {
          await this.copy(
            FileManager.toPath(index, item.name),
            FileManager.toPath(to, folder.name)
          );
        }
      }

      this.emit('copied', [index, to]);
      return true;
    }

    return false;
  }
}

export default FileManager;
