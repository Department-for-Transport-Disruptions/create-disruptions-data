import resendInvite from "../api/admin/resend-invite.api";

const createUserActionsLink = (
    key: string,
    index: number,
    username: string,
    userGroup: string,
    showResendInvite?: boolean,
) => {
    return (
        <>
            {showResendInvite ? (
                <>
                    <button
                        key={`${key}${index ? `-${index}` : ""}`}
                        className="govuk-link"
                        onClick={() => resendInvite(username, userGroup)}
                    >
                        Resend invite
                    </button>
                    <br />
                    <button
                        key={`${key}${index ? `-remove-${index}` : "-remove"}`}
                        className="govuk-link"
                        onClick={() => removeUser(username)}
                    >
                        Remove
                    </button>
                </>
            ) : (
                <button
                    key={`${key}${index ? `-${index}` : ""}`}
                    className="govuk-link"
                    onClick={() => removeUser(username)}
                >
                    Remove
                </button>
            )}
        </>
    );
};
