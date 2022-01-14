import country, { countryMap } from "./country"
import categories from "./categories"
import axios from 'axios'
import { saveCsv, sleep } from "./util"

const csvArray:object[] = []
const ranks = getRankArr()

run()
async function run() {
    //for (let i = 0; i < country.length; i++) {
    for (let i = 0; i < 1; i++) {  // 先抓取一个国家的数据
        const activeCountry = country[i].value
        const activeLabel = countryMap[activeCountry]
        await collectOneData(activeCountry, activeLabel)
    }
    saveCsv(csvArray, 'sale.csv')
}


async function collectOneData(store: string, countryLabel: number){
    for(let i=0;i<ranks.length;i++){
        const category = categories[store][0]
        const category_label = 1
        const sale = await getData({
            store,
            category,
            rank: ranks[i]
        })
        console.log("sale is", sale)
        csvArray.push({
            rank: ranks[i],
            countryLabel,
            category_label,
            sale,
        })
        if(sale == 0){  // 如果销量为0 提前终止循环
            break
        }
        await sleep(2000)
    }
}   

function getRankArr(): Array<number> {
    const arr: Array<number> = []
    for (let i = 0; i < 300000;) {
        let step = 0
        if (i <= 100) {
            step = 4
        } else if (i <= 1000) {
            step += 50
        } else if (i <= 10000) {
            step += 500
        } else {
            step += 10000
        }
        arr.push(i+1)
        i += step  
    }
    return arr
}

interface RequestParams {
    store: string
    category: string
    rank: number
}

async function getData(query: RequestParams):Promise<number> {
    const url = `https://app.isellerpal.com/api-tool//seller-sales-estimator`
    let res = await axios({
        url,
        method: 'get',
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
            "Host": "app.isellerpal.com",
            "Referer": "https://app.isellerpal.com/tools/estimator",
            "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
        },
        params: query
    }) as unknown as {data: {result: number}}
    return res.data.result
}



