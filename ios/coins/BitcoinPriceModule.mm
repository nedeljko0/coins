#import "BitcoinPriceModule.h"

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTLog.h>

static const NSTimeInterval kInitialReconnectDelay = 1.0;
static const NSTimeInterval kMaxReconnectDelay = 30.0;
static const NSInteger kMaxRetryCount = 5;

@implementation BitcoinPriceModule

RCT_EXPORT_MODULE()

// Required for Turbo Modules
RCT_EXPORT_METHOD(startObserving:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    RCTLog(@"[BitcoinPriceModule] startObserving called");
    @try {
        dispatch_async(dispatch_get_main_queue(), ^{
            self.hasListeners = YES;
            RCTLog(@"[BitcoinPriceModule] Setting hasListeners to YES");
            [self connectWebSocket];
        });
        resolve(@YES);
    } @catch (NSException *exception) {
        RCTLog(@"[BitcoinPriceModule] Error in startObserving: %@", exception);
        reject(@"error", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(stopObserving:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        dispatch_async(dispatch_get_main_queue(), ^{
            self.hasListeners = NO;
            [self closeWebSocket];
            [self cancelReconnection];
        });
        resolve(@YES);
    } @catch (NSException *exception) {
        reject(@"error", exception.reason, nil);
    }
}

+ (BOOL)requiresMainQueueSetup
{
    RCTLog(@"[BitcoinPriceModule] requiresMainQueueSetup called");
    return NO;
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[@"onPriceUpdate", @"onError", @"onConnectionStateChange"];
}

- (instancetype)init
{
    RCTLog(@"[BitcoinPriceModule] init called");
    if (self = [super init]) {
        _hasListeners = NO;
        _webSocket = nil;
        _connectionState = WebSocketConnectionStateNone;
        _retryCount = 0;
        _reconnectDelay = kInitialReconnectDelay;
        _connectionTimer = nil;
        _urlSession = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
        
        if (!_urlSession) {
            RCTLog(@"[BitcoinPriceModule] Failed to create URL session");
            return nil;
        }
        RCTLog(@"[BitcoinPriceModule] Initialized successfully");
    }
    return self;
}

// RCTEventEmitter override
- (void)startObservingEvents
{
    dispatch_async(dispatch_get_main_queue(), ^{
        self.hasListeners = YES;
        [self connectWebSocket];
    });
}

// RCTEventEmitter override
- (void)stopObservingEvents
{
    dispatch_async(dispatch_get_main_queue(), ^{
        self.hasListeners = NO;
        [self closeWebSocket];
        [self cancelReconnection];
    });
}

- (void)updateConnectionState:(WebSocketConnectionState)newState
{
    @synchronized (self) {
        if (self.connectionState != newState) {
            self.connectionState = newState;
            if (self.hasListeners) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    [self sendEventWithName:@"onConnectionStateChange" 
                                     body:@{@"state": @(newState)}];
                });
            }
        }
    }
}

- (void)emitError:(NSString *)message
{
    // Filter out compression-related errors that don't affect functionality
    if ([message containsString:@"Protocol error"] ||
        [message containsString:@"inflate"] ||
        [message containsString:@"deflate"]) {
        // Just log these internally
        RCTLog(@"[BitcoinPriceModule] Ignoring compression-related error: %@", message);
        return;
    }
    
    if (self.hasListeners) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self sendEventWithName:@"onError" body:@{@"message": message}];
        });
    }
}

- (NSTimeInterval)calculateReconnectDelay
{
    // Exponential backoff with jitter
    NSTimeInterval delay = MIN(kInitialReconnectDelay * pow(2, self.retryCount), kMaxReconnectDelay);
    // Add random jitter between 0-1 seconds
    delay += ((double)arc4random() / UINT32_MAX);
    return delay;
}

- (void)scheduleReconnection
{
    [self cancelReconnection];
    
    if (self.retryCount >= kMaxRetryCount) {
        [self emitError:@"Maximum reconnection attempts reached"];
        return;
    }
    
    self.retryCount++;
    NSTimeInterval delay = [self calculateReconnectDelay];
    
    dispatch_queue_t queue = dispatch_get_main_queue();
    self.connectionTimer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, queue);
    
    dispatch_source_set_timer(self.connectionTimer,
                            dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delay * NSEC_PER_SEC)),
                            DISPATCH_TIME_FOREVER,
                            (1ull * NSEC_PER_SEC) / 10);
    
    __weak __typeof__(self) weakSelf = self;
    dispatch_source_set_event_handler(self.connectionTimer, ^{
        __strong __typeof__(weakSelf) strongSelf = weakSelf;
        if (!strongSelf) return;
        
        [strongSelf cancelReconnection];
        [strongSelf connectWebSocket];
    });
    
    dispatch_resume(self.connectionTimer);
}

- (void)cancelReconnection
{
    if (self.connectionTimer) {
        dispatch_source_cancel(self.connectionTimer);
        self.connectionTimer = nil;
    }
}

- (void)connectWebSocket
{
    RCTLog(@"[BitcoinPriceModule] Attempting to connect WebSocket");
    @synchronized (self) {
        if (self.connectionState == WebSocketConnectionStateConnecting ||
            self.connectionState == WebSocketConnectionStateConnected) {
            RCTLog(@"[BitcoinPriceModule] Already connecting or connected");
            return;
        }
        
        [self updateConnectionState:WebSocketConnectionStateConnecting];
    }
    
    if (self.webSocket) {
        [self closeWebSocket];
    }
    
    NSURL *url = [NSURL URLWithString:@"wss://ws.bitstamp.net"];
    if (!url) {
        [self emitError:@"Invalid WebSocket URL"];
        [self updateConnectionState:WebSocketConnectionStateDisconnected];
        return;
    }
    
    RCTLog(@"[BitcoinPriceModule] Creating WebSocket with URL: %@", url);
    
    NSURLSessionConfiguration *config = [NSURLSessionConfiguration defaultSessionConfiguration];
    NSMutableDictionary *headers = [NSMutableDictionary dictionary];
    [headers setObject:@"websocket" forKey:@"Upgrade"];
    [headers setObject:@"Upgrade" forKey:@"Connection"];
    [headers setObject:@"13" forKey:@"Sec-WebSocket-Version"];
    // Don't set any compression headers
    config.HTTPAdditionalHeaders = headers;
    
    self.urlSession = [NSURLSession sessionWithConfiguration:config];
    self.webSocket = [self.urlSession webSocketTaskWithURL:url
                                              protocols:@[@"websocket"]];
    
    // Set up message receiver before starting
    [self receiveMessage];
    
    [self.webSocket resume];
    
    // Send subscribe message after a short delay to ensure connection is ready
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        NSString *subscribeMessage = @"{\"event\":\"bts:subscribe\",\"data\":{\"channel\":\"live_trades_btceur\"}}";
        NSData *data = [subscribeMessage dataUsingEncoding:NSUTF8StringEncoding];
        [self.webSocket sendMessage:[[NSURLSessionWebSocketMessage alloc] initWithData:data] completionHandler:^(NSError *error) {
            if (error) {
                RCTLog(@"[BitcoinPriceModule] Failed to send subscribe message: %@", error);
                [self emitError:error.localizedDescription];
            } else {
                RCTLog(@"[BitcoinPriceModule] Subscribe message sent successfully");
            }
        }];
    });
    
    [self updateConnectionState:WebSocketConnectionStateConnected];
}

- (void)closeWebSocket
{
    [self cancelReconnection];
    if (self.webSocket) {
        [self.webSocket cancelWithCloseCode:NSURLSessionWebSocketCloseCodeNormalClosure reason:nil];
        self.webSocket = nil;
        [self updateConnectionState:WebSocketConnectionStateDisconnected];
    }
}

- (void)receiveMessage
{
    if (!self.webSocket) {
        RCTLog(@"[BitcoinPriceModule] WebSocket is nil in receiveMessage");
        return;
    }
    
    __weak __typeof__(self) weakSelf = self;
    [self.webSocket receiveMessageWithCompletionHandler:^(NSURLSessionWebSocketMessage *message, NSError *error) {
        __typeof__(self) strongSelf = weakSelf;
        if (!strongSelf) return;
        
        if (error) {
            RCTLog(@"[BitcoinPriceModule] Error receiving message: %@", error);
            
            // Only handle non-compression related errors
            if (![error.localizedDescription containsString:@"Protocol error"]) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    __typeof__(self) strongSelf = weakSelf;
                    if (strongSelf) {
                        [strongSelf emitError:error.localizedDescription];
                        if (strongSelf.connectionState != WebSocketConnectionStateDisconnected) {
                            [strongSelf updateConnectionState:WebSocketConnectionStateDisconnected];
                            [strongSelf scheduleReconnection];
                        }
                    }
                });
            } else {
                // For compression errors, just reconnect without showing error to user
                dispatch_async(dispatch_get_main_queue(), ^{
                    __typeof__(self) strongSelf = weakSelf;
                    if (strongSelf && strongSelf.connectionState != WebSocketConnectionStateDisconnected) {
                        [strongSelf updateConnectionState:WebSocketConnectionStateDisconnected];
                        [strongSelf scheduleReconnection];
                    }
                });
            }
            return;
        }
        
        NSData *messageData;
        if (message.type == NSURLSessionWebSocketMessageTypeString) {
            messageData = [message.string dataUsingEncoding:NSUTF8StringEncoding];
        } else if (message.type == NSURLSessionWebSocketMessageTypeData) {
            messageData = message.data;
        }
        
        if (messageData) {
            NSError *jsonError = nil;
            NSDictionary *json = [NSJSONSerialization JSONObjectWithData:messageData
                                                               options:0
                                                                 error:&jsonError];
            
            if (jsonError) {
                RCTLog(@"[BitcoinPriceModule] Failed to parse message: %@", jsonError);
                [strongSelf emitError:@"Failed to parse message"];
            } else {
                RCTLog(@"[BitcoinPriceModule] Received message: %@", json);
                
                if ([json[@"event"] isEqualToString:@"trade"] && json[@"data"]) {
                    NSDictionary *data = json[@"data"];
                    NSNumber *price = data[@"price"];
                    
                    if (price) {
                        RCTLog(@"[BitcoinPriceModule] Found price in trade event: %@", price);
                        if (strongSelf.hasListeners) {
                            dispatch_async(dispatch_get_main_queue(), ^{
                                __typeof__(self) strongSelf = weakSelf;
                                if (strongSelf) {
                                    [strongSelf sendEventWithName:@"onPriceUpdate" body:price];
                                    RCTLog(@"[BitcoinPriceModule] Price update emitted");
                                }
                            });
                        }
                    }
                }
            }
        }
        
        // Continue receiving messages if still connected
        if (strongSelf.webSocket && strongSelf.connectionState == WebSocketConnectionStateConnected) {
            [strongSelf receiveMessage];
        }
    }];
}

- (void)invalidate
{
    [self closeWebSocket];
    [self cancelReconnection];
    self.urlSession = nil;
}

@end 