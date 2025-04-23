import { Progress } from "@/components/ui/progress";

const PredictionPage = ({ prediction }) => {
  if (!prediction) {
    return <p className="text-center text-gray-600">No prediction data available.</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Prediction Results</h1>

      <div className="bg-white p-4 shadow rounded-lg mt-4">
        <h2 className="text-lg font-semibold">Predicted Grade: {prediction.grade}</h2>
        <p className="text-gray-600">{prediction.label}</p>
        <Progress value={prediction.confidence} className="h-2 bg-blue-500" />
        <p>Confidence: {prediction.confidence}%</p>
      </div>

      {/* 🔁 Updated key name */}
      {prediction.class_probabilities && (
        <>
          <h3 className="mt-6 text-lg font-semibold">Class Probabilities</h3>
          {prediction.class_probabilities.map((prob, index) => (
            <div key={index} className="flex items-center mb-2">
              <p className="w-20">Grade {prob.grade}</p>
              <Progress value={prob.confidence} className="h-2 bg-green-500" />
              <span className="ml-2">{prob.confidence}%</span>
            </div>
          ))}
        </>
      )}

      {/* ✅ Heatmap */}
      {prediction.heatmap && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Grad-CAM Heatmap</h3>
          <img
            src={`data:image/png;base64,${prediction.heatmap}`}
            alt="Grad-CAM Heatmap"
            className="rounded-lg shadow"
            style={{ width: "300px" }}
          />
        </div>
      )}
    </div>
  );
};

export default PredictionPage;
