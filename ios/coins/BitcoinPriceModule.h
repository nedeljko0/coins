#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

typedef NS_ENUM(NSInteger, WebSocketConnectionState) {
    WebSocketConnectionStateNone,
    WebSocketConnectionStateConnecting,
    WebSocketConnectionStateConnected,
    WebSocketConnectionStateDisconnected
};

NS_ASSUME_NONNULL_BEGIN

@interface BitcoinPriceModule : RCTEventEmitter <RCTBridgeModule>

@property (nonatomic, strong) NSURLSessionWebSocketTask *webSocket;
@property (nonatomic, assign) BOOL hasListeners;
@property (atomic, assign) WebSocketConnectionState connectionState;
@property (nonatomic, assign) NSInteger retryCount;
@property (nonatomic, assign) NSTimeInterval reconnectDelay;
@property (nonatomic, strong) dispatch_source_t connectionTimer;
@property (nonatomic, strong) NSURLSession *urlSession;

// Turbo Module methods
- (void)startObserving:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject;
- (void)stopObserving:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject;

// Event Emitter methods
- (void)startObservingEvents;
- (void)stopObservingEvents;
- (NSArray<NSString *> *)supportedEvents;

// Connection management
- (void)scheduleReconnection;
- (void)cancelReconnection;
- (NSTimeInterval)calculateReconnectDelay;

@end

NS_ASSUME_NONNULL_END 