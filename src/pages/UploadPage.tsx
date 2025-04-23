import { useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';

interface UploadPageProps {
  apiUrl: string;
  setPrediction: (prediction: {
    file: File | null;
    label?: string;
    grade?: number;
    confidence?: number;
    class_probabilities?: { confidence: number; grade: number }[];
    heatmap?: string;
    confusionMatrix?: number[][];
  }) => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ apiUrl, setPrediction }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [prediction, setPredictionResult] = useState<any>(null);
  const navigate = useNavigate();

  const validateAndSetFile = (file: File) => {
    // Only check if it's an image file
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file.");
      return;
    }

    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      validateAndSetFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image to upload.");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to get prediction. Try again.");
      }
  
      const data = await response.json();
      
      // Normalize probabilities
      const normalizedProbs = normalizeGradeProbabilities(data.prediction.class_probabilities);
      
      // Get highest confidence grade
      const highestConfidence = getHighestConfidenceGrade(normalizedProbs);
      
      const normalizedPrediction = {
        ...data.prediction,
        grade: highestConfidence?.grade || data.prediction.grade,
        confidence: highestConfidence?.confidence || data.prediction.confidence,
        class_probabilities: normalizedProbs
      };

      setPredictionResult(normalizedPrediction);
      setPrediction({
        file,
        label: normalizedPrediction.label,
        grade: normalizedPrediction.grade,
        confidence: normalizedPrediction.confidence,
        class_probabilities: normalizedPrediction.class_probabilities,
        heatmap: normalizedPrediction.heatmap,
        confusionMatrix: data.confusion_matrix,
      });
      
      setShowResults(true);
    } catch (err) {
      setError("Error uploading file. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setPredictionResult(null);
    setShowResults(false);
    setError(null);
  };

  // Add this helper function to normalize probabilities
  const normalizeGradeProbabilities = (probabilities: { confidence: number; grade: number }[]) => {
    // Calculate total confidence
    const total = probabilities.reduce((sum, prob) => sum + prob.confidence, 0);
    
    // Normalize each probability to make sum = 1 (100%)
    return probabilities.map(prob => ({
      ...prob,
      confidence: prob.confidence / total
    }));
  };

  // Add this helper function to normalize confidence
  const normalizeConfidence = (confidence: number): number => {
    // Ensure confidence is between 0 and 1, then convert to percentage
    return Math.min(Math.max(confidence, 0), 1) * 100;
  };

  // Add helper function to get highest confidence grade
  const getHighestConfidenceGrade = (probabilities: { confidence: number; grade: number }[]) => {
    if (!probabilities || probabilities.length === 0) return null;
    
    // Find the grade with highest confidence
    const highestProb = probabilities.reduce((max, current) => {
      return current.confidence > max.confidence ? current : max;
    }, probabilities[0]);

    return {
      grade: highestProb.grade,
      confidence: highestProb.confidence
    };
  };

  // Add helper function to convert grade number to descriptive label
  const getGradeLabel = (grade: number): string => {
    switch (grade) {
      case 0:
        return "Normal";
      case 3:
        return "Moderate";
      case 4:
        return "Severe";
      default:
        return `Grade ${grade}`;
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;
    let currentPage = 1;

    // Colors
    const BLACK = '#000000';
    const WHITE = '#FFFFFF';
    const MEDICAL_BLUE = '#4285F4';

    const checkAndAddPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        currentPage++;
        yPosition = margin;
        // Add page header
        doc.setFillColor(MEDICAL_BLUE);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(WHITE);
        doc.setFontSize(24);
        doc.text('Knee Osteoarthritis Analysis Report', margin, 28);
        yPosition = 50;
      }
    };

    // Add header for first page
    doc.setFillColor(MEDICAL_BLUE);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(WHITE);
    doc.setFontSize(24);
    doc.text('Knee Osteoarthritis Analysis Report', margin, 28);
    yPosition = 50;

    // Add date
    doc.setTextColor(BLACK);
    doc.setFontSize(12);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 20;

    // Check space for images
    checkAndAddPage(100);

    // Add original image and attention map
    if (preview) {
      const imgWidth = 80;
      const imgHeight = 80;
      doc.addImage(preview, 'PNG', margin, yPosition, imgWidth, imgHeight);
      
      doc.addImage(
        `data:image/png;base64,${prediction.heatmap}`,
        'PNG',
        margin + imgWidth + 20,
        yPosition,
        imgWidth,
        imgHeight
      );

      // Add image labels
      doc.setFontSize(10);
      doc.setTextColor(BLACK);
      doc.text('Original X-ray', margin, yPosition + imgHeight + 5);
      doc.text('Attention Map', margin + imgWidth + 20, yPosition + imgHeight + 5);
      yPosition += imgHeight + 30;
    }

    // Check space for analysis results
    checkAndAddPage(60);

    // Add KL Grade and Confidence
    doc.setFontSize(16);
    doc.setTextColor(MEDICAL_BLUE);
    doc.text('Analysis Results', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setTextColor(BLACK);
    const gradeText = `Predicted Grade: ${getGradeLabel(prediction.grade)}`;
    const confidenceText = `Confidence: ${(prediction.confidence * 100).toFixed(1)}%`;
    doc.text(gradeText, margin, yPosition);
    doc.text(confidenceText, pageWidth - margin - doc.getTextWidth(confidenceText), yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.text("(Confidence represents the probability of the predicted grade)", margin, yPosition);
    yPosition += 10;

    // Check space for probabilities
    checkAndAddPage(80);

    // Add grade probabilities
    doc.setFontSize(14);
    doc.setTextColor(MEDICAL_BLUE);
    doc.text('Grade Probabilities', margin, yPosition);
    yPosition += 15;

    // Draw probability bars
    const normalizedProbs = normalizeGradeProbabilities(prediction.class_probabilities);
    normalizedProbs.forEach((prob: any) => {
      checkAndAddPage(20);

      doc.setFontSize(10);
      doc.setTextColor(BLACK);
      const gradeLabel = `Grade ${prob.grade}`;
      const probabilityText = `${(prob.confidence * 100).toFixed(1)}%`;
      
      doc.text(gradeLabel, margin, yPosition);
      doc.text(probabilityText, pageWidth - margin - doc.getTextWidth(probabilityText), yPosition);
      
      // Draw probability bar
      const barWidth = 100;
      const barHeight = 5;
      doc.setFillColor(200, 200, 200);
      doc.rect(margin + 40, yPosition - 4, barWidth, barHeight, 'F');
      doc.setFillColor(MEDICAL_BLUE);
      doc.rect(margin + 40, yPosition - 4, barWidth * prob.confidence, barHeight, 'F');
      
      yPosition += 15;
    });

    // Check space for interpretation
    checkAndAddPage(100);

    // Add interpretation
    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(MEDICAL_BLUE);
    doc.text('Interpretation', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(BLACK);
    const interpretation = getGradeInterpretation(prediction.grade);
    const splitText = doc.splitTextToSize(interpretation, pageWidth - (2 * margin));
    
    checkAndAddPage(splitText.length * 12);
    doc.text(splitText, margin, yPosition);
    yPosition += splitText.length * 12;

    // Add recommendations section
    checkAndAddPage(80);
    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(MEDICAL_BLUE);
    doc.text('Recommendations', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(BLACK);
    const recommendations = getRecommendations(prediction.grade);
    const splitRecommendations = doc.splitTextToSize(recommendations, pageWidth - (2 * margin));
    doc.text(splitRecommendations, margin, yPosition);

    // Add footer to each page
    for (let i = 1; i <= currentPage; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(BLACK);
      doc.text('Generated by KOA Detect AI System', margin, pageHeight - margin);
      doc.text(`Page ${i}/${currentPage}`, pageWidth - margin - 20, pageHeight - margin);
    }

    // Save the PDF
    doc.save('knee-analysis-report.pdf');
  };

  // Helper function for grade interpretation
  const getGradeInterpretation = (grade: number): string => {
    const interpretations: { [key: number]: string } = {
      0: "No radiographic features of osteoarthritis are present. The knee joint appears normal with no visible signs of degeneration.",
      1: "Doubtful narrowing of joint space and possible osteophytic lipping. Early signs that may indicate the beginning of osteoarthritic changes.",
      2: "Definite osteophytes and possible narrowing of joint space. Clear evidence of early osteoarthritic changes in the knee joint.",
      3: "Moderate multiple osteophytes, definite narrowing of joint space, some sclerosis and possible deformity of bone contour. Significant osteoarthritic changes are present.",
      4: "Large osteophytes, marked narrowing of joint space, severe sclerosis and definite deformity of bone contour. Severe osteoarthritic changes indicating advanced disease."
    };
    return interpretations[grade] || "Grade interpretation not available.";
  };

  // Helper function for recommendations
  const getRecommendations = (grade: number): string => {
    const recommendations: { [key: number]: string } = {
      0: "No specific treatment needed. Maintain healthy lifestyle and regular exercise. Monitor for any changes in symptoms.",
      1: "Consider lifestyle modifications such as weight management and low-impact exercises. Regular monitoring recommended.",
      2: "Implement regular exercise program, weight management if needed. Consider physical therapy. Regular monitoring by healthcare provider.",
      3: "Consult with orthopedic specialist. Consider pain management options. Physical therapy strongly recommended. Regular monitoring essential.",
      4: "Immediate consultation with orthopedic specialist. Discuss treatment options including possible surgical intervention. Pain management and mobility assistance may be necessary."
    };
    return recommendations[grade] || "Please consult with your healthcare provider for specific recommendations.";
  };

  if (showResults && prediction) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Results Header */}
          <div className="bg-medical-600 text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Analysis Results</h2>
            <button
              onClick={handleReset}
              className="text-white hover:text-medical-200 transition-colors"
            >
              ← New Analysis
            </button>
          </div>

          <div className="p-6">
            {/* Original and Processed Images */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Original Image</h3>
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={preview!}
                    alt="Original X-ray"
                    className="w-full object-contain"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Attention Map</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // Download original image
                        const link = document.createElement('a');
                        link.href = preview!;
                        link.download = 'original-xray.png';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center gap-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Original
                    </button>
                    <button
                      onClick={() => {
                        // Download attention map
                        const link = document.createElement('a');
                        link.href = `data:image/png;base64,${prediction.heatmap}`;
                        link.download = 'attention-map.png';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="text-sm px-3 py-1 rounded bg-medical-50 hover:bg-medical-100 text-medical-600 flex items-center gap-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Attention Map
                    </button>
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={`data:image/png;base64,${prediction.heatmap}`}
                    alt="Grad-CAM visualization"
                    className="w-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Grade and Confidence */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Predicted Grade</p>
                  <p className="text-2xl font-bold text-medical-600">{getGradeLabel(prediction.grade)}</p>
                  <p className="text-xs text-gray-500 mt-1">Highest probability grade</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Confidence</p>
                  <p className="text-2xl font-bold text-medical-600">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Highest grade probability</p>
                </div>
              </div>
            </div>

            {/* Class Probabilities with Highlight */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Grade Probabilities</h3>
              <div className="space-y-2">
                {prediction.class_probabilities?.map((prob: any) => (
                  <div key={prob.grade} className="flex items-center">
                    <span className={`w-20 text-sm ${
                      prob.grade === prediction.grade 
                        ? 'text-medical-600 font-medium' 
                        : 'text-gray-600'
                    }`}>
                      {getGradeLabel(prob.grade)}
                    </span>
                    <div className="flex-1 mx-2">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${
                            prob.grade === prediction.grade 
                              ? 'bg-medical-600' 
                              : 'bg-medical-400'
                          }`}
                          style={{ width: `${prob.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className={`w-16 text-sm ${
                      prob.grade === prediction.grade 
                        ? 'text-medical-600 font-medium' 
                        : 'text-gray-600'
                    }`}>
                      {(prob.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Report Card Section */}
            <div className="mt-8 border-t pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Analysis Report</h3>
                <button
                  onClick={generatePDF}
                  className="flex items-center gap-2 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                  Download Report (PDF)
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Download a comprehensive PDF report containing all analysis results and interpretations.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Knee X-ray Analysis
          </h1>
          <p className="text-gray-600">
            Upload a knee X-ray image for osteoarthritis detection
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supported format: X-ray images of knee joints only
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center ${
              file ? 'border-green-500 bg-green-50' : 
              error ? 'border-red-300 bg-red-50' : 'border-gray-300'
            } hover:border-medical-500 hover:bg-medical-50 transition-all cursor-pointer`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            {preview ? (
              <div className="space-y-6">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-96 mx-auto object-contain"
                />
                <p className="text-sm text-gray-500">
                  Click or drag to change image
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <svg
                  className={`mx-auto h-20 w-20 ${
                    error ? 'text-red-400' : 'text-gray-400'
                  }`}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  />
                </svg>
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Drop your knee X-ray image here
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    or click to browse from your computer
                  </p>
                </div>
              </div>
            )}
            <input
              id="fileInput"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">
                {error}
              </p>
            </div>
          )}

      <button
        onClick={handleUpload}
            disabled={!file || loading}
            className={`mt-8 w-full py-4 px-6 rounded-lg text-white font-medium text-lg ${
              !file || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-medical-600 hover:bg-medical-700'
            } transition-colors`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              'Analyze X-ray'
            )}
      </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
