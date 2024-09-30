import React from "react";

export default function PDFViewerPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">FAA Remote Pilot Study Guide</h1>
      <div className="aspect-w-16 aspect-h-9">
        <iframe
          src="https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/remote_pilot_study_guide.pdf"
          className="w-full h-full"
          title="FAA Remote Pilot Study Guide PDF"
        ></iframe>
      </div>
    </div>
  );
}
