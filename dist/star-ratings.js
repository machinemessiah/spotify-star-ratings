var starDratings = ( () => {
  var __defProp = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = ( obj, key, value ) => key in obj ? __defProp( obj, key, { enumerable: true, configurable: true, writable: true, value } ) : obj[key] = value;
  var __spreadValues = ( a, b ) => {
    for ( var prop in b || ( b = {} ) )
      if ( __hasOwnProp.call( b, prop ) )
        __defNormalProp( a, prop, b[prop] );
    if ( __getOwnPropSymbols )
      for ( var prop of __getOwnPropSymbols( b ) ) {
        if ( __propIsEnum.call( b, prop ) )
          __defNormalProp( a, prop, b[prop] );
      }
    return a;
  };

  // src/api.tsx
  function showNotification( text ) {
    Spicetify.showNotification( text );
  }
  function getLocalStorageData( key ) {
    return Spicetify.LocalStorage.get( key );
  }
  function setLocalStorageData( key, value ) {
    Spicetify.LocalStorage.set( key, value );
  }
  async function createPlaylist( name, folderUri ) {
    if ( navigator.platform.startsWith( "Linux" ) && navigator.userAgent.includes( "Spotify/1.1.84.716" ) ) {
      return await Spicetify.Platform.RootlistAPI.createPlaylist( name, {
        after: folderUri
      } );
    } else {
      return await Spicetify.Platform.RootlistAPI.createPlaylist( name, {
        after: {
          uri: folderUri
        }
      } );
    }
  }
  async function makePlaylistPrivate( playlistUri ) {
    setTimeout( async () => {
      await Spicetify.CosmosAsync.post( `sp://core-playlist/v1/playlist/${playlistUri}/set-base-permission`, {
        permission_level: "BLOCKED"
      } );
    }, 1e3 );
  }
  async function createFolder( name ) {
    await Spicetify.Platform.RootlistAPI.createFolder( name, { before: "" } );
  }
  async function getAlbum( uri ) {
    const { queryAlbumTracks } = Spicetify.GraphQL.Definitions;
    const { data, errors } = await Spicetify.GraphQL.Request( queryAlbumTracks, { uri, offset: 0, limit: 500 } );
    return data;
  }
  async function getContents() {
    return await Spicetify.Platform.RootlistAPI.getContents();
  }
  function playlistUriToPlaylistId( uri ) {
    return uri.match( /spotify:playlist:(.*)/ )[1];
  }
  async function addTrackToPlaylist( playlistUri, trackUri ) {
    const playlistId = playlistUriToPlaylistId( playlistUri );
    try {
      await Spicetify.CosmosAsync.post( `https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        uris: [trackUri]
      } );
    } catch ( error ) {
      await new Promise( ( resolve ) => setTimeout( resolve, 500 ) );
      await Spicetify.CosmosAsync.post( `https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        uris: [trackUri]
      } );
    }
  }
  async function deleteTrackFromPlaylist( playlistUri, trackUri ) {
    const playlistId = playlistUriToPlaylistId( playlistUri );
    await Spicetify.CosmosAsync.del( `https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      tracks: [
        {
          uri: trackUri
        }
      ]
    } );
  }
  async function getPlaylistItems( uri ) {
    const result = await Spicetify.CosmosAsync.get( `sp://core-playlist/v1/playlist/${uri}` );
    return result.items;
  }
  async function isAppLaterThan( specifiedVersion ) {
    let appInfo = await Spicetify.CosmosAsync.get( "sp://desktop/v1/version" );
    let result = appInfo.version.localeCompare( specifiedVersion, void 0, { numeric: true, sensitivity: "base" } );
    return result === 1;
  }
  async function moveTracksBefore( playlistUri, trackUids, beforeUid ) {
    const isV2 = await isAppLaterThan( "1.2.5.1006.g22820f93" );
    await Spicetify.Platform.PlaylistAPI.move(
      playlistUri,
      trackUids.map( ( uid ) => ( { uid } ) ),
      { before: isV2 ? { uid: beforeUid } : beforeUid }
    );
  }
  async function moveTracksAfter( playlistUri, trackUids, afterUid ) {
    const isV2 = await isAppLaterThan( "1.2.5.1006.g22820f93" );
    await Spicetify.Platform.PlaylistAPI.move(
      playlistUri,
      trackUids.map( ( uid ) => ( { uid } ) ),
      { after: isV2 ? { uid: afterUid } : afterUid }
    );
  }

  // src/stars.tsx
  function findStars( idSuffix ) {
    const starsId = `stars-${idSuffix}`;
    const stars = document.getElementById( starsId );
    if ( !stars )
      return null;
    const starElements = [];
    for ( let i = 1; i <= 5; i++ ) {
      const id = `${starsId}-${i}`;
      const star = document.getElementById( id );
      const stopFirst = document.getElementById( `${id}-gradient-first` );
      const stopSecond = document.getElementById( `${id}-gradient-second` );
      starElements.push( [star, stopFirst, stopSecond] );
    }
    return [stars, starElements];
  }
  function createStar( starsId, n, size ) {
    const xmlns = "http://www.w3.org/2000/svg";
    const star = document.createElementNS( xmlns, "svg" );
    const id = `${starsId}-${n}`;
    star.id = id;
    star.style.minHeight = `${size}px`;
    star.style.minWidth = `${size}px`;
    star.setAttributeNS( null, "width", `${size}px` );
    star.setAttributeNS( null, "height", `${size}px` );
    star.setAttributeNS( null, "viewBox", `0 0 32 32` );
    const defs = document.createElementNS( xmlns, "defs" );
    star.append( defs );
    const gradient = document.createElementNS( xmlns, "linearGradient" );
    defs.append( gradient );
    gradient.id = `${id}-gradient`;
    const stopFirst = document.createElementNS( xmlns, "stop" );
    gradient.append( stopFirst );
    stopFirst.id = `${id}-gradient-first`;
    stopFirst.setAttributeNS( null, "offset", "50%" );
    stopFirst.setAttributeNS( null, "stop-color", "var(--spice-button-disabled)" );
    const stopSecond = document.createElementNS( xmlns, "stop" );
    gradient.append( stopSecond );
    stopSecond.id = `${id}-gradient-second`;
    stopSecond.setAttributeNS( null, "offset", "50%" );
    stopSecond.setAttributeNS( null, "stop-color", "var(--spice-button-disabled)" );
    const path = document.createElementNS( xmlns, "path" );
    star.append( path );
    path.setAttributeNS( null, "fill", `url(#${gradient.id})` );
    path.setAttributeNS(
      null,
      "d",
      "M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"
    );
    return [star, stopFirst, stopSecond];
  }
  function createStars( idSuffix, size ) {
    const stars = document.createElement( "span" );
    const id = `stars-${idSuffix}`;
    stars.className = "stars";
    stars.id = id;
    stars.style.whiteSpace = "nowrap";
    stars.style.alignItems = "center";
    stars.style.display = "flex";
    const starElements = [];
    for ( let i = 0; i < 5; i++ ) {
      const [star, stopFirst, stopSecond] = createStar( id, i + 1, size );
      stars.append( star );
      starElements.push( [star, stopFirst, stopSecond] );
    }
    return [stars, starElements];
  }
  function setRating( starElements, rating ) {
    var _a, _b, _c;
    ( _c = ( _b = ( _a = starElements == null ? void 0 : starElements[0] ) == null ? void 0 : _a[0] ) == null ? void 0 : _b.parentElement ) == null ? void 0 : _c.setAttribute( "data-rating", parseFloat( rating ).toFixed( 1 ) );
    const halfStars = rating /= 0.5;
    for ( let i = 0; i < 5; i++ ) {
      const stopFirst = starElements[i][1];
      const stopSecond = starElements[i][2];
      stopFirst.setAttributeNS( null, "stop-color", "var(--spice-button-disabled)" );
      stopSecond.setAttributeNS( null, "stop-color", "var(--spice-button-disabled)" );
    }
    for ( let i = 0; i < halfStars; i++ ) {
      const j = Math.floor( i / 2 );
      const stopFirst = starElements[j][1];
      const stopSecond = starElements[j][2];
      if ( i % 2 === 0 ) {
        stopFirst.setAttributeNS( null, "stop-color", "var(--spice-button)" );
      } else {
        stopSecond.setAttributeNS( null, "stop-color", "var(--spice-button)" );
      }
    }
  }
  function getMouseoverRating( settings3, star, i ) {
    const rect = star.getBoundingClientRect();
    const offset = event.clientX - rect.left;
    const half = offset > 8 || !settings3.halfStarRatings;
    const zeroStars = i === 0 && offset < 3;
    let rating = i + 1;
    if ( !half )
      rating -= 0.5;
    if ( zeroStars ) {
      rating -= settings3.halfStarRatings ? 0.5 : 1;
    }
    return rating;
  }

  // src/settings.tsx
  function getSettings() {
    const defaultSettings = {
      halfStarRatings: true,
      likeThreshold: "4.0",
      hideHearts: false,
      enableKeyboardShortcuts: true,
      showPlaylistStars: true,
      nowPlayingStarsPosition: "left",
      skipThreshold: "disabled",
      alwaysShowStars: true
    };
    settings = {};
    try {
      const parsed = JSON.parse( getLocalStorageData( "starRatings:settings" ) );
      if ( parsed && typeof parsed === "object" ) {
        settings = parsed;
      } else {
        throw "";
      }
    } catch ( e ) {
      setLocalStorageData( "starRatings:settings", defaultSettings );
      return defaultSettings;
    }
    let modified = false;
    for ( const key of Object.keys( defaultSettings ) ) {
      if ( !settings.hasOwnProperty( key ) ) {
        settings[key] = defaultSettings[key];
        modified = true;
      }
    }
    if ( modified ) {
      setLocalStorageData( "starRatings:settings", settings );
    }
    return settings;
  }
  function saveSettings( settings3 ) {
    setLocalStorageData( "starRatings:settings", JSON.stringify( settings3 ) );
  }
  function getPlaylistUris() {
    try {
      const parsed = JSON.parse( getLocalStorageData( "starRatings:playlistUris" ) );
      if ( parsed && typeof parsed === "object" ) {
        return parsed;
      }
      throw "";
    } catch ( e ) {
      setLocalStorageData( "starRatings:playlistUris", `{}` );
      return {};
    }
  }
  function savePlaylistUris( playlistUris2 ) {
    setLocalStorageData( "starRatings:playlistUris", JSON.stringify( playlistUris2 ) );
  }
  function getRatedFolderUri() {
    return getLocalStorageData( "starRatings:ratedFolderUri" );
  }
  function saveRatedFolderUri( ratedFolderUri2 ) {
    setLocalStorageData( "starRatings:ratedFolderUri", ratedFolderUri2 );
  }

  // src/settings-ui.tsx
  function CheckboxIcon() {
    const React2 = Spicetify.React;
    return /* @__PURE__ */ React2.createElement( "svg", {
      width: 16,
      height: 16,
      viewbox: "0 0 16 16",
      fill: "currentColor",
      dangerouslySetInnerHTML: {
        __html: Spicetify.SVGIcons.check
      }
    } );
  }
  function CheckboxItem( { settings: settings3, name, field, onclick } ) {
    const React2 = Spicetify.React;
    let [value, setValue] = Spicetify.React.useState( settings3[field] );
    const buttonClass = value ? "checkbox" : "checkbox disabled";
    function handleOnClick() {
      let state = !value;
      settings3[field] = state;
      setValue( state );
      saveSettings( settings3 );
      if ( onclick )
        onclick();
    }
    return /* @__PURE__ */ React2.createElement( "div", {
      className: "popup-row"
    }, /* @__PURE__ */ React2.createElement( "label", {
      className: "col description"
    }, name ), /* @__PURE__ */ React2.createElement( "div", {
      className: "col action"
    }, /* @__PURE__ */ React2.createElement( "button", {
      className: buttonClass,
      onClick: handleOnClick
    }, /* @__PURE__ */ React2.createElement( CheckboxIcon, null ) ) ) );
  }
  function DropdownItem( { settings: settings3, name, field, options, onclick } ) {
    const React2 = Spicetify.React;
    const [value, setValue] = Spicetify.React.useState( settings3[field] );
    function handleOnChange( event2 ) {
      setValue( event2.target.value );
      settings3[field] = event2.target.value;
      saveSettings( settings3 );
      if ( onclick )
        onclick();
    }
    const optionElements = [];
    for ( const [optionName, optionValue] of Object.entries( options ) )
      optionElements.push(/* @__PURE__ */ React2.createElement( "option", {
        value: optionValue
      }, optionName ) );
    return /* @__PURE__ */ React2.createElement( "div", {
      className: "popup-row"
    }, /* @__PURE__ */ React2.createElement( "label", {
      className: "col description"
    }, name ), /* @__PURE__ */ React2.createElement( "div", {
      className: "col action"
    }, /* @__PURE__ */ React2.createElement( "select", {
      value,
      onChange: handleOnChange
    }, optionElements ) ) );
  }
  function KeyboardShortcutDescription( { label, numberKey } ) {
    const React2 = Spicetify.React;
    return /* @__PURE__ */ React2.createElement( "li", {
      className: "main-keyboardShortcutsHelpModal-sectionItem"
    }, /* @__PURE__ */ React2.createElement( "span", {
      className: "Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-sectionItemName"
    }, label ), /* @__PURE__ */ React2.createElement( "kbd", {
      className: "Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-key"
    }, "Ctrl" ), /* @__PURE__ */ React2.createElement( "kbd", {
      className: "Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-key"
    }, "Alt" ), /* @__PURE__ */ React2.createElement( "kbd", {
      className: "Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-key"
    }, numberKey ) );
  }
  function Heading( { value } ) {
    const React2 = Spicetify.React;
    return /* @__PURE__ */ React2.createElement( "h2", {
      className: "Type__TypeElement-goli3j-0 bcTfIx main-keyboardShortcutsHelpModal-sectionHeading"
    }, value );
  }
  function Settings( {
    settings: settings3,
    registerKeyboardShortcuts,
    deregisterKeyboardShortcuts,
    updateTracklist: updateTracklist2,
    restoreTracklist: restoreTracklist2,
    redrawNowPlayingStars
  } ) {
    const React2 = Spicetify.React;
    function handleHideHeartsCheckboxClick() {
      const nowPlayingWidgetHeart = document.querySelector( ".control-button-heart" );
      if ( nowPlayingWidgetHeart )
        nowPlayingWidgetHeart.style.display = settings3.hideHearts ? "none" : "flex";
      const hearts = document.querySelectorAll( ".main-trackList-rowHeartButton" );
      for ( const heart of hearts )
        heart.style.display = settings3.hideHearts ? "none" : "flex";
    }
    function handleAlwaysShowStarsCheckboxClick() {
      const stars = document.querySelectorAll( ".main-trackList-rowSectionVariable.starRatings" );
      for ( const star of stars )
        star.style.visibility = settings3.alwaysShowStars ? "visible" : "hidden";
    }
    function handleEnableKeyboardShortcutsCheckboxClick() {
      if ( settings3.enableKeyboardShortcuts )
        registerKeyboardShortcuts();
      else
        deregisterKeyboardShortcuts();
    }
    function handleShowPlaylistStarsCheckboxClick() {
      if ( settings3.showPlaylistStars )
        updateTracklist2();
      else
        restoreTracklist2();
    }
    function hanleNowPlayingStarsPositionDropdownClick() {
      redrawNowPlayingStars();
    }
    function handleDummy() {
      console.log( "dummy function" );
    }
    return /* @__PURE__ */ React2.createElement( "div", null, /* @__PURE__ */ React2.createElement( Heading, {
      value: "Settings"
    } ), /* @__PURE__ */ React2.createElement( CheckboxItem, {
      settings: settings3,
      name: "Half star ratings",
      field: "halfStarRatings",
      onclick: handleDummy
    } ), /* @__PURE__ */ React2.createElement( CheckboxItem, {
      settings: settings3,
      name: "Hide hearts",
      field: "hideHearts",
      onclick: handleHideHeartsCheckboxClick
    } ), /* @__PURE__ */ React2.createElement( CheckboxItem, {
      settings: settings3,
      name: "Enable keyboard shortcuts",
      field: "enableKeyboardShortcuts",
      onclick: handleEnableKeyboardShortcutsCheckboxClick
    } ), /* @__PURE__ */ React2.createElement( CheckboxItem, {
      settings: settings3,
      name: "Show playlist stars",
      field: "showPlaylistStars",
      onclick: handleShowPlaylistStarsCheckboxClick
    } ), /* @__PURE__ */ React2.createElement( CheckboxItem, {
      settings: settings3,
      name: "Always show stars",
      field: "alwaysShowStars",
      onclick: handleAlwaysShowStarsCheckboxClick
    } ), /* @__PURE__ */ React2.createElement( DropdownItem, {
      settings: settings3,
      name: "Auto-like/dislike threshold",
      field: "likeThreshold",
      options: {
        Disabled: "disabled",
        "3.0": "3.0",
        "3.5": "3.5",
        "4.0": "4.0",
        "4.5": "4.5",
        "5.0": "5.0"
      },
      onclick: handleDummy
    } ), /* @__PURE__ */ React2.createElement( DropdownItem, {
      settings: settings3,
      name: "Now playing stars position",
      field: "nowPlayingStarsPosition",
      options: {
        Left: "left",
        Right: "right"
      },
      onclick: hanleNowPlayingStarsPositionDropdownClick
    } ), /* @__PURE__ */ React2.createElement( DropdownItem, {
      settings: settings3,
      name: "Skip threshold",
      field: "skipThreshold",
      options: {
        Disabled: "disabled",
        "0.0": "0.0",
        "0.5": "0.5",
        "1.0": "1.0",
        "1.5": "1.5",
        "2.0": "2.0",
        "2.5": "2.5",
        "3.0": "3.0",
        "3.5": "3.5",
        "4.0": "4.0",
        "4.5": "4.5"
      },
      onclick: handleDummy
    } ), /* @__PURE__ */ React2.createElement( Heading, {
      value: "Keyboard Shortcuts"
    } ), /* @__PURE__ */ React2.createElement( "ul", null, /* @__PURE__ */ React2.createElement( KeyboardShortcutDescription, {
      label: "Rate current track 0.5 stars",
      numberKey: "1"
    } ), /* @__PURE__ */ React2.createElement( KeyboardShortcutDescription, {
      label: "Rate current track 1 star",
      numberKey: "2"
    } ), /* @__PURE__ */ React2.createElement( KeyboardShortcutDescription, {
      label: "Rate current track 1.5 stars",
      numberKey: "3"
    } ), /* @__PURE__ */ React2.createElement( KeyboardShortcutDescription, {
      label: "Rate current track 2 stars",
      numberKey: "4"
    } ), /* @__PURE__ */ React2.createElement( KeyboardShortcutDescription, {
      label: "Rate current track 2.5 stars",
      numberKey: "5"
    } ), /* @__PURE__ */ React2.createElement( KeyboardShortcutDescription, {
      label: "Rate current track 3 stars",
      numberKey: "6"
    } ), /* @__PURE__ */ React2.createElement( KeyboardShortcutDescription, {
      label: "Rate current track 3.5 stars",
      numberKey: "7"
    } ), /* @__PURE__ */ React2.createElement( KeyboardShortcutDescription, {
      label: "Rate current track 4 stars",
      numberKey: "8"
    } ), /* @__PURE__ */ React2.createElement( KeyboardShortcutDescription, {
      label: "Rate current track 4.5 stars",
      numberKey: "9"
    } ), /* @__PURE__ */ React2.createElement( KeyboardShortcutDescription, {
      label: "Rate current track 5 stars",
      numberKey: "0"
    } ) ) );
  }

  // src/sort-modal.tsx
  var React = Spicetify.React;
  function Button( { name, className, onButtonClick } ) {
    return /* @__PURE__ */ React.createElement( "button", {
      className,
      onClick: onButtonClick
    }, name );
  }
  function SortModal( { onClickCancel, onClickOK } ) {
    return /* @__PURE__ */ React.createElement( "div", {
      className: "parent-div"
    }, /* @__PURE__ */ React.createElement( "p", null, "This will modify the ", /* @__PURE__ */ React.createElement( "b", null, "Custom order" ), " of the playlist." ), /* @__PURE__ */ React.createElement( "div", {
      className: "button-div"
    }, /* @__PURE__ */ React.createElement( Button, {
      name: "Cancel",
      className: "cancel-button",
      onButtonClick: onClickCancel
    } ), /* @__PURE__ */ React.createElement( Button, {
      name: "Sort",
      className: "ok-button",
      onButtonClick: onClickOK
    } ) ) );
  }

  // src/ratings.tsx
  function findFolderByUri( contents, uri ) {
    return contents.items.find( ( item ) => item.type === "folder" && item.uri === uri );
  }
  function findFolderByName( contents, name ) {
    return contents.items.find( ( item ) => item.type === "folder" && item.name === name );
  }
  function removePlaylistUris( playlistUris2, ratedFolder ) {
    const newPlaylistUris = {};
    let changed = false;
    for ( const [rating, playlistUri] of Object.entries( playlistUris2 ) ) {
      if ( ratedFolder.items.find( ( item ) => item.uri === playlistUri ) )
        newPlaylistUris[rating] = playlistUri;
      else
        changed = true;
    }
    return [changed, newPlaylistUris];
  }
  function addPlaylistUris( playlistUris2, ratedFolder ) {
    const newPlaylistUris = __spreadValues( {}, playlistUris2 );
    let changed = false;
    const ratings2 = ["0.0", "0.5", "1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0"];
    const unmappedRatings = ratings2.filter( ( rating ) => !playlistUris2.hasOwnProperty( rating ) );
    ratedFolder.items.filter( ( item ) => unmappedRatings.includes( item.name ) ).forEach( ( item ) => {
      newPlaylistUris[item.name] = item.uri;
      changed = true;
    } );
    return [changed, newPlaylistUris];
  }
  function getPlaylistNames( playlistUris2, ratedFolder ) {
    const playlistNames2 = {};
    ratedFolder.items.filter( ( item ) => Object.values( playlistUris2 ).includes( item.uri ) ).forEach( ( item ) => {
      playlistNames2[item.uri] = item.name;
    } );
    return playlistNames2;
  }
  async function getAllPlaylistItems( playlistUris2 ) {
    const ratings2 = Object.keys( playlistUris2 );
    const allPlaylistItemsArray = await Promise.all( ratings2.map( ( rating ) => getPlaylistItems( playlistUris2[rating] ) ) );
    const allPlaylistItems = {};
    for ( let i = 0; i < ratings2.length; i++ )
      allPlaylistItems[ratings2[i]] = allPlaylistItemsArray[i];
    return allPlaylistItems;
  }
  function getRatings( allPlaylistItems ) {
    const ratings2 = {};
    for ( const [rating, items] of Object.entries( allPlaylistItems ) ) {
      for ( const item of items ) {
        const trackUri = item.link;
        let trackRatings = [];
        if ( ratings2[trackUri] )
          trackRatings = ratings2[trackUri];
        trackRatings.push( rating );
        ratings2[trackUri] = trackRatings;
      }
    }
    return ratings2;
  }
  function takeHighestRatings( ratings2 ) {
    const newRatings = {};
    for ( const [trackUri, trackRatings] of Object.entries( ratings2 ) )
      newRatings[trackUri] = Math.max( ...trackRatings );
    return newRatings;
  }
  async function deleteLowestRatings( playlistUris2, ratings2 ) {
    const promises = [];
    for ( const [trackUri, trackRatings] of Object.entries( ratings2 ) ) {
      if ( trackRatings.length <= 1 )
        continue;
      const highestRating = Math.max( ...trackRatings );
      trackRatings.filter( ( rating ) => rating != highestRating ).forEach( ( rating ) => {
        const playlistUri = playlistUris2[rating];
        console.log(
          `Removing track ${trackUri} with lower rating ${rating} and higher rating ${highestRating} from lower rated playlist ${playlistUri}.`
        );
        promises.push( deleteTrackFromPlaylist( playlistUri, trackUri ) );
      } );
    }
    await Promise.all( promises );
  }
  function getAlbumRating( ratings2, album2 ) {
    const items = album2.albumUnion.tracks.items;
    let sumRatings = 0;
    let numRatings = 0;
    for ( const item of items ) {
      const rating = ratings2[item.track.uri];
      if ( !rating )
        continue;
      sumRatings += parseFloat( rating );
      numRatings += 1;
    }
    let averageRating = 0;
    if ( numRatings > 0 )
      averageRating = sumRatings / numRatings;
    averageRating = ( Math.round( averageRating * 2 ) / 2 ).toFixed( 1 );
    return averageRating;
  }
  async function sortPlaylistByRating( playlistUri, ratings2 ) {
    var _a;
    const ratingKeys = ["5.0", "4.5", "4.0", "3.5", "3.0", "2.5", "2.0", "1.5", "1.0", "0.5", "0.0"];
    const items = await getPlaylistItems( playlistUri );
    if ( items.length === 0 )
      return;
    const ratingToUids = {};
    for ( const rating of ratingKeys )
      ratingToUids[rating] = [];
    for ( const item of items ) {
      const rating = ( _a = ratings2[item.link] ) != null ? _a : 0;
      const ratingAsString = rating.toFixed( 1 );
      ratingToUids[ratingAsString].push( item.rowId );
    }
    function getHighestRatedUid( ratingToUids2 ) {
      for ( const rating of ratingKeys ) {
        if ( ratingToUids2[rating].length > 0 )
          return ratingToUids2[rating][0];
      }
      return null;
    }
    let previousIterationLastUid = getHighestRatedUid( ratingToUids );
    const firstUid = items[0].rowId;
    const isFirstItemHighestRated = previousIterationLastUid === firstUid;
    let isFirstIteration = true;
    for ( const rating of ratingKeys ) {
      if ( ratingToUids[rating].length === 0 )
        continue;
      if ( !isFirstItemHighestRated && isFirstIteration ) {
        await moveTracksBefore( playlistUri, ratingToUids[rating], previousIterationLastUid );
      } else {
        await moveTracksAfter( playlistUri, ratingToUids[rating], previousIterationLastUid );
      }
      isFirstIteration = false;
      previousIterationLastUid = ratingToUids[rating].slice( -1 )[0];
    }
  }

  // src/app.tsx
  var settings2 = null;
  var ratedFolderUri = null;
  var ratings = {};
  var playlistNames = {};
  var playlistUris = {};
  var originalTracklistHeaderCss = null;
  var originalTracklistTrackCss = null;
  var oldMainElement = null;
  var mainElement = null;
  var mainElementObserver = null;
  var tracklists = [];
  var oldTracklists = [];
  var oldNowPlayingWidget = null;
  var nowPlayingWidget = null;
  var oldAlbumPlayButton = null;
  var albumPlayButton = null;
  var albumId = null;
  var album = null;
  var albumStarData = null;
  var nowPlayingWidgetStarData = null;
  var clickListenerRunning = false;
  var ratingsLoading = false;
  var isSorting = false;
  function isAlbumPage() {
    const pathname = Spicetify.Platform.History.location.pathname;
    const matches = pathname.match( /album\/(.*)/ );
    if ( !matches )
      return null;
    return matches[1];
  }
  function trackUriToTrackId( trackUri ) {
    return trackUri.match( /spotify:track:(.*)/ )[1];
  }
  function getTracklistTrackUri( tracklistElement ) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
    let values = Object.values( tracklistElement );
    if ( !values )
      return null;
    const searchFrom = ( _d = ( _c = ( _b = ( _a = values[0] ) == null ? void 0 : _a.pendingProps ) == null ? void 0 : _b.children[0] ) == null ? void 0 : _c.props ) == null ? void 0 : _d.children;
    return ( ( _e = searchFrom == null ? void 0 : searchFrom.props ) == null ? void 0 : _e.uri ) || ( ( _h = ( _g = ( _f = searchFrom == null ? void 0 : searchFrom.props ) == null ? void 0 : _f.children ) == null ? void 0 : _g.props ) == null ? void 0 : _h.uri ) || ( ( _m = ( _l = ( _k = ( _j = ( _i = searchFrom == null ? void 0 : searchFrom.props ) == null ? void 0 : _i.children ) == null ? void 0 : _j.props ) == null ? void 0 : _k.children ) == null ? void 0 : _l.props ) == null ? void 0 : _m.uri ) || ( ( _o = ( _n = searchFrom[0] ) == null ? void 0 : _n.props ) == null ? void 0 : _o.uri );
  }
  function getNowPlayingHeart() {
    return document.querySelector( ".main-nowPlayingWidget-nowPlaying .control-button-heart" );
  }
  var getNowPlayingTrackUri = () => {
    return Spicetify.Player.data.track.uri;
  };
  function updateAlbumRating() {
    if ( !albumId )
      return;
    const averageRating = getAlbumRating( ratings, album );
    setRating( albumStarData[1], averageRating.toString() );
  }
  async function handleRemoveRating( trackUri, rating ) {
    delete ratings[trackUri];
    const ratingAsString = rating.toFixed( 1 );
    const playlistUri = playlistUris[ratingAsString];
    const playlistName = playlistNames[playlistUri];
    await deleteTrackFromPlaylist( playlistUri, trackUri );
    showNotification( `Removed from ${playlistName}` );
  }
  async function handleSetRating( trackUri, oldRating, newRating ) {
    ratings[trackUri] = newRating;
    if ( oldRating ) {
      const oldRatingAsString = oldRating.toFixed( 1 );
      const playlistUri2 = playlistUris[oldRatingAsString];
      const playlistName2 = playlistNames[playlistUri2];
      await deleteTrackFromPlaylist( playlistUri2, trackUri );
    }
    if ( !ratedFolderUri ) {
      await createFolder( "Rated" );
      const contents = await getContents();
      const ratedFolder = findFolderByName( contents, "Rated" );
      ratedFolderUri = ratedFolder.uri;
      saveRatedFolderUri( ratedFolderUri );
    }
    const newRatingAsString = newRating.toFixed( 1 );
    let playlistUri = playlistUris[newRatingAsString];
    if ( !playlistUri ) {
      playlistUri = await createPlaylist( newRatingAsString, ratedFolderUri );
      await makePlaylistPrivate( playlistUri );
      playlistUris[newRatingAsString] = playlistUri;
      savePlaylistUris( playlistUris );
      playlistNames[playlistUri] = newRatingAsString;
    }
    await addTrackToPlaylist( playlistUri, trackUri );
    const playlistName = playlistNames[playlistUri];
    showNotification( ( oldRating ? "Moved" : "Added" ) + ` to ${playlistName}` );
  }
  function getClickListener( i, ratingOverride, starData, getTrackUri, getHeart ) {
    return () => {
      if ( clickListenerRunning || ratingsLoading || isSorting )
        return;
      clickListenerRunning = true;
      const [stars, starElements] = starData;
      const star = starElements[i][0];
      const trackUri = getTrackUri();
      const oldRating = ratings[trackUri];
      let newRating = ratingOverride !== null ? ratingOverride : getMouseoverRating( settings2, star, i );
      const heart = getHeart();
      if ( heart && settings2.likeThreshold !== "disabled" ) {
        if ( heart.ariaChecked !== "true" && newRating >= parseFloat( settings2.likeThreshold ) )
          heart.click();
        if ( heart.ariaChecked === "true" && newRating < parseFloat( settings2.likeThreshold ) )
          heart.click();
      }
      let promise = null;
      let displayRating = null;
      if ( oldRating === newRating ) {
        displayRating = 0;
        promise = handleRemoveRating( trackUri, newRating );
      } else {
        displayRating = newRating;
        promise = handleSetRating( trackUri, oldRating, newRating );
      }
      promise.finally( () => {
        tracklistStarData = findStars( trackUriToTrackId( trackUri ) );
        if ( tracklistStarData ) {
          setRating( tracklistStarData[1], displayRating );
          tracklistStarData[0].style.visibility = oldRating === newRating ? "hidden" : "visible";
        }
        updateNowPlayingWidget();
        updateAlbumRating();
        clickListenerRunning = false;
      } );
    };
  }
  function getRegisterKeyboardShortcuts( keys ) {
    return () => {
      for ( const [rating, key] of Object.entries( keys ) ) {
        Spicetify.Keyboard.registerShortcut(
          {
            key,
            ctrl: true,
            alt: true
          },
          getClickListener( 0, parseFloat( rating ), nowPlayingWidgetStarData, getNowPlayingTrackUri, getNowPlayingHeart )
        );
      }
    };
  }
  function getDeregisterKeyboardShortcuts( keys ) {
    return () => {
      for ( const key of Object.values( keys ) ) {
        Spicetify.Keyboard._deregisterShortcut( {
          key,
          ctrl: true,
          alt: true
        } );
      }
    };
  }
  function addStarsListeners( starData, getTrackUri, getHeart ) {
    const getCurrentRating = ( trackUri ) => {
      var _a;
      return ( _a = ratings[trackUri] ) != null ? _a : 0;
    };
    const [stars, starElements] = starData;
    stars.addEventListener( "mouseout", function () {
      setRating( starElements, getCurrentRating( getTrackUri() ) );
    } );
    for ( let i = 0; i < 5; i++ ) {
      const star = starElements[i][0];
      star.addEventListener( "mousemove", function () {
        const rating = getMouseoverRating( settings2, star, i );
        setRating( starElements, rating );
      } );
      star.addEventListener( "click", getClickListener( i, null, starData, getTrackUri, getHeart ) );
    }
  }
  function restoreTracklist() {
    const tracklistHeaders = document.querySelectorAll( ".main-trackList-trackListHeaderRow" );
    tracklistHeaders.forEach( ( tracklistHeader ) => {
      tracklistHeader.style["grid-template-columns"] = originalTracklistHeaderCss;
    } );
    for ( const tracklist of tracklists ) {
      const tracks = tracklist.getElementsByClassName( "main-trackList-trackListRow" );
      for ( const track of tracks ) {
        let ratingColumn = track.querySelector( ".starRatings" );
        if ( !ratingColumn )
          continue;
        track.style["grid-template-columns"] = originalTracklistTrackCss;
        ratingColumn.remove();
        let lastColumn = track.querySelector( ".main-trackList-rowSectionEnd" );
        let colIndexInt = parseInt( lastColumn.getAttribute( "aria-colindex" ) );
        lastColumn.setAttribute( "aria-colindex", ( colIndexInt - 1 ).toString() );
      }
    }
  }
  function updateTracklist() {
    var _a;
    if ( !settings2.showPlaylistStars )
      return;
    oldTracklists = tracklists;
    tracklists = Array.from( document.querySelectorAll( ".main-trackList-indexable" ) );
    let tracklistsChanged = tracklists.length !== oldTracklists.length;
    for ( let i = 0; i < tracklists.length; i++ )
      if ( !tracklists[i].isEqualNode( oldTracklists[i] ) )
        tracklistsChanged = true;
    if ( tracklistsChanged ) {
      originalTracklistHeaderCss = null;
      originalTracklistTrackCss = null;
    }
    const tracklistColumnCss = [
      null,
      null,
      null,
      null,
      "[index] 16px [first] 4fr [var1] 2fr [var2] 1fr [last] minmax(120px,1fr)",
      "[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] 2fr [last] minmax(120px,1fr)",
      "[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] minmax(120px,2fr) [var3] 2fr [last] minmax(120px,1fr)"
    ];
    let newTracklistHeaderCss = null;
    const tracklistHeaders = document.querySelectorAll( ".main-trackList-trackListHeaderRow" );
    tracklistHeaders.forEach( ( tracklistHeader ) => {
      let lastColumn = tracklistHeader.querySelector( ".main-trackList-rowSectionEnd" );
      let colIndexInt = parseInt( lastColumn.getAttribute( "aria-colindex" ) );
      if ( !originalTracklistHeaderCss )
        originalTracklistHeaderCss = getComputedStyle( tracklistHeader ).gridTemplateColumns;
      if ( originalTracklistHeaderCss && tracklistColumnCss[colIndexInt] ) {
        tracklistHeader.style["grid-template-columns"] = tracklistColumnCss[colIndexInt];
        newTracklistHeaderCss = tracklistColumnCss[colIndexInt];
      }
    } );
    for ( const tracklist of tracklists ) {
      const tracks = tracklist.getElementsByClassName( "main-trackList-trackListRow" );
      for ( const track of tracks ) {
        const getHeart = () => {
          var _a2, _b, _c;
          return ( _c = ( _b = ( _a2 = track.getElementsByClassName( "main-addButton-button" )[0] ) != null ? _a2 : track.querySelector( ".main-trackList-rowHeartButton" ) ) != null ? _b : track.querySelector( "button[class*='buttonTertiary-iconOnly']" ) ) != null ? _c : track.querySelector( "button[aria-label='Add to playlist']" );
        };
        const heart = getHeart();
        const hasStars = track.getElementsByClassName( "stars" ).length > 0;
        const trackUri = getTracklistTrackUri( track );
        const isTrack = trackUri.includes( "track" );
        let ratingColumn = track.querySelector( ".starRatings" );
        if ( !ratingColumn ) {
          let lastColumn = track.querySelector( ".main-trackList-rowSectionEnd" );
          let colIndexInt = parseInt( lastColumn.getAttribute( "aria-colindex" ) );
          lastColumn.setAttribute( "aria-colindex", ( colIndexInt + 1 ).toString() );
          ratingColumn = document.createElement( "div" );
          ratingColumn.setAttribute( "aria-colindex", colIndexInt.toString() );
          ratingColumn.role = "gridcell";
          ratingColumn.style.display = "flex";
          ratingColumn.classList.add( "main-trackList-rowSectionVariable" );
          ratingColumn.classList.add( "starRatings" );
          track.insertBefore( ratingColumn, lastColumn );
          if ( !originalTracklistTrackCss )
            originalTracklistTrackCss = getComputedStyle( track ).gridTemplateColumns;
          if ( tracklistColumnCss[colIndexInt] )
            track.style["grid-template-columns"] = newTracklistHeaderCss ? newTracklistHeaderCss : tracklistColumnCss[colIndexInt];
        }
        if ( !heart || !trackUri || hasStars || !isTrack )
          continue;
        const starData = createStars( trackUriToTrackId( trackUri ), 16 );
        const stars = starData[0];
        const starElements = starData[1];
        const currentRating = ( _a = ratings[trackUri] ) != null ? _a : 0;
        ratingColumn.appendChild( stars );
        setRating( starElements, currentRating );
        getHeart().style.display = settings2.hideHearts ? "none" : "flex";
        addStarsListeners(
          starData,
          () => {
            return trackUri;
          },
          getHeart
        );
        stars.style.visibility = settings2.alwaysShowStars || typeof ratings[trackUri] !== "undefined" ? "visible" : "hidden";
        track.addEventListener( "mouseover", () => {
          if ( !settings2.alwaysShowStars )
            stars.style.visibility = "visible";
        } );
        track.addEventListener( "mouseout", () => {
          if ( !settings2.alwaysShowStars )
            stars.style.visibility = typeof ratings[trackUri] !== "undefined" ? "visible" : "hidden";
        } );
      }
    }
  }
  async function observerCallback( keys ) {
    oldMainElement = mainElement;
    mainElement = document.querySelector( "main" );
    if ( mainElement && !mainElement.isEqualNode( oldMainElement ) ) {
      if ( oldMainElement ) {
        mainElementObserver.disconnect();
      }
      updateTracklist();
      mainElementObserver.observe( mainElement, {
        childList: true,
        subtree: true
      } );
    }
    if ( getNowPlayingHeart() )
      getNowPlayingHeart().style.display = settings2.hideHearts ? "none" : "flex";
    oldNowPlayingWidget = nowPlayingWidget;
    let selector = settings2.nowPlayingStarsPosition === "left" ? ".main-nowPlayingWidget-nowPlaying .main-trackInfo-container" : ".main-nowPlayingBar-right div";
    nowPlayingWidget = document.querySelector( selector );
    if ( nowPlayingWidget && !nowPlayingWidget.isEqualNode( oldNowPlayingWidget ) ) {
      nowPlayingWidgetStarData = createStars( "now-playing", 16 );
      nowPlayingWidgetStarData[0].style.marginLeft = "8px";
      nowPlayingWidgetStarData[0].style.marginRight = "8px";
      if ( settings2.nowPlayingStarsPosition === "left" )
        nowPlayingWidget.after( nowPlayingWidgetStarData[0] );
      else
        nowPlayingWidget.prepend( nowPlayingWidgetStarData[0] );
      addStarsListeners( nowPlayingWidgetStarData, getNowPlayingTrackUri, getNowPlayingHeart );
      updateNowPlayingWidget();
      if ( settings2.enableKeyboardShortcuts ) {
        getRegisterKeyboardShortcuts( keys )();
      }
    }
    oldAlbumPlayButton = albumPlayButton;
    albumPlayButton = document.querySelector( ".main-actionBar-ActionBar .main-playButton-PlayButton" );
    if ( albumPlayButton && !albumPlayButton.isEqualNode( oldAlbumPlayButton ) ) {
      albumStarData = createStars( "album", 32 );
      albumPlayButton.after( albumStarData[0] );
      await updateAlbumStars();
      updateAlbumRating();
    }
  }
  async function updateAlbumStars() {
    if ( !albumStarData )
      return;
    albumId = isAlbumPage();
    albumStarData[0].style.display = albumId ? "flex" : "none";
    if ( !albumId )
      return;
    album = await getAlbum( `spotify:album:${albumId}` );
    updateAlbumRating();
  }
  function updateNowPlayingWidget() {
    var _a;
    if ( !nowPlayingWidgetStarData )
      return;
    const getTrackUri = () => {
      return Spicetify.Player.data.track.uri;
    };
    const trackUri = getTrackUri();
    const isTrack = trackUri.includes( "track" );
    nowPlayingWidgetStarData[0].style.display = isTrack ? "flex" : "none";
    const currentRating = ( _a = ratings[trackUri] ) != null ? _a : 0;
    setRating( nowPlayingWidgetStarData[1], currentRating );
  }
  function shouldAddContextMenuOnFolders( uri ) {
    let uriObj = Spicetify.URI.fromString( uri[0] );
    return uriObj.type === Spicetify.URI.Type.FOLDER;
  }
  function shouldAddContextMenuOnPlaylists( uri ) {
    let uriObj = Spicetify.URI.fromString( uri[0] );
    switch ( uriObj.type ) {
      case Spicetify.URI.Type.PLAYLIST:
      case Spicetify.URI.Type.PLAYLIST_V2:
        return true;
    }
    return false;
  }
  async function loadRatings() {
    ratedFolderUri = getRatedFolderUri();
    ratings = {};
    playlistNames = {};
    playlistUris = getPlaylistUris();
    let ratedFolder = null;
    if ( ratedFolderUri ) {
      const contents = await getContents();
      ratedFolder = findFolderByUri( contents, ratedFolderUri );
    } else {
      const contents = await getContents();
      ratedFolder = findFolderByName( contents, "Rated" );
      if ( ratedFolder ) {
        ratedFolderUri = ratedFolder.uri;
        saveRatedFolderUri( ratedFolderUri );
      }
    }
    if ( ratedFolder ) {
      let playlistUrisRemoved = false;
      [playlistUrisRemoved, playlistUris] = removePlaylistUris( playlistUris, ratedFolder );
      let playlistUrisAdded = false;
      [playlistUrisAdded, playlistUris] = addPlaylistUris( playlistUris, ratedFolder );
      if ( playlistUrisAdded || playlistUrisRemoved )
        savePlaylistUris( playlistUris );
      const allPlaylistItems = await getAllPlaylistItems( playlistUris );
      ratings = getRatings( allPlaylistItems );
      await deleteLowestRatings( playlistUris, ratings );
      ratings = takeHighestRatings( ratings );
      playlistNames = getPlaylistNames( playlistUris, ratedFolder );
    } else if ( Object.keys( playlistUris ).length > 0 ) {
      playlistUris = {};
      savePlaylistUris( playlistUris );
      ratedFolderUri = "";
      saveRatedFolderUri( ratedFolderUri );
    }
  }
  async function main() {
    while ( !( Spicetify == null ? void 0 : Spicetify.showNotification ) ) {
      await new Promise( ( resolve ) => setTimeout( resolve, 100 ) );
    }
    settings2 = getSettings();
    saveSettings( settings2 );
    await loadRatings();
    const keys = {
      "5.0": Spicetify.Keyboard.KEYS.NUMPAD_0,
      "0.5": Spicetify.Keyboard.KEYS.NUMPAD_1,
      "1.0": Spicetify.Keyboard.KEYS.NUMPAD_2,
      "1.5": Spicetify.Keyboard.KEYS.NUMPAD_3,
      "2.0": Spicetify.Keyboard.KEYS.NUMPAD_4,
      "2.5": Spicetify.Keyboard.KEYS.NUMPAD_5,
      "3.0": Spicetify.Keyboard.KEYS.NUMPAD_6,
      "3.5": Spicetify.Keyboard.KEYS.NUMPAD_7,
      "4.0": Spicetify.Keyboard.KEYS.NUMPAD_8,
      "4.5": Spicetify.Keyboard.KEYS.NUMPAD_9
    };
    const registerKeyboardShortcuts = getRegisterKeyboardShortcuts( keys );
    const deregisterKeyboardShortcuts = getDeregisterKeyboardShortcuts( keys );
    const redrawNowPlayingStars = () => {
      if ( nowPlayingWidgetStarData )
        nowPlayingWidgetStarData[0].remove();
      nowPlayingWidget = null;
      observerCallback( keys );
    };
    new Spicetify.Menu.Item( "Star Ratings", false, () => {
      Spicetify.PopupModal.display( {
        title: "Star Ratings",
        content: Settings( {
          settings: settings2,
          registerKeyboardShortcuts,
          deregisterKeyboardShortcuts,
          updateTracklist,
          restoreTracklist,
          redrawNowPlayingStars
        } ),
        isLarge: true
      } );
    } ).register();
    mainElementObserver = new MutationObserver( () => {
      updateTracklist();
    } );
    Spicetify.Player.addEventListener( "songchange", () => {
      const trackUri = Spicetify.Player.data.track.uri;
      if ( trackUri in ratings && settings2.skipThreshold !== "disabled" && ratings[trackUri] <= parseFloat( settings2.skipThreshold ) ) {
        Spicetify.Player.next();
        return;
      }
      updateNowPlayingWidget();
    } );
    Spicetify.Platform.History.listen( async () => {
      await updateAlbumStars();
    } );
    new Spicetify.ContextMenu.Item(
      "Use as Rated folder",
      ( uri ) => {
        ratedFolderUri = uri[0];
        saveRatedFolderUri( ratedFolderUri );
        ratingsLoading = true;
        loadRatings().finally( () => {
          ratingsLoading = false;
        } );
      },
      shouldAddContextMenuOnFolders
    ).register();
    new Spicetify.ContextMenu.Item(
      "Sort by rating",
      ( uri ) => {
        Spicetify.PopupModal.display( {
          title: "Modify Custom order?",
          content: SortModal( {
            onClickCancel: () => {
              Spicetify.PopupModal.hide();
            },
            onClickOK: () => {
              Spicetify.PopupModal.hide();
              isSorting = true;
              showNotification( "Sorting..." );
              sortPlaylistByRating( uri[0], ratings ).finally( () => {
                isSorting = false;
              } );
            }
          } )
        } );
      },
      shouldAddContextMenuOnPlaylists
    ).register();
    const observer = new MutationObserver( async () => {
      await observerCallback( keys );
    } );
    await observerCallback( keys );
    observer.observe( document.body, {
      childList: true,
      subtree: true
    } );
  }
  var app_default = main;

  // node_modules/spicetify-creator/dist/temp/index.jsx
  ( async () => {
    await app_default();
  } )();
} )();
( async () => {
  if ( !document.getElementById( `starDratings` ) ) {
    var el = document.createElement( 'style' );
    el.id = `starDratings`;
    el.textContent = ( String.raw`
  /* C:/Users/Mark/AppData/Local/Temp/tmp-25988-1OfTaHX3tYDd/18c27e166df7/settings-ui.css */
.popup-row::after {
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
  -webkit-margin-start: 12px;
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
}

/* C:/Users/Mark/AppData/Local/Temp/tmp-25988-1OfTaHX3tYDd/18c27e166da6/sort-modal.css */
.parent-div {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.button-div {
  margin-top: 24px;
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}
.cancel-button {
  background-color: transparent;
  font-weight: 700;
  border: 0;
  color: var(--spice-text);
  display: inline-flex;
  border-radius: 500px;
  font-size: inherit;
  min-block-size: 48px;
  align-items: center;
  padding-inline: 32px;
}
.cancel-button:hover {
  transform: scale(1.04);
}
.ok-button {
  background-color: var(--spice-button-active);
  font-weight: 700;
  border: 0;
  color: var(--spice-main);
  display: inline-flex;
  border-radius: 500px;
  font-size: inherit;
  min-block-size: 48px;
  align-items: center;
  padding-inline: 32px;
}
.ok-button:hover {
  transform: scale(1.04);
}

      `).trim();
    document.head.appendChild( el );
  }
} )();