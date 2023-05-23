import { ReactElement, ReactNode } from "react";

interface CsrfFormProps {
    action: string;
    method: string;
    csrfToken?: string;
    children: ReactNode;
    hideCsrf?: boolean;
    [props: string]: unknown;
}

const CsrfForm = ({ action, method, csrfToken, children, hideCsrf = false, ...props }: CsrfFormProps): ReactElement => (
    <form action={action} method={method} {...props}>
        {!hideCsrf ? <input type="hidden" name="csrf_token" value={csrfToken || ""} /> : null}
        {children}
    </form>
);

export default CsrfForm;
