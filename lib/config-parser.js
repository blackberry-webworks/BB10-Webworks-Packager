/*
 *  Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    packagerUtils = require('./packager-utils'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    localize = require("./localize"),
    logger = require("./logger"),
    fileManager = require("./file-manager"),
    utils = require("./packager-utils"),
    GLOBAL_FEATURES = [{
        version: "1.0.0.0",
        required: true,
        id: "blackberry.event"
    }], // the list of features that come for free, user does not need to whitelist manually    
    _self;

function createAccessListObj(featuresArray, uri, allowSubDomain) {
    var accessObj = {
            features: [],
            uri: uri,
            allowSubDomain: allowSubDomain
        },
        attribs;

    if (featuresArray) {
        featuresArray.forEach(function (feature) {
            attribs = feature["@"];

            attribs.required = packagerUtils.toBoolean(attribs.required, true);

            accessObj.features.push(attribs);
        });
    }

    // always add global features to whitelist
    GLOBAL_FEATURES.forEach(function (feature) {
        var featureFound = accessObj.features.reduce(function (found, currElem) {
                return found || currElem.id === feature.id;
            }, false);

        if (!featureFound) {
            accessObj.features.push(feature);
        }
    });

    return accessObj;
}

function processVersion(widgetConfig) {
    if (widgetConfig.version) {
        var versionArray = widgetConfig.version.split(".");
        
        //if 4rth number in version exists, extract for build id
        if (versionArray.length > 3) {
            widgetConfig.buildId = versionArray[3];
            widgetConfig.version = widgetConfig.version.substring(0, widgetConfig.version.lastIndexOf('.'));
        }
    }
}

function processBuildID(widgetConfig, session) {
    if (session.buildId) {
        //user specified a build id (--buildId), overide any previously set build id
        widgetConfig.buildId = session.buildId;
    }
}

function processWidgetData(data, widgetConfig, session) {
    var localFeatures, attribs, featureArray;

    if (data["@"]) {
        widgetConfig.version = data["@"].version;
        widgetConfig.id = data["@"].id;
    }

    widgetConfig.hasMultiAccess = false; // Default value of hasMultiAccess is false
    widgetConfig.accessList = [];

    
    //set locally available features to access list
    if (data.feature) {
        featureArray = packagerUtils.isArray(data.feature) ? data.feature : [data.feature];
    }
    
    localFeatures = createAccessListObj(featureArray, "WIDGET_LOCAL", true);
    widgetConfig.accessList.push(localFeatures);

    //add whitelisted features to access list
    if (data.access) {
        //If there is only one access list element, it will be parsed as an object and not an array
        if (!packagerUtils.isArray(data.access)) {
            data.access = [data.access];
        }

        data.access.forEach(function (accessElement) {
            attribs = accessElement["@"];

            if (attribs) {
                if (attribs.uri === "*") {
                    if (accessElement.feature) {
                        throw localize.translate("EXCEPTION_FEATURE_DEFINED_WITH_WILDCARD_ACCESS_URI"); 
                    }
                    
                    widgetConfig.hasMultiAccess = true;
                } else {
                    //set features for this access list
                    if (accessElement.feature) {
                        featureArray = packagerUtils.isArray(accessElement.feature) ? accessElement.feature : [accessElement.feature];
                    } else {
                        featureArray = undefined;
                    }

                    attribs.subdomains = packagerUtils.toBoolean(attribs.subdomains);
                    widgetConfig.accessList.push(createAccessListObj(featureArray, attribs.uri, attribs.subdomains));
                }
            }
        });
    }
}

function processIconData(data, widgetConfig) {
    if (data.icon && data.icon["@"]) {
        widgetConfig.icon = data.icon["@"].src;
    }
}

function processAuthorData(data, widgetConfig) {
    if (data.author) {
        var attribs = data.author["@"];

        if (!attribs && typeof data.author === "string") {
            //do not sanitize empty objects {} (must be string)
            widgetConfig.author = sanitize(data.author).trim();
        } else if (data.author["#"]) {
            widgetConfig.author = sanitize(data.author["#"]).trim();
        }

        if (attribs) {
            widgetConfig.authorURL = attribs.href;
            widgetConfig.copyright = attribs["rim:copyright"];
            widgetConfig.authorEmail = attribs.email;
        }
    }
}

function processLicenseData(data, widgetConfig) {
    if (data.license && data.license["#"]) {
        widgetConfig.license = data.license["#"];
    } else {
        widgetConfig.license = "";
    }

    if (data.license && data.license["@"]) {
        widgetConfig.licenseURL = data.license["@"].href;
    } else {
        widgetConfig.licenseURL = "";
    }
}

function processContentData(data, widgetConfig) {
    if (data.content) {
        var attribs  = data.content["@"],
            startPage;

        if (attribs) {
            widgetConfig.content = attribs.src;

            startPage = packagerUtils.parseUri(attribs.src);

            // if start page is local but does not start with local:///, will prepend it
            // replace any backslash with forward slash
            if (!packagerUtils.isAbsoluteURI(startPage) && !packagerUtils.isLocalURI(startPage)) {
                if (!startPage.relative.match(/^\//)) {
                    widgetConfig.content = "local:///" + startPage.relative.replace(/\\/g, "/");
                } else {
                    widgetConfig.content = "local://" + startPage.relative.replace(/\\/g, "/");
                }
            }

            widgetConfig.foregroundSource = attribs.src;
            widgetConfig.contentType = attribs.type;
            widgetConfig.contentCharSet = attribs.charset;
            widgetConfig.allowInvokeParams = attribs["rim:allowInvokeParams"];
            //TODO content rim:background
        }
    }
}

function processOrientationData(data, widgetConfig) {
    if (data["rim:orientation"]) {
        var mode = data["rim:orientation"].mode;

        if (mode === "landscape" || mode === "portrait") {
            widgetConfig.autoOrientation = false;
            widgetConfig.orientation = mode;
            return;
        }
    }

    //Default value
    widgetConfig.autoOrientation = true;
}

function processPermissionsData(data, widgetConfig) {
    if (data["rim:permissions"] && data["rim:permissions"]["rim:permit"]) {
        var permissions = data["rim:permissions"]["rim:permit"];
        
        if (permissions instanceof Array) {
            widgetConfig.permissions = permissions;
        } else {
            //user entered one permission and it comes in as an object
            widgetConfig.permissions = [permissions];
        }
    } else {
        widgetConfig.permissions = [];
    }
    
    // hardcoded access_internet to ensure user has internet (whitelist takes care of security)
    if (widgetConfig.permissions.indexOf("access_internet") === -1) {
        widgetConfig.permissions.push("access_internet");
    }
    
    //Remove any empty permission elements
    widgetConfig.permissions = widgetConfig.permissions.filter(function (val) {
        return typeof val === "string";
    });
}

function processInvokeTargetsData(data, widgetConfig) {

    if (data["rim:invoke-target"]) {
        widgetConfig["invoke-target"] = data["rim:invoke-target"];

        //If invoke-target is not an array, wrap the invoke-target in an array
        utils.wrapPropertyInArray(widgetConfig, "invoke-target");

        widgetConfig["invoke-target"].forEach(function (invokeTarget) {

            if (invokeTarget.type) {
                invokeTarget.type = invokeTarget.type.toUpperCase();
            }

            if (invokeTarget.filter) {
                utils.wrapPropertyInArray(invokeTarget, "filter");

                invokeTarget.filter.forEach(function (filter) {

                    if (filter["action"]) {
                        utils.wrapPropertyInArray(filter, "action");
                    }

                    if (filter["mime-type"]) {
                        utils.wrapPropertyInArray(filter, "mime-type");
                    }

                    if (filter["property"]) {
                        utils.wrapPropertyInArray(filter, "property");
                    }
                });
            }
        });
    }
}

function processSplashScreenData(data, widgetConfig) {
    //
    // This takes config.xml markup in the form of:
    //
    // <rim:splashScreens>
    //     <image>landscape.jpg</image>
    //     <image>portrait.jpg</image>
    //     <image><text xml:lang="fr">fr-landscape.jpg</text></image>
    //     <image><text xml:lang="fr">fr-portrait.jpg</text></image>
    //     <image><text xml:lang="es">es-landscape.jpg</text></image>
    //     <image><text xml:lang="es">es-portrait.jpg</text></image>
    // </rim:splashScreens>
    //
    // and turns it into for native-packager.js' consumption:
    //
    // splashScreens: {
    //    image: {
    //        "default": ["landscape.jpg", "portrait.jpg"],
    //        "fr": ["fr-landscape.jpg", "fr-portrait.jpg"],
    //        "es": ["es-landscape.jpg", "es-portrait.jpg"]
    //    }
    // }
    //
    if (data["rim:splashScreens"] && data["rim:splashScreens"]["image"]) {
        var rawImages = data["rim:splashScreens"]["image"],
            images = {};

        widgetConfig["splashScreens"] = {};
        widgetConfig["splashScreens"]["image"] = {};

        if (!(rawImages instanceof Array)) {
            rawImages = [rawImages];
        }

        rawImages.forEach(function (img) {
            var lang = "default";

            if (img.text && img.text["@"] && img.text["@"]["xml:lang"]) {
                lang = img.text["@"]["xml:lang"];
            }

            if (!images[lang]) {
                images[lang] = [];
            }

            if (lang !== "default") {
                images[lang].push(sanitize(img.text["#"]).trim());
            } else {
                images[lang].push(sanitize(img).trim());
            }
        });

        Object.getOwnPropertyNames(images).forEach(function (lang) {
            widgetConfig["splashScreens"]["image"][lang] = images[lang];
        });
    }
}

function validateConfig(widgetConfig) {

    check(widgetConfig.version, localize.translate("EXCEPTION_INVALID_VERSION"))
        .notNull()
        .regex("^[0-9]{1,3}([.][0-9]{1,3}){2,3}$");
    check(widgetConfig.name, localize.translate("EXCEPTION_INVALID_NAME")).notEmpty();
    check(widgetConfig.author, localize.translate("EXCEPTION_INVALID_AUTHOR")).notNull();
    check(widgetConfig.id, localize.translate("EXCEPTION_INVALID_ID")).regex("^[a-zA-Z][a-zA-Z0-9 ]*[a-zA-Z0-9]$");

    if (widgetConfig.icon) {
        check(widgetConfig.icon, localize.translate("EXCEPTION_INVALID_ICON_SRC")).notNull();
    }

    if (widgetConfig.accessList) {
        widgetConfig.accessList.forEach(function (access) {
            if (access.uri) {
                if (access.uri !== "WIDGET_LOCAL") {
                    check(access.uri, localize.translate("EXCEPTION_INVALID_ACCESS_URI_NO_PROTOCOL", access.uri))
                        .regex("^[a-zA-Z]+:\/\/");
                    check(access.uri, localize.translate("EXCEPTION_INVALID_ACCESS_URI_NO_URN", access.uri))
                        .notRegex("^[a-zA-Z]+:\/\/$");
                }
            }
        });
    }

    if (widgetConfig["invoke-target"]) {

        widgetConfig["invoke-target"].forEach(function (invokeTarget) {

            check(typeof invokeTarget["@"] === "undefined",
                    localize.translate("EXCEPTION_INVOKE_TARGET_INVALID_ID"))
                .equals(false);
            check(invokeTarget["@"].id, localize.translate("EXCEPTION_INVOKE_TARGET_INVALID_ID"))
                .notNull()
                .notEmpty();
            check(invokeTarget.type, localize.translate("EXCEPTION_INVOKE_TARGET_INVALID_TYPE"))
                .notNull()
                .notEmpty()
                .isIn(["APPLICATION", "VIEWER"]);

            if (invokeTarget.filter) {

                invokeTarget.filter.forEach(function (filter) {

                    check(filter["action"] && filter["action"] instanceof Array && filter["action"].length > 0,
                            localize.translate("EXCEPTION_INVOKE_TARGET_ACTION_INVALID"))
                        .equals(true);

                    check(filter["mime-type"] && filter["mime-type"] instanceof Array && filter["mime-type"].length > 0,
                            localize.translate("EXCEPTION_INVOKE_TARGET_MIME_TYPE_INVALID"))
                        .equals(true);

                    if (filter.property) {
                        filter.property.forEach(function (property) {
                            check(property["@"] && property["@"]["var"] && typeof property["@"]["var"] === "string",
                                    localize.translate("EXCEPTION_INVOKE_TARGET_FILTER_PROPERTY_INVALID"))
                                .equals(true);
                            check(property["@"]["var"], localize.translate("EXCEPTION_INVOKE_TARGET_FILTER_PROPERTY_INVALID"))
                                .isIn(["exts", "uris"]);
                        });
                    }
                });
            }
        });
    }
}

function processResult(data, session) {
    var widgetConfig = {};

    processWidgetData(data, widgetConfig, session);
    processIconData(data, widgetConfig);
    processAuthorData(data, widgetConfig);
    processLicenseData(data, widgetConfig);
    processContentData(data, widgetConfig);
    processOrientationData(data, widgetConfig);
    processPermissionsData(data, widgetConfig);
    processInvokeTargetsData(data, widgetConfig);
    processSplashScreenData(data, widgetConfig);

    widgetConfig.name = data.name;
    widgetConfig.description = data.description;
    widgetConfig.configXML = "config.xml";

    //validate the widgetConfig
    validateConfig(widgetConfig);
    
    //special handling for version and grabbing the buildId if specified (4rth number)
    processVersion(widgetConfig);
    
    //if --buildId was specified, it takes precedence
    processBuildID(widgetConfig, session);

    return widgetConfig;
}

_self = {
    parse: function (xmlPath, session, callback) {
        var fileData = fs.readFileSync(xmlPath),
            xml = utils.bufferToString(fileData),
            parser = new xml2js.Parser({trim: true, normalize: true, explicitRoot: false});

        //parse xml file data
        parser.parseString(xml, function (err, result) {
            if (err) {
                logger.error(localize.translate("EXCEPTION_PARSING_XML"));
                fileManager.cleanSource(session);
            } else {
                callback(processResult(result, session));
            }
        });
    },
    getGlobalFeatures: function () {
        return GLOBAL_FEATURES;
    }
};

module.exports = _self;
