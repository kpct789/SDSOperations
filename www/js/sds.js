var qsParm = new Array();
document.addEventListener("deviceready", onDeviceReady, false);

/*var readapp = {
    initialize: function(){
        this.bindEvents();
    },

    bindEvents: function(){
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function(){
        $("#hiduuid").val(device.uuid);
        window.plugins.imeiplugin.getImei(callback);
        nfc.enabled(function(){
            lblerr.innerHTML = "Tap nfc tag to read";
            nfc.addNdefListener(ndefTagDetected);
        },
        function(){
            alert('NFC is disabled in your device. Please enable and come back again.')
        });
    }
};*/
function onDeviceReady() {
    $("#hiduuid").val(device.uuid);
    window.plugins.imeiplugin.getImei(callback);
    nfc.enabled(function(){
        lblerr.innerHTML = "Tap nfc tag to read";
        nfc.addNdefListener(ndefTagDetected);
    },
    function(){
        alert('NFC is disabled in your device. Please enable and come back again.')
    });
}
function ndefTagDetected(record){
    //debugger;
    txttruckno.value = "";
    var tagdata = record.tag.ndefMessage[0]["payload"];
    var label = document.createTextNode(nfc.bytesToString(tagdata));
    txttruckno.value = label.data;
    lblerr.innerHTML = "";
    GetTruckDetails(txttruckno.value);
}

function callback(imei) {
    $("#hidimei").val(imei);
    lblerr.innerHTML = imei;
}
function qs() {
    var query = window.location.search.substring(1);
    var parms = query.split('&');
    for (var i = 0; i < parms.length; i++) {
        var pos = parms[i].indexOf('=');
        if (pos > 0) {
            var key = parms[i].substring(0, pos);
            var val = parms[i].substring(pos + 1);
            qsParm[key] = val;
        }
    }

    if (parms.length == 1 && query != "") {
        $("#hidusrid").val(atob(qsParm["user"]));
        return true;
    }
    else if(parms.length > 1) {
        $("#hidusrid").val(atob(qsParm["user"]));
        $("#txttruckno").val(atob(qsParm["trkno"]));
        $("#txtqty").val(atob(qsParm["qty"]));
        $("#hidloc").val(atob(qsParm["loc"]));
        $("#btnSubmit").html("<i class='fa fa-check'></i> Submit");
        $("#btnSubmit").attr('disabled', false);
        $("#btnSubmit").attr('class', 'btn btn-custom');
        return true;
    }
    else {
        window.location.href = 'Login.html';
        return false;
    }
}
$(document).ready(function () {
    $("#imgtruck").hide();
    $("#loading").hide();
    //$("#divType").hide();
    //$("#divLoc").hide();
    $("#btnSubmit").hide();
    $("#btnClear").hide();
    $("#txttruckno").focus();
    $("#selLocation").prop('disabled', true);
    qs();
    GetDeviceStatus();
    GetTruckDetails($("#txttruckno").val().trim());
    Reason();

    $("#home").click(function () {
        $.ajax({
            type: "GET",
            url: "http://61.0.225.169/KPCTApi/api/Account/GetUserScreens/" + $("#hidusrid").val(),
            data: '{}',
            contentType: "application/json",
            success: function(result) {
                window.location.href = result + '?user=' + btoa($("#hidusrid").val());
            }
        });
    });

    $("#imgSearch").click(function () {
        $("#loading").show();
        $("#imgtruck").hide();
        $("#txtparty").val("");
        $("#txtloc").val("");
        $("#txtcargo").val("");
        $("#txtqty").val("");
        $("#hidTruckId").val("");
        $("#hidStatusId").val("");
        $("#txtstatus").text("");
        /*if ($("#txttruckno").val() == "") {
            alert('Please Enter Truck No.');
            $("#loading").hide();
            $("#txttruckno").focus();
            return false;
        }*/
        GetDeviceStatus();
        GetTruckDetails($("#txttruckno").val().trim());
        Reason();
        GetUserStages($("#hidusrid").val());
        $("#loading").hide();
    });

    $("#imgScan").click(function () {
        $("#txtparty").val("");
        $("#txtloc").val("");
        $("#txtcargo").val("");
        $("#txtqty").val("");
        $("#hidTruckId").val("");
        $("#hidStatusId").val("");
        $("#txtstatus").text("");
        $("#imgtruck").hide();
        scan();
    });

    $("#selReason").change(function (){
        var str = "";
        $("#selReason option:selected").each(function () {
            str += $(this).text().trim();
        });
        if(str != "--Select--" && str == "OTHER"){
            $("#txtremarks").focus();
        }
    });

    $("#btnClear").click(function (){
        window.location.href = 'SDS.html?user=' + btoa($("#hidusrid").val());
    });

    $("#btnSubmit").click(function (){
        var $btn = $("#btnSubmit");
        /*if(LocationValidations() == false)
        {
            return false;
        }
        else*/ if($("#hidStatusId").val() == 5 && $("#hidloctype").val() == 2 && $("#hidNewStatus").val() == "ACTIVITY END")
        {
            window.location.href = 'TallySheet.html?user=' + btoa($("#hidusrid").val()) + '&trkid=' + btoa($("#hidTruckId").val()) + '&trkno=' + btoa($("#txttruckno").val().trim()) + '&loctype=' + btoa($("#hidloctype").val()) + '';
        }
        else if($("#hidStatusId").val() == 5 && $("#hidloctype").val() == 1 && $("#hidNewStatus").val() == "ACTIVITY END")
        {
            window.location.href = 'TallySheet.html?user=' + btoa($("#hidusrid").val()) + '&trkid=' + btoa($("#hidTruckId").val()) + '&trkno=' + btoa($("#txttruckno").val().trim()) + '&loctype=' + btoa($("#hidloctype").val()) + '';
        }
        else if(RemarksValidations() == false)
        {
            return false;
        }
        else
        {
            $btn.html("<i class='fa fa-spinner fa-spin'></i>data is submitting please wait...");
            $btn.attr('disabled', true);
            $btn.attr('class', 'btn btn-custom-icon');
            var locType = $("#txtloctype").val();
            var loc = $("#hidloc").val();
            /*$("#selLocation option:selected").each(function () {
                loc += $(this).val().trim();
            });*/
            var reason = "";
            $("#selReason option:selected").each(function () {
                reason += $(this).val().trim();
            });

            var Adddata = {};
            Adddata.TruckNo = $("#txttruckno").val();
            Adddata.LocationName = loc;
            Adddata.LocationType = locType;
            Adddata.Qty = $("#txtqty").val();
            Adddata.ReasonId = reason;
            Adddata.Remarks = $("#txtremarks").val();
            Adddata.User = $("#hidusrid").val();
            $.ajax({
                type: 'POST',
                url: 'http://61.0.225.169/KPCTApi/api/TruckDetails/AddData',
                dataType: "json",
                data: Adddata,
                success: function (result) {
                    alert('Data Saved Successfully.');
                    window.location.href = 'SDS.html?user=' + btoa($("#hidusrid").val());
                },
                error: function () {
                    alert('Error occurred while saving the data.');
                    $btn.html("<i class='fa fa-check'></i> Submit");
                    $btn.attr('disabled', false);
                    $btn.attr('class', 'btn btn-custom-icon');
                }
            });
        }
    });
});

function GetUserStages(userid)
{
    $.ajax({
        url: 'http://61.0.225.169/KPCTApi/api/Account/GetUserStages/' + userid,
        type: 'GET',
        data: '{}',
        dataType: 'json',
        async: false,
        success: function (data){
            if(data.length > 0)
            {
                for (var i = 0; i <= data.length; i++)
                {
                    if($("#hidStatusId").val() == data[i])
                    {
                        $("#btnSubmit").attr('disabled', false);
                        break;
                    }
                    else $("#btnSubmit").attr('disabled', true);
                }
            }
            else $("#btnSubmit").attr('disabled', true);
        }
    });
}

function GetTruckDetails(truckno)
{
    var trkno = truckno == "" ? "" : truckno;
    if(trkno != "")
    {
        $.ajax({
            url: 'http://61.0.225.169/KPCTApi/api/TruckDetails/GetTruckDetails/' + trkno,
            type: 'GET',
            data: '{}',
            dataType: 'json',
            async: false,
            success: function (result) {
                if (result.length > 0) {
                    $("#txtparty").val(result[0].Party);
                    $("#txtloc").val(result[0].Loc);
                    $("#txtactloc").val(result[0].ActualLocation);
                    $("#txtcargo").val(result[0].Cargo);
                    $("#txtqty").val(result[0].Qty);
                    $("#txtstatus").text(result[0].Status);
                    $("#hidNewStatus").val(result[0].NextStatus);
                    $("#hidTruckId").val(result[0].TruckId);
                    $("#hidStatusId").val(result[0].StatusId);
                    $("#hidfrstflag").val(result[0].FirstTransit_Flag);
                    $("#hidprkngflag").val(result[0].DBParking_Flag);
                    $("#hidscndflag").val(result[0].SecondTransit_Flag);
                    $("#hidactlogflag").val(result[0].ActivityLoc_Flag);
                    $("#hidsdsoutflag").val(result[0].SDSOut_Flag);
                    $("#hidkpctoutflag").val(result[0].KPCTOut_Flag);
                    $("#hidfnlflag").val(result[0].FinalTransit_Flag);
                    $("#txtstatus").attr('class', 'text-success');
                    $("#btnSubmit").show();
                    $("#btnClear").show();
                    /*$("#btnSubmit").html("<i class='fa fa-check'></i> " + result[0].NextStatus);*/
                    $("#hidtrkstatus").val(result[0].NextStatus);
                    $("#btnSubmit").attr('disabled', false);
                    $("#btnSubmit").attr('class', 'btn btn-custom');
                    if($("#hidStatusId").val() == 5 && $("#hidloctype").val() == 1 && $("#hidNewStatus").val() == "ACTIVITY END")
                        $("#btnSubmit").html("<i class='fa fa-check'></i> Tally Sheet");
                    else if($("#hidStatusId").val() == 5 && $("#hidloctype").val() == 2 && $("#hidNewStatus").val() == "ACTIVITY END")
                        $("#btnSubmit").html("<i class='fa fa-check'></i> Tally Sheet");
                    else
                        $("#btnSubmit").html("<i class='fa fa-check'></i> " + result[0].NextStatus);
                    DisableButton(result[0].NextStatus, result[0].LocType, $("#hidloctype").val());
                }
                else {
                    $("#txtstatus").text("No Data Found");
                    $("#txtstatus").attr('class', 'text-danger');
                }
            },
            error: function () {
                alert('Error occurred while loading Truck details.');
                $("#imgtruck").hide();
                $("#loading").hide();
            }
        });
    }
}

function Reason()
{
    $("#selReason").empty();
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: 'http://61.0.225.169/KPCTApi/api/Reason/GetReasons',
        dataType: "json",
        data: '{}',
        async: false,
        success: function (locresult) {
            $.each(locresult, function (key, value) {
                $("#selReason").append($("<option></option>").val(value.ReasonId).html(value.Reason));
            });
        },
        error: function () {
            alert("Error occurred while loading Reasons.");
        }
    });
}

function GetDeviceStatus()
{
    var Adddata = {};
    Adddata.IMEI = $("#hidimei").val();
    Adddata.UUID = $("#hiduuid").val();
    $.ajax({
        type: "POST",
        url: 'http://61.0.225.169/KPCTApi/api/Account/GetDeviceStatus',
        dataType: "json",
        data: Adddata,
        async: false,
        success: function (result) {
            $("#hidloctype").val(result);
            if(result == '1')
            {
                $("#txtloctype").val("WH");
            }
            else if(result == '2')
            {
                $("#txtloctype").val("YARD");
            }
        },
        error: function () {
            alert("Error occurred while getting device details.");
        }
    });
}

function ShowObjects()
{
    /*if($("#hidStatusId").val() == 5)
    {
        $("#divType").show();
        $("#divLoc").show();
    }*/
}

function DisableButton(obj, plocid, alocid)
{
    $("#lblerr").html();
    $("#btnSubmit").prop('disabled', false);
    if(obj == 'SDS ACK IN' || obj == 'SDS-OUT ACK' || obj == 'EXIT') {
        $("#btnSubmit").prop('disabled', true);
    }
    else {
        $("#selLocation").prop('disabled', true);
    }

    /*if(plocid > 0 && plocid != alocid)
    {
        $("#btnSubmit").prop('disabled', true);
        if(alocid == 1)
            $("#lblerr").html('Planned Loation is in Yard. Device is registered for WareHouse. Pleace Check.');
        else if(alocid == 2)
            $("#lblerr").html('Planned Location is in WareHouse. Device is registered for Yard. Pleace Check.');
    }*/

    if(alocid == 3)
    {
        if(obj == 'PARKING IN' || obj == 'PARKING OUT')
            $("#btnSubmit").prop('disabled', false);
        else
            $("#btnSubmit").prop('disabled', true);
    }
}

function scan()
{
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            if (!result.cancelled) {
                $("#txttruckno").val(result.text);
            }
        },
        function (error) {
            alert("Scanning failed: " + error);
        }
    );
}

function LocationValidations()
{
    if($("#hidStatusId").val() == 4)
    {
        var loc = "";
        $("#selLocation option:selected").each(function () {
            loc += $(this).text().trim();
        });

        if(loc == "--Select--")
        {
            alert('Please Select Location');
            $("#selLocation").focus();
            return false;
        }
    }
    return true;
}

function RemarksValidations()
{
    var reason = "";
    $("#selReason option:selected").each(function () {
        reason += $(this).text().trim();
    });
    if(($("#hidStatusId").val() == 1 && ($("#hidfrstflag").val() == 'C' || $("#hidfrstflag").val() == 'W'))
     ||($("#hidStatusId").val() == 2 && ($("#hidprkngflag").val() == 'C' || $("#hidprkngflag").val() == 'W'))
     ||($("#hidStatusId").val() == 3 && ($("#hidscndflag").val() == 'C' || $("#hidscndflag").val() == 'W'))
     ||($("#hidStatusId").val() == 4 && ($("#hidactlogflag").val() == 'C' || $("#hidactlogflag").val() == 'W'))
     ||($("#hidStatusId").val() == 5 && ($("#hidsdsoutflag").val() == 'C' || $("#hidsdsoutflag").val() == 'W'))
     ||($("#hidStatusId").val() == 6 && ($("#hidkpctoutflag").val() == 'C' || $("#hidkpctoutflag").val() == 'W'))
     ||($("#hidStatusId").val() == 7 && ($("#hidfnlflag").val() == 'C' || $("#hidfnlflag").val() == 'W')))
    {
        if(reason == "--Select--")
        {
            alert('Please Select Reason');
            $("#selReason").focus();
            return false;
        }
    }

    if(reason == "OTHER")
    {
        if($("#txtremarks").val()=="")
        {
            alert('Enter Remarks');
            $("#txtremarks").focus();
            return false;
        }
    }

    return true;
}
