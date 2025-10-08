(function(){const H=document.createElement("link").relList;if(H&&H.supports&&H.supports("modulepreload"))return;for(const D of document.querySelectorAll('link[rel="modulepreload"]'))r(D);new MutationObserver(D=>{for(const w of D)if(w.type==="childList")for(const G of w.addedNodes)G.tagName==="LINK"&&G.rel==="modulepreload"&&r(G)}).observe(document,{childList:!0,subtree:!0});function A(D){const w={};return D.integrity&&(w.integrity=D.integrity),D.referrerPolicy&&(w.referrerPolicy=D.referrerPolicy),D.crossOrigin==="use-credentials"?w.credentials="include":D.crossOrigin==="anonymous"?w.credentials="omit":w.credentials="same-origin",w}function r(D){if(D.ep)return;D.ep=!0;const w=A(D);fetch(D.href,w)}})();function Yr(v){return v&&v.__esModule&&Object.prototype.hasOwnProperty.call(v,"default")?v.default:v}var Es={exports:{}},Jn={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Er;function Im(){if(Er)return Jn;Er=1;var v=Symbol.for("react.transitional.element"),H=Symbol.for("react.fragment");function A(r,D,w){var G=null;if(w!==void 0&&(G=""+w),D.key!==void 0&&(G=""+D.key),"key"in D){w={};for(var W in D)W!=="key"&&(w[W]=D[W])}else w=D;return D=w.ref,{$$typeof:v,type:r,key:G,ref:D!==void 0?D:null,props:w}}return Jn.Fragment=H,Jn.jsx=A,Jn.jsxs=A,Jn}var Dr;function Pm(){return Dr||(Dr=1,Es.exports=Im()),Es.exports}var c=Pm(),Ds={exports:{}},F={};/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var _r;function th(){return Dr||(Dr=1,Es.exports=Im()),Es.exports}/* ...file continues... */

//# sourceMappingURL=index-CLmY3K2d.js.map
