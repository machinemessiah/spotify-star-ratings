import "./sort-modal.css";

export function Button({ name, className, onButtonClick }) {
    const React = Spicetify.React;
    return (
        <button className={className} onClick={onButtonClick}>
            {name}
        </button>
    );
}

export function SortModal({ onClickCancel, onClickOK }) {
    const React = Spicetify.React;
    return (
        <div className="parent-div">
            <p>
                This will modify the <b>Custom order</b> of the playlist.
            </p>
            <div className="button-div">
                <Button name="Cancel" className="cancel-button" onButtonClick={onClickCancel} />
                <Button name="Sort" className="ok-button" onButtonClick={onClickOK} />
            </div>
        </div>
    );
}
