// File: 04-core-code/ui/views/quick-quote-view.spec.js

import { QuickQuoteView } from './quick-quote-view.js';
import { EVENTS } from '../../config/constants.js';

describe('QuickQuoteView', () => {
    let quickQuoteView;
    let mockQuoteService;
    let mockCalculationService;
    let mockUiService;
    let mockEventAggregator;
    let mockFocusService;
    let mockProductFactory; // [FIX] Declare mock for productFactory

    beforeEach(() => {
        // Arrange: Create mock dependencies for the QuickQuoteView constructor.
        mockQuoteService = {
            getQuoteData: jest.fn(),
            getItems: jest.fn().mockReturnValue([]),
            insertRow: jest.fn(),
            setQuoteData: jest.fn(),
        };
        mockCalculationService = {
            calculateAndSum: jest.fn(),
        };
        mockUiService = {
            getState: jest.fn(),
            setActiveCell: jest.fn(),
            clearMultiSelectSelection: jest.fn(),
            setSumOutdated: jest.fn(),
        };
        mockEventAggregator = {
            publish: jest.fn(),
        };
        mockFocusService = {
            focusAfterDelete: jest.fn(),
        };
        // [FIX] Create a proper mock for productFactory with the required method.
        mockProductFactory = {
            getProductStrategy: jest.fn(),
        };

        // Arrange: Instantiate the view with all its dependencies mocked.
        quickQuoteView = new QuickQuoteView({
            quoteService: mockQuoteService,
            calculationService: mockCalculationService,
            uiService: mockUiService,
            eventAggregator: mockEventAggregator,
            focusService: mockFocusService,
            productFactory: mockProductFactory, // [FIX] Pass the new mock
            // These are not used in the tested methods but are required by the constructor.
            fileService: {},
            configManager: {},
            publishStateChangeCallback: jest.fn(),
        });
    });

    describe('handleInsertRow', () => {
        it('should call quoteService.insertRow and uiService.setActiveCell when a valid row is selected', () => {
            // Arrange: Simulate a state where a single, valid row is selected.
            mockUiService.getState.mockReturnValue({ multiSelectSelectedIndexes: [0] });
            mockQuoteService.getItems.mockReturnValue([
                { width: 100, height: 100 }, // Row 0
                { width: 200, height: 200 }, // Row 1
                { width: null, height: null } // Last empty row
            ]);
            mockQuoteService.insertRow.mockReturnValue(1); // Simulate that the new row is at index 1.

            // Act: Call the method under test.
            quickQuoteView.handleInsertRow();

            // Assert: Verify that the correct service methods were called with the correct arguments.
            expect(mockQuoteService.insertRow).toHaveBeenCalledWith(0);
            expect(mockUiService.setActiveCell).toHaveBeenCalledWith(1, 'width');
            expect(mockUiService.clearMultiSelectSelection).toHaveBeenCalled();
        });
    });

    describe('handleCalculateAndSum', () => {
        it('should set sum as not outdated when calculation is successful', () => {
            // Arrange: Mock a successful calculation result.
            const mockQuoteData = { some: 'data' };
            const mockSuccessResult = { updatedQuoteData: mockQuoteData, firstError: null };
            mockQuoteService.getQuoteData.mockReturnValue(mockQuoteData);
            mockCalculationService.calculateAndSum.mockReturnValue(mockSuccessResult);
            // [FIX] Ensure getProductStrategy returns a mock strategy object.
            mockProductFactory.getProductStrategy.mockReturnValue({});

            // Act: Call the method.
            quickQuoteView.handleCalculateAndSum();

            // Assert: Verify state is updated correctly for success.
            expect(mockQuoteService.setQuoteData).toHaveBeenCalledWith(mockQuoteData);
            expect(mockUiService.setSumOutdated).toHaveBeenCalledWith(false);
            expect(mockEventAggregator.publish).not.toHaveBeenCalledWith(EVENTS.SHOW_NOTIFICATION, expect.any(Object));
        });

        it('should set sum as outdated and show a notification when calculation fails', () => {
            // Arrange: Mock a failed calculation result.
            const mockQuoteData = { some: 'data' };
            const mockError = { message: 'Test Error', rowIndex: 1, column: 'width' };
            const mockErrorResult = { updatedQuoteData: mockQuoteData, firstError: mockError };
            mockQuoteService.getQuoteData.mockReturnValue(mockQuoteData);
            mockCalculationService.calculateAndSum.mockReturnValue(mockErrorResult);
            // [FIX] Ensure getProductStrategy returns a mock strategy object.
            mockProductFactory.getProductStrategy.mockReturnValue({});

            // Act: Call the method.
            quickQuoteView.handleCalculateAndSum();

            // Assert: Verify state is updated correctly for failure.
            expect(mockQuoteService.setQuoteData).toHaveBeenCalledWith(mockQuoteData);
            expect(mockUiService.setSumOutdated).toHaveBeenCalledWith(true);
            expect(mockEventAggregator.publish).toHaveBeenCalledWith(EVENTS.SHOW_NOTIFICATION, { message: 'Test Error', type: 'error' });
            expect(mockUiService.setActiveCell).toHaveBeenCalledWith(1, 'width');
        });
    });
});