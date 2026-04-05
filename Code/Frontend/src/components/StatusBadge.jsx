import React from "react";

const STATUS_LABELS = {
  PENDING: "En attente",
  REVIEWING: "En cours",
  ACCEPTED: "Acceptée",
  REJECTED: "Refusée",
};

function normalizeStatus(status) {
  return (status || "PENDING").toUpperCase();
}

export default function StatusBadge({ status }) {
  const key = normalizeStatus(status);
  const label = STATUS_LABELS[key] || status || STATUS_LABELS.PENDING;

  return (
    <span className={`tb-badge tb-badge--${key.toLowerCase()}`} title={label}>
      {label}
    </span>
  );
}
