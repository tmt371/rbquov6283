// /04-core-code/strategies/product-factory.js

/**
 * @fileoverview A factory for creating product-specific strategy objects.
 * This allows the application to easily support multiple product types.
 */

// 匯入我們目前唯一的一個產品策略
import { RollerBlindStrategy } from './roller-blind-strategy.js';

// 建立一個產品策略的地圖 (Map)
// Key: 產品類型的字串
// Value: 對應的策略類別
const strategyMap = {
    rollerBlind: RollerBlindStrategy,
    // --- 未來擴充 ---
    // sheerCurtain: SheerCurtainStrategy, // 未來新增紗簾時，只需在此處增加一行
    // flyScreen: FlyScreenStrategy,       // 新增伸縮紗門時，再加一行
};

export class ProductFactory {
    constructor({ configManager }) {
        this.configManager = configManager;
        console.log("ProductFactory Initialized with ConfigManager.");
    }

    /**
     * Returns an instance of the strategy for the given product type.
     * @param {string} productType - The type of the product (e.g., 'rollerBlind').
     * @returns {object|null} An instance of the corresponding product strategy, or null if not found.
     */
    getProductStrategy(productType) {
        const StrategyClass = strategyMap[productType];

        if (StrategyClass) {
            // 回傳一個新的策略實例，並傳入依賴
            return new StrategyClass({ configManager: this.configManager });
        } else {
            console.error(`No strategy found for product type: ${productType}`);
            return null;
        }
    }
}