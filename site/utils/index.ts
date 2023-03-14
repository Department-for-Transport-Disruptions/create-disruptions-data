import dayjs from "dayjs";
import { NextApiResponse, NextPageContext } from "next";
import { useEffect, useRef, useState } from "react";
import { ServerResponse } from "http";
import { ErrorInfo, ResponseWithLocals } from "../interfaces";

export const buildTitle = (errors: ErrorInfo[], title: string): string => {
    if (errors.length > 0) {
        return `Error: ${title}`;
    }

    return title;
};

export const redirectTo = (res: NextApiResponse | ServerResponse, location: string): void => {
    res.writeHead(302, {
        Location: location,
    });
    res.end();
};

export const getCsrfToken = (ctx: NextPageContext | NextPageContext): string =>
    (ctx.res as ResponseWithLocals)?.locals?.csrfToken ?? "";

export const useEffectOnce = (effect: () => void | (() => void)) => {
    const destroyFunc = useRef<void | (() => void)>();
    const effectCalled = useRef(false);
    const renderAfterCalled = useRef(false);
    const [, setVal] = useState<number>(0);

    if (effectCalled.current) {
        renderAfterCalled.current = true;
    }

    useEffect(() => {
        // only execute the effect first time around
        if (!effectCalled.current) {
            destroyFunc.current = effect();
            effectCalled.current = true;
        }

        // this forces one render after the effect is run
        setVal((val) => val + 1);

        return () => {
            // if the comp didn't render since the useEffect was called,
            // we know it's the dummy React cycle
            if (!renderAfterCalled.current) {
                return;
            }
            if (destroyFunc.current) {
                destroyFunc.current();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};

export const convertDateTimeToFormat = (dateOrTime: string, format: string) => dayjs(dateOrTime).format(format);

export const formatTime = (time: string) => (time ? time.slice(0, -2) + ":" + time.slice(-2) : "");

export const splitCamelCaseToString = (s: string) => {
    return s
        ?.split(/(?=[A-Z])/)
        .map(function (p) {
            return p.charAt(0).toUpperCase() + p.slice(1);
        })
        .join(" ");
};
