import { View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import { Fragment } from "react";
import { PDFProps } from "./DownloadPDF";

Font.registerHyphenationCallback((word) => [word]);

const hyphenCallback = (word: string) => [word];

const PDFStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-start",
        textAlign: "left",
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 1,
        margin: 5,
        fontFamily: "Helvetica",
        paddingBottom: 5,
    },
    column: {
        width: "6.5%",
    },
    title: {
        width: "30.5%",
    },
    date: {
        width: "4.5%",
    },
    status: {
        width: "8.5%",
    },
});

const PDFRows = ({ disruptions }: PDFProps) => {
    const rows = disruptions.map((disruption, rowIndex) => (
        <View key={rowIndex} style={PDFStyles.container}>
            <Text key="0" style={PDFStyles.column}>
                {rowIndex}
            </Text>
            <Text key="1" style={PDFStyles.title}>
                {disruption.title}
            </Text>
            <Text key="2" style={PDFStyles.column}>
                {disruption.mode}
            </Text>
            <Text key="3" style={PDFStyles.column}>
                {disruption["operator wide"]}
            </Text>
            <Text key="4" style={PDFStyles.column}>
                {disruption["network wide"]}
            </Text>
            <Text key="5" style={PDFStyles.column}>
                {disruption["services affected"]}
            </Text>
            <Text key="6" style={PDFStyles.column}>
                {disruption["stops affected"]}
            </Text>
            <Text key="7" style={PDFStyles.date}>
                {disruption.start}
            </Text>
            <Text key="8" style={PDFStyles.date}>
                {disruption.end}
            </Text>
            <Text key="9" style={PDFStyles.column}>
                {disruption.severity}
            </Text>
            <Text key="10" style={PDFStyles.column} hyphenationCallback={hyphenCallback}>
                {disruption.live}
            </Text>
            <Text key="11" style={PDFStyles.status}>
                {disruption.status}
            </Text>
        </View>
    ));

    return <Fragment>{rows}</Fragment>;
};

export default PDFRows;
