import csrf from "edge-csrf";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const csrfProtect = csrf({
    cookie: {
        secure: process.env.NODE_ENV === "production",
        name: "_csrf",
    },
});

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();

    await csrfProtect(request, response);

    // if (csrfError) {
    //     return new NextResponse("invalid csrf token", { status: 403 });
    // }

    return response;
}
