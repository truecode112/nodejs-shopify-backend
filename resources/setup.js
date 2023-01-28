$(document).ready(function() {
    var iframe = document.createElement('iframe');
    var iframe_props = {
        src: "https://nenad.hariwhitedream.com/slimprints/embeds/banner",
        width: "100%",
        height: "80px",
        border: "none",
        overflow: "hidden !important"
    };
    var encoded = btoa(JSON.stringify(iframe_props));
    console.log('encoded', encoded);
    var decoded = atob(encoded);
    
    var data_styles = document.querySelector('script[data-styles][data-network]').getAttribute('data-styles');
    var data_plugin_id = document.querySelector('script[data-styles][data-network]').getAttribute('data-plugin-id');
    var data_network = document.querySelector('script[data-styles][data-network]').getAttribute('data-network');
    console.log('data-plugin-id', data_plugin_id);
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
        $("#banner_iframe").css('display', 'block');
    });
  })
