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

    const inputs = normalize(tf.tensor(xs))
    const labels = normalize(tf.tensor(ys))
    await model.fit(inputs, labels, {
        batchSize: 10,
        epochs: 10,
        callbacks: tfvis.show.fitCallbacks({ name: '训练过程', }, ['loss'])
    })


    const output = model.predict(tf.tensor([5])) as tf.Tensor
    output.print()
    console.log(output.dataSync())

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

function normalize(tensor: tf.Tensor) {
    const min = tensor.min()
    const max = tensor.max()

    return tensor.div(max.sub(min))
}
