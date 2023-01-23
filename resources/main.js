/* invoke this function to prompt user and connect wallet */
const ABI = [
  "function balanceOf(address owner) view returns (uint256)",
]

var globalAccount = undefined;
var globalSignature = undefined;

async function getAccount() {
  const accounts = await ethereum.request({
    method: 'eth_requestAccounts'
  });
  const account = accounts[0];
  globalAccount = accounts[0];
  console.log('account', globalAccount);
}

async function setBannerText(bannerText, showHint) {
  var currentDiscountCode = getCookie('CurDiscountCode');
  var bannerFinalText = "";
  if (showHint == true && currentDiscountCode !== undefined && currentDiscountCode !== "") {
    bannerFinalText = bannerText + '<p id="sekanson-cta-hint" style="color: rgb(255, 255, 255); font-size: 10px; text-align: center;">discount code is valid for 5 minutes</p>';
  } else {
    bannerFinalText = bannerText;
  }
  document.getElementById("sekanson-cta-text").innerHTML = bannerFinalText;
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
  const message = 'Very Message Such Wow';
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

function setCookie(name,value,minutes) {
  var expires = "";
  if (minutes) {
      var date = new Date();
      date.setTime(date.getTime() + (minutes*60*1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

function eraseCookie(name) {   
  document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function refreshBanner(timeout = 3000) {
  setTimeout(() => {
    var currentDiscountCode = getCookie('CurDiscountCode');
    if (currentDiscountCode == null) {
      var ctaText = getCookie('curCtaText')
      setBannerText(ctaText, false);
    } else {
      var currentMessage = getCookie('CurDiscountCodeMessage');
      setBannerText(currentMessage, true);
    }
  }, timeout);
}

async function callHolder() {
  var data_plugin_id = document.querySelector('script[data-styles][data-plugin-id]').getAttribute('data-plugin-id');
  var data_network = document.querySelector('script[data-styles][data-plugin-id]').getAttribute('data-network');
  var sendInfo = {
    wallet_address: globalAccount,
    chain_id: data_network,
    uid: data_plugin_id
  };

  $.ajax({
    type: "POST",
    url: "http://95.217.102.97/api/discount",
    headers:{         
      'Content-Type' : 'application/json',
    },
    dataType: "json",
    success: function (data) {
      console.log('data', data);
      if (data.error == null) {
        eraseCookie('CurDiscountCode');
        eraseCookie('CurDiscountCodeMessage');
        setCookie('CurDiscountCode', data.discount_code, 5);
        setCookie('CurDiscountCodeMessage', data.message, 5);
        setBannerText(data.message, true);
      } else {
        console.log(data.error);
      }
      refreshBanner();
    },
    error: function(err) {
      eraseCookie('CurDiscountCode');
      eraseCookie('CurDiscountCodeMessage');
      refreshBanner();
    },
    data: JSON.stringify(sendInfo)
  })
}

async function connectWallet() {
  if (typeof web3 !== 'undefined') {
    console.log('Web3 Detected! ' + web3.currentProvider.constructor.name)
    window.web3 = new Web3(web3.currentProvider);
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!');

      if (globalAccount == undefined) {
        await getAccount();  
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


window.onload = (event) => {
  const button = document.querySelector("#sekanson-banner");
  button.addEventListener("click", connectWallet);
  refreshBanner(0);
}