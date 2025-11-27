import { RequestSmartbillInvoiceDto } from "src/smartbill/dto/request-smartbill-invoice.dto";
import { TrendyolOrderDto } from "../dto/trendyol-order.dto";
import { DateTime } from "luxon";
import { RequestSmartbillProductDto } from "src/smartbill/dto/request-smartbill-product.dto";

const SECTOR_DICT = {
  "01": "Sector 1",
  "02": "Sector 2",
  "03": "Sector 3",
  "04": "Sector 4",
  "05": "Sector 5",
  "06": "Sector 6",
}

export class TrendyolSmartbillInvoiceAdapter {
  static toInternal(requestDto: TrendyolOrderDto, seriesName: string): RequestSmartbillInvoiceDto {
    if (requestDto.invoiceAddress.countryCode !== "RO") {
      throw new Error(`Nur rumänische Rechnungen sind erlaubt. Der gegebene countryCode war: ${requestDto.invoiceAddress.countryCode}`);
    }
    requestDto.lines.forEach((product)=>{
      if (product.vatBaseAmount !== 21.00) {
        throw new Error(`vatBaseAmount of the product is expected to be 21 NORMALA, it was different, this case hasn't been handled yet: ${product.vatBaseAmount}`);
      }
      if (product.tyDiscount > 0) {
        throw new Error(`tyDiscount of the product is expected to be 0, it was different, this case hasn't been handled yet: ${product.tyDiscount}`);
      }
      if (product.currencyCode !== "RON") {
        throw new Error(`currencyCode of the product is expected to be RON, it was different, this case hasn't been handled yet: ${product.currencyCode}`);
      }
    })
    const issueDate = DateTime.fromMillis(requestDto.orderDate)
      .setZone('Europe/Bucharest');
    const dueDate = issueDate.plus({ days: 5 });
    var deliveryDate = DateTime.fromMillis(requestDto.packageHistories.findLast((packageHistory)=>packageHistory.status=="Delivered")?.createdDate || requestDto.estimatedDeliveryEndDate)
      .setZone('Europe/Bucharest');
    if(deliveryDate > dueDate){
      deliveryDate = dueDate;  // I don't think we can give a delivery date later than the due date, APIs don't mention anything about this specifically, but their example JSON values suggest this is the case.
    }
    const postalCode = requestDto.invoiceAddress.postalCode;
    const postalCodePrefix = postalCode.substring(0,2);
    const sector = SECTOR_DICT[postalCodePrefix];
    var address = `${requestDto.invoiceAddress.fullAddress}, ${requestDto.invoiceAddress.countyName}`;
    if(!address.toLocaleLowerCase().includes(requestDto.invoiceAddress.countyName.toLocaleLowerCase())){
      address = `${address}, ${requestDto.invoiceAddress.countyName}`;
    }
    if (
      sector !== undefined && !address.toLocaleLowerCase().includes(sector.toLocaleLowerCase())
    ){
      address = `${address}, ${sector}`;
    }
    const products: RequestSmartbillProductDto[]  = requestDto.lines.map((product) => ({
      name: product.productName,
      code: product.barcode,
      quantity: product.quantity,
      price: product.amount,
      isDiscount: false,
      isTaxIncluded: true,
      measuringUnitName: "buc",
      currency: product.currencyCode,
      taxName: "Normala",
      taxPercentage: Math.round(product.vatBaseAmount),
      isService: false,
    }));
    const discounts: RequestSmartbillProductDto[] = [];
    for(var key in requestDto.lines) {
      const product = requestDto.lines[key];
      if(!(product.discount > 0)){
        continue;
      }
      const discount: RequestSmartbillProductDto = {
        name: `Discount valoric pe produsul "${product.productName}"`,
        isDiscount: true,
        numberOfItems: product.quantity,
        discountType: 1,  // Discount that Trendyol applies is of "value" type, not of "percentage" type.
        discountValue: -product.discount * product.quantity,  // Even though we enter the numberOfItems, the discount value doesn't get multiplied by that. For that reason, we have to multiply it ourselves.
        isTaxIncluded: true,
        measuringUnitName: "buc",
        currency: product.currencyCode,
        taxName: "Normala",
        taxPercentage: product.vatBaseAmount,
      };
      discounts.push(discount);
    };
    
    return {
          client: {
            name: requestDto.invoiceAddress.fullName,
            vatCode: requestDto.identityNumber,
            address: address,
            isTaxPayer: requestDto.taxNumber ? true : false,
            city: requestDto.invoiceAddress.city,
            county: requestDto.invoiceAddress.countyName,
            country: "Romania",
            email: requestDto.customerEmail,
         },
         issueDate: issueDate.toFormat('yyyy-MM-dd'),
         dueDate: dueDate.toFormat('yyyy-MM-dd'),
         deliveryDate: deliveryDate.toFormat('yyyy-MM-dd'),
         products: [...products, ...discounts],
         currency: "RON",
         language: "RO",
         precision: 2,
         seriesName: seriesName,
         aviz: requestDto.orderNumber,
       
         observations: `Internal info. TrendyolOrderNumber=${requestDto.orderNumber},TrendyolTrackingCode=${requestDto.cargoTrackingNumber}`,
       
         mentions: "",
    };
  }
}
