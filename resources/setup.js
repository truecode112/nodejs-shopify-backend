async function getCurrentAccount() {
    const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'//'eth_accounts'
    });
    return accounts;
}

function loadWeb3()
{
  if (window.ethereum) {
    window.ethereum.on('chainChanged', function (chainId) {
      console.log('chainChanged', chainId);
    });
    window.web3.eth.getChainId().then((chainId) => {
      console.log('setup.js currentChainId', chainId);
    });
    window.ethereum.on('disconnect', function(error  /*:ProviderRpcError*/) {
      //alert("disconnected, " + error);      
      console.log('disconnected');
    });
    console.log('>>> 1', window.ethereum)
    window.ethereum.on('accountsChanged', ( accounts/*: Array<string>*/) => {
      console.log('account changed', accounts);
      /*alert("wallet "+accounts[0]+" is connected");
      console.log('accountsChanged', accounts[0]);
       if(accounts[0] !== undefined)
       {
        console.log('accountsChanged', accounts[0]);
       }
       if(accounts.length === 0) {
        console.log('no account selected');
       }*/
    });
  }
};

$(document).ready(function() {
    var iframe = document.createElement('iframe');
    var iframe_props = {
        src: "https://sekanson.com/slimprints/embeds/banner",
        width: "100%",
        height: "80px",
        border: "none",
        overflow: "hidden !important"
    };
    var encoded = btoa(JSON.stringify(iframe_props));
    var decoded = atob(encoded);
    
    var data_styles = document.querySelector('script[data-styles][data-network]').getAttribute('data-styles');
    var data_plugin_id = document.querySelector('script[data-styles][data-network]').getAttribute('data-plugin-id');
    var data_network = document.querySelector('script[data-styles][data-network]').getAttribute('data-network');
    var decoded = atob(data_styles);
    var iframe_props = JSON.parse(decoded);
    iframe.setAttribute("src", iframe_props.src);
    iframe.setAttribute("id", "banner_iframe");
    iframe.setAttribute("name", data_plugin_id + "," + data_network);
    iframe.setAttribute('allow', 'clipboard-write')
    iframe.style.width = iframe_props.width;
    iframe.style.height = iframe_props.height;
    iframe.style.border = iframe_props.border;
    iframe.style.overflow = iframe_props.overflow;
    iframe.style.display = 'none';

    document.body.insertBefore(iframe, document.body.firstChild);

    window.addEventListener('message', function(event) {
        if (event.origin == "https://sekanson.com")
            $("#banner_iframe").css('display', 'block');
    });

    getCurrentAccount().then((accounts) => {
        console.log('selectedAccount in setup.js', accounts);
    }).catch((err) => {

    });

    loadWeb3();
})
