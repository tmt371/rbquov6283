// /04-core-code/services/calculation-service.js

/**
 * @fileoverview Service for handling all price and sum calculations.
 * Acts as a generic executor that delegates product-specific logic to a strategy.
 */
export class CalculationService {
    constructor({ stateService, productFactory, configManager }) {
        this.stateService = stateService;
        this.productFactory = productFactory;
        this.configManager = configManager;
        console.log("CalculationService Initialized.");
    }

    /**
     * Calculates line prices for all valid items and the total sum using a provided product strategy.
     */
    calculateAndSum(quoteData, productStrategy) {
        if (!productStrategy) {
            console.error("CalculationService: productStrategy is required for calculateAndSum.");
            return { quoteData, firstError: { message: "Product strategy not provided." } };
        }

        const currentProductKey = quoteData.currentProduct;
        const currentProductData = quoteData.products[currentProductKey];

        let firstError = null;

        const newItems = currentProductData.items.map((item, index) => {
            const newItem = { ...item, linePrice: null };
            if (item.width && item.height && item.fabricType) {
                const priceMatrix = this.configManager.getPriceMatrix(item.fabricType);
                const result = productStrategy.calculatePrice(item, priceMatrix);

                if (result.price !== null) {
                    newItem.linePrice = result.price;
                } else if (result.error && !firstError) {
                    const errorColumn = result.error.toLowerCase().includes('width') ? 'width' : 'height';
                    firstError = {
                        message: `Row ${index + 1}: ${result.error}`,
                        rowIndex: index,
                        column: errorColumn
                    };
                }
            }
            return newItem;
        });

        const itemsTotal = newItems.reduce((sum, item) => sum + (item.linePrice || 0), 0);

        let accessoriesTotal = 0;
        const currentSummary = currentProductData.summary;
        if (currentSummary && currentSummary.accessories) {
            const acc = currentSummary.accessories;
            accessoriesTotal += acc.winder?.price || 0;
            accessoriesTotal += acc.motor?.price || 0;
            accessoriesTotal += acc.remote?.price || 0;
            accessoriesTotal += acc.charger?.price || 0;
            accessoriesTotal += acc.cord3m?.price || 0;
        }

        const newSummary = {
            ...currentSummary,
            totalSum: itemsTotal + accessoriesTotal
        };

        const newProductData = {
            ...currentProductData,
            items: newItems,
            summary: newSummary
        };

        const updatedQuoteData = {
            ...quoteData,
            products: {
                ...quoteData.products,
                [currentProductKey]: newProductData
            }
        };

        return { updatedQuoteData, firstError };
    }

    /**
     * [NEW] Calculates the SALE PRICE for a given accessory.
     * This method is explicit and should be used for calculating prices for the end customer.
     */
    calculateAccessorySalePrice(productType, accessoryName, data) {
        const productStrategy = this.productFactory.getProductStrategy(productType);
        if (!productStrategy) return 0;

        const { accessoryPriceKeyMap, accessoryMethodNameMap } = this.configManager.getAccessoryMappings();
        const priceKey = accessoryPriceKeyMap[accessoryName];

        if (!priceKey) {
            console.error(`No sale price key found for accessory: ${accessoryName}`);
            return 0;
        }

        const pricePerUnit = this.configManager.getAccessoryPrice(priceKey);
        if (pricePerUnit === null) return 0;

        const methodName = accessoryMethodNameMap[accessoryName];

        if (methodName && productStrategy[methodName]) {
            const args = (data.items) ? [data.items, pricePerUnit] : [data.count, pricePerUnit];
            return productStrategy[methodName](...args);
        }

        return 0;
    }

    /**
     * [NEW] Calculates the COST for a given accessory.
     * This method is explicit and should be used for internal cost calculations.
     */
    calculateAccessoryCost(productType, accessoryName, data) {
        const productStrategy = this.productFactory.getProductStrategy(productType);
        if (!productStrategy) return 0;

        // Cost key must be provided in the data object.
        if (!data || !data.costKey) {
            console.error(`Cost calculation for '${accessoryName}' requires a 'costKey' in the data payload.`);
            return 0;
        }
        const priceKey = data.costKey;

        const pricePerUnit = this.configManager.getAccessoryPrice(priceKey);
        if (pricePerUnit === null) return 0;

        const { accessoryMethodNameMap } = this.configManager.getAccessoryMappings();
        const methodName = accessoryMethodNameMap[accessoryName];

        if (methodName && productStrategy[methodName]) {
            const args = (data.items) ? [data.items, pricePerUnit] : [data.count, pricePerUnit];
            return productStrategy[methodName](...args);
        }

        return 0;
    }

    /**
     * @deprecated since v5.93. Use calculateAccessorySalePrice() or calculateAccessoryCost() instead.
     * [REFACTORED] This method is now deprecated and will be removed in a future version.
     */
    calculateAccessoryPrice(productType, accessoryName, data) {
        console.warn("DEPRECATED: `calculateAccessoryPrice` was called. Please update to use `calculateAccessorySalePrice` or `calculateAccessoryCost`.");
        if (data && data.costKey) {
            return this.calculateAccessoryCost(productType, accessoryName, data);
        } else {
            return this.calculateAccessorySalePrice(productType, accessoryName, data);
        }
    }

    /**
     * [REFACTORED] Calculates the total price for a given F1 panel component based on its quantity.
     * It now fetches mappings from the ConfigManager.
     */
    calculateF1ComponentPrice(componentKey, quantity) {
        if (typeof quantity !== 'number' || quantity < 0) {
            return 0;
        }

        const f1KeyMap = {
            'winder': 'cost-winder',
            'motor': 'cost-motor',
            'remote-1ch': 'remoteSingleChannel',
            'remote-16ch': 'remoteMultiChannel16',
            'charger': 'charger',
            '3m-cord': 'cord3m',
            'dual-combo': 'comboBracket',
            'slim': 'slimComboBracket'
        };

        const accessoryKey = f1KeyMap[componentKey];
        if (!accessoryKey) {
            console.error(`No accessory key found for F1 component: ${componentKey}`);
            return 0;
        }

        const unitPrice = this.configManager.getAccessoryPrice(accessoryKey);
        if (unitPrice === null) {
            return 0;
        }

        return unitPrice * quantity;
    }

    /**
     * Calculates all values for the F2 summary panel.
     */
    calculateF2Summary(quoteData, uiState) {
        const currentProductKey = quoteData.currentProduct;
        const items = quoteData.products[currentProductKey].items;
        const productSummary = quoteData.products[currentProductKey].summary;
        const totalSumFromQuickQuote = productSummary.totalSum || 0;

        const f2Config = this.configManager.getF2Config();
        const UNIT_PRICES = f2Config.unitPrices || {};

        const accessories = productSummary.accessories || {};
        const winderPrice = accessories.winderCostSum || 0;
        const dualPrice = accessories.dualCostSum || 0;
        const motorPrice = accessories.motorCostSum || 0;
        const remotePrice = accessories.remoteCostSum || 0;
        const chargerPrice = accessories.chargerCostSum || 0;
        const cordPrice = accessories.cordCostSum || 0;

        const f1State = uiState.f1;
        const f2State = uiState.f2;

        const wifiQty = f2State.wifiQty || 0;
        const deliveryQty = f2State.deliveryQty || 0;
        const installQty = f2State.installQty || 0;
        const removalQty = f2State.removalQty || 0;
        const mulTimes = f2State.mulTimes || 0;
        const discount = f2State.discount || 0;

        const wifiSum = wifiQty * UNIT_PRICES.wifi;
        const deliveryFee = deliveryQty * UNIT_PRICES.delivery;
        const installFee = installQty * UNIT_PRICES.install;
        const removalFee = removalQty * UNIT_PRICES.removal;

        const acceSum = winderPrice + dualPrice;
        const eAcceSum = motorPrice + remotePrice + chargerPrice + cordPrice + wifiSum;
        const surchargeFee =
            (f2State.deliveryFeeExcluded ? 0 : deliveryFee) +
            (f2State.installFeeExcluded ? 0 : installFee) +
            (f2State.removalFeeExcluded ? 0 : removalFee);

        const firstRbPrice = totalSumFromQuickQuote * mulTimes;
        const disRbPriceValue = firstRbPrice * (1 - (discount / 100));
        const disRbPrice = Math.round(disRbPriceValue * 100) / 100;

        const sumPrice = acceSum + eAcceSum + surchargeFee + disRbPrice;

        // --- Start: Replicate F1 Final Total Calculation ---
        const winderQtyF1 = items.filter(item => item.winder === 'HD').length;
        const motorQtyF1 = items.filter(item => !!item.motor).length;
        const totalRemoteQtyF1 = uiState.driveRemoteCount || 0;
        const remote1chQtyF1 = f1State.remote_1ch_qty;
        const remote16chQtyF1 = (f1State.remote_16ch_qty === null) ? totalRemoteQtyF1 - remote1chQtyF1 : f1State.remote_16ch_qty;
        const chargerQtyF1 = uiState.driveChargerCount || 0;
        const cordQtyF1 = uiState.driveCordCount || 0;
        const totalDualPairsF1 = Math.floor(items.filter(item => item.dual === 'D').length / 2);
        const comboQtyF1 = (f1State.dual_combo_qty === null) ? totalDualPairsF1 : f1State.dual_combo_qty;
        const slimQtyF1 = (f1State.dual_slim_qty === null) ? 0 : f1State.dual_slim_qty;

        const f1ComponentTotal =
            this.calculateF1ComponentPrice('winder', winderQtyF1) +
            this.calculateF1ComponentPrice('motor', motorQtyF1) +
            this.calculateF1ComponentPrice('remote-1ch', remote1chQtyF1) +
            this.calculateF1ComponentPrice('remote-16ch', remote16chQtyF1) +
            this.calculateF1ComponentPrice('charger', chargerQtyF1) +
            this.calculateF1ComponentPrice('3m-cord', cordQtyF1) +
            this.calculateF1ComponentPrice('dual-combo', comboQtyF1) +
            this.calculateF1ComponentPrice('slim', slimQtyF1);

        const f1DiscountPercentage = f1State.discountPercentage || 0;
        const retailTotalFromF1 = quoteData.products.rollerBlind.summary.totalSum || 0;
        const f1_rb_price = retailTotalFromF1 * (1 - (f1DiscountPercentage / 100));

        const f1SubTotal = f1ComponentTotal + f1_rb_price;
        const f1Gst = f1SubTotal * 0.10;
        const f1_final_total = f1SubTotal + f1Gst;
        // --- End: Replicate F1 Final Total Calculation ---

        const rbProfit = disRbPrice - f1_rb_price;
        const validItemCount = items.filter(item => typeof item.linePrice === 'number' && item.linePrice > 0).length;
        const singleprofit = validItemCount > 0 ? rbProfit / validItemCount : 0;

        // [MODIFIED] Corrected sumProfit and netProfit calculation
        const sumProfit = sumPrice - f1SubTotal;
        const gst = sumPrice * 1.1; // Correctly calculate the total including GST
        const netProfit = gst - f1_final_total;

        return {
            totalSumForRbTime: totalSumFromQuickQuote,
            wifiSum,
            deliveryFee,
            installFee,
            removalFee,
            acceSum, // [FIX] Added missing acceSum
            eAcceSum, // [FIX] Added missing eAcceSum
            firstRbPrice,
            disRbPrice,
            sumPrice,
            rbProfit,
            singleprofit,
            sumProfit,
            gst,
            netProfit
        };
    }
}