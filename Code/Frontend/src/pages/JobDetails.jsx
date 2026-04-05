import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApplicationForm from "../components/ApplicationForm";
import { submitApplication } from "../services/api";

const mockJob = {
  id: 1,
  title: "Développeur Full Stack React/Node.js",
  company: "TalentBridge Inc",
  location: "Paris, France",
  description: "Rejoignez notre équipe pour développer la prochaine génération de plateforme RH avec microservices cloud native."
};

export default function JobDetails({ jobId }) {
  const [job, setJob] = useState(mockJob);
  const [submitted, setSubmitted] = useState(false);

  const handleApplicationSubmitted = () => {
    setSubmitted(true);
  };

  return (
    <div className="job-details">
      <div className="job-header">
        <h1>{job.title}</h1>
        <div className="job-info">
          <span>{job.company}</span>
          <span>{job.location}</span>
        </div>
      </div>
      <div className="job-description">
        <p>{job.description}</p>
      </div>
      {!submitted ? (
        <ApplicationForm jobId={jobId} onSubmitted={handleApplicationSubmitted} />
      ) : (
        <div className="success-message">
          <h3>Candidature envoyée!</h3>
          <Link to="/candidatures">Voir mes candidatures</Link>
        </div>
      )}
    </div>
  );
}
