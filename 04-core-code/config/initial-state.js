// File: 04-core-code/config/initial-state.js

/**
 * @fileoverview Defines the initial state of the application.
 * This structure serves as the default blueprint for the entire app's data.
 */

export const initialState = {
    ui: {
        // --- SPA View Management ---
        currentView: 'QUICK_QUOTE', 
        visibleColumns: ['sequence', 'width', 'height', 'TYPE', 'Price'],
        activeTabId: 'k1-tab',

        // --- Input & Selection State ---
        inputValue: '',
        inputMode: 'width',
        activeCell: { rowIndex: 0, column: 'width' },
        selectedRowIndex: null,
        isMultiSelectMode: false,
        multiSelectSelectedIndexes: [],

        // --- Left Panel Edit Modes & States ---
        activeEditMode: null,
        targetCell: null,
        locationInputValue: '',
        
        // --- K2 (Fabric/LF) State ---
        lfSelectedRowIndexes: [],
        // [REMOVED] lfModifiedRowIndexes is moved to quoteData.uiMetadata for persistence.

        // --- K5 (Dual/Chain) State ---
        dualChainMode: null,
        dualChainInputValue: '',
        dualPrice: null,

        // --- K4 (Drive/Accessories) State ---
        driveAccessoryMode: null,
        driveRemoteCount: 0,
        driveChargerCount: 0,
        driveCordCount: 0,
        driveWinderTotalPrice: null,
        driveMotorTotalPrice: null,
        driveRemoteTotalPrice: null,
        driveChargerTotalPrice: null,
        driveCordTotalPrice: null,
        driveGrandTotal: null,

        // --- K5 Summary Display State ---
        summaryWinderPrice: null,
        summaryMotorPrice: null,
        summaryRemotePrice: null,
        summaryChargerPrice: null,
        summaryCordPrice: null,
        summaryAccessoriesTotal: null,

        // [RESTRUCTURED] --- F1 Financial Overview State ---
        f1: {
            discountPercentage: 0,
            remote_1ch_qty: 0,
            remote_16ch_qty: null,
            dual_combo_qty: null,
            dual_slim_qty: null,
        },
        
        // --- F2 Financial Summary State ---
        f2: {
            wifiQty: null, deliveryQty: null, installQty: null, removalQty: null,
            mulTimes: null, discount: null, wifiSum: null, deliveryFee: null,
            installFee: null, removalFee: null, deliveryFeeExcluded: false,
            installFeeExcluded: false, removalFeeExcluded: false, acceSum: null,
            eAcceSum: null, surchargeFee: null, totalSumForRbTime: null,
            firstRbPrice: null, disRbPrice: null, singleprofit: null,
            rbProfit: null, sumPrice: null, sumProfit: null, gst: null, netProfit: null
        },

        // --- Global UI State ---
        isSumOutdated: false,
        welcomeDialogShown: false
    },
    quoteData: {
        currentProduct: 'rollerBlind',
        products: {
            rollerBlind: {
                items: [
                    { 
                        itemId: `item-${Date.now()}`, 
                        width: null, height: null, fabricType: null, linePrice: null,
                        location: '', fabric: '', color: '', over: '',
                        oi: '', lr: '', dual: '', chain: null, winder: '', motor: ''
                    }
                ],
                summary: { 
                    totalSum: null,
                    accessories: {
                        winder: { count: 0, price: 0 },
                        motor: { count: 0, price: 0 },
                        remote: { type: 'standard', count: 0, price: 0 },
                        charger: { count: 0, price: 0 },
                        cord3m: { count: 0, price: 0 },
                        remoteCostSum: null,
                        winderCostSum: null,
                        motorCostSum: null,
                        chargerCostSum: null,
                        cordCostSum: null,
                    }
                }
            }
        },
        // [ADDED] A new container for UI-related metadata that needs to be saved.
        uiMetadata: {
            lfModifiedRowIndexes: []
        },
        quoteId: null,
        issueDate: null,
        dueDate: null,
        status: "Configuring",
        costDiscountPercentage: 0,
        customer: { 
            name: "",
            address: "",
            phone: "",
            email: ""
        }
    }
};