'use strict';

const docker = require('harbor-master');

const client = docker.Client({
    host: '<put ip in here>',
    port: '2376'
});

let main = async() => {
    client.images().list().then((info) => {
        console.log('All images:', info);
    }).then(() => {
        let options = { all: true };
        client.containers().list(options).then((info) => {
            console.log('All Containers', info);
        }).catch((err) => {
            console.error(err);
        });
    }).then(() => {
        client.containers().stats('troys-container').then((emitter) => {
            emitter.on('data', (data) => {

                data = JSON.parse(data);

                if (data && data.memory_stats && data.memory_stats.usage) {
                    const mem = (data.memory_stats.usage / Math.pow(1024, 2)) * (Math.pow(2, 20) / Math.pow(10, 6)).toFixed(2);
                    const memUsage = ((data.memory_stats.usage / data.memory_stats.limit) * 100).toFixed(2);

                    let cpuPercent = (data.cpu_stats.cpu_usage.total_usage / data.cpu_stats.system_cpu_usage);
                    cpuPercent = cpuPercent * data.cpu_stats.cpu_usage.percpu_usage.length * 100;
                    cpuPercent = cpuPercent.toFixed(2);

                    const networkIn = (data.networks.eth0.rx_bytes / 1024 / 1024).toFixed(3)
                    const networkOut = (data.networks.eth0.tx_bytes / 1024 / 1024).toFixed(3)

                    console.log('Memory Usage:', mem + 'MB', memUsage + '%');
                    console.log('CPU Usage:', cpuPercent + '%');
                    console.log('Network Usage:', networkIn + 'MB / ' + networkOut + 'MB');

                }
            });
        });
    })
}

main();
