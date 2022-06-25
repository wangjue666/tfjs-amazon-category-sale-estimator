import * as tf from "@tensorflow/tfjs"
import * as tfvis from "@tensorflow/tfjs-vis"
import saleDataset from "./sale"
// const saleDataset = [
//     {rank:1, sale: 10},
//     {rank:2, sale: 20},
//     {rank:3, sale: 30},
// ]
window.onload = async () => {
    plot()
    const xs = saleDataset.map(item => [item.rank, item.countryLabel, item.category_label])
    const ys = saleDataset.map(item => item.sale)
    shuffle(xs, ys)
    const tensors = {
        rawTrainFeatures: tf.tensor2d(xs),
        rowTrainTarget: tf.tensor2d(ys, [ys.length, 1]),
    }
    let [dataMean, dataStd] = determineMeanAndStddev(tensors.rawTrainFeatures)
    let [labelDataMean, labelDataStd] = determineMeanAndStddev(tensors.rowTrainTarget)
    const trainTarget = normalizeTensor(tensors.rowTrainTarget, labelDataMean, labelDataStd)    

    const trainFeatures = normalizeTensor(tensors.rawTrainFeatures, dataMean, dataStd)    
    console.log("trainFeatures", trainFeatures.dataSync())
    console.log("tranTarget", trainTarget.dataSync())
    const model = tf.sequential()
    model.add(tf.layers.dense({
        inputShape: [xs[0].length],
        units: 50,
        activation: 'sigmoid',
        kernelInitializer: 'leCunNormal'
    }))

    model.add(tf.layers.dense({units: 1}))
    model.compile({ loss: tf.losses.meanSquaredError, optimizer: tf.train.sgd(0.01) })

    await model.fit(trainFeatures, trainTarget, {
        batchSize: saleDataset.length,
        epochs: 300,
        callbacks: tfvis.show.fitCallbacks({ name: '训练过程', }, ['loss'])
    })
    console.log("得到的权重", model.layers[0].getWeights()[0].dataSync())

    model.summary()
    const evaluateData = model.evaluate(trainFeatures, trainTarget) as tf.Tensor
    evaluateData.print()
    predict(model, dataMean, dataStd, labelDataMean, labelDataStd)
    
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
    return [dataMean, dataStd]
  }

function predict(model: tf.Sequential, dataMean:tf.Tensor, dataStd:tf.Tensor, labelDataMean:tf.Tensor, labelDataStd:tf.Tensor){
    const predictRank = normalizeTensor(tf.tensor([
        [20, 1, 1],
        [400, 1, 1],
    ]), dataMean, dataStd)
    const output = model.predict(
        predictRank
    ) as tf.Tensor


    console.log('68hang输入排名为', 
    '预测结果为',
    output.mul(labelDataStd).add(labelDataMean).dataSync())
}


function shuffle(data: any[], target: number[]) {
    let counter = data.length;
    let temp = 0;
    let index = 0;
    while (counter > 0) {
      index = (Math.random() * counter) | 0;
      counter--;
      // data:
      temp = data[counter];
      data[counter] = data[index];
      data[index] = temp;
      // target:
      temp = target[counter];
      target[counter] = target[index];
      target[index] = temp;
    }
  };