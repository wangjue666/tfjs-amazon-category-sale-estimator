const country = [{
        label: "美国",
        value: "us",
        train_label: 1, 
    },
    {
        label: "英国",
        value: "uk",
        train_label: 2, 
    },
    {
        label: "法国",
        value: "fr",
        train_label: 3, 
    },
    {
        label: "意大利",
        value: "it",
        train_label: 4, 
    },
    {
        label: "西班牙",
        value: "es",
        train_label: 5, 
    },
    {
        label: "德国",
        value: "de",
        train_label: 6, 
    },
    {
        label: "加拿大",
        value: "ca",
        train_label: 7, 
    },
    {
        label: "墨西哥",
        value: "mx",
        train_label: 8, 
    },
    {
        label: "日本",
        value: "jp",
        train_label: 9, 
    },
    {
        label: "印度",
        value: "in",
        train_label: 10, 
    },
]

function tranCountryMap(){
    const countryMap:{[propName: string]: number} = {}
    country.forEach(item=>{
        countryMap[item.value] = item.train_label
    })
    return countryMap
}
export const countryMap = tranCountryMap()
export default country