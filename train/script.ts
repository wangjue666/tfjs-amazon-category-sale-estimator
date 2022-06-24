import * as tf from "@tensorflow/tfjs"
import * as tfvis from "@tensorflow/tfjs-vis"
import saleDataset from "./sale"
// const saleDataset = [
//     {rank:1, sale: 40},
//     {rank:2, sale: 50},
//     {rank:3, sale: 60},
// ]
window.onload = async () => {
    plot()
    const xs = saleDataset.map(item => [item.rank])
    const ys = saleDataset.map(item => [item.sale])
    const tensors = {
        rawTrainFeatures: tf.tensor2d(xs),
        rowTrainTarget: tf.tensor2d(ys),
    }
    let [dataMean, dataStd] = determineMeanAndStddev(tensors.rawTrainFeatures)
    let [labelDataMean, labelDataStd] = determineMeanAndStddev(tensors.rowTrainTarget)
    const trainTarget = normalizeTensor(tensors.rowTrainTarget, labelDataMean, labelDataStd)    

    const trainFeatures = normalizeTensor(tensors.rawTrainFeatures, dataMean, dataStd)    
    console.log("trainFeatures", trainFeatures.dataSync())
    console.log("tranTarget", trainTarget.dataSync())
    const model = tf.sequential()
    model.add(tf.layers.dense({
        inputShape: [1],
        units: 50,
        activation: 'sigmoid',
        kernelInitializer: 'leCunNormal'
    }));
    model.add(tf.layers.dense({units: 1}))
    model.compile({ loss: tf.losses.meanSquaredError, optimizer: tf.train.sgd(0.001) })

    await model.fit(trainFeatures, trainTarget, {
        batchSize: saleDataset.length,
        epochs: 100,
        callbacks: tfvis.show.fitCallbacks({ name: '训练过程', }, ['loss'])
    })
    console.log("得到的权重", model.layers[0].getWeights()[0].dataSync())
    predict(model, dataMean, dataStd, labelDataMean, labelDataStd)
    
}
function plot(){
    tfvis.render.scatterplot(
        { name: '线性回归训练集2' },
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
    return [dataMean, dataStd]
  }

function predict(model: tf.Sequential, dataMean:tf.Tensor, dataStd:tf.Tensor, labelDataMean:tf.Tensor, labelDataStd:tf.Tensor){
    const predictRank = normalizeTensor(tf.tensor([20]), dataMean, dataStd)
    const output = model.predict(
        predictRank
    ) as tf.Tensor


    console.log('68hang输入排名为', predictRank, 
    '预测结果为',
    output.mul(labelDataStd).add(labelDataMean).dataSync()[0])
}