import { Document, Page, StyleSheet } from "@react-pdf/renderer";
import PDFHeader from "./PDFHeader";
import PDFRows from "./PDFRows";
import { ExportDisruptions } from "../../schemas/disruption.schema";

export const PDFStyles = StyleSheet.create({
    page: {
        flexDirection: "column",
        fontFamily: "Helvetica",
    },
});

export interface PDFProps {
    disruptions: ExportDisruptions;
}

const PDFDoc = ({ disruptions }: PDFProps) => (
    <Document>
        <Page size="A1" style={PDFStyles.page} wrap orientation="landscape">
            <PDFHeader />
            <PDFRows disruptions={disruptions} />
        </Page>
    </Document>
);

export default PDFDoc;
