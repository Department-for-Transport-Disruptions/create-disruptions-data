import FocusTrap from "focus-trap-react";
import { ReactNode } from "react";

interface TrapProps {
    active: boolean;
    children: ReactNode;
}
const Trap = ({ active, children }: TrapProps) => {
    return active ? (
        <FocusTrap
            focusTrapOptions={{
                tabbableOptions: { displayCheck: "none" },
            }}
        >
            <div className="trap">{children}</div>
        </FocusTrap>
    ) : (
        false
    );
};
export default Trap;
