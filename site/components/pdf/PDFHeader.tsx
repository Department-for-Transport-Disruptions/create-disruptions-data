import { View, Text, StyleSheet, Font } from "@react-pdf/renderer";

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
        margin: 5,
        fontFamily: "Helvetica-Bold",
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

const PDFHeader = () => (
    <View style={PDFStyles.container} fixed>
        <Text style={PDFStyles.column}>id</Text>
        <Text style={PDFStyles.title}>title</Text>
        <Text style={PDFStyles.column}>mode</Text>
        <Text style={PDFStyles.column}>operator wide</Text>
        <Text style={PDFStyles.column}>network wide</Text>
        <Text style={PDFStyles.column}>services affected</Text>
        <Text style={PDFStyles.column}>stops affected</Text>
        <Text style={PDFStyles.date}>start</Text>
        <Text style={PDFStyles.date}>end</Text>
        <Text style={PDFStyles.date}>publish start</Text>
        <Text style={PDFStyles.date}>publish end</Text>
        <Text style={PDFStyles.column}>severity</Text>
        <Text style={PDFStyles.column}>live</Text>
        <Text style={PDFStyles.status}>status</Text>
    </View>
);

export default PDFHeader;
