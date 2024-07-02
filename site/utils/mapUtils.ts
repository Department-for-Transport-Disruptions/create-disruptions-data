import { RouteWithServiceInfo, RouteWithServiceInfoPreformatted } from ".";

export const warningMessageText = (selectedLength: number) => ({
    noServiceAssociatedWithStop: "Cannot select stop, stop does not have any associated services",
    maxStopLimitReached: `Stop selection capped at 100, ${selectedLength} stops currently selected`,
    drawnAreaTooBig: "Drawn area too big, draw a smaller area",
    problemRetrievingStops: "There was a problem retrieving the stops",
    noStopsFound: "No stops found in selected area",
});

export const groupByJourneyPattern = (routesData: RouteWithServiceInfoPreformatted[]): RouteWithServiceInfo[] => {
    const result: RouteWithServiceInfo[] = [];

    routesData.forEach((data) => {
        const groupedData: RouteWithServiceInfo = {
            outbound: {},
            inbound: {},
            serviceId: data.serviceId,
            serviceCode: data.serviceCode,
            lineId: data.lineId,
        };

        data.outbound.forEach((stop) => {
            const key = stop.journeyPatternId || "unknown";
            if (!groupedData.outbound[key]) {
                groupedData.outbound[key] = [];
            }
            groupedData.outbound[key].push(stop);
        });

        for (const journeyPatternId in groupedData.outbound) {
            groupedData.outbound[journeyPatternId].sort((a, b) => Number(a.sequenceNumber) - Number(b.sequenceNumber));
        }

        data.inbound.forEach((stop) => {
            const key = stop.journeyPatternId || "unknown";
            if (!groupedData.inbound[key]) {
                groupedData.inbound[key] = [];
            }
            groupedData.inbound[key].push(stop);
        });

        for (const journeyPatternId in groupedData.inbound) {
            groupedData.inbound[journeyPatternId].sort((a, b) => Number(a.sequenceNumber) - Number(b.sequenceNumber));
        }

        result.push(groupedData);
    });

    return result;
};
