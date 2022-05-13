import Store from 'electron-store';
import { is } from 'electron-util';

interface LastWindowState {
  bounds: {
    width: number;
    height: number;
    x: number | undefined;
    y: number | undefined;
  };
  fullscreen: boolean;
  maximized: boolean;
}

export enum ConfigKey {
  LastWindowState = 'lastWindowState',
  CustomUserAgent = 'customUserAgent',
}

type TypedStore = {
  [ConfigKey.LastWindowState]: LastWindowState;
  [ConfigKey.CustomUserAgent]: string;
};

const defaults: TypedStore = {
  [ConfigKey.LastWindowState]: {
    bounds: {
      width: 860,
      height: 600,
      x: undefined,
      y: undefined,
    },
    fullscreen: false,
    maximized: false,
  },
  [ConfigKey.CustomUserAgent]: '',
};

const config = new Store<TypedStore>({
  defaults,
  name: is.development ? 'config.dev' : 'config',
  migrations: {
    '>=2.21.2': (store) => {
      const hideRightSidebar: boolean | undefined =
        store.get('hideRightSidebar');

      if (typeof hideRightSidebar === 'boolean') {
        // @ts-expect-error
        store.delete('hideRightSidebar');
      }
    },
    '>2.21.2': (store) => {
      const overrideUserAgent: string | undefined =
        store.get('overrideUserAgent');

      if (typeof overrideUserAgent === 'string') {
        if (overrideUserAgent.length > 0) {
          store.set(ConfigKey.CustomUserAgent, overrideUserAgent);
        }

        // @ts-expect-error
        store.delete('overrideUserAgent');
      }
    },
  },
});

export default config;
