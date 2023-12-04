import { saveSettings } from "./settings";
import "./settings-ui.css";


function CheckboxIcon() {
    const React = Spicetify.React;
    return (
        <svg
            width={16}
            height={16}
            viewbox="0 0 16 16"
            fill="currentColor"
            dangerouslySetInnerHTML={{
                __html: Spicetify.SVGIcons.check,
            }}
        ></svg>
    );
}

function CheckboxItem({ settings, name, field, onclick }) {
    const React = Spicetify.React;
    let [value, setValue] = Spicetify.React.useState(settings[field]);
    const buttonClass = value ? "checkbox" : "checkbox disabled";

    function handleOnClick() {
        let state = !value;
        settings[field] = state;
        setValue(state);
        saveSettings(settings);
        if (onclick) onclick();
    }

    return (
        <div className="popup-row">
            <label className="col description">{name}</label>
            <div className="col action">
                <button className={buttonClass} onClick={handleOnClick}>
                    <CheckboxIcon />
                </button>
            </div>
        </div>
    );
}

function DropdownItem({ settings, name, field, options, onclick }) {
    const React = Spicetify.React;
    const [value, setValue] = Spicetify.React.useState(settings[field]);

    function handleOnChange(event) {
        setValue(event.target.value);
        settings[field] = event.target.value;
        saveSettings(settings);
        if (onclick) onclick();
    }

    const optionElements = [];
    for (const [optionName, optionValue] of Object.entries(options)) optionElements.push(<option value={optionValue}>{optionName}</option>);

    return (
        <div className="popup-row">
            <label className="col description">{name}</label>
            <div className="col action">
                <select value={value} onChange={handleOnChange}>
                    {optionElements}
                </select>
            </div>
        </div>
    );
}

function KeyboardShortcutDescription({ label, numberKey }) {
    const React = Spicetify.React;
    return (
        <li className="main-keyboardShortcutsHelpModal-sectionItem">
            <span className="Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-sectionItemName">{label}</span>
            <kbd className="Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-key">Ctrl</kbd>
            <kbd className="Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-key">Alt</kbd>
            <kbd className="Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-key">{numberKey}</kbd>
        </li>
    );
}

function Heading({ value }) {
    const React = Spicetify.React;
    return <h2 className="Type__TypeElement-goli3j-0 bcTfIx main-keyboardShortcutsHelpModal-sectionHeading">{value}</h2>;
}

export function Settings({
    settings,
    registerKeyboardShortcuts,
    deregisterKeyboardShortcuts,
    updateTracklist,
    restoreTracklist,
    redrawNowPlayingStars,
}) {
    const React = Spicetify.React;
    function handleHideHeartsCheckboxClick(/*hideHearts*/) {
        const nowPlayingWidgetHeart = document.querySelector(".control-button-heart");
        if (nowPlayingWidgetHeart) nowPlayingWidgetHeart.style.display = settings.hideHearts ? "none" : "flex";
        const hearts = document.querySelectorAll(".main-trackList-rowHeartButton");
        for (const heart of hearts) heart.style.display = settings.hideHearts ? "none" : "flex";

    }

    function handleAlwaysShowStarsCheckboxClick(/*alwaysShowStars*/) {
        const stars = document.querySelectorAll(".main-trackList-rowSectionVariable.starRatings");
        for (const star of stars) star.style.visibility = settings.alwaysShowStars ? "visible" : "hidden";
    }

    function handleEnableKeyboardShortcutsCheckboxClick() {
        if (settings.enableKeyboardShortcuts) registerKeyboardShortcuts();
        else deregisterKeyboardShortcuts();
    }

    function handleShowPlaylistStarsCheckboxClick() {
        if (settings.showPlaylistStars) updateTracklist();
        else restoreTracklist();
    }

    function hanleNowPlayingStarsPositionDropdownClick() {
        redrawNowPlayingStars();
    }
    function handleDummy() {
        console.log("dummy function");
    }
    return (
        <div>
            <Heading value="Settings" />
            <CheckboxItem settings={settings} name="Half star ratings" field="halfStarRatings" onclick={handleDummy} />
            <CheckboxItem settings={settings} name="Hide hearts" field="hideHearts" onclick={handleHideHeartsCheckboxClick} />
            <CheckboxItem settings={settings} name="Enable keyboard shortcuts" field="enableKeyboardShortcuts" onclick={handleEnableKeyboardShortcutsCheckboxClick} />
            <CheckboxItem settings={settings} name="Show playlist stars" field="showPlaylistStars" onclick={handleShowPlaylistStarsCheckboxClick} />
            <CheckboxItem settings={settings} name="Always show stars" field="alwaysShowStars" onclick={handleAlwaysShowStarsCheckboxClick} />
            <DropdownItem
                settings={settings}
                name="Auto-like/dislike threshold"
                field="likeThreshold"
                options={{
                    Disabled: "disabled",
                    "3.0": "3.0",
                    "3.5": "3.5",
                    "4.0": "4.0",
                    "4.5": "4.5",
                    "5.0": "5.0",
                }}
                onclick={handleDummy}
            />
            <DropdownItem
                settings={settings}
                name="Now playing stars position"
                field="nowPlayingStarsPosition"
                options={{
                    Left: "left",
                    Right: "right",
                }}
                onclick={hanleNowPlayingStarsPositionDropdownClick}
            />
            <DropdownItem
                settings={settings}
                name="Skip threshold"
                field="skipThreshold"
                options={{
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
                    "4.5": "4.5",
                }}
                onclick={handleDummy}
            />
            <Heading value="Keyboard Shortcuts" />
            <ul>
                <KeyboardShortcutDescription label="Rate current track 0.5 stars" numberKey="1" />
                <KeyboardShortcutDescription label="Rate current track 1 star" numberKey="2" />
                <KeyboardShortcutDescription label="Rate current track 1.5 stars" numberKey="3" />
                <KeyboardShortcutDescription label="Rate current track 2 stars" numberKey="4" />
                <KeyboardShortcutDescription label="Rate current track 2.5 stars" numberKey="5" />
                <KeyboardShortcutDescription label="Rate current track 3 stars" numberKey="6" />
                <KeyboardShortcutDescription label="Rate current track 3.5 stars" numberKey="7" />
                <KeyboardShortcutDescription label="Rate current track 4 stars" numberKey="8" />
                <KeyboardShortcutDescription label="Rate current track 4.5 stars" numberKey="9" />
                <KeyboardShortcutDescription label="Rate current track 5 stars" numberKey="0" />
            </ul>
        </div>
    );
}
