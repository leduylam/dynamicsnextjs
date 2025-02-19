export const number_format = (number: any) => {
    return number ? number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : 0
}

export const cleanSku = (sku: string) => {
    if (!sku) return '';
    return sku.includes('-')
        ? sku.split('-')[0]
        : sku.split('_').slice(0, -1).join('_');
};

// Hàm tính tổng các chữ số của số lượng
const calculateDigitSum = (quantity: number): number => {
    const quantityString = quantity.toString();
    return quantityString.split('').reduce((digitSum, digit) => digitSum + Number(digit), 0);
};

// Hàm tính tổng số lượng (tính từ attribute và sub_attribute nếu có)
interface SubAttribute {
    quantity?: number;
}

interface ActiveAttributes {
    quantity?: number;
    sub_attribute?: SubAttribute[];
}

export const calculateTotalQuantity = (activeAttributes: ActiveAttributes): number => {
    if (!activeAttributes) return 0; // Nếu activeAttributes không tồn tại, trả về 0.

    let totalQuantity = 0;

    // Kiểm tra nếu có sub_attribute, nếu không thì chỉ tính từ attribute
    if ((activeAttributes.sub_attribute ?? []).length > 0) {
        totalQuantity = (activeAttributes.sub_attribute ?? []).reduce((sum, subAttr) => {
            // Kiểm tra xem quantity có phải là số hợp lệ không trước khi tách thành chuỗi và tính tổng các chữ số
            const quantity = subAttr.quantity || 0;
            return sum + calculateDigitSum(quantity); // Tính tổng các chữ số của quantity
        }, 0);
    } else {
        // Nếu không có sub_attribute, tính tổng từ attribute quantity
        const attributeQuantity = activeAttributes.quantity || 0;
        totalQuantity = calculateDigitSum(attributeQuantity); // Tính tổng các chữ số của quantity
    }

    return totalQuantity;
};