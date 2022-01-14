import country, { countryMap } from "./country"
import categories from "./categories"
import { json2csv } from 'json-2-csv';
import axios from 'axios'
import fs from "fs"


async function run() {

}
function getRankArr():Array<number>{
    const arr:Array<number> = []
    for(let i=0;i< 300000;){
        let step = 0
        if(i <= 100){
            step = 5
        }else if(i<=1000){
            step+=50
        }else if(i<=10000){
            step+= 500
        }else{
            step+= 10000
        }
        i+=step
    }
    return arr
}

interface RequestParams {
    store: string
    category: string
    rank: number
}

async function getData(query: RequestParams) {
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
    }) as unknown as string
    const parseRes = JSON.parse(res)
    console.log("parseRes", parseRes)
}

function saveCsv(arr: object[], fileName: string){
    json2csv(arr,(err, csv)=>{
        console.log(err)
        console.log(csv)
        if(csv){
            fs.writeFileSync(fileName, csv)
        }
    })
}
