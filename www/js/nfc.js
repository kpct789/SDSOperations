var readapp = {
    initialize: function(){
        this.bindEvents();
    },

    bindEvents: function(){
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function(){
        nfc.enabled(function(){
            debugger;
            nfc.addNdefListener(nfcTagDetected);
        },
        function(){
            alert('NFC is disabled in your device. Please enable and come back again.')
        });
    }
};
function ndefTagDetected(record){
    debugger;
    var tagdata = record.tag.ndefMessage[0]["payload"];
    var label = document.createTextNode(nfc.bytesToString(tagdata)),
    txttruckno.value = label;
    //lineBreak = document.createElement("br");
    //messageDiv.appendChild(lineBreak); // add a line break
    //messageDiv.appendChild(label); // add the text
    //alert(nfc.bytesToString(tagdata));
}
