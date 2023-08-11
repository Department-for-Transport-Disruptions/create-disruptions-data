export const warningMessageText = (selectedLength: number) => ({
    noServiceAssociatedWithStop: "Cannot select stop, stop does not have any associated services",
    maxStopLimitReached: `Stop selection capped at 100, ${selectedLength} stops currently selected`,
    drawnAreaTooBig: "Drawn area too big, draw a smaller area",
    problemRetrievingStops: "There was a problem retrieving the stops",
    noStopsFound: "No stops found in selected area",
});
