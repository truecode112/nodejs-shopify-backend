/* invoke this function to prompt user and connect wallet */
const ABI = [
  "function balanceOf(address owner) view returns (uint256)",
]

var globalAccount = undefined;
var globalSignature = undefined;

function isValidDiscountCode(discountCode) {
  if (discountCode === null || discountCode === undefined || discountCode === "") {
    return false;
  }
  return true;
}

async function getAccount() {
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });
  globalAccount = accounts[0];
  console.log('account', globalAccount);
}

async function setBannerText(bannerText) {
  document.getElementById("sekanson-cta-text").innerHTML = bannerText;
}

async function signMessage() {
  setBannerText('Please sign message to verify', false);
  try {
      const from = globalAccount;
      console.log('from : ' + from);
      const msg = `You are about to connect to slimprints.myshopify.com. \n\nThis signature will prove you are the owner of address ${globalAccount}.\n\n This action will not cost you anything.\n\nPlugin provided by Sekanson`;
      const sign = await ethereum.request({
          method: 'personal_sign',
          params: [msg, from, "Random text"],
      });
      console.log('sign : ' + sign);
      globalSignature = sign;
      return true;
  } catch (err) {
      console.error(err);
      return false;
  }
}

async function verifyMessage() {
  try {
      const from = globalAccount;
      const msg = `You are about to connect to slimprints.myshopify.com. \n\nThis signature will prove you are the owner of address ${globalAccount}.\n\n This action will not cost you anything.\n\nPlugin provided by Sekanson`;
      const recoveredAddr = web3.eth.accounts.recover(msg, globalSignature);
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
      return false;
      console.error(err);
  }
}

function refreshBanner(timeout = 3000) {
  setTimeout(() => {
    //var currentDiscountCode = getCookie('CurDiscountCode');
    //console.log('getCookie : curdiscountcode ', currentDiscountCode);
    var discountCode = $("#discountCode").val();
    if (isValidDiscountCode(discountCode) == false) {
      var ctaText = $("#curCtaText").val();
      setBannerText(ctaText);
    } else {
      setBannerText('Your current discount code is ' + discountCode);
    }
  }, timeout);
}

async function callHolder() {
  var iframe_data = window.name;
  var data_arr = iframe_data.split(',');
  var data_plugin_id = data_arr[0];
  var data_network = data_arr[1];
  var sendInfo = {
    wallet_address: globalAccount,
    chain_id: data_network,
    uid: data_plugin_id
  };

  $.ajax({
    type: "POST",
    url: "http://sekanson.com/slimprints/api/discount",
    headers:{         
      'Content-Type' : 'application/json',
    },
    dataType: "json",
    success: function (data) {
      console.log('data', data);
      if (data.error == null) {
        setBannerText(data.message, true);
        $("#discountCode").val(data.discount_code);
      } else {
        setBannerText(data.error, false);
        console.log(data.error);
        $("#discountCode").val("");
      }
      refreshBanner();
    },
    error: function(err) {
      $("#discountCode").val("");
      refreshBanner();
    },
    data: JSON.stringify(sendInfo)
  })
}

async function connectWallet() {
  const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'//'eth_accounts'
    });

    console.log(accounts)
  return;

  var discountCode = $("#discountCode").val();
  if (isValidDiscountCode(discountCode)) {
    navigator.clipboard.writeText(discountCode);
    alert('Copied ' + discountCode);
    return;
  }

  if (typeof web3 !== 'undefined') {
    console.log('Web3 Detected! ' + web3.currentProvider.constructor.name)
    window.web3 = new Web3(web3.currentProvider);
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!');
      await getAccount();  
      if (globalAccount == undefined) {
        ///await getAccount();  
      } 
      
      console.log('globalAccount', globalAccount);

      if (globalAccount !== undefined) {
        var signResult = await signMessage();
        if (signResult) {
          var verifyResult = await verifyMessage();
          if (verifyResult) {
            setBannerText('Verifying signature', false);
            callHolder();
          } else {
            setBannerText("Verify signature failed", false);
            globalSignature = undefined;
            refreshBanner();
          }
        }
        else {
          setBannerText("Signature rejected by user!", false);
          globalSignature = undefined;
          refreshBanner();
        }
      }
    } else {
      alert('MetaMask is not installed');
    }
  } else {
    console.log('No Web3 Detected... using HTTP Provider')
    window.web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/<APIKEY>"));
  }
  return;
}

function loadWeb3()
{
  if (window.ethereum) 
  {
    window.web3 = new Web3(window.ethereum);
    window.web3.eth.handleRevert = true;
  } 
  else if (window.web3) 
  {
    window.web3 = new Web3(Web3.givenProvider);
    window.web3.eth.handleRevert = true;
  } 
  else {
    // window.alert(
    //   "Non-Ethereum browser detected. Please connect and unlock your wallet."
    // );
    return;
  }
  if (window.ethereum) {
    window.web3 = new Web3(Web3.givenProvider);
    window.ethereum.on('chainChanged', function (chainId) {
      console.log('chainChanged', chainId);
    });
    window.web3.eth.getChainId().then((chainId) => {
      console.log('currentChainId', chainId);
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

window.onload = (event) => {
  const button = document.querySelector("#sekanson-banner");
  button.addEventListener("click", connectWallet);
  loadWeb3();
  //refreshBanner(0);
}