from flask import Flask, request, jsonify
import asyncio
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model, Model
from PIL import Image
import io
import cv2
import base64
from flask_cors import CORS
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)

print("🚀 Starting Flask app...")

# Load model with error logging
try:
    model = load_model("final_model.keras")
    print("✅ Model loaded successfully")
except Exception as e:
    print("💥 Error loading model:", e)
    model = None

# Label mappings
index_to_label = {0: 0, 1: 3, 2: 4}
class_labels = {0: "Normal", 3: "Moderate OA", 4: "Severe OA"}

# Add asynchronous preprocessing and prediction
async def async_predict(processed_image):
    return await asyncio.to_thread(model.predict, processed_image)

@app.route("/", methods=["GET", "HEAD"])
def health_check():
    return "Backend is live!", 200

@app.route("/predict", methods=["POST"])
async def predict():
    print("📩 /predict POST request received")

    if model is None:
        print("❌ Model not loaded")
        return jsonify({"error": "Model not available"}), 500

    if "file" not in request.files:
        print("❌ No file in request")
        return jsonify({"error": "No file uploaded"}), 400

    try:
        file = request.files["file"]
        image = Image.open(io.BytesIO(file.read()))
        processed_image = preprocess_image(image)

        print("✅ Image preprocessed")

        predictions = await async_predict(processed_image)
        predictions = predictions[0]  # remove batch dim

        predicted_index = np.argmax(predictions)
        predicted_class = index_to_label[predicted_index]
        confidence = float(predictions[predicted_index]) * 100

        print(f"🔮 Prediction: {predicted_class} ({confidence:.2f}%)")

        heatmap = compute_gradcam(model, processed_image)
        gradcam_img = overlay_heatmap(image, heatmap)
        heatmap_base64 = encode_image_to_base64(gradcam_img)

        class_probabilities = [
            {"grade": index_to_label[i], "confidence": round(float(prob) * 100, 2)}
            for i, prob in enumerate(predictions)
        ]

        return jsonify({
            "prediction": {
                "grade": predicted_class,
                "label": class_labels[predicted_class],
                "confidence": round(confidence, 2),
                "class_probabilities": class_probabilities,
                "heatmap": heatmap_base64
            }
        })

    except Exception as e:
        print("💥 Error during prediction:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, threaded=True)
