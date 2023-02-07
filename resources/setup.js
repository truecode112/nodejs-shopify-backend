async function getCurrentAccount() {
    const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'//'eth_accounts'
    });
    return accounts;
}

var iframe = null;

function loadWeb3()
{
  if (window.ethereum) {
    window.ethereum.on('chainChanged', function (chainId) {
      console.log('chainChanged', chainId);
    });
    window.ethereum.on('disconnect', function(error  /*:ProviderRpcError*/) {
      //alert("disconnected, " + error);      
      console.log('disconnected');
    });
    window.ethereum.on('accountsChanged', ( accounts/*: Array<string>*/) => {
      console.log('account changed', accounts);
      /*const message = JSON.stringify({
        type: 2,
        account: accounts[0]
      });
      sendMessageToParent(message);*/
    });
  }
};

function sendMessageToParent(message) {
  if (iframe != null && iframe != undefined) {
    iframe.contentWindow.postMessage(message, '*');
  }
}

$(document).ready(function() {
    iframe = document.createElement('iframe');
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
        if (event.origin == "https://sekanson.com") {
          console.log('received from iframe', event.data);
          const data = event.data;
          const decoded = JSON.parse(data);
          if (decoded.type == 1) {
            // Get Account Request
            getCurrentAccount().then((accounts) => {
                console.log('currentAccount', accounts[0]);
                const message = JSON.stringify({
                  type: 2,
                  account: accounts[0]
                });
                sendMessageToParent(message);
            }).catch((err) => {
            });
          } else if (decoded.type == 0) {
            $("#banner_iframe").css('display', 'block');
          }
        }
    });
    loadWeb3();
})
