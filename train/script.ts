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
    const tensors = {
        rawTrainFeatures: tf.tensor2d(xs),
        trainTarget: tf.tensor2d(ys)
    }
    

    const model = tf.sequential()
    
    model.compile({ loss: tf.losses.meanSquaredError, optimizer: tf.train.sgd(0.1) })
    let {dataMean, dataStd} = determineMeanAndStddev(tensors.rawTrainFeatures)
    const trainFeatures = normalizeTensor(tensors.rawTrainFeatures, dataMean, dataStd)
    model.add(tf.layers.dense({inputShape: [1], units: 1}));
   
    await model.fit(trainFeatures, tensors.trainTarget, {
        batchSize: saleDataset.length,
        epochs: 100,
        callbacks: tfvis.show.fitCallbacks({ name: '训练过程', }, ['loss'])
    })

    predict(model, dataMean, dataStd)
    
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

function normalizeTensor(data:tf.Tensor, dataMean:tf.Tensor, dataStd:tf.Tensor) {
    return data.sub(dataMean).div(dataStd)
}
function determineMeanAndStddev(data: tf.Tensor) {
    const dataMean = data.mean(0)
    const diffFromMean = data.sub(dataMean);
    const squaredDiffFromMean = diffFromMean.square();
    const variance = squaredDiffFromMean.mean(0)
    const dataStd = variance.sqrt()
    return {dataMean, dataStd}
  }

function predict(model: tf.Sequential, dataMean:tf.Tensor, dataStd:tf.Tensor){
    const predictRank = 100
    const output = model.predict(
        normalizeTensor(tf.tensor([predictRank]), dataMean, dataStd)
    ) as tf.Tensor


    console.log('输入排名为', predictRank, 
    '预测结果为',
    output.mul(dataStd).add(dataMean).dataSync()[0], '实际结果为 240')
}