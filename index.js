var HID = require('node-hid');
var readExternalCommand = [0x01, 0x80, 0x33, 0x01, 0x00, 0x00, 0x00, 0x00];

exports.getDevices = function() {
    var devices = HID.devices();
    var list = [];
    devices.forEach(function(item) {
        if (item.product === "TEMPerNTC1.1" &&
            item.vendorId === 3141 &&
            item.interface === 1) {
            list.push(item.path);
        }
    });
    return list;
}

exports.readTemperature = function(path, callback, converter) {
    if (!converter) {
        converter = exports.toDegreeCelcius;
    }
    var device = new HID.HID(path);
    device.write(readExternalCommand);
    device.read(function(err, response) {
        if (err) {
            callback.call(this, err, null);
        } else {
            console.log(response);
            callback.call(this, null, JSON.stringify({
                t0: converter(response[2], response[3]),
                t1: converter(response[4], response[5]),
                t2: converter(response[6], response[7])
            }));
        }
    });
}

exports.toDegreeCelcius = function(hiByte, loByte) {
    var sign = hiByte & (1 << 7);
    var temp = ((hiByte & 0x7F) << 8) | loByte;
    if (sign) {
        temp = -(128 - (temp * 125.0 / 32000.0));
    } else {
        temp = temp * 125.0 / 32000.0;
    }
    return temp.toFixed(2);
}
