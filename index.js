// web3 provider with fallback for old version
if (window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    try {
        // ask user for permission
        ethereum.enable()
        // user approved permission
    } catch (error) {
        // user rejected permission
        console.log('user rejected permission')
    }
}
else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
    // no need to ask for permission
}
else {
    window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
}
console.log (window.web3.currentProvider)

var contractAddress;
var abi;
var account;

web3.eth.getAccounts(function(err, accounts) {
    if (err != null) {
        alert("Error retrieving accounts.");
        return;
    }
    if (accounts.length == 0) {
        alert("No account found! Make sure the Ethereum client is configured properly.");
        return;
    }
    account = accounts[0];
    console.log('Account: ' + account);
    web3.eth.defaultAccount = account;
});

function load(){
    abi = JSON.parse($("#abi").val());
    contractAddress = $("#address").val();
    contract = new web3.eth.Contract(abi, contractAddress);
    web3.eth.getAccounts();
    console.log("All ok!");
    $("#initial").hide();
    for (var obj in abi){
        console.log(obj);
        add_front_func(abi[obj]);
    }
    $("#result").show();
}

functions = {};
function add_front_func(obj){
    var funcName = obj.name;
    if (funcName === undefined){
        return;
    }
    $(".result-table").append(`<tr><td><h3>${funcName}</h3></td></tr>`);
    functions[funcName] = obj;
    for (var key in obj['inputs']){
        var input = obj['inputs'][key];
        var type = input["type"];
        var inputName = input["name"];
        var inp_id = funcName + "_" + inputName;
        $(".result-table").append(`<td><label htmlFor='${inp_id}'>${inputName}</label><input class='form-control' id='${inp_id}' placeholder='${type}'></td>`);
    }
    $(".result-table").append(`<td><a href="#" onclick="execute('${funcName}')" class="btn btn-primary" style="position: relative; bottom: 0">${funcName}</a></td>`);

    if (obj['outputs']){
        for (var key in obj['outputs']){
            var output = obj['outputs'][key];
            var out_id = funcName + '_' + key;
            $(".result-table").append(`<tr><td><h4>Result:</h4> <p id="${out_id}"></p></td></tr>`);
        }
    }
}

function execute(name){
    var args = [];
    var outputs = [];

    var obj = functions[name];
    var funcType = obj.stateMutability;
    var method = 'send';

    if (funcType === "view"){
        method = 'call';
    }
    for (var key in obj['inputs']){
        var input = obj['inputs'][key];
        var inputName = input["name"];
        var inp_id = name + "_" + inputName;
        args.push($(`#${inp_id}`).val());
    }
    if (obj['outputs']){
        for (var key in obj['outputs']){
            var output = obj['outputs'][key];
            var out_id = name + '_' + key;
            outputs.push(out_id);
        }
    }
    contract.methods[name](...args)[method]({from: account}).then(function (res){
        console.log(res);
        if (document.getElementById(name + '_0')){
            document.getElementById(name + '_0').innerHTML = res;
        }

    })

}