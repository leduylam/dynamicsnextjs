export const number_format = (number: any) => {
    return number ? number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : 0
}

export const cleanSku = (sku: string) => {
    if (!sku) return '';
    return sku.includes('-')
        ? sku.split('-')[0]
        : sku.split('_').slice(0, -1).join('_');
};