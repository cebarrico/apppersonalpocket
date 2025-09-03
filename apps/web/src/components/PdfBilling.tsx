"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
// Logo é servido via pasta public do Next.js

export interface BillingItem {
  date: string;
  status: "Presente" | "Falta";
  price: number;
}

export interface PdfBillingProps {
  appName?: string;
  teacherName: string;
  studentName: string;
  startDate: string;
  endDate: string;
  items: BillingItem[];
  colors?: {
    title?: string;
    text?: string;
    present?: string;
    absent?: string;
  };
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#36495c",
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#333333",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerBar: {
    backgroundColor: "#1E2A38", // dark-teal
    height: 4,
    marginBottom: 12,
  },
  logo: {
    width: 80,
    height: 40,
    objectFit: "contain",
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "#ffffff",
  },
  subText: {
    marginTop: 4,
    fontSize: 10,
    color: "#ffffff",
  },
  section: {
    marginTop: 16,
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#2C3A4A", // medium-blue-gray
    color: "#3dd9b3", // ice-white
    borderTop: 1,
    borderBottom: 1,
    borderColor: "#3dd9b3",
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    borderBottom: 1,
    borderColor: "#3dd9b3",
  },
  cellDate: { flex: 2, padding: 8, color: "#3dd9b3" },
  cellStatus: {
    flex: 1,
    padding: 8,
    textAlign: "center" as const,
    color: "#ffffff",
  },
  cellPrice: {
    flex: 1,
    padding: 8,
    textAlign: "right" as const,
    color: "#ffffff",
  },
  summary: {
    marginTop: 16,
    paddingTop: 8,
    borderTop: 1,
    borderColor: "#3dd9b3",
  },
  summaryRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    color: "#3dd9b3",
  },
});

const formatCurrency = (value: number) => {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `R$ ${value.toFixed(2)}`;
  }
};

const formatDatePtBr = (isoDate: string) => {
  try {
    return new Date(isoDate).toLocaleDateString("pt-BR");
  } catch {
    return isoDate;
  }
};

export const BillingDocument: React.FC<PdfBillingProps> = ({
  appName,
  teacherName,
  studentName,
  startDate,
  endDate,
  items,
  colors,
}) => {
  const totals = items.reduce(
    (acc, item) => {
      if (item.status === "Presente") acc.present += 1;
      if (item.status === "Falta") acc.absent += 1;
      // Cobrar tanto Presente quanto Falta (conforme modal)
      acc.amount += item.price;
      return acc;
    },
    { present: 0, absent: 0, amount: 0 }
  );

  // Paleta baseada no app (tailwind):
  // aqua: #3DD9B3, dark-teal: #1E2A38, medium-blue-gray: #2C3A4A, coral-red: #FF5C5C
  const colorTitle = colors?.title || "#3DD9B3"; // dark-teal
  const colorText = colors?.text || "#3DD9B3"; // medium-blue-gray
  const colorPresent = colors?.present || "#3DD9B3"; // aqua
  const colorAbsent = colors?.absent || "#FF5C5C"; // coral-red

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Barra decorativa do cabeçalho alinhada ao tema */}
        <View style={styles.headerBar} />
        <View style={styles.header}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src="/logo.png" style={styles.logo} />
            <Text style={[styles.title, { color: colorTitle }]}>
              {appName || "Pocket Personal"}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.subText, { color: colorText }]}>
              Professor: {teacherName}
            </Text>
            <Text style={[styles.subText, { color: colorText }]}>
              Aluno: {studentName}
            </Text>
            <Text style={[styles.subText, { color: colorText }]}>
              Período: {formatDatePtBr(startDate)} a {formatDatePtBr(endDate)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cellDate, { color: colorText }]}>
              Data da aula
            </Text>
            <Text style={[styles.cellStatus, { color: colorText }]}>
              Status
            </Text>
            <Text style={[styles.cellPrice, { color: colorText }]}>Valor</Text>
          </View>

          {items.map((item, idx) => (
            <View style={styles.tableRow} key={`row-${idx}`}>
              <Text style={styles.cellDate}>{formatDatePtBr(item.date)}</Text>
              <Text
                style={[
                  styles.cellStatus,
                  {
                    color:
                      item.status === "Presente" ? colorPresent : colorAbsent,
                  },
                ]}
              >
                {item.status}
              </Text>
              <Text style={styles.cellPrice}>{formatCurrency(item.price)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text>Total de aulas</Text>
            <Text>{items.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Presentes</Text>
            <Text>{totals.present}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Faltas</Text>
            <Text>{totals.absent}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ fontWeight: 700 }}>Total a pagar</Text>
            <Text style={{ fontWeight: 700 }}>
              {formatCurrency(totals.amount)}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default BillingDocument;
