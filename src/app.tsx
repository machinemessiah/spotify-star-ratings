import * as api from "./api";
import { createStars, setRating, getMouseoverRating, findStars } from "./stars";
import { getSettings, saveSettings, getPlaylistUris, savePlaylistUris, getRatedFolderUri, saveRatedFolderUri } from "./settings";
import { SortModal } from "./sort-modal";
import { Settings } from "./settings-ui";
import {
    findFolderByName,
    findFolderByUri,
    addPlaylistUris,
    removePlaylistUris,
    getAllPlaylistItems,
    getRatings,
    takeHighestRatings,
    getPlaylistNames,
    deleteLowestRatings,
    getAlbumRating,
    sortPlaylistByRating,
} from "./ratings";

let settings = null;

let ratedFolderUri = null;
let ratings = {};
let playlistNames = {};
let playlistUris = {};

let originalTracklistHeaderCss = null;
let originalTracklistTrackCss = null;
let oldMainElement = null;
let mainElement = null;
let mainElementObserver = null;
let tracklists = [];
let oldTracklists = [];

let oldNowPlayingWidget = null;
let nowPlayingWidget = null;

let oldAlbumPlayButton = null;
let albumPlayButton = null;

let albumId = null;
let album = null;
let albumStarData = null;
let nowPlayingWidgetStarData = null;

let clickListenerRunning = false;
let ratingsLoading = false;
let isSorting = false;

function isAlbumPage() {
    const pathname = Spicetify.Platform.History.location.pathname;
    const matches = pathname.match(/album\/(.*)/);
    if (!matches) return null;
    return matches[1];
}

function trackUriToTrackId(trackUri) {
    return trackUri.match(/spotify:track:(.*)/)[1];
}

function getTracklistTrackUri(tracklistElement) {
    let values = Object.values(tracklistElement);
    if (!values) return null;
    const searchFrom = values[0]?.pendingProps?.children[0]?.props?.children;
    return (
        searchFrom?.props?.uri ||
        searchFrom?.props?.children?.props?.uri ||
        searchFrom?.props?.children?.props?.children?.props?.uri ||
        searchFrom[0]?.props?.uri
    );
}

function getNowPlayingHeart() {
    return document.querySelector(".main-nowPlayingWidget-nowPlaying .control-button-heart");
}

const getNowPlayingTrackUri = () => {
    return Spicetify.Player.data.item.uri;
};

async function updateAlbumRating() {
    if (!albumId) return;
    if (!album) album = await api.getAlbum(`spotify:album:${albumId}`);
    const averageRating = getAlbumRating(ratings, album);
    setRating(albumStarData[1], averageRating.toString());
}

async function handleRemoveRating(trackUri, rating) {
    delete ratings[trackUri];
    const ratingAsString = rating.toFixed(1);
    const playlistUri = playlistUris[ratingAsString];
    const playlistName = playlistNames[playlistUri];
    await api.deleteTrackFromPlaylist(playlistUri, trackUri);
    api.showNotification(`Removed from ${playlistName}`);
}

async function handleSetRating(trackUri, oldRating, newRating) {
    ratings[trackUri] = newRating;
    if (oldRating) {
        const oldRatingAsString = oldRating.toFixed(1);
        const playlistUri = playlistUris[oldRatingAsString];
        const playlistName = playlistNames[playlistUri];
        await api.deleteTrackFromPlaylist(playlistUri, trackUri);
    }
    if (!ratedFolderUri) {
        await api.createFolder("Rated");
        const contents = await api.getContents();
        const ratedFolder = findFolderByName(contents, "Rated");
        ratedFolderUri = ratedFolder.uri;
        saveRatedFolderUri(ratedFolderUri);
    }
    const newRatingAsString = newRating.toFixed(1);
    let playlistUri = playlistUris[newRatingAsString];
    if (!playlistUri) {
        playlistUri = await api.createPlaylist(newRatingAsString, ratedFolderUri);
        await api.makePlaylistPrivate(playlistUri);
        playlistUris[newRatingAsString] = playlistUri;
        savePlaylistUris(playlistUris);
        playlistNames[playlistUri] = newRatingAsString;
    }
    await api.addTrackToPlaylist(playlistUri, trackUri);
    const playlistName = playlistNames[playlistUri];
    api.showNotification((oldRating ? "Moved" : "Added") + ` to ${playlistName}`);
}

function getClickListener(i, ratingOverride, starData, getTrackUri, getHeart) {
    return () => {
        if (clickListenerRunning || ratingsLoading || isSorting) return;
        clickListenerRunning = true;
        const [stars, starElements] = starData;
        const star = starElements[i][0];
        const trackUri = getTrackUri();
        const oldRating = ratings[trackUri];
        let newRating = ratingOverride !== null ? ratingOverride : getMouseoverRating(settings, star, i);

        const heart = getHeart();
        if (heart && settings.likeThreshold !== "disabled") {
            if (heart.ariaChecked !== "true" && newRating >= parseFloat(settings.likeThreshold)) heart.click();
            if (heart.ariaChecked === "true" && newRating < parseFloat(settings.likeThreshold)) heart.click();
        }

        let promise = null;
        let displayRating = null;

        if (oldRating === newRating) {
            displayRating = 0.0;
            promise = handleRemoveRating(trackUri, newRating);
        } else {
            displayRating = newRating;
            promise = handleSetRating(trackUri, oldRating, newRating);
        }

        promise.finally(() => {
            tracklistStarData = findStars(trackUriToTrackId(trackUri));
            if (tracklistStarData) {
                setRating(tracklistStarData[1], displayRating);
                tracklistStarData[0].style.visibility = oldRating === newRating ? "hidden" : "visible";
            }

            updateNowPlayingWidget();
            updateAlbumRating();

            clickListenerRunning = false;
        });
    };
}

function getRegisterKeyboardShortcuts(keys) {
    return () => {
        for (const [rating, key] of Object.entries(keys)) {
            Spicetify.Keyboard.registerShortcut(
                {
                    key: key,
                    ctrl: true,
                    alt: true,
                },
                getClickListener(0, parseFloat(rating), nowPlayingWidgetStarData, getNowPlayingTrackUri, getNowPlayingHeart)
            );
        }
    };
}

function getDeregisterKeyboardShortcuts(keys) {
    return () => {
        for (const key of Object.values(keys)) {
            Spicetify.Keyboard._deregisterShortcut({
                key: key,
                ctrl: true,
                alt: true,
            });
        }
    };
}

function addStarsListeners(starData, getTrackUri, getHeart) {
    const getCurrentRating = (trackUri) => {
        return ratings[trackUri] ?? 0.0;
    };

    const [stars, starElements] = starData;

    stars.addEventListener("mouseout", function () {
        setRating(starElements, getCurrentRating(getTrackUri()));
    });

    for (let i = 0; i < 5; i++) {
        const star = starElements[i][0];

        star.addEventListener("mousemove", function () {
            const rating = getMouseoverRating(settings, star, i);
            setRating(starElements, rating);
        });

        star.addEventListener("click", getClickListener(i, null, starData, getTrackUri, getHeart));
    }
}

function restoreTracklist() {
    const tracklistHeaders = document.querySelectorAll(".main-trackList-trackListHeaderRow");
    tracklistHeaders.forEach((tracklistHeader) => {
        tracklistHeader.style["grid-template-columns"] = originalTracklistHeaderCss;
    });

    for (const tracklist of tracklists) {
        const tracks = tracklist.getElementsByClassName("main-trackList-trackListRow");
        for (const track of tracks) {
            let ratingColumn = track.querySelector(".starRatings");
            if (!ratingColumn) continue;
            track.style["grid-template-columns"] = originalTracklistTrackCss;
            ratingColumn.remove();
            let lastColumn = track.querySelector(".main-trackList-rowSectionEnd");
            let colIndexInt = parseInt(lastColumn.getAttribute("aria-colindex"));
            lastColumn.setAttribute("aria-colindex", (colIndexInt - 1).toString());
        }
    }
}

function updateTracklist() {
    if (!settings.showPlaylistStars) return;

    oldTracklists = tracklists;
    tracklists = Array.from(document.querySelectorAll(".main-trackList-indexable"));
    let tracklistsChanged = tracklists.length !== oldTracklists.length;
    for (let i = 0; i < tracklists.length; i++) if (!tracklists[i].isEqualNode(oldTracklists[i])) tracklistsChanged = true;
    if (tracklistsChanged) {
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
        "[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] minmax(120px,2fr) [var3] 2fr [last] minmax(120px,1fr)",
    ];

    let newTracklistHeaderCss = null;
    /**
    const tracklistHeaders = document.querySelectorAll(".main-trackList-trackListHeaderRow");
    // No tracklist header on Artist page
    tracklistHeaders.forEach((tracklistHeader) => {
        let lastColumn = tracklistHeader.querySelector(".main-trackList-rowSectionEnd");
        let colIndexInt = parseInt(lastColumn.getAttribute("aria-colindex"));

        if (!originalTracklistHeaderCss) originalTracklistHeaderCss = getComputedStyle(tracklistHeader).gridTemplateColumns;
        if (originalTracklistHeaderCss && tracklistColumnCss[colIndexInt]) {
            tracklistHeader.style["grid-template-columns"] = tracklistColumnCss[colIndexInt];
            newTracklistHeaderCss = tracklistColumnCss[colIndexInt];
        }
    });
    **/

    for (const tracklist of tracklists) {
        const tracks = tracklist.getElementsByClassName(
            "main-trackList-trackListRow",
        );
        for (const track of tracks) {
            const getHeart = () => {
                return (
                    track.getElementsByClassName("main-addButton-button")[0] ??
                    track.querySelector(".main-trackList-rowHeartButton") ??
                    track.querySelector(
                        "button[class*='buttonTertiary-iconOnly']",
                    ) ??
                    track.querySelector("button[aria-label='Add to playlist']")
                );
            };
            const heart = getHeart();
            const hasStars = track.getElementsByClassName("stars").length > 0;
            const trackUri = getTracklistTrackUri(track);
            const isTrack = trackUri.includes("track");

            let ratingColumn = track.querySelector(".starRatings");
            if (!ratingColumn) {
                // Add column for stars
                ratingColumn = track.querySelector(
                    ".main-trackList-rowSectionEnd",
                );
                ratingColumn.classList.add("starRatings");

                /**
                let colIndexInt = parseInt(lastColumn.getAttribute("aria-colindex"));
                lastColumn.setAttribute("aria-colindex", (colIndexInt + 1).toString());
                ratingColumn = document.createElement("div");
                ratingColumn.setAttribute("aria-colindex", colIndexInt.toString());
                ratingColumn.role = "gridcell";
                ratingColumn.style.display = "flex";
                ratingColumn.classList.add("main-trackList-rowSectionVariable");
                ratingColumn.classList.add("starRatings");
                track.insertBefore(ratingColumn, lastColumn);

                if (!originalTracklistTrackCss) originalTracklistTrackCss = getComputedStyle(track).gridTemplateColumns;
                if (tracklistColumnCss[colIndexInt])
                    track.style["grid-template-columns"] = newTracklistHeaderCss ? newTracklistHeaderCss : tracklistColumnCss[colIndexInt];
                **/
            }

            if (!heart || !trackUri || hasStars || !isTrack) continue;

            const starData = createStars(trackUriToTrackId(trackUri), 16);
            const stars = starData[0];
            const starElements = starData[1];
            const currentRating = ratings[trackUri] ?? 0.0;
            ///ratingColumn.appendChild(stars);
            ratingColumn.insertBefore(stars, ratingColumn.firstChild);
            setRating(starElements, currentRating);
            getHeart().style.display = settings.hideHearts ? "none" : "flex";
            addStarsListeners(
                starData,
                () => {
                    return trackUri;
                },
                getHeart,
            );

            // Add listeners for hovering over a track in the tracklist
            stars.style.visibility =
                settings.alwaysShowStars ||
                    typeof ratings[trackUri] !== "undefined"
                    ? "visible"
                    : "hidden";

            track.addEventListener("mouseover", () => {
                if (!settings.alwaysShowStars) stars.style.visibility = "visible";
            });

            track.addEventListener("mouseout", () => {
                if (!settings.alwaysShowStars)
                    stars.style.visibility =
                        typeof ratings[trackUri] !== "undefined"
                            ? "visible"
                            : "hidden";
            });
        }
    }
}

function onClickShowPlaylistStars() {
    if (settings.showPlaylistStars) updateTracklist();
    else restoreTracklist();
}

async function observerCallback(keys) {
    oldMainElement = mainElement;
    mainElement = document.querySelector("main");
    if (mainElement && !mainElement.isEqualNode(oldMainElement)) {
        if (oldMainElement) {
            mainElementObserver.disconnect();
        }
        updateTracklist();
        mainElementObserver.observe(mainElement, {
            childList: true,
            subtree: true,
        });
    }

    if (getNowPlayingHeart()) getNowPlayingHeart().style.display = settings.hideHearts ? "none" : "flex";

    oldNowPlayingWidget = nowPlayingWidget;
    let selector =
        settings.nowPlayingStarsPosition === "left" ? ".main-nowPlayingWidget-nowPlaying .main-trackInfo-container" : ".main-nowPlayingBar-right div";
    nowPlayingWidget = document.querySelector(selector);
    if (nowPlayingWidget && !nowPlayingWidget.isEqualNode(oldNowPlayingWidget)) {
        nowPlayingWidgetStarData = createStars("now-playing", 16);
        nowPlayingWidgetStarData[0].style.marginLeft = "8px";
        nowPlayingWidgetStarData[0].style.marginRight = "8px";
        if (settings.nowPlayingStarsPosition === "left") nowPlayingWidget.after(nowPlayingWidgetStarData[0]);
        else nowPlayingWidget.prepend(nowPlayingWidgetStarData[0]);
        addStarsListeners(nowPlayingWidgetStarData, getNowPlayingTrackUri, getNowPlayingHeart);
        updateNowPlayingWidget();
        if (settings.enableKeyboardShortcuts) {
            getRegisterKeyboardShortcuts(keys)();
        }
    }

    oldAlbumPlayButton = albumPlayButton;
    albumPlayButton = document.querySelector(".main-actionBar-ActionBar .main-playButton-PlayButton");
    if (albumPlayButton && !albumPlayButton.isEqualNode(oldAlbumPlayButton)) {
        albumStarData = createStars("album", 32);
        albumPlayButton.after(albumStarData[0]);

        // ?? this calls updateAlbumRating if the promise returns a value
        // = solution: don't call it here as well
        await updateAlbumStars();
        ///updateAlbumRating();
    }
}

async function updateAlbumStars() {
    if (!albumStarData) return;

    albumId = isAlbumPage();
    albumStarData[0].style.display = albumId ? "flex" : "none";
    if (!albumId) return;
    album = await api.getAlbum(`spotify:album:${albumId}`);
    updateAlbumRating();
}

function updateNowPlayingWidget() {
    if (!nowPlayingWidgetStarData) return;

    const getTrackUri = () => {
        return Spicetify.Player.data.item.uri;
    };
    const trackUri = getTrackUri();
    const isTrack = trackUri.includes("track");

    nowPlayingWidgetStarData[0].style.display = isTrack ? "flex" : "none";

    const currentRating = ratings[trackUri] ?? 0.0;
    setRating(nowPlayingWidgetStarData[1], currentRating);
}

function shouldAddContextMenuOnFolders(uri) {
    let uriObj = Spicetify.URI.fromString(uri[0]);
    return uriObj.type === Spicetify.URI.Type.FOLDER;
}

function shouldAddContextMenuOnPlaylists(uri) {
    let uriObj = Spicetify.URI.fromString(uri[0]);
    switch (uriObj.type) {
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

    if (ratedFolderUri) {
        const contents = await api.getContents();
        ratedFolder = findFolderByUri(contents, ratedFolderUri);
    } else {
        // TODO: Remove after next release
        const contents = await api.getContents();
        ratedFolder = findFolderByName(contents, "Rated");
        if (ratedFolder) {
            ratedFolderUri = ratedFolder.uri;
            saveRatedFolderUri(ratedFolderUri);
        }
    }

    if (ratedFolder) {
        let playlistUrisRemoved = false;
        [playlistUrisRemoved, playlistUris] = removePlaylistUris(playlistUris, ratedFolder);

        let playlistUrisAdded = false;
        [playlistUrisAdded, playlistUris] = addPlaylistUris(playlistUris, ratedFolder);

        if (playlistUrisAdded || playlistUrisRemoved) savePlaylistUris(playlistUris);

        const allPlaylistItems = await getAllPlaylistItems(playlistUris);
        ratings = getRatings(allPlaylistItems);
        await deleteLowestRatings(playlistUris, ratings);
        ratings = takeHighestRatings(ratings);
        playlistNames = getPlaylistNames(playlistUris, ratedFolder);
    } else if (Object.keys(playlistUris).length > 0) {
        playlistUris = {};
        savePlaylistUris(playlistUris);
        ratedFolderUri = "";
        saveRatedFolderUri(ratedFolderUri);
    }
}

async function main() {
    while (!Spicetify?.showNotification || !Spicetify.SVGIcons) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // + add star icon so we can use it for the settings menu
    Object.assign(Spicetify.SVGIcons, { star: '<path d="M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z"/>' });
    settings = getSettings();
    saveSettings(settings);

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
        "4.5": Spicetify.Keyboard.KEYS.NUMPAD_9,
    };

    const registerKeyboardShortcuts = getRegisterKeyboardShortcuts(keys);
    const deregisterKeyboardShortcuts = getDeregisterKeyboardShortcuts(keys);
    const redrawNowPlayingStars = () => {
        if (nowPlayingWidgetStarData) nowPlayingWidgetStarData[0].remove();
        nowPlayingWidget = null;
        observerCallback(keys);
    };

    new Spicetify.Menu.Item("Star Ratings", false, () => {
        Spicetify.PopupModal.display({
            title: "Star Ratings",
            content: Settings({
                settings,
                registerKeyboardShortcuts,
                deregisterKeyboardShortcuts,
                updateTracklist,
                restoreTracklist,
                redrawNowPlayingStars,
            }),
            isLarge: true,
        });
    }, 'star').register();

    mainElementObserver = new MutationObserver(() => {
        updateTracklist();
    });

    Spicetify.Player.addEventListener("songchange", () => {
        const trackUri = Spicetify.Player.data.item.uri;
        if (trackUri in ratings && settings.skipThreshold !== "disabled" && ratings[trackUri] <= parseFloat(settings.skipThreshold)) {
            Spicetify.Player.next();
            return;
        }

        updateNowPlayingWidget();
    });

    Spicetify.Platform.History.listen(async () => {
        await updateAlbumStars();
    });

    new Spicetify.ContextMenu.Item(
        "Use as Rated folder",
        (uri) => {
            ratedFolderUri = uri[0];
            saveRatedFolderUri(ratedFolderUri);
            ratingsLoading = true;
            loadRatings().finally(() => {
                ratingsLoading = false;
            });
        },
        shouldAddContextMenuOnFolders
    ).register();

    new Spicetify.ContextMenu.Item(
        "Sort by rating",
        (uri) => {
            Spicetify.PopupModal.display({
                title: "Modify Custom order?",
                content: SortModal({
                    onClickCancel: () => {
                        Spicetify.PopupModal.hide();
                    },
                    onClickOK: () => {
                        Spicetify.PopupModal.hide();
                        isSorting = true;
                        api.showNotification("Sorting...");
                        sortPlaylistByRating(uri[0], ratings).finally(() => {
                            isSorting = false;
                        });
                    },
                }),
            });
        },
        shouldAddContextMenuOnPlaylists
    ).register();

    const observer = new MutationObserver(async () => {
        await observerCallback(keys);
    });
    await observerCallback(keys);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

export default main;
