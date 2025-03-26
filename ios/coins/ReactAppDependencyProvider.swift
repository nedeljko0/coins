import Foundation
import React

@objc(ReactAppDependencyProvider)
class RCTAppDependencyProvider: NSObject, RCTBridgeDelegate {
    
    func sourceURL(for bridge: RCTBridge!) -> URL! {
        #if DEBUG
            return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
        #else
            return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
        #endif
    }
    
    @objc func extraModules(for bridge: RCTBridge!) -> [RCTBridgeModule]! {
        var modules: [RCTBridgeModule] = []
        
        // Add the Bitcoin Price Module
        if let bitcoinModule = BitcoinPriceModule() {
            modules.append(bitcoinModule)
        }
        
        return modules
    }
} 