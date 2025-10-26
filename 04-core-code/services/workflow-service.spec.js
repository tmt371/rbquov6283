// File: 04-core-code/services/workflow-service.spec.js

import { WorkflowService } from './workflow-service.js';
import { EVENTS } from '../config/constants.js';

describe('WorkflowService', () => {
    let workflowService;
    let mockEventAggregator;
    let mockStateService;
    let mockUiService;
    // Add mocks for other dependencies even if not used in all tests
    let mockQuoteService;
    let mockCalculationService;
    let mockProductFactory;
    let mockDetailConfigView;

    beforeEach(() => {
        // Arrange: Create mock dependencies using jest.fn() for all methods we need to track/control.
        mockEventAggregator = {
            publish: jest.fn(),
        };
        mockStateService = {
            getState: jest.fn(),
        };
        mockUiService = {
            setF1RemoteDistribution: jest.fn(),
            setF1DualDistribution: jest.fn(),
        };
        mockQuoteService = {};
        mockCalculationService = {};
        mockProductFactory = {};
        mockDetailConfigView = {};

        // Arrange: Instantiate the service with mock dependencies
        workflowService = new WorkflowService({
            eventAggregator: mockEventAggregator,
            stateService: mockStateService,
            uiService: mockUiService,
            quoteService: mockQuoteService,
            calculationService: mockCalculationService,
            productFactory: mockProductFactory,
            detailConfigView: mockDetailConfigView,
        });
    });

    describe('handleRemoteDistribution', () => {
        it('should publish a confirmation dialog with correct remote counts', () => {
            // Arrange: Define a mock state that the service will retrieve.
            const mockState = {
                ui: {
                    driveRemoteCount: 5,
                    f1: {
                        remote_1ch_qty: 2,
                        remote_16ch_qty: null
                    }
                }
            };
            mockStateService.getState.mockReturnValue(mockState);

            // Act: Call the method under test.
            workflowService.handleRemoteDistribution();

            // Assert: Verify that eventAggregator.publish was called correctly.
            expect(mockEventAggregator.publish).toHaveBeenCalledTimes(1);
            expect(mockEventAggregator.publish).toHaveBeenCalledWith(
                EVENTS.SHOW_CONFIRMATION_DIALOG,
                expect.objectContaining({
                    message: 'Total remotes: 5. Please distribute them.',
                })
            );
        });
    });

    describe('handleDualDistribution', () => {
        it('should publish a confirmation dialog with correct dual pair counts', () => {
            // Arrange: Define a mock state with items to calculate dual pairs.
            const mockState = {
                quoteData: {
                    currentProduct: 'rollerBlind',
                    products: {
                        rollerBlind: {
                            items: [
                                { dual: 'D' }, { dual: 'D' }, // Pair 1
                                { dual: '' },
                                { dual: 'D' }, { dual: 'D' }, // Pair 2
                                { dual: 'D' }, // Unpaired
                            ]
                        }
                    }
                },
                ui: {
                    f1: {
                        dual_combo_qty: null,
                        dual_slim_qty: null
                    }
                }
            };
            mockStateService.getState.mockReturnValue(mockState);

            // Act: Call the method under test.
            workflowService.handleDualDistribution();

            // Assert: Verify that eventAggregator.publish was called correctly.
            expect(mockEventAggregator.publish).toHaveBeenCalledTimes(1);
            expect(mockEventAggregator.publish).toHaveBeenCalledWith(
                EVENTS.SHOW_CONFIRMATION_DIALOG,
                expect.objectContaining({
                    message: 'Total Dual pairs: 2. Please distribute them.',
                })
            );
        });
    });
});