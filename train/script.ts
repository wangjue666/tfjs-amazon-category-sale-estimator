import * as tf from "@tensorflow/tfjs"
import * as tfvis from "@tensorflow/tfjs-vis"
import saleDataset from "./sale"


window.onload = async () => {
    plot()
    const xs = saleDataset.map(item => item.rank)
    const ys = saleDataset.map(item => item.sale)


    const model = tf.sequential()
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }))
    model.compile({ loss: tf.losses.meanSquaredError, optimizer: tf.train.sgd(0.00001) })

    const [inputs, inputSubVal, inputMin] = normalize(tf.tensor(xs))
    const [labels, labelSubVal, labelMin] = normalize(tf.tensor(ys))
   
    await model.fit(inputs, labels, {
        batchSize: saleDataset.length,
        epochs: 10,
        callbacks: tfvis.show.fitCallbacks({ name: '训练过程', }, ['loss'])
    })

    const predictRank = 10
    const output = model.predict(
        tf.tensor([predictRank]).sub(inputMin).div(inputSubVal)
    ) as tf.Tensor


    console.log('输入排名为', predictRank, '预测结果为',output.mul(labelSubVal).add(labelMin).dataSync()[0])
    
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
        tensor.div(subVal),
        subVal,
        min
    ]
}
