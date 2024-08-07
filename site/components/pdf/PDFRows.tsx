import { Font, StyleSheet, Text, View } from "@react-pdf/renderer";
import { PDFProps } from "./DownloadPDF";

Font.registerHyphenationCallback((word) => [word]);

const hyphenCallback = (word: string) => [word];

const breakWord = (word: string) => {
    if (word.length > 10) {
        return [...(word.match(/.{1,10}/g) ?? [])];
    }
    return [word];
};

const PDFStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-start",
        textAlign: "left",
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 1,
        margin: 2,
        fontFamily: "Helvetica",
        paddingBottom: 5,
    },
    column: {
        width: "6.7%",
        flex: 1,
        wordWrap: "break-word",
        maxWidth: "6.7%",
        padding: "0 5px",
    },
    title: {
        width: "12.5%",
        flex: 1,
        wordWrap: "break-word",
        maxWidth: "12.5%",
        padding: "0 5px",
    },
    date: {
        width: "5.5%",
        flex: 1,
        wordWrap: "break-word",
        maxWidth: "5.5%",
        padding: "0 5px",
    },
    status: {
        width: "9%",
        flex: 1,
        wordWrap: "break-word",
        maxWidth: "9%",
        padding: "0 5px",
    },
});

const PDFRows = ({ disruptions }: PDFProps) => {
    const rows = disruptions.map((disruption, rowIndex) => (
        <View key={rowIndex} style={PDFStyles.container} wrap={false}>
            <Text key="0" style={PDFStyles.column}>
                {disruption.id}
            </Text>
            <Text key="1" style={PDFStyles.title} hyphenationCallback={breakWord}>
                {disruption.title}
            </Text>
            <Text key="2" style={PDFStyles.column}>
                {disruption.serviceModes}
            </Text>
            <Text key="3" style={PDFStyles.column}>
                {disruption.operatorWide}
            </Text>
            <Text key="4" style={PDFStyles.column}>
                {disruption.networkWide}
            </Text>
            <Text key="5" style={PDFStyles.column}>
                {disruption.servicesAffectedCount}
            </Text>
            <Text key="6" style={PDFStyles.column}>
                {disruption.stopsAffectedCount}
            </Text>
            <Text key="7" style={PDFStyles.date}>
                {disruption.startDate}
            </Text>
            <Text key="8" style={PDFStyles.date}>
                {disruption.endDate}
            </Text>
            <Text key="9" style={PDFStyles.date}>
                {disruption.publishStartDate}
            </Text>
            <Text key="10" style={PDFStyles.date}>
                {disruption.publishEndDate}
            </Text>
            <Text key="11" style={PDFStyles.status}>
                {disruption.severity}
            </Text>
            <Text key="12" style={PDFStyles.status} hyphenationCallback={hyphenCallback}>
                {disruption.isLive}
            </Text>
            <Text key="13" style={PDFStyles.status}>
                {disruption.status}
            </Text>
            <Text key="14" style={PDFStyles.title} hyphenationCallback={breakWord}>
                {disruption.description}
            </Text>
            <Text key="15" style={PDFStyles.status}>
                {disruption.disruptionType}
            </Text>
            <Text key="16" style={PDFStyles.date}>
                {disruption.creationTime}
            </Text>
            <Text key="17" style={PDFStyles.column} hyphenationCallback={breakWord}>
                {disruption.disruptionReason}
            </Text>
            <Text key="18" style={PDFStyles.column}>
                {disruption.servicesAffected}
            </Text>
        </View>
    ));

    return rows;
};

export default PDFRows;
