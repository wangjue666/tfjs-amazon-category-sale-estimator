import * as tf from "@tensorflow/tfjs"
import * as tfvis from "@tensorflow/tfjs-vis"
import saleDataset from "./sale"
// const saleDataset = [
//     {rank:150, sale: 40},
//     {rank:160, sale: 50},
//     {rank:170, sale: 60},
// ]

window.onload = async () => {
    plot()
    const xs = saleDataset.map(item => item.rank)
    const ys = saleDataset.map(item => item.sale)


    const model = tf.sequential()
    model.add(tf.layers.dense({ units: 1, inputShape: [1], activation: 'relu' }))
    model.add(tf.layers.dense({
        units: 1,
        activation: 'sigmoid'
    }))
    model.compile({ loss: tf.losses.meanSquaredError, optimizer: tf.train.sgd(0.1) })
    // model.compile({
    //     loss: tf.losses.logLoss,
    //     optimizer: tf.train.adam(0.1)
    // })
    const [inputs, inputSubVal, inputMin] = normalize(tf.tensor(xs))
    const [labels, labelSubVal, labelMin] = normalize(tf.tensor(ys))
   
    await model.fit(inputs, labels, {
        batchSize: saleDataset.length,
        epochs: 300,
        callbacks: tfvis.show.fitCallbacks({ name: '训练过程', }, ['loss'])
    })

    predict(model, inputMin, inputSubVal, labelSubVal, labelMin)
    
}
function plot(){
    tfvis.render.scatterplot(
        { name: '线性回归训练集' },
        {
            values: saleDataset.map((item, i) => {
                return { x: item.rank, y: item.sale }
            })
        },
        { xAxisDomain: [0, 1000], yAxisDomain: [0, 10000] }
    )
}

function normalize(tensor: tf.Tensor):[tf.Tensor, tf.Tensor, tf.Tensor] {
    const min = tensor.min()
    const max = tensor.max()
    const subVal = max.sub(min)
    return [
        tensor.sub(min).div(subVal),
        subVal,
        min
    ]
}


function predict(model: tf.Sequential, inputMin: tf.Tensor, inputSubVal: tf.Tensor, labelSubVal: tf.Tensor, labelMin: tf.Tensor,){
    const predictRank = 100
    const output = model.predict(
        tf.tensor([predictRank]).sub(inputMin).div(inputSubVal)
    ) as tf.Tensor


    console.log('输入排名为', predictRank, 
    '预测结果为',
    output.mul(labelSubVal).add(labelMin).dataSync()[0], '实际结果为 240')
}