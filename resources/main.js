/* invoke this function to prompt user and connect wallet */
const ABI = [
  "function balanceOf(address owner) view returns (uint256)",
]

//var globalAccount = undefined;
//var globalSignature = undefined;

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

async function callHolder(account) {
  var iframe_data = window.name;
  var data_arr = iframe_data.split(',');
  var data_plugin_id = data_arr[0];
  var data_network = data_arr[1];
  var sendInfo = {
    wallet_address: account,
    chain_id: data_network,
    uid: data_plugin_id,
    store: document.referrer
  };

  $.ajax({
    type: "POST",
    url: "https://sekanson.com/shopify/api/discount",
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

async function onClickBanner() {
  var discountCode = $("#discountCode").val();
  if (isValidDiscountCode(discountCode)) {
    navigator.clipboard.writeText(discountCode);
    alert('Copied ' + discountCode);
    return;
  }

  const message = JSON.stringify({
    type: 1,
    storeURL: $("#storeURL").val()
  });

  window.parent.postMessage(message, '*');
}

window.onload = (event) => {
  const button = document.querySelector("#sekanson-banner");
  button.addEventListener("click", onClickBanner);
  window.addEventListener('message', function(event) {
    // console.log(event.origin, event.data);
    if ($("#storeURL").val() != null && $("#storeURL").val() != undefined && $("#storeURL").val() != "") {
      const originURL = new URL(event.origin);
      const storeURL = new URL($("#storeURL").val());
      if (originURL.host == storeURL.host) {
        const data = event.data;
        const decoded = JSON.parse(data);
        if (decoded.type == 2) {
          // Started sign 
          setBannerText('Please sign message to verify', false);
        } else if (decoded.type == 3) {
          // Verify sign success
          setBannerText('Verifying signature', false);
          callHolder(decoded.account);
        } else if (decoded.type == 4) {
          // Verify sign failed
          setBannerText("Verify signature failed", false);
          refreshBanner();
        } else if (decoded.type == 5) {
          // Sign rejected
          setBannerText("Signature rejected by user!", false);
          refreshBanner();
        }
        $("#banner_iframe").css('display', 'block');
      }
    }
  });
  //refreshBanner(0);
}