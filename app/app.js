// calculate subnets
function calculate() {
    var calcButton = document.getElementById("calculate");
    var ipField = document.getElementById("ip-address");
    var ipLabel = document.getElementById("ip-label");
    var subnetField = document.getElementById("subnet-mask");
    var versionFields = document.getElementsByName("ip-version");
    var snLabel = document.getElementById("sn-label");
    var subnetCountField = document.getElementById("subnet-count");
    var errorField = document.getElementById("error-field");

    // returns selected IP version
    function getVersion(versionFields) {
        // return version of checked radio button
        for (v in versionFields) {
            if (versionFields[v].checked) {
                return versionFields[v].value;      // ipv4 or ipv6
            }
        }
    }

    // validate user input
    function validate(ip, ipBin, ipVersion, subnetMask, subnetCount) {

        // validate IP address format
        function validateAddressFormat(ip, ipVersion) {
            
            function v4Validate(ip) {
                // validate ipv4 address format (0-255.0-255.0-255.0-255)
                ipAddr = ip.split(".");
                if (ipAddr.length != 4) {                                               // 4 fields separated by "."
                    return [false, ipField, "Enter correct ip format: X.X.X.X"];
                }
                for (item in ipAddr) {
                    if (isNaN(ipAddr[item])) {                                          // insure numeric values
                        return [false, ipField, "Enter numbers"];
                    }
                    if (parseInt(ipAddr[item]) < 0 || parseInt(ipAddr[item]) > 255) {   // insure values within range
                        return [false, ipField, "Enter correct IP address values"];
                    }
                }
                return [true, ipField, ""];    
            }

            function v6Validate(ip) {
                // Regex from: https://community.helpsystems.com/forums/intermapper/miscellaneous-topics/5acc4fcf-fa83-e511-80cf-0050568460e4
                var v6Regex = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/i;
                if (ip.match(v6Regex)) {
                    return [true, ipField, ""];
                } else {
                    return [false, ipField, "Enter correct IPv6 Format: X:X:X:X:X:X:X:X"];
                }
                
            }

            if (ipVersion == "ipv4") {
                return v4Validate(ip);
            } else if (ipVersion == "ipv6") {
                return v6Validate(ip);
            }
        }

        // validate SN mask against IP address
        function validateSNMask(ipBin, subnetMask, ipVersion) {
            if (ipVersion == "ipv6") {                                                      // IPv6 subnet validation
                if (subnetMask < 0 || subnetMask > 64) {
                    return [false, subnetField, "Minimum IPv6 subnet size: /64"];
                }
            } else {
                if (subnetMask < 0 || subnetMask > 30) {                                    // IPv4 validation
                    return [false, subnetField, "Minimum IPv4 subnet size: /30"];
                }
            }
            for (var bit = subnetMask; bit < ipBin.length; bit++) {                         // insure all subnet bits == 0
                if (ipBin[bit] == "1") {
                    return [false, subnetField, "Provide valid subnet range/ mask"];
                }
            }
            return [true, subnetField, ""];
        }

        // validate requested subnet count
        function validateSubnetCount(ipBin, subnetMask, subnetCount) {
            var maxSubnets = (2 ** (ipBin.length - subnetMask) / 4);                    // determine max subnets
            if ( maxSubnets >= subnetCount) {
                return [true, subnetCountField, ""];
            } else if (subnetCount < 0) {                                               // insure positive subnet  count
                return [false, subnetCountField, "Enter non-negative subnet count"];
            } else {
                return [false, subnetCountField, "Maximum subnets in /" + subnetMask + " network: " + maxSubnets];
            }
        }

        var validateIP = validateAddressFormat(ip, ipVersion);
        var validateSN = validateSNMask(ipBin, subnetMask, ipVersion);
        var validateSNC = validateSubnetCount(ipBin, subnetMask, subnetCount);

        if (validateIP[0]) {                                                            // validate IP address
            inputMessage(validateIP);
            if (validateSN[0]) {                                                        // validate subnet mask
                inputMessage(validateSN);
                if (validateSNC[0]) {
                    inputMessage(validateSNC);
                    return true;
                } else {
                    inputMessage(validateSNC);
                }
            } else {
                inputMessage(validateSN);
            }
        } else {
            inputMessage(validateIP);
        }

        return false;
    }

    // returns binary string ipv4/ipv6 address
    function getBinary(ip, ipVersion) {

        function v4Binary(ip) {
            var ipBin = "";

            // create array of decimals
            ipAddr = ip.split('.');                                     // split on '.'
            
            // create binary string from decimal array
            for (item in ipAddr) {                                      // convert string list to binary string
                var octet = parseInt(ipAddr[item]).toString(2)          // convert to decimal from binary
                while (octet.length < 8) {                              // add extra 0s
                    octet = '0' + octet;
                }
                ipBin += octet;                                         // append octet to string
            }

            return ipBin;
        }

        function v6Binary(ip) {
            var ipBin = "";
            // create array of hexadecimal strings
            if (ip.includes("::")) {                                    // consecutive 0 omission
                ipAddr = ip.split("::");                                // split into array of 2 strings
                ipAddr[0] = ipAddr[0].split(":");                       // split first string into list of hex strings
                ipAddr[1] = ipAddr[1].split(":");

                for (item in ipAddr) {                                  // remove empty strings from arrays (first item)
                    if (ipAddr[item].includes("")) {
                        ipAddr[item].splice(0, 1);
                    }
                }
                while (ipAddr[0].length + ipAddr[1].length < 8) {       // fill to 8 hextets
                    ipAddr[0].push("0");
                }
                ipAddr = ipAddr[0].concat(ipAddr[1]);                   // concatenate nested arrays
            } else {
                ipAddr = ip.split(":");                                 // create array of hex strings
            }

            // create binary string from hexadecimal array
            for (item in ipAddr) {
                var hextet = parseInt(ipAddr[item], 16).toString(2);    // convert hex to binary
                while (hextet.length < 16) {                            // fill to 16 bits
                    hextet = '0' + hextet;
                }
                ipBin += hextet;                                        // append hextet to string
            }

            return ipBin;
        }

        if (ipVersion == "ipv4") {
            return v4Binary(ip);
        } else if (ipVersion == "ipv6") {
            return v6Binary(ip);
        }
    }

    // returns array of subnet info arrays
    function getSubnets(ipBin, subnetMask, subnetCount) {
        // returns array of 2 subnets: [{"ip": "binary", "mask": snmask}, {"ip": "binary", "mask": snmask}]
        function splitBit(subnet) {
            // split ipBin string at subnet mask+1
            var ipBin1 = subnet["ip"].slice(0, subnet["mask"]) + "0" + subnet["ip"].slice(subnet["mask"] + 1, subnet["ip"].length);
            var ipBin2 = subnet["ip"].slice(0, subnet["mask"]) + "1" + subnet["ip"].slice(subnet["mask"] + 1, subnet["ip"].length);
            var mask = subnet["mask"] + 1;

            return [{"ip": ipBin1, "mask": mask}, {"ip": ipBin2, "mask": mask}];
        }

        var subnets = [{"ip": ipBin, "mask": Number(subnetMask)}];
        var maxLength = 2;
        var iterator = 0;
        var splitSN;

        // divide until subnetCount reached
        while (subnets.length < subnetCount) {
            splitSN = splitBit(subnets[iterator]);                      // get list of split ips
            subnets.splice(iterator, 1, splitSN[0], splitSN[1]);        // replace ip with 2 split ips (ex. /24 -> /25, /25)
            iterator += 2;                                              // split NEXT ip in list
            if (subnets.length == subnetCount) {                        // desired subnet count
                return subnets;                                         // return subnet list
            }
            if (subnets.length == maxLength) {                          // iterated through list
                maxLength = maxLength * 2;                              // double maxLength for subnet division
                iterator = 0;                                           // reset iterator
            }
        }
    }

    function getIP(binaryString, ipVersion) {
        // convert to binary from decimal
        //console.log(parseInt(ipaddr[0]).toString(2))
    }

    // embed HTML response to user input
    function inputMessage(response) {
        errorField.innerHTML = response[2];             // pack error message
        if (response[0]) {
            response[1].classList.remove("error");      // add error "red BG" class if erroneous
        } else {
            response[1].classList.add("error");         // remove "red BG" if validated
        }
    }

    // calculate
    calcButton.addEventListener("click", () => {
        var ip = ipField.value;
        var ipVersion = getVersion(versionFields);
        var subnetMask = subnetField.value;
        var subnetCount = subnetCountField.value;
        var ipBin = getBinary(ip, ipVersion);
        
        if (validate(ip, ipBin, ipVersion, subnetMask, subnetCount)) {
            console.log("valid!");
            subnets = getSubnets(ipBin, subnetMask, subnetCount);
            console.log(subnets);
        } else {
            console.log("invalid");
        }
    });

    // select IPv4
    versionFields[0].addEventListener("click", () => {
        // ipv4 version selected
        ipLabel.innerHTML = "IPv4 Address";             // change text to "ipv4 address"
        ipField.style.width = "110px";                  // shrink ip input width
        ipField.value = "0.0.0.0";                      // clear ipField
        subnetField.value = "0";                        // clear subnetField
        subnetField.max = "32";                         // set maximum input value
        snLabel.style.marginLeft = "40px";              // shrink label position
    });

    // select IPv6
    versionFields[1].addEventListener("click", () => {
        // ipv6 version selected
        ipLabel.innerHTML = "IPv6 Address";             // change text to ipv6 address
        ipField.style.width = "250px";                  // extend ip input width
        ipField.value = "::";                           // clear ipField
        subnetField.value = "64";                       // clear subnet field
        subnetField.max = "64";                         // set maximum input value
        snLabel.style.marginLeft = "180px";             // extend label position
    });
}


const app = () => {
    calculate();
}