# Cryptocurrency Trading App

A React Native application that enables users to trade Bitcoin (BTC) with real-time price tracking and portfolio management.

## Features

- Real-time BTC price tracking via native module implementation
- Portfolio management with balance tracking
- Buy and sell BTC
- Transaction history
- Profit/Loss tracking
- Comprehensive test coverage for business logic and components

## Technical Highlights

- Native module integration for efficient price data fetching
- Unit and integration tests ensuring reliability
- Redux for state management
- Type-safe implementation with TypeScript

## Project Structure

Key components of the application:

- `app/store/features/portfolio`: Redux slice managing portfolio state and trading logic
  - Handles buy/sell transactions
  - Tracks user balance and BTC amount
  - Maintains transaction history
  - Calculates profit/loss
- `native_modules/`: Contains native implementation for BTC price fetching
  - Optimized performance through native code
  - Platform-specific implementations for iOS
- `__tests__/`: Test suites for components and business logic
  - Unit tests for Redux reducers and actions
  - Integration tests for key features
  - Component testing with React Native Testing Library

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```
npm run start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### iOS

```
npm run ios
```

If everything is set up correctly, you should see your new app running in the iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Xcode.
