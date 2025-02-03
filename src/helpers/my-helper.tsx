export const number_format = (number: any) => {
    return number ? number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : 0
}