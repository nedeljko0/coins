import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'BitcoinPriceModule' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", android: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const { BitcoinPriceModule } = NativeModules;

const BitcoinPriceNativeModule = BitcoinPriceModule
  ? BitcoinPriceModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      },
    );

interface BitcoinPriceNativeModule {
  startObserving(): void;
  stopObserving(): void;
  supportedEvents(): string[];
}

export interface PriceUpdate {
  price: number;
}

class BitcoinPriceEmitter extends NativeEventEmitter {
  constructor() {
    super(BitcoinPriceNativeModule);
    try {
      BitcoinPriceNativeModule.startObserving();
    } catch (error) {
      console.error('Error calling startObserving:', error);
    }
  }

  addPriceListener(callback: (update: PriceUpdate) => void) {
    return this.addListener('onPriceUpdate', (event: any) => {
      callback(event);
    });
  }
}

export const bitcoinPriceEmitter = new BitcoinPriceEmitter();

export default BitcoinPriceNativeModule as BitcoinPriceNativeModule;
