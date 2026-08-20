"use client";

import { useState, useEffect } from "react";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import { downloadMarkdown } from "@/lib/export-utils";

interface NoteContent {
  intro: string;
  keyConcepts: string[];
  howItWorks: string;
  example: string;
  summary: string;
}

interface NoteData {
  title: string;
  content: NoteContent;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 12,
    marginLeft: 20,
    marginBottom: 4,
  },
});

function NotePDF({ note }: { note: NoteData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{note.title}</Text>

        <Text style={styles.heading}>Introduction</Text>
        <Text style={styles.text}>{note.content.intro}</Text>

        <Text style={styles.heading}>Key Concepts</Text>
        {note.content.keyConcepts.map((concept, i) => (
          <Text key={i} style={styles.listItem}>
            • {concept}
          </Text>
        ))}

        <Text style={styles.heading}>How It Works</Text>
        <Text style={styles.text}>{note.content.howItWorks}</Text>

        <Text style={styles.heading}>Example / Analogy</Text>
        <Text style={styles.text}>{note.content.example}</Text>

        <Text style={styles.heading}>Summary</Text>
        <Text style={styles.text}>{note.content.summary}</Text>
      </Page>
    </Document>
  );
}

export function ExportButtons({ note }: { note: NoteData }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const filename = `${note.title.toLowerCase().replace(/\s+/g, "-")}.pdf`;

  return (
    <div className="flex flex-wrap gap-3">
      <PDFDownloadLink
        document={<NotePDF note={note} />}
        fileName={filename}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
      </PDFDownloadLink>

      <button
        onClick={() => downloadMarkdown(note)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
      >
        Download Markdown
      </button>
    </div>
  );
}
