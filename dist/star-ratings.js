var starDratings=(()=>{function b(e){Spicetify.showNotification(e)}function t(e,t){Spicetify.LocalStorage.set(e,t)}function v(e){return e.match(/spotify:playlist:(.*)/)[1]}async function g(e,t){e=v(e);await Spicetify.CosmosAsync.del(`https://api.spotify.com/v1/playlists/${e}/tracks`,{tracks:[{uri:t}]})}function p(e,t){var i,a,r,n=document.createElement("span"),l="stars-"+e,o=(n.className="stars",n.id=l,n.style.whiteSpace="nowrap",n.style.alignItems="center",n.style.display="flex",[]);for(let e=0;e<5;e++){d=l,i=e+1,s=t,r=a=c=void 0,c="http://www.w3.org/2000/svg",a=document.createElementNS(c,"svg"),d=d+"-"+i,a.id=d,a.style.minHeight=s+"px",a.style.minWidth=s+"px",a.setAttributeNS(null,"width",s+"px"),a.setAttributeNS(null,"height",s+"px"),a.setAttributeNS(null,"viewBox","0 0 32 32"),i=document.createElementNS(c,"defs"),a.append(i),s=document.createElementNS(c,"linearGradient"),i.append(s),s.id=d+"-gradient",i=document.createElementNS(c,"stop"),s.append(i),i.id=d+"-gradient-first",i.setAttributeNS(null,"offset","50%"),i.setAttributeNS(null,"stop-color","var(--spice-button-disabled)"),r=document.createElementNS(c,"stop"),s.append(r),r.id=d+"-gradient-second",r.setAttributeNS(null,"offset","50%"),r.setAttributeNS(null,"stop-color","var(--spice-button-disabled)"),d=document.createElementNS(c,"path"),a.append(d),d.setAttributeNS(null,"fill",`url(#${s.id})`),d.setAttributeNS(null,"d","M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z");var[c,s,d]=[a,i,r];n.append(c),o.push([c,s,d])}return[n,o]}function h(t,e){var i=e/=.5;for(let e=0;e<5;e++){var a=t[e][1],r=t[e][2];a.setAttributeNS(null,"stop-color","var(--spice-button-disabled)"),r.setAttributeNS(null,"stop-color","var(--spice-button-disabled)")}for(let e=0;e<i;e++){var n=Math.floor(e/2),l=t[n][1],n=t[n][2];(e%2==0?l:n).setAttributeNS(null,"stop-color","var(--spice-button)")}}var k=null;function l(e){return k[e]}function o(e,t){k[e]=t}function O(){try{var e=JSON.parse(Spicetify.LocalStorage.get("starRatings:settings"));throw e&&"object"==typeof e&&(k=e),""}catch(e){t("starRatings:settings","{}"),k={halfStarRatings:!0,likeThreshold:"4.0",hideHearts:!1,enableKeyboardShortcuts:!0,showPlaylistStars:!0}}}function c(){t("starRatings:settings",JSON.stringify(k))}function n({icon:e,size:t}){return Spicetify.React.createElement("svg",{width:t,height:t,viewBox:"0 0 16 16",fill:"currentColor",dangerouslySetInnerHTML:{__html:e}})}function s({name:e,field:t,onclick:i}){let[a,r]=Spicetify.React.useState(l(t));return Spicetify.React.createElement("div",{className:"popup-row"},Spicetify.React.createElement("label",{className:"col description"},e),Spicetify.React.createElement("div",{className:"col action"},Spicetify.React.createElement("button",{className:"checkbox"+(a?"":" disabled"),onClick:async()=>{var e=!a;o(t,e),r(e),c(),i()}},Spicetify.React.createElement(n,{icon:Spicetify.SVGIcons.check,size:16}))))}function j({name:e,field:t,options:i,onclick:a}){const[r,n]=Spicetify.React.useState(l(t));return Spicetify.React.createElement("div",{className:"popup-row"},Spicetify.React.createElement("label",{className:"col description"},e),Spicetify.React.createElement("div",{className:"col action"},Spicetify.React.createElement("select",{value:r,onChange:async e=>{n(e.target.value),o(t,e.target.value),c(),a()}},Object.keys(i).map(e=>Spicetify.React.createElement("option",{value:e},i[e])))))}function d(e,t){return Spicetify.React.createElement("li",{className:"main-keyboardShortcutsHelpModal-sectionItem"},Spicetify.React.createElement("span",{className:"Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-sectionItemName"},e),Spicetify.React.createElement("kbd",{className:"Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-key"},"Ctrl"),Spicetify.React.createElement("kbd",{className:"Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-key"},"Alt"),Spicetify.React.createElement("kbd",{className:"Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-key"},t))}async function w(){var e=(await Spicetify.Platform.RootlistAPI.getContents()).items.find(e=>"folder"===e.type&&"Rated"===e.name);return e?[function(e){var t=["0.0","0.5","1.0","1.5","2.0","2.5","3.0","3.5","4.0","4.5","5.0"],i={};for(const a of e.items)t.includes(a.name)&&(i[a.name]=a);return i}(e),e.uri]:[[],null]}async function Y(){var e,[t,i]=await w(),a={};for(const c in t){e=t[c].uri;for(const s of await(await Spicetify.CosmosAsync.get("sp://core-playlist/v1/playlist/"+e)).items){var r,n,l,o=s.link;a[o]?(n=(r=parseFloat(c))<(l=parseFloat(a[o]))?c:a[o],l=l<r?c:a[o],a[o]=l,console.log(`Removing track ${s.name} with lower rating ${n} and higher rating ${l} from lower rated playlist ${t[n].name}.`),await g(t[n].uri,o)):a[o]=c}}return[t,i,a]}var u,y="[index] 16px [first] 4fr [var1] 2fr [var2] 1fr [last] minmax(120px,1fr)",m="[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] 2fr [last] minmax(120px,1fr)",f="[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] minmax(120px,2fr) [var3] 2fr [last] minmax(120px,1fr)",S=null,x=null,[E,R,N]=[null,null,null],[A,P]=[null,null],L=null,K=null,M=null,T=null,_=!1,H=i=>new Promise(e=>{if(document.querySelector(i))return e(document.querySelector(i));const t=new MutationObserver(()=>{document.querySelector(i)&&(t.disconnect(),e(document.querySelector(i)))});t.observe(document.body,{childList:!0,subtree:!0})});function I(e,t){e=e.getBoundingClientRect(),e=event.clientX-e.left;let i=t+1;return 8<e||!k.halfStarRatings||(i-=.5),0===t&&e<3&&(i-=k.halfStarRatings?.5:1),i.toFixed(1)}function B(){return document.querySelector(".main-nowPlayingWidget-nowPlaying .control-button-heart")}function C(){return Spicetify.Player.data.track.uri}async function q(){if("ALBUM"===A){r=P;let e=0,t=0;for(const l of(await Spicetify.CosmosAsync.get(`wg://album/v1/album-app/album/${r}/desktop`)).discs[0].tracks){var a=N[l.uri];a&&(e+=parseFloat(a),t+=1)}let i=0;0<t&&(i=e/t),i=(Math.round(2*i)/2).toFixed(1);var r=await H(".main-actionBar-ActionBar"),n=r.querySelector(".stars"),r=r.querySelector(".main-playButton-PlayButton");n||(M=p("album",32),r.after(M[0])),h(M[1],i.toString())}}function D(s,d,e,u,p,y,m){const[,f]=e,S=f[s][0];return async()=>{if(!_){_=!0;var i=u(),a=N[i]||"0.0";let e=null!==d?d:I(S,s);var r,n=m(),n=(n&&"disabled"!==k.likeThreshold&&("true"!==n.ariaChecked&&e>=parseFloat(k.likeThreshold)&&n.click(),"true"===n.ariaChecked)&&e<parseFloat(k.likeThreshold)&&n.click(),a===e&&N[i]),a=(n&&(e="0.0"),N[i]),l=e.toString(),o=(N[i]=l,h(f,e),a&&(await g(E[a].uri,i),n)&&b("Removed from "+a),E[l]);let t=null;if(o||n||(R||(await Spicetify.Platform.RootlistAPI.createFolder("Rated",{before:""}),[E,R]=await w()),t=(o=l,c=R,await(navigator.platform.startsWith("Linux")&&navigator.userAgent.includes("Spotify/1.1.84.716")?Spicetify.Platform.RootlistAPI.createPlaylist(o,{after:c}):Spicetify.Platform.RootlistAPI.createPlaylist(o,{after:{uri:c}}))),r=t,await!setTimeout(async()=>{await Spicetify.CosmosAsync.post(`sp://core-playlist/v1/playlist/${r}/set-base-permission`,{permission_level:"BLOCKED"})},1e3),[E,R]=await w()),n)delete N[i];else{var o=t=E[l].uri,c=i;o=v(o);try{await Spicetify.CosmosAsync.post(`https://api.spotify.com/v1/playlists/${o}/tracks`,{uris:[c]})}catch(e){await new Promise(e=>setTimeout(e,500)),await Spicetify.CosmosAsync.post(`https://api.spotify.com/v1/playlists/${o}/tracks`,{uris:[c]})}await 0,b((a?"Moved":"Added")+" to "+l),N[i]=l}p&&L&&L(),y&&K&&((n=document.getElementById("stars-"+i))&&n.remove(),await K()),await q(),_=!1}}}function U(i){return()=>{for(var[e,t]of Object.entries(i))Spicetify.Keyboard.registerShortcut({key:t,ctrl:!0,alt:!0},D(0,e,T,C,!1,!0,B))}}function $(e,i,a,r,n){const[t,l]=e;t.addEventListener("mouseout",function(){var e;h(l,(e=i(),N[e]||"0.0"))});for(let t=0;t<5;t++){const o=l[t][0];o.addEventListener("mousemove",function(){var e=I(o,t);h(l,e)}),o.addEventListener("click",D(t,null,e,i,a,r,n))}}var e=async function(){for(;null==Spicetify||!Spicetify.showNotification;)await new Promise(e=>setTimeout(e,100));O(),c(),[E,R,N]=await Y();const i={"5.0":Spicetify.Keyboard.KEYS.NUMPAD_0,.5:Spicetify.Keyboard.KEYS.NUMPAD_1,"1.0":Spicetify.Keyboard.KEYS.NUMPAD_2,1.5:Spicetify.Keyboard.KEYS.NUMPAD_3,"2.0":Spicetify.Keyboard.KEYS.NUMPAD_4,2.5:Spicetify.Keyboard.KEYS.NUMPAD_5,"3.0":Spicetify.Keyboard.KEYS.NUMPAD_6,3.5:Spicetify.Keyboard.KEYS.NUMPAD_7,"4.0":Spicetify.Keyboard.KEYS.NUMPAD_8,4.5:Spicetify.Keyboard.KEYS.NUMPAD_9};var t,a,r;new Spicetify.Menu.Item("Star Ratings",!1,(t=U(i),r=i,a=()=>{for(const e of Object.values(r))Spicetify.Keyboard._deregisterShortcut({key:e,ctrl:!0,alt:!0})},()=>{var e=Spicetify.React.createElement("style",null,`.popup-row::after {
                    content: "";
                    display: table;
                    clear: both;
                }
                .popup-row .col {
                    display: flex;
                    padding: 10px 0;
                    align-items: center;
                }
                .popup-row .col.description {
                    float: left;
                    padding-right: 15px;
                }
                .popup-row .col.action {
                    float: right;
                    text-align: right;
                }
                .popup-row .div-title {
                    color: var(--spice-text);
                }
                .popup-row .divider {
                    height: 2px;
                    border-width: 0;
                    background-color: var(--spice-button-disabled);
                }
                .popup-row .space {
                    margin-bottom: 20px;
                    visibility: hidden;
                }
                button.checkbox {
                    align-items: center;
                    border: 0px;
                    border-radius: 50%;
                    background-color: rgba(var(--spice-rgb-shadow), 0.7);
                    color: var(--spice-text);
                    cursor: pointer;
                    display: flex;
                    margin-inline-start: 12px;
                    padding: 8px;
                }
                button.checkbox.disabled {
                    color: rgba(var(--spice-rgb-text), 0.3);
                }
                select {
                    color: var(--spice-text);
                    background: rgba(var(--spice-rgb-shadow), 0.7);
                    border: 0;
                    height: 32px;
                }
                ::-webkit-scrollbar {
                    width: 8px;
                }
                .login-button {
                    background-color: var(--spice-button);
                    border-radius: 8px;
                    border-style: none;
                    box-sizing: border-box;
                    color: var(--spice-text);
                    cursor: pointer;
                    display: inline-block;
                    font-size: 14px;
                    font-weight: 500;
                    height: 40px;
                    line-height: 20px;
                    list-style: none;
                    margin: 10px;
                    outline: none;
                    padding: 5px 10px;
                    position: relative;
                    text-align: center;
                    text-decoration: none;
                    vertical-align: baseline;
                    touch-action: manipulation;
                }`),e=Spicetify.React.createElement("div",null,e,Spicetify.React.createElement("h2",{className:"Type__TypeElement-goli3j-0 bcTfIx main-keyboardShortcutsHelpModal-sectionHeading"},"Settings"),Spicetify.React.createElement(s,{name:"Half star ratings",field:"halfStarRatings",onclick:async()=>{}}),Spicetify.React.createElement(s,{name:"Hide hearts",field:"hideHearts",onclick:async()=>{var e=document.querySelector(".control-button-heart"),e=(e&&(e.style.display=k.hideHearts?"none":"flex"),document.querySelectorAll(".main-trackList-rowHeartButton"));for(const t of e)t.style.display=k.hideHearts?"none":"flex"}}),Spicetify.React.createElement(s,{name:"Enable keyboard shortcuts",field:"enableKeyboardShortcuts",onclick:async()=>{(k.enableKeyboardShortcuts?t:a)()}}),Spicetify.React.createElement(s,{name:"Show playlist stars",field:"showPlaylistStars",onclick:async()=>{}}),Spicetify.React.createElement(j,{name:"Auto-like/dislike threshold",field:"likeThreshold",options:{disabled:"Disabled","3.0":"3.0",3.5:"3.5","4.0":"4.0",4.5:"4.5","5.0":"5.0"},onclick:async()=>{}}),Spicetify.React.createElement("h2",{className:"Type__TypeElement-goli3j-0 bcTfIx main-keyboardShortcutsHelpModal-sectionHeading"},"Keyboard Shortcuts"),Spicetify.React.createElement("ul",null,d("Rate current track 0.5 stars","1"),d("Rate current track 1 star","2"),d("Rate current track 1.5 stars","3"),d("Rate current track 2 stars","4"),d("Rate current track 2.5 stars","5"),d("Rate current track 3 stars","6"),d("Rate current track 3.5 stars","7"),d("Rate current track 4 stars","8"),d("Rate current track 4.5 stars","9"),d("Rate current track 5 stars","0")));Spicetify.PopupModal.display({title:"Star Ratings",content:e,isLarge:!0})})).register(),K=()=>{if(k.showPlaylistStars){var e=document.querySelector(".main-trackList-indexable");if(e){var e=e.getElementsByClassName("main-trackList-trackListRow"),t=document.querySelector(".main-trackList-trackListHeaderRow");if(t){var i=t.querySelector(".main-trackList-rowSectionEnd");switch(parseInt(i.getAttribute("aria-colindex"))){case 4:t.style["grid-template-columns"]=y;break;case 5:t.style["grid-template-columns"]=m;break;case 6:t.style["grid-template-columns"]=f}}for(const s of e){var a=()=>s.getElementsByClassName("main-addButton-button")[0],r=s.getElementsByClassName("main-addButton-button")[0],n=0<s.getElementsByClassName("stars").length;o=s,l=void 0;const d=(o=Object.values(o))?(null==(l=null==(l=null==(l=null==(l=null==(l=null==(l=o[0])?void 0:l.pendingProps)?void 0:l.children[0])?void 0:l.props)?void 0:l.children)?void 0:l.props)?void 0:l.uri)||(null==(l=null==(l=null==(l=null==(l=null==(l=null==(l=null==(l=null==(l=o[0])?void 0:l.pendingProps)?void 0:l.children[0])?void 0:l.props)?void 0:l.children)?void 0:l.props)?void 0:l.children)?void 0:l.props)?void 0:l.uri)||(null==(o=null==(l=null==(o=null==(l=null==(o=null==(l=o[0])?void 0:l.pendingProps)?void 0:o.children[0])?void 0:l.props)?void 0:o.children[0])?void 0:l.props)?void 0:o.uri):null;var l=d.includes("track");let e=s.querySelector(".starRatings");if(!e){var o=s.querySelector(".main-trackList-rowSectionEnd"),c=parseInt(o.getAttribute("aria-colindex"));switch(o.setAttribute("aria-colindex",(c+1).toString()),(e=document.createElement("div")).setAttribute("aria-colindex",c.toString()),e.role="gridcell",e.style.display="flex",e.classList.add("main-trackList-rowSectionVariable"),e.classList.add("starRatings"),s.insertBefore(e,o),c){case 4:s.style["grid-template-columns"]=y;break;case 5:s.style["grid-template-columns"]=m;break;case 6:s.style["grid-template-columns"]=f}}if(r&&d&&!n&&l){o=p(d,16);const u=o[0];c=o[1],r=N[d]||"0.0";e.appendChild(u),h(c,r),a().style.display=k.hideHearts?"none":"flex",$(o,()=>d,!0,!1,a),u.style.visibility=N[d]?"visible":"hidden",s.addEventListener("mouseover",()=>{u.style.visibility="visible"}),s.addEventListener("mouseout",()=>{u.style.visibility=N[d]?"visible":"hidden"})}}}}},L=()=>{var e,t;T&&(t=(e=Spicetify.Player.data.track.uri).includes("track"),T[0].style.display=t?"flex":"none",t=N[e]||"0.0",h(T[1],t))};const n=new MutationObserver(()=>{K()});Spicetify.Player.addEventListener("songchange",()=>{L()});var e=async()=>{var e,t;u=S,(S=document.querySelector(".main-trackList-indexable"))&&!S.isEqualNode(u)&&(u&&n.disconnect(),[A,P]="/collection/tracks"===(t=Spicetify.Platform.History.location.pathname)?["LIKED_SONGS",null]:(e=t.match(/playlist\/(.*)/))?["PLAYLIST",e[1]]:(e=t.match(/album\/(.*)/))?["ALBUM",e[1]]:(e=t.match(/artist\/([^/]*)$/))?["ARTIST",e[1]]:(e=t.match(/artist\/([^/]*)\/saved/))?["ARTIST_LIKED",e[1]]:["OTHER",null],K(),"ALBUM"===A&&await q(),n.observe(S,{childList:!0,subtree:!0})),B()&&(B().style.display=k.hideHearts?"none":"flex"),u=x,(x=document.querySelector(".main-nowPlayingWidget-nowPlaying"))&&!x.isEqualNode(u)&&((T=p("now-playing",16))[0].style.marginLeft="8px",T[0].style.marginRight="8px",(await H(".main-nowPlayingWidget-nowPlaying .main-trackInfo-container")).after(T[0]),$(T,C,!1,!0,B),L(),k.enableKeyboardShortcuts)&&U(i)()},l=new MutationObserver(e);await e(),l.observe(document.body,{childList:!0,subtree:!0})};(async()=>{await e()})()})();