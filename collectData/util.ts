import { json2csv, csv2json } from 'json-2-csv'
import fs from "fs"

export function saveCsv(arr: object[], fileName: string) {
    json2csv(arr, (err, csv) => {
        console.log(err)
        if (csv) {
            fs.writeFileSync(fileName, csv)
        }
        console.log("保存文件成功")
    })
}


export function sleep(timer: number) {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, timer)
    })
}
function saveJSON(){
    fs.readFile("./train/sale.csv", (err, csv)=>{
        console.log(err)
        csv2json(csv.toString(), (err, json)=>{
            if(json){
                fs.writeFileSync("./sale.json", JSON.stringify(json))
            }
        })
    })
}

