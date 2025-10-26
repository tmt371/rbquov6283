// /04-core-code/services/calculation-service.spec.js

import { CalculationService } from './calculation-service.js';
import { StateService } from './state-service.js';
import { EventAggregator } from '../event-aggregator.js';

// --- Mock Dependencies ---
const mockProductStrategy = {
    calculatePrice: jest.fn((item, priceMatrix) => {
        if (!item.width || !item.height) {
            return { price: null, error: 'Incomplete data.' };
        }
        if (item.width > 3000) {
            return { price: null, error: 'Width exceeds maximum.' };
        }
        return { price: item.width * 0.1 + item.height * 0.2 };
    }),
    calculateDualPrice: jest.fn(() => 10), // Add mock for dual price calculation
    calculateWinderPrice: jest.fn((count, price) => count * price) // Add mock for winder
};

const mockConfigManager = {
    getPriceMatrix: jest.fn((fabricType) => {
        if (fabricType === 'B5') {
            return { name: 'SHAW - VIBE', aliasFor: 'SN' };
        }
        return {}; // Return a dummy matrix for other types
    }),
    getAccessoryPrice: jest.fn((key) => {
        const prices = { 
            comboBracket: 10, 
            winderHD: 30,
            'cost-combo-dual': 5, // Mock cost price
            'cost-winder': 8
        };
        return prices[key] || 0;
    }),
    getAccessoryMappings: jest.fn(() => ({
        accessoryPriceKeyMap: {
            'dual': 'comboBracket',
            'winder': 'winderHD',
            'motor': 'motorStandard',
            'remote': 'remoteStandard',
            'charger': 'chargerStandard',
            'cord': 'cord3m'
        },
        accessoryMethodNameMap: {
            'dual': 'calculateDualPrice',
            'winder': 'calculateWinderPrice',
            'motor': 'calculateMotorPrice',
            'remote': 'calculateRemotePrice',
            'charger': 'calculateChargerPrice',
            'cord': 'calculateCordPrice'
        }
    }))
};

// --- Test Suite ---
describe('CalculationService (Refactored)', () => {
    let calculationService;
    let stateService;
    let eventAggregator;

    beforeEach(() => {
        eventAggregator = new EventAggregator();
        stateService = new StateService({ initialState: {}, eventAggregator });

        calculationService = new CalculationService({
            stateService,
            productFactory: { getProductStrategy: () => mockProductStrategy },
            configManager: mockConfigManager
        });
        
        // Clear mocks before each test
        jest.clearAllMocks();
    });

    // --- Tests for calculateAndSum (Unchanged) ---
    describe('calculateAndSum', () => {
        it('should correctly calculate and sum prices for valid items using the product strategy', () => {
            const quoteData = {
                currentProduct: 'rollerBlind',
                products: {
                    rollerBlind: {
                        items: [
                            { width: 1000, height: 1000, fabricType: 'B1', linePrice: null },
                            { width: 2000, height: 1500, fabricType: 'B1', linePrice: null },
                            { width: null, height: null, fabricType: null, linePrice: null }
                        ],
                        summary: { 
                            totalSum: 0,
                            accessories: {
                                winder: { price: 30 },
                                motor: { price: 250 }
                            }
                        }
                    }
                }
            };
    
            const { updatedQuoteData, firstError } = calculationService.calculateAndSum(quoteData, mockProductStrategy);
            const productSummary = updatedQuoteData.products.rollerBlind.summary;
            const productItems = updatedQuoteData.products.rollerBlind.items;
    
            expect(productSummary.totalSum).toBe(1080);
            expect(productItems[0].linePrice).toBe(300);
            expect(productItems[1].linePrice).toBe(500);
            expect(firstError).toBeNull();
            expect(mockConfigManager.getPriceMatrix).toHaveBeenCalledTimes(2);
            expect(mockProductStrategy.calculatePrice).toHaveBeenCalledTimes(2);
        });
    
        it('should return the first error encountered and still sum valid items', () => {
            const quoteData = {
                currentProduct: 'rollerBlind',
                products: {
                    rollerBlind: {
                        items: [
                            { width: 1000, height: 1000, fabricType: 'B3', linePrice: null },
                            { width: 4000, height: 1500, fabricType: 'B3', linePrice: null }, 
                            { width: 2000, height: 2000, fabricType: 'B3', linePrice: null }
                        ],
                        summary: { totalSum: 0, accessories: {} }
                    }
                }
            };
    
            const { updatedQuoteData, firstError } = calculationService.calculateAndSum(quoteData, mockProductStrategy);
            const productSummary = updatedQuoteData.products.rollerBlind.summary;
            const productItems = updatedQuoteData.products.rollerBlind.items;
    
            expect(productSummary.totalSum).toBe(900);
            expect(productItems[0].linePrice).toBe(300);
            expect(productItems[1].linePrice).toBeNull();
            expect(productItems[2].linePrice).toBe(600);
            expect(firstError).not.toBeNull();
            expect(firstError.rowIndex).toBe(1);
            expect(firstError.message).toContain('Width exceeds maximum.');
        });
    });

    // --- Tests for NEW Refactored Methods ---
    describe('calculateAccessorySalePrice', () => {
        it('should calculate the SALE PRICE for an accessory using the price key map', () => {
            const productType = 'rollerBlind';
            const items = [{ dual: 'D' }, { dual: 'D' }];
            
            const price = calculationService.calculateAccessorySalePrice(productType, 'dual', { items });

            expect(price).toBe(10); // Mocked return value from strategy
            expect(mockConfigManager.getAccessoryMappings).toHaveBeenCalledTimes(1);
            // It should use the SALE price key
            expect(mockConfigManager.getAccessoryPrice).toHaveBeenCalledWith('comboBracket');
            expect(mockProductStrategy.calculateDualPrice).toHaveBeenCalledWith(items, 10);
        });
    });

    describe('calculateAccessoryCost', () => {
        it('should calculate the COST for an accessory using the provided costKey', () => {
            const productType = 'rollerBlind';
            const winderCount = 3;
            const data = { count: winderCount, costKey: 'cost-winder' };
            
            const price = calculationService.calculateAccessoryCost(productType, 'winder', data);

            expect(price).toBe(24); // 3 * 8 (mocked cost price)
            expect(mockConfigManager.getAccessoryMappings).toHaveBeenCalledTimes(1);
            // It should use the COST key provided in the data object
            expect(mockConfigManager.getAccessoryPrice).toHaveBeenCalledWith('cost-winder');
            expect(mockProductStrategy.calculateWinderPrice).toHaveBeenCalledWith(winderCount, 8);
        });

        it('should return 0 and log an error if costKey is not provided', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const productType = 'rollerBlind';
            
            const price = calculationService.calculateAccessoryCost(productType, 'winder', { count: 3 });

            expect(price).toBe(0);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Cost calculation for 'winder' requires a 'costKey' in the data payload.");
            consoleErrorSpy.mockRestore();
        });
    });
});