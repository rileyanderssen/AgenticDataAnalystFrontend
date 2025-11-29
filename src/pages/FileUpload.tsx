import { useState } from 'react';
import './styles/FileUpload.css';

interface FileUploadProps { }

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,  // This is needed for Pie charts
    Title,
    Tooltip,
    Legend
);

const FileUpload: React.FC<FileUploadProps> = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [userQuery, setUserQuery] = useState('');
    const [outputType, setOutputType] = useState<'chart' | 'general enquiry'>('general enquiry');
    const [chartType, setChartType] = useState<'Bar' | 'Pie' | 'Line' | 'Any'>('Any');
    const [analysisResult, setAnalysisResult] = useState<string>('');
    const [chartConfig, setChartConfig] = useState<any>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = [
                'text/csv',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];

            if (validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                setSelectedFile(file);
                setUploadSuccess(false);
                setAnalysisResult('');
            } else {
                alert('Please upload a CSV or Excel file');
                event.target.value = '';
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !userQuery.trim()) {
            alert('Please provide both a file and a query');
            return;
        }

        setUploading(true);

        // Create FormData to send file and other data
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('user_query', userQuery);
        formData.append('chart_type', chartType);
        formData.append('requested_output_type', outputType === 'chart' ? chartType : outputType);

        try {
            // Replace with your actual backend endpoint
            const response = await fetch('http://localhost:8000/api/data_enquiry', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setUploadSuccess(true);

                // Store the analysis result if it's a general enquiry
                if (outputType === 'general enquiry' && data.answer) {
                    setAnalysisResult(data.answer);
                } else if (outputType === 'chart' && data.answer) {
                    setChartConfig(data.answer);
                }

                console.log('File uploaded successfully');
            } else {
                alert('Upload failed. Please try again.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setUploadSuccess(false);
        setAnalysisResult('');
    };

    const handleNewQuery = () => {
        setUploadSuccess(false);
        setSelectedFile(null);
        setAnalysisResult('');
        setUserQuery('');
    };

    function ChartRenderer({ _chartConfig }: { _chartConfig: any }) {
        if (!_chartConfig) {
            return <div>No chart data available</div>;
        }

        if (_chartConfig.type === 'bar') {
            return <Bar data={_chartConfig.data} options={_chartConfig.options} />;
        }
        if (_chartConfig.type === 'line') {
            return <Line data={_chartConfig.data} options={_chartConfig.options} />;
        }
        if (_chartConfig.type === 'pie') {
            return <Pie data={_chartConfig.data} options={_chartConfig.options} />;
        }

        return <div>Unsupported chart type</div>;
    }

    return (
        <div className="file-upload-container">
            <div className="file-upload-card">
                <h1 className="file-upload-title">Personal Data Analyst</h1>
                <p className="file-upload-subtitle">Upload your CSV or Excel file to get started</p>

                <div className="file-upload-area">
                    {!selectedFile ? (
                        <label className="file-upload-input-label">
                            <input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileSelect}
                                className="file-upload-input"
                            />
                            <div className="file-upload-prompt">
                                <svg className="file-upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span className="file-upload-text">Click to upload or drag and drop</span>
                                <span className="file-upload-subtext">CSV, XLS, or XLSX files</span>
                            </div>
                        </label>
                    ) : (
                        <div className="file-upload-preview">
                            <div className="file-upload-info">
                                <svg className="file-upload-file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div className="file-upload-details">
                                    <p className="file-upload-name">{selectedFile.name}</p>
                                    <p className="file-upload-size">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <button onClick={handleRemoveFile} className="file-upload-remove-button">
                                <svg className="file-upload-remove-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {selectedFile && !uploadSuccess && (
                    <>
                        <div className="file-upload-query-section">
                            <label className="file-upload-label">
                                What would you like to know?
                            </label>
                            <textarea
                                value={userQuery}
                                onChange={(e) => setUserQuery(e.target.value)}
                                placeholder="e.g., Show me sales trends over time"
                                className="file-upload-textarea"
                                rows={3}
                            />
                        </div>

                        <div className="file-upload-output-section">
                            <label className="file-upload-label">
                                Output Type
                            </label>
                            <div className="file-upload-radio-group">
                                <label className="file-upload-radio-label">
                                    <input
                                        type="radio"
                                        value="chart"
                                        checked={outputType === 'chart'}
                                        onChange={(e) => setOutputType(e.target.value as 'chart' | 'general enquiry')}
                                        className="file-upload-radio"
                                    />
                                    <span>Chart</span>
                                </label>
                                <label className="file-upload-radio-label">
                                    <input
                                        type="radio"
                                        value="general enquiry"
                                        checked={outputType === 'general enquiry'}
                                        onChange={(e) => setOutputType(e.target.value as 'chart' | 'general enquiry')}
                                        className="file-upload-radio"
                                    />
                                    <span>General Enquiry</span>
                                </label>
                            </div>
                        </div>

                        {outputType === 'chart' && (
                            <div className="file-upload-chart-type-section">
                                <label className="file-upload-label">
                                    Chart Type
                                </label>
                                <div className="file-upload-chart-type-grid">
                                    <label className={`file-upload-chart-option ${chartType === 'Bar' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            value="Bar"
                                            checked={chartType === 'Bar'}
                                            onChange={(e) => setChartType(e.target.value as 'Bar' | 'Pie' | 'Line' | 'Any')}
                                            className="file-upload-chart-radio"
                                        />
                                        <svg className="file-upload-chart-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <span className="file-upload-chart-label">Bar</span>
                                    </label>
                                    <label className={`file-upload-chart-option ${chartType === 'Pie' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            value="Pie"
                                            checked={chartType === 'Pie'}
                                            onChange={(e) => setChartType(e.target.value as 'Bar' | 'Pie' | 'Line' | 'Any')}
                                            className="file-upload-chart-radio"
                                        />
                                        <svg className="file-upload-chart-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                        </svg>
                                        <span className="file-upload-chart-label">Pie</span>
                                    </label>
                                    <label className={`file-upload-chart-option ${chartType === 'Line' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            value="Line"
                                            checked={chartType === 'Line'}
                                            onChange={(e) => setChartType(e.target.value as 'Bar' | 'Pie' | 'Line' | 'Any')}
                                            className="file-upload-chart-radio"
                                        />
                                        <svg className="file-upload-chart-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                        </svg>
                                        <span className="file-upload-chart-label">Line</span>
                                    </label>
                                    <label className={`file-upload-chart-option ${chartType === 'Any' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            value="Any"
                                            checked={chartType === 'Any'}
                                            onChange={(e) => setChartType(e.target.value as 'Bar' | 'Pie' | 'Line' | 'Any')}
                                            className="file-upload-chart-radio"
                                        />
                                        <svg className="file-upload-chart-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                                        </svg>
                                        <span className="file-upload-chart-label">Any</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={uploading || !userQuery.trim()}
                            className="file-upload-button"
                        >
                            {uploading ? 'Analyzing...' : 'Analyze Data'}
                        </button>
                    </>
                )}

                {uploadSuccess && outputType === 'general enquiry' && analysisResult && (
                    <div className="file-upload-result-section">
                        <div className="file-upload-result-header">
                            <svg className="file-upload-result-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="file-upload-result-title">Analysis Result</h3>
                        </div>
                        <div className="file-upload-result-content">
                            {analysisResult}
                        </div>
                        <button onClick={handleNewQuery} className="file-upload-new-query-button">
                            Ask Another Question
                        </button>
                    </div>
                )}

                {uploadSuccess && outputType === 'chart' && chartConfig && (
                    <ChartRenderer _chartConfig={chartConfig} />
                )}

                {uploadSuccess && (
                    <div className="file-upload-success-message">
                        <svg className="file-upload-success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Analysis complete!</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;