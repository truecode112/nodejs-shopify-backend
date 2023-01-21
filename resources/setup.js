window.onload = (event) => {
    var iframe = document.createElement('iframe');
    /*iframe.setAttribute("src", "https://yourcorehub.com/sekanson/embeds/banner");
    iframe.style.width = "100%";
    iframe.style.height = "80px";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden !important"
    var iframe_props = {
        src: "https://yourcorehub.com/sekanson/embeds/banner",
        width: "100%",
        height: "80px",
        border: "none",
        overflow: "hidden !important"
    };
    var encoded = btoa(JSON.stringify(iframe_props));
    console.log('encoded', encoded);
    var decoded = atob(encoded);
    console.log('decoded', decoded);*/
    
    var data_styles = document.querySelector('script[data-styles][data-network]').getAttribute('data-styles');
    console.log('data_styles', data_styles);
    var decoded = atob(data_styles);
    var iframe_props = JSON.parse(decoded);
    iframe.setAttribute("src", iframe_props.src);
    iframe.style.width = iframe_props.width;
    iframe.style.height = iframe_props.height;
    iframe.style.border = iframe_props.border;
    iframe.style.overflow = iframe_props.overflow;

    document.body.insertBefore(iframe, document.body.firstChild);
  }
