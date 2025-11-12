// ==UserScript==
// @name         AltUpgradeTooltips
// @namespace    https://github.com/stellar-demesne/Trimps-AltUpgradesTooltips
// @version      1.0
// @updateURL    https://github.com/stellar-demesne/Trimps-AltUpgradesTooltips/AltUpgradeTooltips.user.js
// @description  Alternative Upgrade Button Tooltips
// @author       StellarDemesne
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @grant        none
// ==/UserScript==
var script = document.createElement('script');
script.id = 'AltUpgradeTooltips';
script.src = 'https://stellar-demesne.github.io/Trimps-AltUpgradesTooltips/AltUpgradeTooltips.js';
script.setAttribute('crossorigin', "anonymous");
document.head.appendChild(script);
