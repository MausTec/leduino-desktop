const serialport = require('serialport')
serialport.list().then((ports) => {
    console.log('ports', ports);

    if (ports.length === 0) {
        document.getElementById('error').textContent = 'No ports discovered'
    } else {
        ports.map(port => {
            document.getElementById('error').textContent = JSON.stringify(port);
        })
    }
}).catch((err) => {
    document.getElementById('error').textContent = err.message
})