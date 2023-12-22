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

async function signMessage(account, storeURL) {
  try {
      const msg = `You are about to connect to ${storeURL}. \n\nThis signature will prove you are the owner of address ${account}.\n\n This action will not cost you anything.\n\nPlugin provided by Sekanson`;
      const sign = await window.ethereum.request({
          method: 'personal_sign',
          params: [msg, account],
      });
      console.log('sign : ' + sign);
      return sign;
  } catch (err) {
      console.error(err);
      return null;
  }
}

async function verifyMessage(account, signature, storeURL) {
  try {
      const from = account;
      const msg = `You are about to connect to ${storeURL}. \n\nThis signature will prove you are the owner of address ${account}.\n\n This action will not cost you anything.\n\nPlugin provided by Sekanson`;
      const recoveredAddr = web3.eth.accounts.recover(msg, signature);
      console.log('recoveredAddr : ' + recoveredAddr);

      if (recoveredAddr.toLowerCase() === from.toLowerCase()) {
          console.log(`Successfully ecRecovered signer as ${recoveredAddr}`);
          return true;
      } else {
          console.log(
              `Failed to verify signer when comparing ${recoveredAddr} to ${from}`,
          );
          return false;
      }
  } catch (err) {
    console.error(err);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  iframe = document.createElement('iframe');
  var iframe_props = {
      src: "https://sekanson.com/shopify/embeds/banner",
      width: "100%",
      height: "80px",
      border: "none",
      overflow: "hidden !important"
  };
  // var encoded = btoa(JSON.stringify(iframe_props));
  // console.log('encoded', encoded);
  // var decoded = atob(encoded);
  
  var data_styles = document.querySelector('script[data-styles][data-network]').getAttribute('data-styles');
  var data_plugin_id = document.querySelector('script[data-styles][data-network]').getAttribute('data-plugin-id');
  var data_network = document.querySelector('script[data-styles][data-network]').getAttribute('data-network');
  // var decoded = atob(data_styles);
  // var iframe_props = JSON.parse(decoded);
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
          // Click Banner
          const storeURL = decoded.storeURL;
          getCurrentAccount().then(async (accounts) => {
              console.log('currentAccount', accounts[0]);
              const connectedWallet = accounts[0];

              const message = JSON.stringify({
                type: 2,
                account: accounts[0]
              });
              sendMessageToParent(message);
              var signature = await signMessage(connectedWallet, storeURL);
              if (signature != null) {
                var verifyResult = await verifyMessage(connectedWallet, signature, storeURL);
                if (verifyResult) {
                  const message = JSON.stringify({
                    type: 3,
                    account: connectedWallet
                  });
                  sendMessageToParent(message);
                } else {
                  const message = JSON.stringify({
                    type: 4
                  });
                  sendMessageToParent(message);
                }
              }
              else {
                const message = JSON.stringify({
                  type: 5
                });
                sendMessageToParent(message);
              }

          }).catch((err) => {
          });
        } else if (decoded.type == 0) {
          if (this.window.location.hostname == 'odto.com') {
            const od_started = document.getElementById("od_start").getAttribute("is_started");
            if (od_started == "true" && this.window.location.pathname=="/collections/od") {
              this.document.getElementById("banner_iframe").style.display = "block";  
            }
          } else {
            this.document.getElementById("banner_iframe").style.display = "block";
          }
          // $("#banner_iframe").css('display', 'block');
        } else if (decoded.type == 2) {
          // Sign message

        }
      }
  });
  loadWeb3();
})