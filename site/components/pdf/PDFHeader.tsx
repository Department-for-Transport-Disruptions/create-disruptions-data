import { Font, StyleSheet, Text, View } from "@react-pdf/renderer";

Font.registerHyphenationCallback((word) => [word]);

const PDFStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-start",
        textAlign: "left",
        fontStyle: "bold",
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 4,
        margin: 2,
        fontFamily: "Helvetica-Bold",
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

const PDFHeader = () => (
    <View style={PDFStyles.container} fixed>
        <Text style={PDFStyles.column}>id</Text>
        <Text style={PDFStyles.title}>title</Text>
        <Text style={PDFStyles.column}>mode</Text>
        <Text style={PDFStyles.column}>operator wide</Text>
        <Text style={PDFStyles.column}>network wide</Text>
        <Text style={PDFStyles.column}>services affected</Text>
        <Text style={PDFStyles.column}>stops affected</Text>
        <Text style={PDFStyles.date}>start date</Text>
        <Text style={PDFStyles.date}>end date</Text>
        <Text style={PDFStyles.date}>publish start date</Text>
        <Text style={PDFStyles.date}>publish end date</Text>
        <Text style={PDFStyles.status}>severity</Text>
        <Text style={PDFStyles.status}>live</Text>
        <Text style={PDFStyles.status}>status</Text>
        <Text style={PDFStyles.title}>description of disruption</Text>
        <Text style={PDFStyles.status}>disruption type</Text>
        <Text style={PDFStyles.date}>creation time</Text>
        <Text style={PDFStyles.column}>disruption reason</Text>
        <Text style={PDFStyles.column}>list of services affected</Text>
    </View>
);

export default PDFHeader;
