(globalThis as any).__DEV__ = true;

import { mock } from 'bun:test';
import * as RNWeb from 'react-native-web';

mock.module('react-native', () => ({
  ...RNWeb,
  Platform: {
    ...RNWeb.Platform,
    OS: 'android',
  },
  TurboModuleRegistry: {
    get: () => null,
    getEnforcing: () => null,
  },
  NativeModules: {},
  NativeEventEmitter: class {
    addListener() {
      return { remove: () => {} };
    }
    removeListener() {}
    removeAllListeners() {}
  },
}));

mock.module('react-native-android-widget', () => ({
  requestWidgetUpdate: () => Promise.resolve(),
}));
