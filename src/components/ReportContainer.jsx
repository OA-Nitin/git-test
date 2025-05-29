// If you have a parent container component that manages reports
const ReportContainer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentReport, setCurrentReport] = useState('lead');
  
  // Reset search when changing report type
  const handleReportChange = (reportType) => {
    setSearchTerm('');
    setCurrentReport(reportType);
  };
  
  return (
    <div>
      {/* Report type selector */}
      <div className="report-selector">
        <button onClick={() => handleReportChange('lead')}>Lead Report</button>
        <button onClick={() => handleReportChange('erc')}>ERC Report</button>
        {/* Other report buttons */}
      </div>
      
      {/* Render the appropriate report */}
      {currentReport === 'lead' && (
        <LeadReport searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      )}
      {currentReport === 'erc' && (
        <ERCReport searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      )}
      {/* Other reports */}
    </div>
  );
};