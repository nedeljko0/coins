import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'BitcoinPriceModule' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", android: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const { BitcoinPriceModule } = NativeModules;

console.log('Native modules available:', Object.keys(NativeModules));
console.log('BitcoinPriceModule:', BitcoinPriceModule);

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
    console.log('Initializing BitcoinPriceEmitter...');
    super(BitcoinPriceNativeModule);
    console.log('Calling startObserving...');
    try {
      BitcoinPriceNativeModule.startObserving();
      console.log('startObserving called successfully');
    } catch (error) {
      console.error('Error calling startObserving:', error);
    }
  }

  addPriceListener(callback: (update: PriceUpdate) => void) {
    console.log('Adding price listener...');
    return this.addListener('onPriceUpdate', (event: any) => {
      console.log('Raw price update event:', event);
      callback(event);
    });
  }
}

export const bitcoinPriceEmitter = new BitcoinPriceEmitter();

export default BitcoinPriceNativeModule as BitcoinPriceNativeModule;
