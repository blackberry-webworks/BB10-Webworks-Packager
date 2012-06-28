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

var path = require("path"),
    wrench = require("wrench");

//
// zh-hans-cn/a.gif
// zh-hans-cn/f.gif
// zh-hans-cn/images/splash-1024x600.png
// zh-hans-cn/images/splash-600x1024.png
// zh-hans/a.gif
// zh-hans/b.gif
// zh/a.gif
// zh/b.gif
// zh/c.gif
//
// TODO do I have to worry about the actual existence of the unlocalized image files?
//
function generateLocalizedMetadataForSplashScreenIcon(config, configKey, xmlObject, xmlObjectKey, localeFiles) {
    // {
    //     "zh-hans-cn": ["a.gif", "f.gif", "images/splash-1024x600.png", "images/splash-600x1024.png"],
    //     "zh-hans": ["a.gif", "b.gif"],
    //     "zh": ["a.gif", "b.gif", "c.gif"]
    // }
    var localeMap = {};

    localeFiles.forEach(function (path) {
        var splitted = path.split("/"),
            locale;

        if (splitted.length > 1) {
            locale = splitted[0];

            if (!localeMap[locale]) {
                localeMap[locale] = [];
            }

            splitted.splice(0, 1);
            localeMap[locale].push(splitted.join("/"));
        }
    });

    xmlObject[xmlObjectKey] = {};
    xmlObject[xmlObjectKey]["image"] = [];

    config[configKey].forEach(function (imgPath) {
        imgPath.replace(/\\/g, "/"); // replace any backslash with forward slash

        Object.getOwnPropertyNames(localeMap).forEach(function (locale) {
            if (localeMap[locale].indexOf(imgPath) !== -1) {
                // localized image found for locale
                xmlObject[xmlObjectKey]["image"].push({
                    text: {
                        _attr: {
                            "xml:lang": locale
                        },
                        _value: "locales/" + locale + "/" + imgPath
                    }
                });
            }
        });

        xmlObject[xmlObjectKey]["image"].push({
            _value: imgPath
        });
    });
}

//
// widgetConfig.icon = ["a.png", "b.png", "c.png"];
// widgetConfig.splash = ["images/splash-1024x600.png", "images/splash-600x1024.png", "images/splash-1280x768.png", "images/splash-768x1280.png"];
//
function generateLocalizedMetadata(session, config, xmlObject) {
    if (config.icon || config.splash) {
        if (path.existsSync(session.sourceDir + "/locales")) {
            var localeFiles = wrench.readdirSyncRecursive(session.sourceDir + "/locales");
            generateLocalizedMetadataForSplashScreenIcon(config, "icon", xmlObject, "icon", localeFiles);
            generateLocalizedMetadataForSplashScreenIcon(config, "splash", xmlObject, "splashScreens", localeFiles);
        }
    }
}

module.exports = {
    generateLocalizedMetadata: generateLocalizedMetadata
};