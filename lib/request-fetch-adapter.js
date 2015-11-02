function serialize(obj) {
    var str = [];
    for(var p in obj){
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    }
    return str.join("&");
}

module.exports = function(options) {
    console.log(options);

    var opts = {
        method: options.method || 'GET',
        headers: options.headers || {}
    }
    var requestData = options.form || options.body;
    if (requestData) {
        opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        opts.body = serialize(requestData);
    }
    console.log("Mapped opts:", opts)
    return fetch(options.uri, opts).then(function(response) {
        return response.json();
    });
}