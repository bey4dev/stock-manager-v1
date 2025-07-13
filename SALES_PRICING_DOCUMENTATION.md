# Sales Module - Flexible Pricing System Documentation

## Overview
The Sales module now supports a flexible pricing system with multiple discount types, customer categories, and promotional codes. This allows for different pricing strategies for different customer types.

## New Features

### 1. Customer Types
- **Regular Customer**: Standard pricing with optional discounts
- **Reseller**: Automatic 3% discount applied to all purchases
- **Wholesale**: Automatic 5% discount applied to all purchases

### 2. Discount Types
- **None**: No discount applied
- **Percentage**: Percentage-based discount (e.g., 10% off)
- **Fixed Amount**: Fixed amount discount (e.g., Rp 5,000 off)
- **Promo Code**: Special promotional discount with code

### 3. Pricing Calculation
The system calculates prices in the following order:
1. Base Price (from product)
2. Customer Type Discount (if applicable)
3. Additional Discount (percentage, fixed, or promo)
4. Final Price = Base Price - Total Discounts

### 4. New Database Fields
The Sales table now includes these additional fields:
- `customerType`: 'regular' | 'reseller' | 'wholesale'
- `discountType`: 'none' | 'percentage' | 'fixed' | 'promo'
- `discountValue`: String value for discount amount/percentage
- `promoCode`: Promotional code (if applicable)
- `finalPrice`: Final calculated price per unit
- `originalTotal`: Original total before discounts
- `savings`: Total amount saved through discounts
- `notes`: Additional notes for the sale

## Google Sheets Integration

### Updated Column Structure
The Sales sheet now uses columns A through O:
- A: ID
- B: Date
- C: Product
- D: Quantity
- E: Price (original unit price)
- F: FinalPrice (discounted unit price)
- G: Total (final total amount)
- H: Customer
- I: CustomerType
- J: DiscountType
- K: DiscountValue
- L: PromoCode
- M: OriginalTotal
- N: Savings
- O: Notes

### Setting up Google Sheets
1. Open your Google Spreadsheet
2. Navigate to the "Sales" sheet
3. **BACKUP** existing data first by duplicating the sheet
4. Select the header row (A1:O1)
5. Copy and paste the following headers:
   ```
   ID	Date	Product	Quantity	Price	FinalPrice	Total	Customer	CustomerType	DiscountType	DiscountValue	PromoCode	OriginalTotal	Savings	Notes
   ```
6. Format the header row (bold, background color)
7. Adjust column widths for readability
8. Freeze the header row (View > Freeze > 1 row)
9. The system will automatically populate these columns when sales are added

**📋 Quick Setup:** Use the `fix-sales-headers.html` file for step-by-step guidance and copy-paste headers.

**🔍 Verification:** Run `verify-headers-setup.js` in browser console to check if headers are set correctly.

## Usage Examples

### Example 1: Regular Customer with Percentage Discount
```javascript
formData = {
  product: "Product A",
  quantity: 2,
  price: 10000,
  customer: "John Doe",
  customerType: "regular",
  discountType: "percentage",
  discountValue: "10",
  promoCode: "",
  notes: "10% discount for loyal customer"
}
// Result: finalPrice = 9000, total = 18000, savings = 2000
```

### Example 2: Reseller with Fixed Discount
```javascript
formData = {
  product: "Product B",
  quantity: 5,
  price: 20000,
  customer: "ABC Store",
  customerType: "reseller",
  discountType: "fixed",
  discountValue: "5000",
  promoCode: "",
  notes: "Bulk purchase discount"
}
// Result: finalPrice = 15000, total = 75000, savings = 25000
```

### Example 3: Wholesale with Promo Code
```javascript
formData = {
  product: "Product C",
  quantity: 10,
  price: 15000,
  customer: "XYZ Wholesale",
  customerType: "wholesale",
  discountType: "promo",
  discountValue: "25",
  promoCode: "SPECIAL25",
  notes: "Special promotional offer"
}
// Result: finalPrice = 10687.5, total = 106875, savings = 43125
```

## UI Features

### Price Preview
The form shows a real-time price breakdown:
- **Harga Satuan**: Original unit price
- **Harga Setelah Diskon**: Final unit price after discounts
- **Total**: Final total amount
- **Hemat**: Total amount saved

### Form Fields
- **Product**: Dropdown to select from available products with stock info
- **Quantity**: Number input with stock validation
- **Customer**: Dropdown to select existing customers or add new ones
- **Customer Type**: Dropdown to select customer category
- **Discount Type**: Dropdown to select discount method
- **Discount Value**: Input field for discount amount/percentage
- **Promo Code**: Input field for promotional codes
- **Notes**: Additional notes for the sale

### Customer Management
- **Existing Customers**: Select from dropdown list with company info
- **New Customers**: Choose "+ Customer Lain" to add new customer
- **Auto-Creation**: New customers are automatically added to Contacts
- **Integration**: Seamless integration with Contact management system

### Validation
- Quantity must be greater than 0
- Discount values must be positive numbers
- Promo codes are validated (currently supports any non-empty string)

## Technical Implementation

### Key Functions
- `calculateFinalPrice()`: Calculates final price based on all discounts
- `handleSubmit()`: Processes form submission with new fields
- `resetForm()`: Resets all form fields including new ones

### API Integration
- `GoogleSheetsService.addSale()`: Saves sales with all new fields
- `GoogleSheetsService.getSales()`: Retrieves sales with discount information

## Testing

### Manual Testing Steps
1. Open the Sales module
2. Select a product
3. Try different customer types and discount combinations
4. Verify price calculations are correct
5. Submit the form and check Google Sheets data
6. Verify stock is correctly reduced

### Automated Testing
Run the test script: `test-sales-features.js`
```javascript
// Load the test in browser console
testSalesFeatures();
```

## Migration Notes

### Existing Data
- Existing sales records will continue to work
- New fields will be populated with default values for old records
- No data migration is required

### Backwards Compatibility
- All existing functionality remains unchanged
- New features are additive and optional
- Default values ensure compatibility with existing workflows

## Future Enhancements

### Planned Features
1. Customer-specific pricing rules
2. Bulk discount tiers
3. Time-based promotional offers
4. Loyalty program integration
5. Advanced reporting with discount analytics

### Configuration Options
1. Customizable customer type discounts
2. Promo code validation system
3. Discount approval workflows
4. Price override permissions

---

## Support

For issues or questions about the flexible pricing system:
1. Check the browser console for error messages
2. Verify Google Sheets permissions and structure
3. Ensure all required fields are completed
4. Test with different customer types and discount combinations

Last updated: January 2025
