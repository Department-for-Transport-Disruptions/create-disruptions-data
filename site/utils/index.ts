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
